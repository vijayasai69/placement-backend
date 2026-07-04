import { prisma } from "../../config/prisma.js";
import { parsePdfBuffer } from "./parser.js";
import { resumeAgent } from "../ai-agents/resume-agent.js";
import { logger } from "../../utils/logger.js";
import fs from "fs/promises";

export class ResumeService {
  async getResumeByUserId(userId: string) {
    return prisma.resume.findFirst({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async handleResumeUpload(userId: string, filePath: string, fileBuffer: Buffer, fileName: string) {
    // 1. Create resume record in UPLOADED status
    const resume = await prisma.resume.create({
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
      logger.error(`Failed to generate recommendations for user ${userId}:`, err);
    });

    // 4. Retrieve the updated profile
    const profile = await prisma.candidateProfile.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return { resume, profile };
  }

  private async parseAndAnalyzeResume(userId: string, resumeId: string, buffer: Buffer, filePath: string, fileName: string) {
    try {
      // Update status to PARSING
      await prisma.resume.update({
        where: { id: resumeId },
        data: { processingStatus: "PARSING" },
      });

      logger.info(`Parsing PDF resume for user: ${userId}`);
      const text = await parsePdfBuffer(buffer);

      if (!text.trim()) {
        throw new Error("Parsed text is empty");
      }

      // Save rawText
      await prisma.resume.update({
        where: { id: resumeId },
        data: {
          rawText: text,
        },
      });

      logger.info(`Analyzing parsed resume via AI Agent for user: ${userId}`);
      // Call resume agent to generate candidate profile
      await resumeAgent.analyzeAndCreateProfile(userId, text, fileName);

      // Set status to ANALYZED
      await prisma.resume.update({
        where: { id: resumeId },
        data: { processingStatus: "ANALYZED" },
      });
      logger.info(`Resume processing completed successfully for user: ${userId}`);
    } catch (error: any) {
      logger.error(`Error processing resume for user ${userId}:`, error);
      await prisma.resume.update({
        where: { id: resumeId },
        data: { processingStatus: "FAILED" },
      }).catch((dbErr) => logger.error("Failed to set resume status to FAILED:", dbErr));
      throw error;
    }
  }
  async resetUserData(userId: string) {
    try {
      logger.info(`Resetting all resume data for user: ${userId}`);
      
      await prisma.$transaction([
        prisma.recommendation.deleteMany({ where: { userId } }),
        prisma.candidateProfile.deleteMany({ where: { userId } }),
        prisma.resume.deleteMany({ where: { userId } })
      ]);
      
      logger.info(`Successfully reset data for user: ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Error resetting data for user ${userId}:`, error);
      throw error;
    }
  }
}
export const resumeService = new ResumeService();
export default resumeService;
