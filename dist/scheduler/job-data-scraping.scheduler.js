"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initJobDataScrapingScheduler = initJobDataScrapingScheduler;
const node_cron_1 = __importDefault(require("node-cron"));
const job_data_scraping_agent_js_1 = require("../features/ai-agents/job-data-scraping-agent.js");
const logger_js_1 = require("../utils/logger.js");
function initJobDataScrapingScheduler() {
    logger_js_1.logger.info("Initializing AI Job Data Scraping Scheduler (every 15 minutes for real-time updates)...");
    // Every 15 minutes: '*/15 * * * *'
    node_cron_1.default.schedule("*/15 * * * *", async () => {
        logger_js_1.logger.info("Cron Triggered: AI Real-Time Job Data Scraping Cycle");
        await job_data_scraping_agent_js_1.jobDataScrapingAgent.runScrapingCycle();
    });
    // Run on startup
    job_data_scraping_agent_js_1.jobDataScrapingAgent.runScrapingCycle().catch((err) => {
        logger_js_1.logger.error("Startup Job Data Scraping Cycle failed:", err);
    });
}
