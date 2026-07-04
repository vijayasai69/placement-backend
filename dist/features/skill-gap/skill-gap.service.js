"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skillGapService = exports.SkillGapService = void 0;
const prisma_js_1 = require("../../config/prisma.js");
const skill_gap_agent_js_1 = require("../ai-agents/skill-gap-agent.js");
const recommendation_service_js_1 = require("../recommendations/recommendation.service.js");
class SkillGapService {
    async getMissingSkillsForJob(userId, jobId, profileId) {
        if (!profileId) {
            throw new Error("Candidate profile not found. Please upload a resume first.");
        }
        // 1. Fetch Candidate Profile
        const profile = await prisma_js_1.prisma.candidateProfile.findUnique({ where: { id: profileId, userId } });
        if (!profile) {
            throw new Error("Candidate profile not found. Please upload a resume first.");
        }
        // 2. Fetch Job Details
        const job = await prisma_js_1.prisma.job.findUnique({
            where: { id: jobId },
        });
        if (!job) {
            throw new Error("Job not found.");
        }
        // 3. Fetch Match Score
        const rec = await prisma_js_1.prisma.recommendation.findFirst({
            where: { userId, jobId, profileId },
        });
        // 4. Analyze Gap or use cached
        let missingSkills = rec?.missingSkills || [];
        let learningRecommendations = rec?.learningRecommendations;
        if (!learningRecommendations) {
            const result = await skill_gap_agent_js_1.skillGapAgent.analyzeGap(profile.skills, job.requiredSkills);
            missingSkills = result.missingSkills;
            learningRecommendations = result.learningRecommendations;
            // Cache it back to the recommendation if it exists
            if (rec) {
                await prisma_js_1.prisma.recommendation.update({
                    where: { id: rec.id },
                    data: {
                        learningRecommendations: learningRecommendations,
                    },
                });
            }
        }
        return {
            jobId,
            jobTitle: job.title,
            company: job.company,
            matchScore: rec ? Math.round(rec.matchScore) : 70,
            candidateSkills: profile.skills,
            requiredSkills: job.requiredSkills,
            missingSkills,
            learningRecommendations,
        };
    }
    async getAllGapsForRecommended(userId, profileId) {
        if (!profileId) {
            return [];
        }
        // Fetch all recommendations
        let recommendations = await prisma_js_1.prisma.recommendation.findMany({
            where: { userId, profileId },
            take: 5,
        });
        if (recommendations.length === 0) {
            await recommendation_service_js_1.recommendationService.generateRecommendations(userId, profileId);
            recommendations = await prisma_js_1.prisma.recommendation.findMany({
                where: { userId, profileId },
                take: 5,
            });
        }
        const gapsResults = await Promise.all(recommendations.map(async (rec) => {
            try {
                return await this.getMissingSkillsForJob(userId, rec.jobId, profileId);
            }
            catch (e) {
                return null;
            }
        }));
        return gapsResults.filter((g) => g !== null);
    }
}
exports.SkillGapService = SkillGapService;
exports.skillGapService = new SkillGapService();
exports.default = exports.skillGapService;
