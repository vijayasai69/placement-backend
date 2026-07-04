"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendationController = exports.RecommendationController = void 0;
const recommendation_service_js_1 = require("./recommendation.service.js");
class RecommendationController {
    async getRecommendedJobs(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: { message: "Unauthorized", status: 401 }
                });
            }
            const profileId = req.query.profileId;
            const recommendations = await recommendation_service_js_1.recommendationService.getRecommendations(userId, profileId);
            res.status(200).json({
                success: true,
                data: recommendations,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async generateRecommendations(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: { message: "Unauthorized", status: 401 }
                });
            }
            const profileId = req.query.profileId;
            const recommendations = await recommendation_service_js_1.recommendationService.generateRecommendations(userId, profileId);
            res.status(200).json({
                success: true,
                message: "Recommendations generated successfully",
                data: recommendations,
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
                    error: { message: "Recommendation ID is required", status: 400 }
                });
            }
            const updated = await recommendation_service_js_1.recommendationService.markAsViewed(id);
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
exports.RecommendationController = RecommendationController;
exports.recommendationController = new RecommendationController();
exports.default = exports.recommendationController;
