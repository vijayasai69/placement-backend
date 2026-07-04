import { JobCollectorService, jobCollectorService as defaultCollectorService } from "../job-collector/collector.service.js";
import { DuplicateDetectorService, duplicateDetectorService as defaultDetectorService } from "../job-collector/duplicate-detector.service.js";
import { JobScrapingMetricsService, jobScrapingMetricsService as defaultMetricsService } from "../job-collector/job-scraping-metrics.service.js";
import { JobRepository, jobRepository as defaultRepository } from "../../repositories/job.repository.js";
import { getStructuredAIResponse } from "../../providers/groq.provider.js";
import { logger } from "../../utils/logger.js";
import { RawJob, ValidatedJob } from "../job-collector/collector.types.js";
import { z } from "zod";

const skillExtractionSchema = z.object({
  skills: z.array(z.string()),
});

type SkillExtractionResult = z.infer<typeof skillExtractionSchema>;

export class JobDataScrapingAgent {
  private lastRunAt: Date | null = null;
  private jobsCollectedCount = 0;

  constructor(
    private collectorService: JobCollectorService = defaultCollectorService,
    private duplicateDetector: DuplicateDetectorService = defaultDetectorService,
    private metricsService: JobScrapingMetricsService = defaultMetricsService,
    private jobRepository: JobRepository = defaultRepository
  ) { }

  /**
   * Main Orchestrator Run Cycle.
   */
  async runScrapingCycle(): Promise<void> {
    logger.info("🤖 AI Job Data Scraping Agent initiating cycle...");
    this.metricsService.reset();

    try {
      // 1. Job Collection
      const rawJobs = await this.collectorService.collectFromAll();
      this.metricsService.incrementCollected(rawJobs.length);

      // 2. Job Validation and Normalization
      const validatedJobs: ValidatedJob[] = [];
      for (const rawJob of rawJobs) {
        const validated = this.normalizeAndValidate(rawJob);
        if (validated) {
          validatedJobs.push(validated);
          this.metricsService.incrementValidated(1);
        }
      }

      // 3. Skill & Company Metadata Extraction using AI (or fallback)
      const processedJobs: ValidatedJob[] = [];
      for (const job of validatedJobs) {
        logger.info(`Extracting skills for job: "${job.title}" at "${job.company}"`);
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
      const { uniqueJobs, duplicatesCount } = this.duplicateDetector.filterDuplicates(
        processedJobs,
        existingJobsBrief
      );
      this.metricsService.incrementDuplicatesRemoved(duplicatesCount);

      // 6. DB Storage (Upsert)
      let storedCount = 0;
      let updatedCount = 0;
      for (const job of uniqueJobs) {
        const result = await this.jobRepository.upsertJob(job);
        if (result.isNew) {
          storedCount++;
        } else {
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
      logger.info("🤖 AI Job Data Scraping Agent successfully finished cycle.");
    } catch (error) {
      logger.error("❌ AI Job Data Scraping Agent cycle encountered an error:", error);
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
  private async extractSkillsWithAI(description: string): Promise<string[]> {
    // Bypassing AI extraction for bulk scraping to prevent rate limits and massive delays.
    // We instantly use the rule-based extractor instead, processing 2500+ jobs in milliseconds.
    return this.ruleBasedSkillExtractorFallback(description);
  }

  /**
   * Fallback rule-based keyword matcher for when AI extraction fails.
   */
  private ruleBasedSkillExtractorFallback(description: string): string[] {
    const commonSkills = [
      "Node.js", "Express", "TypeScript", "PostgreSQL", "Docker", "REST API",
      "Java", "Spring Boot", "AWS", "Redis", "Microservices", "Python",
      "LangChain", "LangGraph", "Groq", "OpenAI", "Vector Databases",
      "FastAPI", "React", "Next.js", "Tailwind", "HTML", "CSS", "SQL",
      "BigQuery", "GCP", "Linux", "Kubernetes", "Go", "C#", "PyTorch"
    ];

    const matched: string[] = [];
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
  private normalizeAndValidate(rawJob: RawJob): ValidatedJob | null {
    if (!rawJob.title || !rawJob.title.trim()) {
      logger.warn("Validation failed: Title is missing.");
      return null;
    }
    if (!rawJob.company || !rawJob.company.trim()) {
      logger.warn(`Validation failed for job "${rawJob.title}": Company is missing.`);
      return null;
    }
    if (!rawJob.description || !rawJob.description.trim()) {
      logger.warn(`Validation failed for job "${rawJob.title}" at "${rawJob.company}": Description is missing.`);
      return null;
    }
    if (!rawJob.applyLink || !rawJob.applyLink.trim()) {
      logger.warn(`Validation failed for job "${rawJob.title}" at "${rawJob.company}": applyLink is missing.`);
      return null;
    }

    let deadlineDate: Date;
    if (rawJob.applicationDeadline) {
      deadlineDate = new Date(rawJob.applicationDeadline);
      if (isNaN(deadlineDate.getTime())) {
        // Invalid date string, default to 30 days out
        deadlineDate = new Date();
        deadlineDate.setDate(deadlineDate.getDate() + 30);
      }
    } else {
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

// Default agent instance
export const jobDataScrapingAgent = new JobDataScrapingAgent();
export default jobDataScrapingAgent;
