"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRecommendationScheduler = initRecommendationScheduler;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_js_1 = require("../config/prisma.js");
const recommendation_service_js_1 = require("../features/recommendations/recommendation.service.js");
const logger_js_1 = require("../utils/logger.js");
function initRecommendationScheduler() {
    logger_js_1.logger.info("Initializing Recommendation Scheduler (every 1 hour)...");
    // Every hour: '0 * * * *'
    node_cron_1.default.schedule("0 * * * *", async () => {
        logger_js_1.logger.info("Cron Triggered: Recommendation Refresh Cycle");
        try {
            const profiles = await prisma_js_1.prisma.candidateProfile.findMany({
                select: { userId: true },
            });
            for (const profile of profiles) {
                logger_js_1.logger.info(`Refreshing recommendations for user: ${profile.userId}`);
                await recommendation_service_js_1.recommendationService.generateRecommendations(profile.userId);
            }
        }
        catch (error) {
            logger_js_1.logger.error("Recommendation Refresh Cycle failed:", error);
        }
    });
}
