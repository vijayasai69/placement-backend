import axios from "axios";
import { IJobCollector } from "./collector.interface.js";
import { RawJob } from "./collector.types.js";

export class RemotiveCollector implements IJobCollector {
  readonly sourceName = "Remotive Jobs API";

  async collect(): Promise<RawJob[]> {
    try {
      const response = await axios.get(
        "https://remotive.com/api/remote-jobs?category=software-dev&limit=1000"
      );

      const jobs = response.data.jobs || [];
      const validJobs = jobs; // Keep all jobs to increase volume

      return validJobs.map((job: any) => ({
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || "Remote",
        description: job.description.replace(/<[^>]*>?/gm, '').substring(0, 500) + '...',
        applyLink: job.url,
        applicationDeadline: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
        source: this.sourceName,
        sourceUrl: "https://remotive.com",
        scrapedAt: new Date(),
      }));
    } catch (error) {
      // Silently ignore errors
      return [];
    }
  }
}
