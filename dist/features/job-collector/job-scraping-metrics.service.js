"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobScrapingMetricsService = exports.JobScrapingMetricsService = void 0;
const logger_js_1 = require("../../utils/logger.js");
class JobScrapingMetricsService {
    totalJobsCollected = 0;
    totalJobsValidated = 0;
    totalDuplicatesRemoved = 0;
    totalJobsStored = 0;
    totalJobsUpdated = 0;
    totalExpiredJobsDeactivated = 0;
    reset() {
        this.totalJobsCollected = 0;
        this.totalJobsValidated = 0;
        this.totalDuplicatesRemoved = 0;
        this.totalJobsStored = 0;
        this.totalJobsUpdated = 0;
        this.totalExpiredJobsDeactivated = 0;
    }
    incrementCollected(count = 1) {
        this.totalJobsCollected += count;
    }
    incrementValidated(count = 1) {
        this.totalJobsValidated += count;
    }
    incrementDuplicatesRemoved(count = 1) {
        this.totalDuplicatesRemoved += count;
    }
    incrementStored(count = 1) {
        this.totalJobsStored += count;
    }
    incrementUpdated(count = 1) {
        this.totalJobsUpdated += count;
    }
    incrementExpiredDeactivated(count = 1) {
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
    logMetrics() {
        logger_js_1.logger.info("====================================");
        logger_js_1.logger.info("AI JOB DATA SCRAPING CYCLE METRICS");
        logger_js_1.logger.info("====================================");
        logger_js_1.logger.info(`Total Jobs Collected:          ${this.totalJobsCollected}`);
        logger_js_1.logger.info(`Total Jobs Validated:          ${this.totalJobsValidated}`);
        logger_js_1.logger.info(`Total Duplicates Removed:      ${this.totalDuplicatesRemoved}`);
        logger_js_1.logger.info(`Total New Jobs Stored:         ${this.totalJobsStored}`);
        logger_js_1.logger.info(`Total Existing Jobs Updated:   ${this.totalJobsUpdated}`);
        logger_js_1.logger.info(`Total Expired Jobs Deactivated: ${this.totalExpiredJobsDeactivated}`);
        logger_js_1.logger.info("====================================");
    }
}
exports.JobScrapingMetricsService = JobScrapingMetricsService;
exports.jobScrapingMetricsService = new JobScrapingMetricsService();
exports.default = exports.jobScrapingMetricsService;
