"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobCollectorService = exports.JobCollectorService = void 0;
const remotive_collector_js_1 = require("./remotive.collector.js");
const remoteok_collector_js_1 = require("./remoteok.collector.js");
const weworkremotely_collector_js_1 = require("./weworkremotely.collector.js");
const arbeitnow_collector_js_1 = require("./arbeitnow.collector.js");
const devto_collector_js_1 = require("./devto.collector.js");
const greenhouse_collector_js_1 = require("./greenhouse.collector.js");
const lever_collector_js_1 = require("./lever.collector.js");
const logger_js_1 = require("../../utils/logger.js");
const language_js_1 = require("../../utils/language.js");
class JobCollectorService {
    collectors;
    constructor(collectors) {
        this.collectors = collectors;
    }
    /**
     * Aggregates raw jobs from all registered collectors.
     * Leverages Promise.allSettled() to guarantee failure isolation.
     */
    async collectFromAll() {
        logger_js_1.logger.info(`Starting Job Collection across ${this.collectors.length} platforms...`);
        const collectionPromises = this.collectors.map(async (collector, index) => {
            try {
                // Slowly load: stagger the start times slightly to prevent massive simultaneous network bursts
                await new Promise((resolve) => setTimeout(resolve, index * 300));
                logger_js_1.logger.info(`Collector [${collector.sourceName}] starting execution...`);
                // Max 14-second timeout to ensure the total process stays strictly under the 15-second limit
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error(`Collector exceeded time limit`)), 14000);
                });
                const jobs = await Promise.race([
                    collector.collect(),
                    timeoutPromise
                ]);
                logger_js_1.logger.info(`Collector [${collector.sourceName}] successfully scraped ${jobs.length} raw records.`);
                return { source: collector.sourceName, jobs, success: true };
            }
            catch (error) {
                logger_js_1.logger.error(`Collector [${collector.sourceName}] failed:`, error);
                throw error;
            }
        });
        const results = await Promise.allSettled(collectionPromises);
        const aggregatedJobs = [];
        for (const result of results) {
            if (result.status === "fulfilled") {
                aggregatedJobs.push(...result.value.jobs);
            }
            else {
                logger_js_1.logger.warn("A job collector failed to complete, but other collectors continued.");
            }
        }
        const englishJobs = aggregatedJobs.filter(job => (0, language_js_1.isEnglish)(job.title + " " + job.description));
        logger_js_1.logger.info(`Completed aggregation. Collected a total of ${aggregatedJobs.length} raw jobs, kept ${englishJobs.length} English jobs.`);
        return englishJobs;
    }
    /**
     * Exposes registered collectors list for health check.
     */
    getRegisteredCollectors() {
        return this.collectors.map((c) => c.sourceName);
    }
}
exports.JobCollectorService = JobCollectorService;
// Expose default instance with standard production collectors injected
exports.jobCollectorService = new JobCollectorService([
    new remotive_collector_js_1.RemotiveCollector(),
    new arbeitnow_collector_js_1.ArbeitnowCollector(),
    new devto_collector_js_1.DevToCollector(),
    new greenhouse_collector_js_1.GreenhouseCollector(),
    new lever_collector_js_1.LeverCollector(),
    new remoteok_collector_js_1.RemoteOKCollector(),
    new weworkremotely_collector_js_1.WeWorkRemotelyCollector()
]);
exports.default = exports.jobCollectorService;
