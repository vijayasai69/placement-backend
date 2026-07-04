"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NaukriCollector = void 0;
class NaukriCollector {
    sourceName = "Naukri";
    async collect() {
        const futureDate = (days) => {
            const d = new Date();
            d.setDate(d.getDate() + days);
            return d;
        };
        return [
            {
                title: "Software Development Engineer II (SDE-2)",
                company: "Amazon",
                location: "Seattle, WA",
                description: "Amazon is hiring an SDE-2 to work on next-generation distribution services. You will design web-scale microservices, optimize database schemas, and deploy containerized apps. Core skills required include Java, Spring Boot, AWS, DynamoDB, PostgreSQL, and Docker.",
                applyLink: "https://naukri.com/jobs/amazon-sde-2",
                applicationDeadline: futureDate(20),
                source: this.sourceName,
                sourceUrl: "https://naukri.com/jobs/amazon-sde-2",
                scrapedAt: new Date(),
            },
            {
                title: "Senior Backend Engineer - Core Streaming",
                company: "Netflix",
                location: "Los Gatos, CA",
                description: "Netflix is looking for a senior backend engineer to join our streaming core group. You will develop highly scalable services using Java, Spring Boot, microservices, AWS (Lambda, DynamoDB), and Docker. Experience with caching systems like Redis is required.",
                applyLink: "https://naukri.com/jobs/netflix-core-streaming",
                applicationDeadline: futureDate(10),
                source: this.sourceName,
                sourceUrl: "https://naukri.com/jobs/netflix-core-streaming",
                scrapedAt: new Date(),
            }
        ];
    }
}
exports.NaukriCollector = NaukriCollector;
