import { IJobCollector } from "./collector.interface.js";
import { RawJob } from "./collector.types.js";
import { RemotiveCollector } from "./remotive.collector.js";
import { RemoteOKCollector } from "./remoteok.collector.js";
import { WeWorkRemotelyCollector } from "./weworkremotely.collector.js";
import { ArbeitnowCollector } from "./arbeitnow.collector.js";
import { DevToCollector } from "./devto.collector.js";
import { GreenhouseCollector } from "./greenhouse.collector.js";
import { LeverCollector } from "./lever.collector.js";
import { logger } from "../../utils/logger.js";
import { isEnglish } from "../../utils/language.js";

export class JobCollectorService {
  constructor(private collectors: IJobCollector[]) { }

  /**
   * Aggregates raw jobs from all registered collectors.
   * Leverages Promise.allSettled() to guarantee failure isolation.
   */
  async collectFromAll(): Promise<RawJob[]> {
    logger.info(`Starting Job Collection across ${this.collectors.length} platforms...`);

    const collectionPromises = this.collectors.map(async (collector, index) => {
      try {
        // Slowly load: stagger the start times slightly to prevent massive simultaneous network bursts
        await new Promise((resolve) => setTimeout(resolve, index * 300));
        
        logger.info(`Collector [${collector.sourceName}] starting execution...`);
        
        // Max 14-second timeout to ensure the total process stays strictly under the 15-second limit
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Collector exceeded time limit`)), 14000);
        });

        const jobs = await Promise.race([
          collector.collect(),
          timeoutPromise
        ]);

        logger.info(`Collector [${collector.sourceName}] successfully scraped ${jobs.length} raw records.`);
        return { source: collector.sourceName, jobs, success: true };
      } catch (error) {
        logger.error(`Collector [${collector.sourceName}] failed:`, error);
        throw error;
      }
    });

    const results = await Promise.allSettled(collectionPromises);
    const aggregatedJobs: RawJob[] = [];

    for (const result of results) {
      if (result.status === "fulfilled") {
        aggregatedJobs.push(...result.value.jobs);
      } else {
        logger.warn("A job collector failed to complete, but other collectors continued.");
      }
    }

    const englishJobs = aggregatedJobs.filter(job => isEnglish(job.title + " " + job.description));
    logger.info(`Completed aggregation. Collected a total of ${aggregatedJobs.length} raw jobs, kept ${englishJobs.length} English jobs.`);
    return englishJobs;
  }

  /**
   * Exposes registered collectors list for health check.
   */
  getRegisteredCollectors(): string[] {
    return this.collectors.map((c) => c.sourceName);
  }
}

// Expose default instance with standard production collectors injected
export const jobCollectorService = new JobCollectorService([
  new RemotiveCollector(),
  new ArbeitnowCollector(),
  new DevToCollector(),
  new GreenhouseCollector(),
  new LeverCollector(),
  new RemoteOKCollector(),
  new WeWorkRemotelyCollector()
]);

export default jobCollectorService;