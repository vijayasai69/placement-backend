"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = exports.DashboardController = void 0;
const dashboard_service_js_1 = require("./dashboard.service.js");
class DashboardController {
    async getStats(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: { message: "Unauthorized", status: 401 },
                });
            }
            const profileId = req.query.profileId;
            const stats = await dashboard_service_js_1.dashboardService.getStats(userId, profileId);
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DashboardController = DashboardController;
exports.dashboardController = new DashboardController();
exports.default = exports.dashboardController;
