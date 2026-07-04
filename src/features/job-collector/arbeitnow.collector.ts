import axios from "axios";
import { IJobCollector } from "./collector.interface.js";
import { RawJob } from "./collector.types.js";

export class ArbeitnowCollector implements IJobCollector {
  readonly sourceName = "Arbeitnow Jobs API";

  async collect(): Promise<RawJob[]> {
    try {
      const response = await axios.get("https://www.arbeitnow.com/api/job-board-api");
      const jobs = response.data.data || [];
      
      return jobs.map((job: any) => ({
        title: job.title,
        company: job.company_name,
        location: job.location || "Remote",
        description: (job.description || "").replace(/<[^>]*>?/gm, '').substring(0, 500) + '...',
        applyLink: job.url,
        applicationDeadline: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
        source: this.sourceName,
        sourceUrl: "https://www.arbeitnow.com",
        scrapedAt: new Date(),
      }));
    } catch (error) {
      // Silently ignore errors
      return [];
    }
  }
}
