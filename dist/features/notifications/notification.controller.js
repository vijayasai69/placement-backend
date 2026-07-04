"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = exports.NotificationController = void 0;
const notification_service_js_1 = require("./notification.service.js");
class NotificationController {
    async getNotifications(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: { message: "Unauthorized", status: 401 }
                });
            }
            const notifications = await notification_service_js_1.notificationService.getNotifications(userId);
            res.status(200).json({
                success: true,
                data: notifications,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async markAsRead(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: { message: "Notification ID is required", status: 400 }
                });
            }
            const updated = await notification_service_js_1.notificationService.markAsRead(id);
            res.status(200).json({
                success: true,
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.NotificationController = NotificationController;
exports.notificationController = new NotificationController();
exports.default = exports.notificationController;
