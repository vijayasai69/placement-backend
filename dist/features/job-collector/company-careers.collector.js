"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyCareersCollector = void 0;
class CompanyCareersCollector {
    sourceName = "Company Careers";
    async collect() {
        const futureDate = (days) => {
            const d = new Date();
            d.setDate(d.getDate() + days);
            return d;
        };
        return [
            {
                title: "AI Solutions Engineer - Multi-Agent Workflows",
                company: "OpenAI",
                location: "San Francisco, CA",
                description: "OpenAI is looking for an AI Solutions Engineer to build robust agentic tools for enterprises. You will design workflows utilizing Python, FastAPI, LangChain, LangGraph, and Groq API. Vector database integration and prompt engineering experience is highly valued.",
                applyLink: "https://openai.com/careers/ai-solutions-engineer",
                applicationDeadline: futureDate(40),
                source: this.sourceName,
                sourceUrl: "https://openai.com/careers/ai-solutions-engineer",
                scrapedAt: new Date(),
            },
            {
                title: "Backend Engineer (Node.js/TypeScript)",
                company: "Stripe",
                location: "San Francisco, CA (Hybrid)",
                description: "We are looking for a strong Backend Engineer to build robust settlement and billing APIs. You will work extensively with Node.js, Express, TypeScript, PostgreSQL, and Docker. Experience with payment processing is a plus.",
                applyLink: "https://stripe.com/careers/backend-engineer",
                applicationDeadline: futureDate(30),
                source: this.sourceName,
                sourceUrl: "https://stripe.com/careers/backend-engineer",
                scrapedAt: new Date(),
            }
        ];
    }
}
exports.CompanyCareersCollector = CompanyCareersCollector;
