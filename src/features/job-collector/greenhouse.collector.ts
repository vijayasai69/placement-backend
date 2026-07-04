import axios from "axios";
import { IJobCollector } from "./collector.interface.js";
import { RawJob } from "./collector.types.js";

export class GreenhouseCollector implements IJobCollector {
  readonly sourceName = "Greenhouse API";

  async collect(): Promise<RawJob[]> {
    const boards = ["stripe", "discord", "vercel", "twitch", "pinterest", "reddit", "airbnb", "doordash", "instacart", "framer", "plaid", "brex", "scaleai", "anthropic"];
    const allJobs: RawJob[] = [];

    for (const board of boards) {
      try {
        const response = await axios.get(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs`);
        const jobs = response.data.jobs || [];
        
        const mappedJobs = jobs.map((job: any) => ({
          title: job.title,
          company: board.charAt(0).toUpperCase() + board.slice(1),
          location: job.location?.name || "Remote / Office",
          description: "Apply via Greenhouse link to see full description and requirements.",
          applyLink: job.absolute_url,
          applicationDeadline: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days
          source: this.sourceName,
          sourceUrl: `https://boards.greenhouse.io/${board}`,
          scrapedAt: new Date(),
        }));
        
        allJobs.push(...mappedJobs);
      } catch (error) {
        // Silently ignore 404s
      }
    }

    return allJobs;
  }
}
