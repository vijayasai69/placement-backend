"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobsController = exports.JobsController = void 0;
const jobs_service_js_1 = require("./jobs.service.js");
class JobsController {
    async getJobs(req, res, next) {
        try {
            const jobs = await jobs_service_js_1.jobsService.getAllActiveJobs();
            res.status(200).json({
                success: true,
                data: jobs,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getJob(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                // Fallback in case of root request or trailing slash
                const jobs = await jobs_service_js_1.jobsService.getAllActiveJobs();
                return res.status(200).json({
                    success: true,
                    data: jobs,
                });
            }
            const job = await jobs_service_js_1.jobsService.getJobById(id);
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
        }
        catch (error) {
            next(error);
        }
    }
}
exports.JobsController = JobsController;
exports.jobsController = new JobsController();
exports.default = exports.jobsController;
