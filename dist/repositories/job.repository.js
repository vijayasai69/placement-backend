"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobRepository = exports.JobRepository = void 0;
const prisma_js_1 = require("../config/prisma.js");
class JobRepository {
    prisma;
    constructor(prisma = prisma_js_1.prisma) {
        this.prisma = prisma;
    }
    /**
     * Retrieves all jobs.
     */
    async findAll() {
        return this.prisma.job.findMany();
    }
    /**
     * Retrieves minimal identification fields of all jobs (for deduplication lookup).
     */
    async findAllBrief() {
        return this.prisma.job.findMany({
            select: {
                title: true,
                company: true,
            },
        });
    }
    /**
     * Finds a job by title and company name.
     */
    async findByTitleAndCompany(title, company) {
        return this.prisma.job.findFirst({
            where: {
                title: { equals: title, mode: "insensitive" },
                company: { equals: company, mode: "insensitive" },
            },
        });
    }
    /**
     * Inserts a new job or updates an existing one.
     */
    async upsertJob(jobData) {
        const existingJob = await this.findByTitleAndCompany(jobData.title, jobData.company);
        if (existingJob) {
            const updatedJob = await this.prisma.job.update({
                where: { id: existingJob.id },
                data: {
                    location: jobData.location,
                    description: jobData.description,
                    requiredSkills: jobData.requiredSkills,
                    applyLink: jobData.applyLink,
                    applicationDeadline: jobData.applicationDeadline,
                    source: jobData.source,
                    sourceUrl: jobData.sourceUrl,
                    isActive: true,
                    lastFetchedAt: jobData.scrapedAt,
                },
            });
            return { job: updatedJob, isNew: false };
        }
        else {
            const newJob = await this.prisma.job.create({
                data: {
                    title: jobData.title,
                    company: jobData.company,
                    location: jobData.location,
                    description: jobData.description,
                    requiredSkills: jobData.requiredSkills,
                    applyLink: jobData.applyLink,
                    applicationDeadline: jobData.applicationDeadline,
                    source: jobData.source,
                    sourceUrl: jobData.sourceUrl,
                    isActive: true,
                    lastFetchedAt: jobData.scrapedAt,
                },
            });
            return { job: newJob, isNew: true };
        }
    }
    /**
     * Deactivates all active jobs where the application deadline is in the past.
     */
    async deactivateExpiredJobs(comparisonDate) {
        const result = await this.prisma.job.updateMany({
            where: {
                applicationDeadline: {
                    lt: comparisonDate,
                },
                isActive: true,
            },
            data: {
                isActive: false,
            },
        });
        return result.count;
    }
}
exports.JobRepository = JobRepository;
exports.jobRepository = new JobRepository();
exports.default = exports.jobRepository;
