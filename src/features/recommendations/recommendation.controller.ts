import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { recommendationService } from "./recommendation.service.js";

export class RecommendationController {
  async getRecommendedJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: "Unauthorized", status: 401 }
        });
      }

      const profileId = req.query.profileId as string | undefined;

      const recommendations = await recommendationService.getRecommendations(userId, profileId);
      res.status(200).json({
        success: true,
        data: recommendations,
      });
    } catch (error) {
      next(error);
    }
  }

  async generateRecommendations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: "Unauthorized", status: 401 }
        });
      }

      const profileId = req.query.profileId as string | undefined;

      const recommendations = await recommendationService.generateRecommendations(userId, profileId);
      res.status(200).json({
        success: true,
        message: "Recommendations generated successfully",
        data: recommendations,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          error: { message: "Recommendation ID is required", status: 400 }
        });
      }

      const updated = await recommendationService.markAsViewed(id);
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const recommendationController = new RecommendationController();
export default recommendationController;
