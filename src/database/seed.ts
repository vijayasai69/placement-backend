import { prisma } from "../config/prisma.js";
import { jobDataScrapingAgent } from "../features/ai-agents/job-data-scraping-agent.js";
import { logger } from "../utils/logger.js";

async function main() {
  logger.info("Starting database seeding...");

  try {
    // Seed mock jobs
    logger.info("Seeding initial mock jobs...");
    await jobDataScrapingAgent.runScrapingCycle();
    logger.info("Mock jobs seeded successfully.");
  } catch (error) {
    logger.error("Failed to seed mock jobs:", error);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    logger.info("Database seeding finished.");
    process.exit(0);
  })
  .catch(async (e) => {
    logger.error("Fatal error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });