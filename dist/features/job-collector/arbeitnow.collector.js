"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArbeitnowCollector = void 0;
const axios_1 = __importDefault(require("axios"));
class ArbeitnowCollector {
    sourceName = "Arbeitnow Jobs API";
    async collect() {
        try {
            const response = await axios_1.default.get("https://www.arbeitnow.com/api/job-board-api");
            const jobs = response.data.data || [];
            return jobs.map((job) => ({
                title: job.title,
                company: job.company_name,
                location: job.location || "Remote",
                description: (job.description || "").replace(/<[^>]*>?/gm, '').substring(0, 500) + '...',
                applyLink: job.url,
                applicationDeadline: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
                source: this.sourceName,
                sourceUrl: "https://www.arbeitnow.com",
                scrapedAt: new Date(),
            }));
        }
        catch (error) {
            // Silently ignore errors
            return [];
        }
    }
}
exports.ArbeitnowCollector = ArbeitnowCollector;
