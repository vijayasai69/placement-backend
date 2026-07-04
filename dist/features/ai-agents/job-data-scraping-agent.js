"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobDataScrapingAgent = exports.JobDataScrapingAgent = void 0;
const collector_service_js_1 = require("../job-collector/collector.service.js");
const duplicate_detector_service_js_1 = require("../job-collector/duplicate-detector.service.js");
const job_scraping_metrics_service_js_1 = require("../job-collector/job-scraping-metrics.service.js");
const job_repository_js_1 = require("../../repositories/job.repository.js");
const logger_js_1 = require("../../utils/logger.js");
const zod_1 = require("zod");
const skillExtractionSchema = zod_1.z.object({
    skills: zod_1.z.array(zod_1.z.string()),
});
class JobDataScrapingAgent {
    collectorService;
    duplicateDetector;
    metricsService;
    jobRepository;
    lastRunAt = null;
    jobsCollectedCount = 0;
    constructor(collectorService = collector_service_js_1.jobCollectorService, duplicateDetector = duplicate_detector_service_js_1.duplicateDetectorService, metricsService = job_scraping_metrics_service_js_1.jobScrapingMetricsService, jobRepository = job_repository_js_1.jobRepository) {
        this.collectorService = collectorService;
        this.duplicateDetector = duplicateDetector;
        this.metricsService = metricsService;
        this.jobRepository = jobRepository;
    }
    /**
     * Main Orchestrator Run Cycle.
     */
    async runScrapingCycle() {
        logger_js_1.logger.info("🤖 AI Job Data Scraping Agent initiating cycle...");
        this.metricsService.reset();
        try {
            // 1. Job Collection
            const rawJobs = await this.collectorService.collectFromAll();
            this.metricsService.incrementCollected(rawJobs.length);
            // 2. Job Validation and Normalization
            const validatedJobs = [];
            for (const rawJob of rawJobs) {
                const validated = this.normalizeAndValidate(rawJob);
                if (validated) {
                    validatedJobs.push(validated);
                    this.metricsService.incrementValidated(1);
                }
            }
            // 3. Skill & Company Metadata Extraction using AI (or fallback)
            const processedJobs = [];
            for (const job of validatedJobs) {
                logger_js_1.logger.info(`Extracting skills for job: "${job.title}" at "${job.company}"`);
                const skills = await this.extractSkillsWithAI(job.description);
                // Merge extracted skills
                processedJobs.push({
                    ...job,
                    requiredSkills: skills,
                });
            }
            // 4. Load Existing Jobs for Deduplication
            const existingJobsBrief = await this.jobRepository.findAllBrief();
            // 5. Deduplication
            const { uniqueJobs, duplicatesCount } = this.duplicateDetector.filterDuplicates(processedJobs, existingJobsBrief);
            this.metricsService.incrementDuplicatesRemoved(duplicatesCount);
            // 6. DB Storage (Upsert)
            let storedCount = 0;
            let updatedCount = 0;
            for (const job of uniqueJobs) {
                const result = await this.jobRepository.upsertJob(job);
                if (result.isNew) {
                    storedCount++;
                }
                else {
                    updatedCount++;
                }
            }
            this.metricsService.incrementStored(storedCount);
            this.metricsService.incrementUpdated(updatedCount);
            // 7. Expired Job Cleanup
            const deactivatedCount = await this.jobRepository.deactivateExpiredJobs(new Date());
            this.metricsService.incrementExpiredDeactivated(deactivatedCount);
            // Update Agent state
            this.lastRunAt = new Date();
            this.jobsCollectedCount = rawJobs.length;
            // Log stats
            this.metricsService.logMetrics();
            logger_js_1.logger.info("🤖 AI Job Data Scraping Agent successfully finished cycle.");
        }
        catch (error) {
            logger_js_1.logger.error("❌ AI Job Data Scraping Agent cycle encountered an error:", error);
        }
    }
    /**
     * Health status endpoint details for the agent.
     */
    getAgentHealth() {
        return {
            status: "healthy",
            lastRunAt: this.lastRunAt,
            collectors: this.collectorService.getRegisteredCollectors(),
            jobsCollected: this.jobsCollectedCount,
        };
    }
    /**
     * AI-powered Skill Extraction abstraction. Can be easily swapped with OpenAI/Gemini/Claude.
     */
    async extractSkillsWithAI(description) {
        // Bypassing AI extraction for bulk scraping to prevent rate limits and massive delays.
        // We instantly use the rule-based extractor instead, processing 2500+ jobs in milliseconds.
        return this.ruleBasedSkillExtractorFallback(description);
    }
    /**
     * Fallback rule-based keyword matcher for when AI extraction fails.
     */
    ruleBasedSkillExtractorFallback(description) {
        const commonSkills = [
            "Node.js", "Express", "TypeScript", "PostgreSQL", "Docker", "REST API",
            "Java", "Spring Boot", "AWS", "Redis", "Microservices", "Python",
            "LangChain", "LangGraph", "Groq", "OpenAI", "Vector Databases",
            "FastAPI", "React", "Next.js", "Tailwind", "HTML", "CSS", "SQL",
            "BigQuery", "GCP", "Linux", "Kubernetes", "Go", "C#", "PyTorch"
        ];
        const matched = [];
        const descriptionLower = description.toLowerCase();
        for (const skill of commonSkills) {
            const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (regex.test(descriptionLower)) {
                matched.push(skill);
            }
        }
        if (matched.length === 0) {
            return ["Software Development"];
        }
        return matched;
    }
    /**
     * Data validation and normalization.
     */
    normalizeAndValidate(rawJob) {
        if (!rawJob.title || !rawJob.title.trim()) {
            logger_js_1.logger.warn("Validation failed: Title is missing.");
            return null;
        }
        if (!rawJob.company || !rawJob.company.trim()) {
            logger_js_1.logger.warn(`Validation failed for job "${rawJob.title}": Company is missing.`);
            return null;
        }
        if (!rawJob.description || !rawJob.description.trim()) {
            logger_js_1.logger.warn(`Validation failed for job "${rawJob.title}" at "${rawJob.company}": Description is missing.`);
            return null;
        }
        if (!rawJob.applyLink || !rawJob.applyLink.trim()) {
            logger_js_1.logger.warn(`Validation failed for job "${rawJob.title}" at "${rawJob.company}": applyLink is missing.`);
            return null;
        }
        let deadlineDate;
        if (rawJob.applicationDeadline) {
            deadlineDate = new Date(rawJob.applicationDeadline);
            if (isNaN(deadlineDate.getTime())) {
                // Invalid date string, default to 30 days out
                deadlineDate = new Date();
                deadlineDate.setDate(deadlineDate.getDate() + 30);
            }
        }
        else {
            deadlineDate = new Date();
            deadlineDate.setDate(deadlineDate.getDate() + 30);
        }
        return {
            title: rawJob.title.trim(),
            company: rawJob.company.trim(),
            location: rawJob.location?.trim() || "Remote",
            description: rawJob.description.trim(),
            requiredSkills: [], // Will be populated in next step
            applyLink: rawJob.applyLink.trim(),
            applicationDeadline: deadlineDate,
            source: rawJob.source,
            sourceUrl: rawJob.sourceUrl || rawJob.applyLink,
            scrapedAt: rawJob.scrapedAt || new Date(),
            isActive: true,
            lastFetchedAt: new Date(),
        };
    }
}
exports.JobDataScrapingAgent = JobDataScrapingAgent;
// Default agent instance
exports.jobDataScrapingAgent = new JobDataScrapingAgent();
exports.default = exports.jobDataScrapingAgent;
