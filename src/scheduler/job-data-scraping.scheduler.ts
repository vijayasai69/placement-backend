import cron from "node-cron";
import { jobDataScrapingAgent } from "../features/ai-agents/job-data-scraping-agent.js";
import { logger } from "../utils/logger.js";

export function initJobDataScrapingScheduler() {
  logger.info("Initializing AI Job Data Scraping Scheduler (every 15 minutes for real-time updates)...");

  // Every 15 minutes: '*/15 * * * *'
  cron.schedule("*/15 * * * *", async () => {
    logger.info("Cron Triggered: AI Real-Time Job Data Scraping Cycle");
    await jobDataScrapingAgent.runScrapingCycle();
  });

  // Run on startup
  jobDataScrapingAgent.runScrapingCycle().catch((err) => {
    logger.error("Startup Job Data Scraping Cycle failed:", err);
  });
}
