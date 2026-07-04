import { logger } from "../../utils/logger.js";

export class JobScrapingMetricsService {
  private totalJobsCollected = 0;
  private totalJobsValidated = 0;
  private totalDuplicatesRemoved = 0;
  private totalJobsStored = 0;
  private totalJobsUpdated = 0;
  private totalExpiredJobsDeactivated = 0;

  reset(): void {
    this.totalJobsCollected = 0;
    this.totalJobsValidated = 0;
    this.totalDuplicatesRemoved = 0;
    this.totalJobsStored = 0;
    this.totalJobsUpdated = 0;
    this.totalExpiredJobsDeactivated = 0;
  }

  incrementCollected(count = 1): void {
    this.totalJobsCollected += count;
  }

  incrementValidated(count = 1): void {
    this.totalJobsValidated += count;
  }

  incrementDuplicatesRemoved(count = 1): void {
    this.totalDuplicatesRemoved += count;
  }

  incrementStored(count = 1): void {
    this.totalJobsStored += count;
  }

  incrementUpdated(count = 1): void {
    this.totalJobsUpdated += count;
  }

  incrementExpiredDeactivated(count = 1): void {
    this.totalExpiredJobsDeactivated += count;
  }

  getMetrics() {
    return {
      totalJobsCollected: this.totalJobsCollected,
      totalJobsValidated: this.totalJobsValidated,
      totalDuplicatesRemoved: this.totalDuplicatesRemoved,
      totalJobsStored: this.totalJobsStored,
      totalJobsUpdated: this.totalJobsUpdated,
      totalExpiredJobsDeactivated: this.totalExpiredJobsDeactivated,
    };
  }

  logMetrics(): void {
    logger.info("====================================");
    logger.info("AI JOB DATA SCRAPING CYCLE METRICS");
    logger.info("====================================");
    logger.info(`Total Jobs Collected:          ${this.totalJobsCollected}`);
    logger.info(`Total Jobs Validated:          ${this.totalJobsValidated}`);
    logger.info(`Total Duplicates Removed:      ${this.totalDuplicatesRemoved}`);
    logger.info(`Total New Jobs Stored:         ${this.totalJobsStored}`);
    logger.info(`Total Existing Jobs Updated:   ${this.totalJobsUpdated}`);
    logger.info(`Total Expired Jobs Deactivated: ${this.totalExpiredJobsDeactivated}`);
    logger.info("====================================");
  }
}

export const jobScrapingMetricsService = new JobScrapingMetricsService();
export default jobScrapingMetricsService;
