import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { skillGapService } from "./skill-gap.service.js";

export class SkillGapController {
  async getMissingSkills(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: "Unauthorized", status: 401 }
        });
      }

      const jobId = req.query.jobId as string;
      const profileId = req.query.profileId as string | undefined;

      if (jobId) {
        const gap = await skillGapService.getMissingSkillsForJob(userId, jobId, profileId);
        return res.status(200).json({
          success: true,
          data: gap
        });
      } else {
        // Return gaps for all recommended jobs
        const gaps = await skillGapService.getAllGapsForRecommended(userId, profileId);
        return res.status(200).json({
          success: true,
          data: gaps
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

export const skillGapController = new SkillGapController();
export default skillGapController;
