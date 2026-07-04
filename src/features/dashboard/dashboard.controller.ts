import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { dashboardService } from "./dashboard.service.js";

export class DashboardController {
  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: "Unauthorized", status: 401 },
        });
      }

      const profileId = req.query.profileId as string | undefined;
      const stats = await dashboardService.getStats(userId, profileId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
export default dashboardController;
