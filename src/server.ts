import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { initJobDataScrapingScheduler } from "./scheduler/job-data-scraping.scheduler.js";
import { initRecommendationScheduler } from "./scheduler/recommendation.scheduler.js";
import { initNotificationScheduler } from "./scheduler/notification.scheduler.js";

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  
  // Initialize Background Cron Schedulers
  try {
    initJobDataScrapingScheduler();
    initRecommendationScheduler();
    initNotificationScheduler();
    logger.info("📅 Background schedulers initialized successfully.");
  } catch (error) {
    logger.error("❌ Failed to initialize background schedulers:", error);
  }
});

// Handle graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Gracefully shutting down server...`);
  server.close(() => {
    logger.info("HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
export default server;
