import cron from "node-cron";
import { prisma } from "../config/prisma.js";
import { notificationAgent } from "../features/ai-agents/notification-agent.js";
import { notificationService } from "../features/notifications/notification.service.js";
import { logger } from "../utils/logger.js";

export function initNotificationScheduler() {
  logger.info("Initializing Notification Scheduler (every day at midnight)...");

  // Every day at midnight: '0 0 * * *'
  cron.schedule("0 0 * * *", async () => {
    logger.info("Cron Triggered: Deadline Reminder Cycle");
    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const today = new Date();

      // Find recommendations for active jobs with deadline approaching in the next 3 days
      // and match score is high (e.g. >= 75%)
      const recommendations = await prisma.recommendation.findMany({
        where: {
          matchScore: {
            gte: 75,
          },
        },
      });

      for (const rec of recommendations) {
        // Fetch job details
        const job = await prisma.job.findUnique({
          where: { id: rec.jobId, isActive: true },
        });

        if (job && job.applicationDeadline <= threeDaysFromNow && job.applicationDeadline >= today) {
          // Fetch user details
          const user = await prisma.user.findUnique({
            where: { id: rec.userId },
          });

          if (user && user.email) {
            logger.info(`Sending approaching deadline reminder to ${user.email} for job: ${job.title}`);
            
            await notificationAgent.sendDeadlineReminder({
              email: user.email,
              userName: user.name,
              jobTitle: job.title,
              company: job.company,
              applicationDeadline: job.applicationDeadline,
              applyLink: job.applyLink,
            });

            // Log notification in DB
            await notificationService.createNotification(
              user.id,
              "DEADLINE_REMINDER",
              `Application deadline for ${job.title} at ${job.company} is approaching on ${job.applicationDeadline.toLocaleDateString()}.`
            );
          }
        }
      }
    } catch (error) {
      logger.error("Deadline Reminder Cycle failed:", error);
    }
  });
}
