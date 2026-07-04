import { ValidatedJob } from "./collector.types.js";

export class DuplicateDetectorService {
  /**
   * Deduplicates a batch of newly collected jobs, and filters out those that already exist in the database.
   */
  filterDuplicates(
    newJobs: ValidatedJob[],
    existingJobs: { title: string; company: string }[]
  ): { uniqueJobs: ValidatedJob[]; duplicatesCount: number } {
    const seen = new Set<string>();
    const uniqueJobs: ValidatedJob[] = [];
    let duplicatesCount = 0;

    // Create lookup keys for existing jobs
    const existingKeys = new Set(
      existingJobs.map((job) => this.generateKey(job.title, job.company))
    );

    for (const job of newJobs) {
      const key = this.generateKey(job.title, job.company);

      // Check if it's a duplicate within the current batch OR already exists in the database
      if (seen.has(key) || existingKeys.has(key)) {
        duplicatesCount++;
        continue;
      }

      seen.add(key);
      uniqueJobs.push(job);
    }

    return { uniqueJobs, duplicatesCount };
  }

  private generateKey(title: string, company: string): string {
    return `${title.trim().toLowerCase()}|${company.trim().toLowerCase()}`;
  }
}

export const duplicateDetectorService = new DuplicateDetectorService();
export default duplicateDetectorService;
