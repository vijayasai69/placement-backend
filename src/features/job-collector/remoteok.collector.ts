import axios from "axios";
import { IJobCollector } from "./collector.interface.js";
import { RawJob } from "./collector.types.js";

export class RemoteOKCollector implements IJobCollector {
  readonly sourceName = "RemoteOK API";

  async collect(): Promise<RawJob[]> {
    try {
      // RemoteOK API allows fetching real-time remote jobs.
      const response = await axios.get("https://remoteok.com/api");
      const jobs = response.data || [];
      
      // The first element is usually a legal notice, so we slice it off.
      const validJobs = Array.isArray(jobs) ? jobs.slice(1) : [];

      return validJobs.map((job: any) => ({
        title: job.position,
        company: job.company,
        location: job.location || "Remote",
        description: (job.description || "").replace(/<[^>]*>?/gm, '').substring(0, 500) + '...',
        applyLink: job.apply_url || job.url,
        applicationDeadline: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
        source: this.sourceName,
        sourceUrl: "https://remoteok.com",
        scrapedAt: new Date(),
      }));
    } catch (error) {
      // Silently ignore to prevent console errors
      return [];
    }
  }
}
