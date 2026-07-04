"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const prisma_js_1 = require("../../config/prisma.js");
class NotificationService {
    async getNotifications(userId) {
        return prisma_js_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }
    async markAsRead(id) {
        return prisma_js_1.prisma.notification.update({
            where: { id },
            data: { read: true },
        });
    }
    async createNotification(userId, type, message) {
        return prisma_js_1.prisma.notification.create({
            data: {
                userId,
                type,
                message,
                read: false,
            },
        });
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
exports.default = exports.notificationService;
