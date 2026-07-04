"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initNotificationScheduler = initNotificationScheduler;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_js_1 = require("../config/prisma.js");
const notification_agent_js_1 = require("../features/ai-agents/notification-agent.js");
const notification_service_js_1 = require("../features/notifications/notification.service.js");
const logger_js_1 = require("../utils/logger.js");
function initNotificationScheduler() {
    logger_js_1.logger.info("Initializing Notification Scheduler (every day at midnight)...");
    // Every day at midnight: '0 0 * * *'
    node_cron_1.default.schedule("0 0 * * *", async () => {
        logger_js_1.logger.info("Cron Triggered: Deadline Reminder Cycle");
        try {
            const threeDaysFromNow = new Date();
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
            const today = new Date();
            // Find recommendations for active jobs with deadline approaching in the next 3 days
            // and match score is high (e.g. >= 75%)
            const recommendations = await prisma_js_1.prisma.recommendation.findMany({
                where: {
                    matchScore: {
                        gte: 75,
                    },
                },
            });
            for (const rec of recommendations) {
                // Fetch job details
                const job = await prisma_js_1.prisma.job.findUnique({
                    where: { id: rec.jobId, isActive: true },
                });
                if (job && job.applicationDeadline <= threeDaysFromNow && job.applicationDeadline >= today) {
                    // Fetch user details
                    const user = await prisma_js_1.prisma.user.findUnique({
                        where: { id: rec.userId },
                    });
                    if (user && user.email) {
                        logger_js_1.logger.info(`Sending approaching deadline reminder to ${user.email} for job: ${job.title}`);
                        await notification_agent_js_1.notificationAgent.sendDeadlineReminder({
                            email: user.email,
                            userName: user.name,
                            jobTitle: job.title,
                            company: job.company,
                            applicationDeadline: job.applicationDeadline,
                            applyLink: job.applyLink,
                        });
                        // Log notification in DB
                        await notification_service_js_1.notificationService.createNotification(user.id, "DEADLINE_REMINDER", `Application deadline for ${job.title} at ${job.company} is approaching on ${job.applicationDeadline.toLocaleDateString()}.`);
                    }
                }
            }
        }
        catch (error) {
            logger_js_1.logger.error("Deadline Reminder Cycle failed:", error);
        }
    });
}
