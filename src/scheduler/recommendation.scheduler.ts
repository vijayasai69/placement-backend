import cron from "node-cron";
import { prisma } from "../config/prisma.js";
import { recommendationService } from "../features/recommendations/recommendation.service.js";
import { logger } from "../utils/logger.js";

export function initRecommendationScheduler() {
  logger.info("Initializing Recommendation Scheduler (every 1 hour)...");

  // Every hour: '0 * * * *'
  cron.schedule("0 * * * *", async () => {
    logger.info("Cron Triggered: Recommendation Refresh Cycle");
    try {
      const profiles = await prisma.candidateProfile.findMany({
        select: { userId: true },
      });

      for (const profile of profiles) {
        logger.info(`Refreshing recommendations for user: ${profile.userId}`);
        await recommendationService.generateRecommendations(profile.userId);
      }
    } catch (error) {
      logger.error("Recommendation Refresh Cycle failed:", error);
    }
  });
}
