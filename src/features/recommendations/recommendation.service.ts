import { prisma } from "../../config/prisma.js";
import { matchingAgent } from "../ai-agents/matching-agent.js";
import { logger } from "../../utils/logger.js";

export class RecommendationService {
  async getRecommendations(userId: string, profileId?: string) {
    if (!profileId) {
      return [];
    }
    const whereClause: any = { userId, profileId };

    let recommendations = await prisma.recommendation.findMany({
      where: whereClause,
      orderBy: { matchScore: "desc" },
    });

    // If no recommendations exist for this profile, generate them on the fly
    if (recommendations.length === 0 && profileId) {
      await this.generateRecommendations(userId, profileId);
      recommendations = await prisma.recommendation.findMany({
        where: whereClause,
        orderBy: { matchScore: "desc" },
      });
    }

    const recommendationsWithJobs = await Promise.all(
      recommendations.map(async (rec) => {
        const job = await prisma.job.findUnique({
          where: { id: rec.jobId },
        });

        const now = new Date();
        const isArchived = !job || !job.isActive || (job.applicationDeadline && new Date(job.applicationDeadline) < now);

        return {
          id: job?.id || rec.jobId,
          title: job?.title || "Unknown Role",
          company: job?.company || "Unknown Company",
          location: job?.location || "Remote",
          type: "Full-time",
          matchScore: Math.round(rec.matchScore),
          salary: "$80,000 - $110,000",
          skills: job?.requiredSkills || [],
          aiInsight: rec.matchScore > 85 ? "High Fit" : "Medium Fit",
          description: job?.description || "",
          applyUrl: job?.applyLink || "#",
          source: job?.source || "LinkedIn",
          saved: false,
          isArchived,
          recommendationReason: rec.recommendationReason,
          matchedSkills: rec.matchedSkills || [],
          missingSkills: rec.missingSkills || [],
        };
      })
    );

    return recommendationsWithJobs;
  }

  async markAsViewed(recommendationId: string) {
    return prisma.recommendation.update({
      where: { id: recommendationId },
      data: { isViewed: true },
    });
  }

  async generateRecommendations(userId: string, targetProfileId?: string) {
    logger.info(`Generating recommendations for user: ${userId}`);

    // 1. Fetch Candidate Profile
    const profile = targetProfileId 
      ? await prisma.candidateProfile.findUnique({ where: { id: targetProfileId } })
      : await prisma.candidateProfile.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });

    if (!profile) {
      throw new Error("Candidate profile not found. Please upload a resume first.");
    }

    // 2. Perform similarity search using pgvector Cosine Similarity
    // If the database does not have pgvector enabled, or query fails, we fallback to standard array overlap query.
    let relevantJobs: any[] = [];
    try {
      relevantJobs = await prisma.$queryRawUnsafe<any[]>(
        `SELECT id, title, company, location, description, "requiredSkills", "applyLink", "applicationDeadline",
                (1 - ("descriptionEmbedding" <=> (SELECT "skillsEmbedding" FROM "CandidateProfile" WHERE "userId" = $1))) as similarity
         FROM "Job"
         WHERE "isActive" = true AND "descriptionEmbedding" IS NOT NULL
         ORDER BY similarity DESC
         LIMIT 30`,
        userId
      );
      
      logger.info(`Successfully retrieved top ${relevantJobs.length} jobs via pgvector similarity.`);
    } catch (vectorError) {
      logger.warn("pgvector similarity search failed or not configured. Falling back to keyword search:", vectorError);
      
      // Fallback: Fetch active jobs and match via skill arrays overlap
      const allJobs = await prisma.job.findMany({
        where: { isActive: true },
        take: 100,
      });

      relevantJobs = allJobs.map(job => {
        const candidateSkillsLower = profile.skills.map(s => s.toLowerCase());
        const matched = job.requiredSkills.filter(s => candidateSkillsLower.includes(s.toLowerCase()));
        return {
          ...job,
          similarity: matched.length / Math.max(job.requiredSkills.length, 1)
        };
      }).sort((a, b) => b.similarity - a.similarity).slice(0, 30);
    }

    // 3. Compare top jobs using AI Matching Agent in PARALLEL to speed up the response
    const recommendationsResults = await Promise.all(
      relevantJobs.map(async (job) => {
        try {
          const evalResult = await matchingAgent.compareProfileWithJob(
            {
              skills: profile.skills,
              education: profile.education,
              projects: profile.projects,
              experience: profile.experience,
            },
            {
              title: job.title,
              company: job.company,
              description: job.description,
              requiredSkills: job.requiredSkills,
            }
          );

          if (evalResult) {
            // Delete previous recommendation for this specific user/job/profile pair if it exists
            await prisma.recommendation.deleteMany({
              where: {
                userId,
                jobId: job.id,
                profileId: profile.id,
              },
            });

            // Insert new recommendation
            const rec = await prisma.recommendation.create({
              data: {
                userId,
                profileId: profile.id,
                jobId: job.id,
                matchScore: evalResult.matchScore,
                matchedSkills: evalResult.matchedSkills,
                missingSkills: evalResult.missingSkills,
                recommendationReason: evalResult.recommendationReason,
                isViewed: false,
              },
            });
            return rec;
          }
        } catch (agentError) {
          logger.error(`Failed to generate AI recommendation for Job ID ${job.id}:`, agentError);
        }
        return null;
      })
    );

    return recommendationsResults.filter((r): r is NonNullable<typeof r> => r !== null);
  }
}

export const recommendationService = new RecommendationService();
export default recommendationService;
