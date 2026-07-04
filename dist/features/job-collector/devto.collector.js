"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevToCollector = void 0;
const axios_1 = __importDefault(require("axios"));
class DevToCollector {
    sourceName = "Dev.to Jobs API";
    async collect() {
        try {
            const response = await axios_1.default.get("https://dev.to/api/listings?category=jobs");
            const jobs = response.data || [];
            return jobs.map((job) => ({
                title: job.title,
                company: job.organization?.name || job.user?.name || "Unknown Tech Company",
                location: job.location || "Remote / Global",
                description: (job.body_markdown || job.description || "").substring(0, 500) + '...',
                applyLink: job.url,
                applicationDeadline: new Date(new Date().getTime() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
                source: this.sourceName,
                sourceUrl: "https://dev.to/listings",
                scrapedAt: new Date(),
            }));
        }
        catch (error) {
            // Silently ignore errors
            return [];
        }
    }
}
exports.DevToCollector = DevToCollector;
