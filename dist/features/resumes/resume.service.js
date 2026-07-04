"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeService = exports.ResumeService = void 0;
const prisma_js_1 = require("../../config/prisma.js");
const parser_js_1 = require("./parser.js");
const resume_agent_js_1 = require("../ai-agents/resume-agent.js");
const logger_js_1 = require("../../utils/logger.js");
class ResumeService {
    async getResumeByUserId(userId) {
        return prisma_js_1.prisma.resume.findFirst({
            where: { userId },
            orderBy: { uploadedAt: 'desc' },
        });
    }
    async handleResumeUpload(userId, filePath, fileBuffer, fileName) {
        // 1. Create resume record in UPLOADED status
        const resume = await prisma_js_1.prisma.resume.create({
            data: {
                userId,
                filePath,
                rawText: "",
                processingStatus: "UPLOADED",
            },
        });
        // 2. Parse and analyze resume synchronously
        await this.parseAndAnalyzeResume(userId, resume.id, fileBuffer, filePath, fileName);
        // 3. Generate recommendations asynchronously so the upload finishes quickly (<20s)
        const { recommendationService } = await import("../recommendations/recommendation.service.js");
        recommendationService.generateRecommendations(userId).catch((err) => {
            logger_js_1.logger.error(`Failed to generate recommendations for user ${userId}:`, err);
        });
        // 4. Retrieve the updated profile
        const profile = await prisma_js_1.prisma.candidateProfile.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return { resume, profile };
    }
    async parseAndAnalyzeResume(userId, resumeId, buffer, filePath, fileName) {
        try {
            // Update status to PARSING
            await prisma_js_1.prisma.resume.update({
                where: { id: resumeId },
                data: { processingStatus: "PARSING" },
            });
            logger_js_1.logger.info(`Parsing PDF resume for user: ${userId}`);
            const text = await (0, parser_js_1.parsePdfBuffer)(buffer);
            if (!text.trim()) {
                throw new Error("Parsed text is empty");
            }
            // Save rawText
            await prisma_js_1.prisma.resume.update({
                where: { id: resumeId },
                data: {
                    rawText: text,
                },
            });
            logger_js_1.logger.info(`Analyzing parsed resume via AI Agent for user: ${userId}`);
            // Call resume agent to generate candidate profile
            await resume_agent_js_1.resumeAgent.analyzeAndCreateProfile(userId, text, fileName);
            // Set status to ANALYZED
            await prisma_js_1.prisma.resume.update({
                where: { id: resumeId },
                data: { processingStatus: "ANALYZED" },
            });
            logger_js_1.logger.info(`Resume processing completed successfully for user: ${userId}`);
        }
        catch (error) {
            logger_js_1.logger.error(`Error processing resume for user ${userId}:`, error);
            await prisma_js_1.prisma.resume.update({
                where: { id: resumeId },
                data: { processingStatus: "FAILED" },
            }).catch((dbErr) => logger_js_1.logger.error("Failed to set resume status to FAILED:", dbErr));
            throw error;
        }
    }
    async resetUserData(userId) {
        try {
            logger_js_1.logger.info(`Resetting all resume data for user: ${userId}`);
            await prisma_js_1.prisma.$transaction([
                prisma_js_1.prisma.recommendation.deleteMany({ where: { userId } }),
                prisma_js_1.prisma.candidateProfile.deleteMany({ where: { userId } }),
                prisma_js_1.prisma.resume.deleteMany({ where: { userId } })
            ]);
            logger_js_1.logger.info(`Successfully reset data for user: ${userId}`);
            return true;
        }
        catch (error) {
            logger_js_1.logger.error(`Error resetting data for user ${userId}:`, error);
            throw error;
        }
    }
}
exports.ResumeService = ResumeService;
exports.resumeService = new ResumeService();
exports.default = exports.resumeService;
