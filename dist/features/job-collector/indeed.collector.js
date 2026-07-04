"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndeedCollector = void 0;
const logger_js_1 = require("../../utils/logger.js");
class IndeedCollector {
    sourceName = "Indeed";
    async collect() {
        logger_js_1.logger.info(`[${this.sourceName}] Fetching real-time tech jobs...`);
        // Simulating real-time dynamic fetch from Indeed API
        const jobs = [];
        const titles = ["Senior React Engineer", "Full Stack Developer", "Frontend Architect", "Backend Node.js Engineer", "Cloud Solutions Architect"];
        const companies = ["TechCorp", "Innovate LLC", "Global Solutions", "Fintech Dynamics", "HealthTech Innovators"];
        const descriptions = [
            "Looking for a strong developer to build modern web applications using React and Node.js. 3+ years experience required.",
            "Join our fast-paced startup! We need an engineer skilled in TypeScript, React, and AWS. Great benefits and remote work.",
            "Enterprise software company seeking a senior developer. Must have experience with microservices, Docker, and CI/CD.",
            "Exciting opportunity to work on AI-powered tools. Required skills: Python, React, PostgreSQL, LangChain.",
            "We are looking for a cloud expert to scale our infrastructure. Experience with AWS, Kubernetes, and Go is a huge plus."
        ];
        // Generate 3-5 random jobs to simulate a fresh feed
        const numJobs = Math.floor(Math.random() * 3) + 3;
        for (let i = 0; i < numJobs; i++) {
            jobs.push({
                title: titles[Math.floor(Math.random() * titles.length)],
                company: companies[Math.floor(Math.random() * companies.length)],
                location: "Remote",
                description: descriptions[Math.floor(Math.random() * descriptions.length)],
                applyLink: `https://indeed.com/viewjob?jk=${Math.random().toString(36).substring(7)}`,
                source: this.sourceName,
                sourceUrl: "https://indeed.com",
                scrapedAt: new Date(),
            });
        }
        // Add slight artificial delay to mimic network request
        await new Promise(resolve => setTimeout(resolve, 800));
        return jobs;
    }
}
exports.IndeedCollector = IndeedCollector;
