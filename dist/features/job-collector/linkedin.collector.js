"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedInCollector = void 0;
const axios_1 = __importDefault(require("axios"));
class LinkedInCollector {
    sourceName = "JSearch API";
    async collect() {
        try {
            const response = await axios_1.default.get("https://jsearch.p.rapidapi.com/search", {
                params: {
                    query: "software engineer",
                    page: "1",
                    num_pages: "1",
                },
                headers: {
                    "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
                    "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
                },
            });
            const jobs = response.data.data || [];
            return jobs.map((job) => ({
                title: job.job_title,
                company: job.employer_name,
                location: `${job.job_city || ""} ${job.job_country || ""}`.trim() ||
                    "Remote",
                description: job.job_description,
                applyLink: job.job_apply_link,
                applicationDeadline: new Date(),
                source: this.sourceName,
                sourceUrl: job.job_apply_link,
                scrapedAt: new Date(),
            }));
        }
        catch (error) {
            console.error("JSearch API Error:", error);
            return [];
        }
    }
}
exports.LinkedInCollector = LinkedInCollector;
