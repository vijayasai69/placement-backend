import { prisma } from "../../config/prisma.js";
import { skillGapAgent } from "../ai-agents/skill-gap-agent.js";
import { recommendationService } from "../recommendations/recommendation.service.js";

export class SkillGapService {
  async getMissingSkillsForJob(userId: string, jobId: string, profileId?: string) {
    if (!profileId) {
      throw new Error("Candidate profile not found. Please upload a resume first.");
    }

    // 1. Fetch Candidate Profile
    const profile = await prisma.candidateProfile.findUnique({ where: { id: profileId, userId } });

    if (!profile) {
      throw new Error("Candidate profile not found. Please upload a resume first.");
    }

    // 2. Fetch Job Details
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error("Job not found.");
    }

    // 3. Fetch Match Score
    const rec = await prisma.recommendation.findFirst({
      where: { userId, jobId, profileId },
    });

    // 4. Analyze Gap or use cached
    let missingSkills = rec?.missingSkills || [];
    let learningRecommendations = rec?.learningRecommendations;

    if (!learningRecommendations) {
      const result = await skillGapAgent.analyzeGap(profile.skills, job.requiredSkills);
      missingSkills = result.missingSkills;
      learningRecommendations = result.learningRecommendations;

      // Cache it back to the recommendation if it exists
      if (rec) {
        await prisma.recommendation.update({
          where: { id: rec.id },
          data: {
            learningRecommendations: learningRecommendations as any,
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

  async getAllGapsForRecommended(userId: string, profileId?: string) {
    if (!profileId) {
      return [];
    }

    // Fetch all recommendations
    let recommendations = await prisma.recommendation.findMany({
      where: { userId, profileId },
      take: 5,
    });

    if (recommendations.length === 0) {
      await recommendationService.generateRecommendations(userId, profileId);
      recommendations = await prisma.recommendation.findMany({
        where: { userId, profileId },
        take: 5,
      });
    }

    const gapsResults = await Promise.all(
      recommendations.map(async (rec) => {
        try {
          return await this.getMissingSkillsForJob(userId, rec.jobId, profileId);
        } catch (e) {
          return null;
        }
      })
    );

    return gapsResults.filter((g): g is NonNullable<typeof g> => g !== null);
  }
}

export const skillGapService = new SkillGapService();
export default skillGapService;
