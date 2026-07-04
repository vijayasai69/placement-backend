"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobsService = exports.JobsService = void 0;
const prisma_js_1 = require("../../config/prisma.js");
class JobsService {
    async getAllActiveJobs() {
        return prisma_js_1.prisma.job.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    async getJobById(id) {
        return prisma_js_1.prisma.job.findUnique({
            where: { id },
        });
    }
    async createJob(data) {
        return prisma_js_1.prisma.job.create({
            data,
        });
    }
}
exports.JobsService = JobsService;
exports.jobsService = new JobsService();
exports.default = exports.jobsService;
