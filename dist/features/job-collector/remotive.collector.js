"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemotiveCollector = void 0;
const axios_1 = __importDefault(require("axios"));
class RemotiveCollector {
    sourceName = "Remotive Jobs API";
    async collect() {
        try {
            const response = await axios_1.default.get("https://remotive.com/api/remote-jobs?category=software-dev&limit=1000");
            const jobs = response.data.jobs || [];
            const validJobs = jobs; // Keep all jobs to increase volume
            return validJobs.map((job) => ({
                title: job.title,
                company: job.company_name,
                location: job.candidate_required_location || "Remote",
                description: job.description.replace(/<[^>]*>?/gm, '').substring(0, 500) + '...',
                applyLink: job.url,
                applicationDeadline: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
                source: this.sourceName,
                sourceUrl: "https://remotive.com",
                scrapedAt: new Date(),
            }));
        }
        catch (error) {
            // Silently ignore errors
            return [];
        }
    }
}
exports.RemotiveCollector = RemotiveCollector;
