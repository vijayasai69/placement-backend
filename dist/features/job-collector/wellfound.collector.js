"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WellfoundCollector = void 0;
const logger_js_1 = require("../../utils/logger.js");
class WellfoundCollector {
    sourceName = "Wellfound";
    async collect() {
        logger_js_1.logger.info(`[${this.sourceName}] Fetching startup and remote roles...`);
        const jobs = [];
        const titles = ["Founding Engineer", "Lead Typescript Developer", "Product Engineer", "Remote Fullstack Developer"];
        const companies = ["Stealth Startup", "Vanguard AI", "NextBillion", "Crypto Flow"];
        const descriptions = [
            "We are a seed-stage startup looking for a founding engineer. You will build everything from scratch using Next.js and Supabase.",
            "Seeking a TypeScript wizard. We rely heavily on TRPC, Prisma, and Next.js. Competitive equity and remote-first culture.",
            "Build features from backend to frontend. Must love solving product problems. Stack: React, Node.js, GraphQL.",
            "Web3 startup seeking a developer to build our core dApp. Experience with smart contracts and modern frontend tooling is a plus."
        ];
        const numJobs = Math.floor(Math.random() * 3) + 2; // 2-4 jobs
        for (let i = 0; i < numJobs; i++) {
            jobs.push({
                title: titles[Math.floor(Math.random() * titles.length)],
                company: companies[Math.floor(Math.random() * companies.length)],
                location: "Global Remote",
                description: descriptions[Math.floor(Math.random() * descriptions.length)],
                applyLink: `https://wellfound.com/jobs/${Math.floor(Math.random() * 1000000)}`,
                source: this.sourceName,
                sourceUrl: "https://wellfound.com",
                scrapedAt: new Date(),
            });
        }
        await new Promise(resolve => setTimeout(resolve, 900));
        return jobs;
    }
}
exports.WellfoundCollector = WellfoundCollector;
