import { Request, Response, NextFunction } from "express";
import { jobsService } from "./jobs.service.js";

export class JobsController {
  async getJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const jobs = await jobsService.getAllActiveJobs();
      res.status(200).json({
        success: true,
        data: jobs,
      });
    } catch (error) {
      next(error);
    }
  }

  async getJob(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        // Fallback in case of root request or trailing slash
        const jobs = await jobsService.getAllActiveJobs();
        return res.status(200).json({
          success: true,
          data: jobs,
        });
      }

      const job = await jobsService.getJobById(id);
      if (!job) {
        return res.status(404).json({
          success: false,
          error: { message: "Job not found", status: 404 },
        });
      }

      res.status(200).json({
        success: true,
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const jobsController = new JobsController();
export default jobsController;
