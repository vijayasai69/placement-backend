"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = require("./app.js");
const env_js_1 = require("./config/env.js");
const logger_js_1 = require("./utils/logger.js");
const job_data_scraping_scheduler_js_1 = require("./scheduler/job-data-scraping.scheduler.js");
const recommendation_scheduler_js_1 = require("./scheduler/recommendation.scheduler.js");
const notification_scheduler_js_1 = require("./scheduler/notification.scheduler.js");
const PORT = env_js_1.env.PORT;
const server = app_js_1.app.listen(PORT, () => {
    logger_js_1.logger.info(`🚀 Server running in ${env_js_1.env.NODE_ENV} mode on port ${PORT}`);
    // Initialize Background Cron Schedulers
    try {
        (0, job_data_scraping_scheduler_js_1.initJobDataScrapingScheduler)();
        (0, recommendation_scheduler_js_1.initRecommendationScheduler)();
        (0, notification_scheduler_js_1.initNotificationScheduler)();
        logger_js_1.logger.info("📅 Background schedulers initialized successfully.");
    }
    catch (error) {
        logger_js_1.logger.error("❌ Failed to initialize background schedulers:", error);
    }
});
// Handle graceful shutdown
const gracefulShutdown = (signal) => {
    logger_js_1.logger.info(`Received ${signal}. Gracefully shutting down server...`);
    server.close(() => {
        logger_js_1.logger.info("HTTP server closed.");
        process.exit(0);
    });
};
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
exports.default = server;
