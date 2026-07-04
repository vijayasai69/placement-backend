import { PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "../config/prisma.js";
import { ValidatedJob } from "../features/job-collector/collector.types.js";

export class JobRepository {
  constructor(private prisma: PrismaClient = defaultPrisma) {}

  /**
   * Retrieves all jobs.
   */
  async findAll(): Promise<any[]> {
    return this.prisma.job.findMany();
  }

  /**
   * Retrieves minimal identification fields of all jobs (for deduplication lookup).
   */
  async findAllBrief(): Promise<{ title: string; company: string }[]> {
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
  async findByTitleAndCompany(title: string, company: string): Promise<any | null> {
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
  async upsertJob(jobData: ValidatedJob): Promise<{ job: any; isNew: boolean }> {
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
    } else {
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
  async deactivateExpiredJobs(comparisonDate: Date): Promise<number> {
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

export const jobRepository = new JobRepository();
export default jobRepository;
