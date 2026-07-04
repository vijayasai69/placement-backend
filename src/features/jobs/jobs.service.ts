import { prisma } from "../../config/prisma.js";

export class JobsService {
  async getAllActiveJobs() {
    return prisma.job.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getJobById(id: string) {
    return prisma.job.findUnique({
      where: { id },
    });
  }

  async createJob(data: any) {
    return prisma.job.create({
      data,
    });
  }
}

export const jobsService = new JobsService();
export default jobsService;
