"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.duplicateDetectorService = exports.DuplicateDetectorService = void 0;
class DuplicateDetectorService {
    /**
     * Deduplicates a batch of newly collected jobs, and filters out those that already exist in the database.
     */
    filterDuplicates(newJobs, existingJobs) {
        const seen = new Set();
        const uniqueJobs = [];
        let duplicatesCount = 0;
        // Create lookup keys for existing jobs
        const existingKeys = new Set(existingJobs.map((job) => this.generateKey(job.title, job.company)));
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
    generateKey(title, company) {
        return `${title.trim().toLowerCase()}|${company.trim().toLowerCase()}`;
    }
}
exports.DuplicateDetectorService = DuplicateDetectorService;
exports.duplicateDetectorService = new DuplicateDetectorService();
exports.default = exports.duplicateDetectorService;
