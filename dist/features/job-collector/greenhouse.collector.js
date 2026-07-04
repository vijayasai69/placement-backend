"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GreenhouseCollector = void 0;
const axios_1 = __importDefault(require("axios"));
class GreenhouseCollector {
    sourceName = "Greenhouse API";
    async collect() {
        const boards = ["stripe", "discord", "vercel", "twitch", "pinterest", "reddit", "airbnb", "doordash", "instacart", "framer", "plaid", "brex", "scaleai", "anthropic"];
        const allJobs = [];
        for (const board of boards) {
            try {
                const response = await axios_1.default.get(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs`);
                const jobs = response.data.jobs || [];
                const mappedJobs = jobs.map((job) => ({
                    title: job.title,
                    company: board.charAt(0).toUpperCase() + board.slice(1),
                    location: job.location?.name || "Remote / Office",
                    description: "Apply via Greenhouse link to see full description and requirements.",
                    applyLink: job.absolute_url,
                    applicationDeadline: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days
                    source: this.sourceName,
                    sourceUrl: `https://boards.greenhouse.io/${board}`,
                    scrapedAt: new Date(),
                }));
                allJobs.push(...mappedJobs);
            }
            catch (error) {
                // Silently ignore 404s
            }
        }
        return allJobs;
    }
}
exports.GreenhouseCollector = GreenhouseCollector;
