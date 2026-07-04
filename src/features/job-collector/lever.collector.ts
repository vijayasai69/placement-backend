import axios from "axios";
import { IJobCollector } from "./collector.interface.js";
import { RawJob } from "./collector.types.js";

export class LeverCollector implements IJobCollector {
  readonly sourceName = "Lever API";

  async collect(): Promise<RawJob[]> {
    const sites = ["figma", "notion", "canva", "yelp", "quora", "spotify", "slack", "atlassian", "zoom", "lyft", "uber", "netflix", "shopify", "coursera", "udemy"];
    const allJobs: RawJob[] = [];

    for (const site of sites) {
      try {
        const response = await axios.get(`https://api.lever.co/v0/postings/${site}?mode=json`);
        const jobs = response.data || [];
        
        const mappedJobs = jobs.map((job: any) => ({
          title: job.text,
          company: site.charAt(0).toUpperCase() + site.slice(1),
          location: job.categories?.location || "Remote / Office",
          description: job.descriptionPlain?.substring(0, 500) + '...' || "View Lever posting for details.",
          applyLink: job.applyUrl || job.hostedUrl,
          applicationDeadline: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days
          source: this.sourceName,
          sourceUrl: `https://jobs.lever.co/${site}`,
          scrapedAt: new Date(),
        }));
        
        allJobs.push(...mappedJobs);
      } catch (error) {
        // Silently ignore 404s for sites that don't use Lever
      }
    }

    return allJobs;
  }
}
