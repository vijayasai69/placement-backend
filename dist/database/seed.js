"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_js_1 = require("../config/prisma.js");
const job_data_scraping_agent_js_1 = require("../features/ai-agents/job-data-scraping-agent.js");
const logger_js_1 = require("../utils/logger.js");
async function main() {
    logger_js_1.logger.info("Starting database seeding...");
    try {
        // Seed mock jobs
        logger_js_1.logger.info("Seeding initial mock jobs...");
        await job_data_scraping_agent_js_1.jobDataScrapingAgent.runScrapingCycle();
        logger_js_1.logger.info("Mock jobs seeded successfully.");
    }
    catch (error) {
        logger_js_1.logger.error("Failed to seed mock jobs:", error);
    }
}
main()
    .then(async () => {
    await prisma_js_1.prisma.$disconnect();
    logger_js_1.logger.info("Database seeding finished.");
    process.exit(0);
})
    .catch(async (e) => {
    logger_js_1.logger.error("Fatal error during seeding:", e);
    await prisma_js_1.prisma.$disconnect();
    process.exit(1);
});
