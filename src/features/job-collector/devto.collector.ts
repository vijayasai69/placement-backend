import axios from "axios";
import { IJobCollector } from "./collector.interface.js";
import { RawJob } from "./collector.types.js";

export class DevToCollector implements IJobCollector {
  readonly sourceName = "Dev.to Jobs API";

  async collect(): Promise<RawJob[]> {
    try {
      const response = await axios.get("https://dev.to/api/listings?category=jobs");
      const jobs = response.data || [];
      
      return jobs.map((job: any) => ({
        title: job.title,
        company: job.organization?.name || job.user?.name || "Unknown Tech Company",
        location: job.location || "Remote / Global",
        description: (job.body_markdown || job.description || "").substring(0, 500) + '...',
        applyLink: job.url,
        applicationDeadline: new Date(new Date().getTime() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        source: this.sourceName,
        sourceUrl: "https://dev.to/listings",
        scrapedAt: new Date(),
      }));
    } catch (error) {
      // Silently ignore errors
      return [];
    }
  }
}
