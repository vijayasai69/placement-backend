"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternshalaCollector = void 0;
class InternshalaCollector {
    sourceName = "Internshala";
    async collect() {
        const futureDate = (days) => {
            const d = new Date();
            d.setDate(d.getDate() + days);
            return d;
        };
        return [
            {
                title: "Frontend Development Intern (React/Next.js)",
                company: "Vercel",
                location: "Remote",
                description: "Join the Vercel DX team to design and build stunning, fast interactive dashboards. You will work with React, Next.js, Tailwind CSS, TypeScript, and HTML5. Experience with speed optimization and web vitals is a plus.",
                applyLink: "https://internshala.com/jobs/vercel-frontend-intern",
                applicationDeadline: futureDate(5),
                source: this.sourceName,
                sourceUrl: "https://internshala.com/jobs/vercel-frontend-intern",
                scrapedAt: new Date(),
            },
            {
                title: "Software Engineering Intern - Payment Rails",
                company: "Stripe",
                location: "San Francisco, CA (Hybrid)",
                description: "Work on Stripe's core payments API. You will implement features using Node.js, Express, TypeScript, PostgreSQL, and Docker. Perfect for candidates wanting experience with financial microservices and scalable database interactions.",
                applyLink: "https://internshala.com/jobs/stripe-swe-intern",
                applicationDeadline: futureDate(12),
                source: this.sourceName,
                sourceUrl: "https://internshala.com/jobs/stripe-swe-intern",
                scrapedAt: new Date(),
            }
        ];
    }
}
exports.InternshalaCollector = InternshalaCollector;
