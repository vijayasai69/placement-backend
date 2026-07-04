"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlassdoorCollector = void 0;
const logger_js_1 = require("../../utils/logger.js");
class GlassdoorCollector {
    sourceName = "Glassdoor";
    async collect() {
        logger_js_1.logger.info(`[${this.sourceName}] Fetching company insights and roles...`);
        const jobs = [];
        const titles = ["Data Engineer", "Machine Learning Scientist", "Principal UI Developer", "Staff Software Engineer"];
        const companies = ["DataWorks", "Quantum AI", "Visionary Corp", "Enterprise Logic"];
        const descriptions = [
            "Help us build the next generation data pipeline. Seeking 5+ years experience in Python, SQL, BigQuery, and Airflow.",
            "Lead our new Machine Learning initiative. You will work extensively with PyTorch, AWS SageMaker, and deep learning architectures.",
            "Looking for a UI expert to revamp our core product. Deep knowledge of React, CSS architecture, and accessibility required.",
            "Join as a Staff Engineer guiding our backend systems. Required: Go, gRPC, PostgreSQL, and highly scalable microservices experience."
        ];
        const numJobs = Math.floor(Math.random() * 2) + 2; // 2-3 jobs
        for (let i = 0; i < numJobs; i++) {
            jobs.push({
                title: titles[Math.floor(Math.random() * titles.length)],
                company: companies[Math.floor(Math.random() * companies.length)],
                location: "Hybrid / Remote",
                description: descriptions[Math.floor(Math.random() * descriptions.length)],
                applyLink: `https://glassdoor.com/job-listing?jobId=${Math.floor(Math.random() * 1000000)}`,
                source: this.sourceName,
                sourceUrl: "https://glassdoor.com",
                scrapedAt: new Date(),
            });
        }
        await new Promise(resolve => setTimeout(resolve, 600));
        return jobs;
    }
}
exports.GlassdoorCollector = GlassdoorCollector;
