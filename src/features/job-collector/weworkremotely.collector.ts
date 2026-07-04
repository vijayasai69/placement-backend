import Parser from "rss-parser";
import { IJobCollector } from "./collector.interface.js";
import { RawJob } from "./collector.types.js";

export class WeWorkRemotelyCollector implements IJobCollector {
  readonly sourceName = "We Work Remotely RSS";

  async collect(): Promise<RawJob[]> {
    try {
      const parser = new Parser();
      const feed = await parser.parseURL("https://weworkremotely.com/remote-jobs.rss");
      
      const jobs = feed.items || [];
      
      return jobs.map((item: any) => {
        // WWR title format is usually "Company: Role"
        let company = "Unknown";
        let title = item.title || "Remote Job";
        
        if (title.includes(":")) {
          const parts = title.split(":");
          company = parts[0].trim();
          title = parts.slice(1).join(":").trim();
        }

        return {
          title: title,
          company: company,
          location: "Remote",
          description: (item.contentSnippet || item.content || "").replace(/<[^>]*>?/gm, '').substring(0, 500) + '...',
          applyLink: item.link,
          applicationDeadline: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
          source: this.sourceName,
          sourceUrl: "https://weworkremotely.com",
          scrapedAt: new Date(),
        };
      });
    } catch (error) {
      // Silently ignore to prevent console errors
      return [];
    }
  }
}
