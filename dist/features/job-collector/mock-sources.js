"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMockJobs = getMockJobs;
function getMockJobs() {
    const futureDate = (days) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d;
    };
    return [
        {
            title: "Backend Engineer (Node.js/TypeScript)",
            company: "Stripe",
            location: "San Francisco, CA (Hybrid)",
            description: "We are looking for a strong Backend Engineer to build robust settlement and billing APIs. You will work extensively with Node.js, Express, TypeScript, PostgreSQL, and Docker. Experience with payment processing is a plus.",
            requiredSkills: ["Node.js", "Express", "TypeScript", "PostgreSQL", "Docker", "REST API"],
            applyLink: "https://stripe.com/careers/backend-engineer",
            applicationDeadline: futureDate(30),
            source: "Stripe Career Page",
            sourceUrl: "https://stripe.com/careers/backend-engineer",
        },
        {
            title: "Software Engineer - Spring Boot & AWS",
            company: "Netflix",
            location: "Los Gatos, CA",
            description: "Join our streaming core infrastructure group. You will develop highly scalable services using Java, Spring Boot, microservices, AWS (Lambda, DynamoDB), and Docker. Experience with caching systems like Redis is required.",
            requiredSkills: ["Java", "Spring Boot", "Docker", "AWS", "Redis", "Microservices"],
            applyLink: "https://netflix.com/careers/se-spring-boot",
            applicationDeadline: futureDate(15),
            source: "Netflix Careers",
            sourceUrl: "https://netflix.com/careers/se-spring-boot",
        },
        {
            title: "AI Engineer - LangChain & Python",
            company: "OpenAI",
            location: "San Francisco, CA",
            description: "We are seeking a researcher/engineer to build tools around large language models. You will implement multi-agent workflows using Python, FastAPI, LangChain, LangGraph, and Groq API. Vector database experience is preferred.",
            requiredSkills: ["Python", "LangChain", "LangGraph", "Groq", "OpenAI", "Vector Databases", "FastAPI"],
            applyLink: "https://openai.com/careers/ai-engineer",
            applicationDeadline: futureDate(45),
            source: "OpenAI Careers",
            sourceUrl: "https://openai.com/careers/ai-engineer",
        },
        {
            title: "Frontend Developer (React/Next.js)",
            company: "Vercel",
            location: "Remote",
            description: "Help build the next generation of web hosting tools. You will create interactive dashboards using React, Next.js, Tailwind CSS, TypeScript, and HTML5. Experience with speed optimization is essential.",
            requiredSkills: ["React", "Next.js", "Tailwind", "TypeScript", "HTML", "CSS"],
            applyLink: "https://vercel.com/careers/frontend-dev",
            applicationDeadline: futureDate(7),
            source: "Vercel Careers",
            sourceUrl: "https://vercel.com/careers/frontend-dev",
        },
        {
            title: "Data Engineer - Spark & BigQuery",
            company: "Google",
            location: "Mountain View, CA",
            description: "Build robust data pipelines to analyze trillions of logs. You will write Spark jobs, deploy on GCP, query BigQuery, and orchestrate with Apache Airflow/Composer. Skills in Python/Java and SQL are required.",
            requiredSkills: ["Python", "Spark", "SQL", "BigQuery", "GCP", "Linux"],
            applyLink: "https://google.com/careers/data-engineer",
            applicationDeadline: futureDate(21),
            source: "Google Careers",
            sourceUrl: "https://google.com/careers/data-engineer",
        }
    ];
}
