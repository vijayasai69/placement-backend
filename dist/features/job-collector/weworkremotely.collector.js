"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeWorkRemotelyCollector = void 0;
const rss_parser_1 = __importDefault(require("rss-parser"));
class WeWorkRemotelyCollector {
    sourceName = "We Work Remotely RSS";
    async collect() {
        try {
            const parser = new rss_parser_1.default();
            const feed = await parser.parseURL("https://weworkremotely.com/remote-jobs.rss");
            const jobs = feed.items || [];
            return jobs.map((item) => {
                // WWR title format is usually "Company: Role"
                let company = "Unknown";
                let title = item.title || "Remote Job";
                if (title.includes(":")) {
                    const parts = title.split(":");
                    company = parts[0].trim();
                    title = parts.slice(1).join(":").trim();
                }
                return {
                    title: title,
                    company: company,
                    location: "Remote",
                    description: (item.contentSnippet || item.content || "").replace(/<[^>]*>?/gm, '').substring(0, 500) + '...',
                    applyLink: item.link,
                    applicationDeadline: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
                    source: this.sourceName,
                    sourceUrl: "https://weworkremotely.com",
                    scrapedAt: new Date(),
                };
            });
        }
        catch (error) {
            // Silently ignore to prevent console errors
            return [];
        }
    }
}
exports.WeWorkRemotelyCollector = WeWorkRemotelyCollector;
