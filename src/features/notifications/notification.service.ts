import { prisma } from "../../config/prisma.js";

export class NotificationService {
  async getNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async createNotification(userId: string, type: string, message: string) {
    return prisma.notification.create({
      data: {
        userId,
        type,
        message,
        read: false,
      },
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;
