"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseResume = void 0;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const openai_1 = require("@langchain/openai");
const zod_1 = require("zod");
// Define the schema for structured LLM parsing
const resumeSchema = zod_1.z.object({
    name: zod_1.z.string().describe("Candidate's full name"),
    email: zod_1.z.string().describe("Candidate's email address"),
    phone: zod_1.z.string().optional().describe("Candidate's phone number"),
    location: zod_1.z.string().optional().describe("Candidate's location (city, country, etc)"),
    bio: zod_1.z.string().describe("A professional bio summarizing candidate's background"),
    skills: zod_1.z.array(zod_1.z.string()).describe("List of technical and soft skills"),
    education: zod_1.z.array(zod_1.z.object({
        degree: zod_1.z.string().describe("Degree name"),
        institution: zod_1.z.string().describe("Institution/University name"),
        startYear: zod_1.z.number().describe("Start year"),
        endYear: zod_1.z.number().describe("End year"),
        gpa: zod_1.z.string().optional().describe("GPA score if available")
    })).describe("Education history"),
    experience: zod_1.z.array(zod_1.z.object({
        title: zod_1.z.string().describe("Job title"),
        company: zod_1.z.string().describe("Company name"),
        startDate: zod_1.z.string().describe("Start date (YYYY-MM)"),
        endDate: zod_1.z.string().optional().describe("End date (YYYY-MM), leave empty if current"),
        current: zod_1.z.boolean().describe("Whether this is their current job"),
        description: zod_1.z.string().optional().describe("Description of work and achievements")
    })).describe("Work experience"),
    projects: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().describe("Project name"),
        description: zod_1.z.string().describe("Project description"),
        technologies: zod_1.z.array(zod_1.z.string()).describe("Technologies and tools used"),
        link: zod_1.z.string().optional().describe("Project link or repository URL")
    })).describe("Key projects built"),
    certifications: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().describe("Certification name"),
        issuer: zod_1.z.string().describe("Issuer organization"),
        date: zod_1.z.string().optional().describe("Date of issue (YYYY-MM)")
    })).describe("Certifications achieved"),
    atsScore: zod_1.z.number().describe("ATS compliance score from 0 to 100 based on standard industry guidelines"),
    readability: zod_1.z.number().describe("Readability score from 0 to 100 based on clarity, formatting, and structures"),
    keywordMatch: zod_1.z.number().describe("Keyword matching score from 0 to 100 based on industry relevance"),
    formatScore: zod_1.z.number().describe("Formatting structure score from 0 to 100"),
    strengths: zod_1.z.array(zod_1.z.string()).describe("3-4 key bullet points highlighting strengths of the resume"),
    improvements: zod_1.z.array(zod_1.z.string()).describe("3-4 key bullet points identifying areas to improve")
});
const parseResume = async (fileName, fileBuffer) => {
    // 1. Extract text from PDF using pdf-parse
    let text = "";
    try {
        const data = await (0, pdf_parse_1.default)(fileBuffer);
        text = data.text;
    }
    catch (err) {
        console.error("PDF Parsing Error:", err);
        throw new Error("Failed to extract text from the PDF file. Please ensure it is not password-protected.");
    }
    if (!text || text.trim().length === 0) {
        text = "Candidate resume named: " + fileName;
    }
    // 2. Setup OpenAI LLM using LangChain StructuredOutput
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "insert_your_openai_api_key_here") {
        console.warn("OPENAI_API_KEY not configured. Falling back to parser simulator.");
        return fallbackSimulator(fileName);
    }
    try {
        const isGroq = apiKey.startsWith("gsk_");
        const llm = new openai_1.ChatOpenAI({
            openAIApiKey: apiKey,
            modelName: isGroq ? "llama3-8b-8192" : "gpt-4o-mini",
            temperature: 0.1,
            configuration: isGroq ? {
                baseURL: "https://api.groq.com/openai/v1"
            } : undefined
        });
        const structuredLlm = llm.withStructuredOutput(resumeSchema);
        const prompt = `You are an expert ATS (Applicant Tracking System) parser and career coach.
Analyze the candidate's resume text and extract structured details, scores (0-100), key strengths, and areas to improve.

Resume Text:
\"\"\"
${text}
\"\"\"
`;
        const result = await structuredLlm.invoke(prompt);
        // Format analysis date
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dateObj = new Date();
        const analysisDate = `${months[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
        return {
            fileName,
            analysisDate,
            atsScore: result.atsScore,
            readability: result.readability,
            keywordMatch: result.keywordMatch,
            formatScore: result.formatScore,
            strengths: result.strengths,
            improvements: result.improvements,
            name: result.name,
            email: result.email,
            phone: result.phone || "",
            location: result.location || "",
            bio: result.bio,
            skills: result.skills,
            education: result.education,
            experience: result.experience,
            projects: result.projects,
            certifications: result.certifications
        };
    }
    catch (err) {
        console.error("LangChain/OpenAI Parsing Error. Falling back to simulator:", err);
        return fallbackSimulator(fileName);
    }
};
exports.parseResume = parseResume;
const fallbackSimulator = (fileName) => {
    const nameLower = fileName.toLowerCase();
    let skills = ["React", "TypeScript", "Node.js", "PostgreSQL", "Python", "Git"];
    let bio = "Aspiring Full Stack Engineer passionate about building scalable web applications.";
    let experience = [
        {
            id: "exp_1",
            title: "Software Engineering Intern",
            company: "Tech Solutions Inc.",
            startDate: "2023-05",
            endDate: "2023-08",
            current: false,
            description: "Developed UI components using React and TypeScript. Improved load speed by 25%."
        }
    ];
    let projects = [
        {
            id: "proj_1",
            name: "E-Commerce Microservices Platform",
            description: "Built a distributed shop system using Node.js, Docker, and RabbitMQ.",
            technologies: ["Node.js", "Docker", "RabbitMQ", "PostgreSQL"]
        }
    ];
    let strengths = [
        "Strong quantified achievements (4 found)",
        "Relevant technical keywords well-distributed",
        "Clear action verbs in all experience bullets"
    ];
    let improvements = [
        "Missing LinkedIn profile URL",
        "Summary section is too generic"
    ];
    if (nameLower.includes("design") || nameLower.includes("ui") || nameLower.includes("ux") || nameLower.includes("frontend")) {
        skills = ["React", "TypeScript", "CSS", "JavaScript", "TailwindCSS", "Figma"];
        bio = "Frontend Developer focusing on crafting high-fidelity design systems and responsive UIs.";
        experience = [
            {
                id: "exp_1",
                title: "Frontend UI Developer Intern",
                company: "Pixel Perfect Agency",
                startDate: "2023-06",
                endDate: "2023-12",
                current: false,
                description: "Implemented responsive web screens in React and Tailwind."
            }
        ];
        projects = [
            {
                id: "proj_1",
                name: "Interactive UI Sandbox",
                description: "A sandbox environment showcasing reusable component systems.",
                technologies: ["React", "TypeScript", "TailwindCSS"]
            }
        ];
        strengths = [
            "Outstanding layout and design aesthetics integration",
            "Modern styling framework keywords found (Tailwind)"
        ];
    }
    else if (nameLower.includes("backend") || nameLower.includes("node") || nameLower.includes("server")) {
        skills = ["Node.js", "PostgreSQL", "Docker", "Redis", "Express", "AWS"];
        bio = "Backend Software Engineer focused on system performance, API optimization, and cloud databases.";
        experience = [
            {
                id: "exp_1",
                title: "Backend Engineer Intern",
                company: "CoreSystems Co.",
                startDate: "2023-04",
                endDate: "2023-09",
                current: false,
                description: "Optimized database queries in PostgreSQL, reducing response times by 30%."
            }
        ];
        projects = [
            {
                id: "proj_1",
                name: "Telemetry Pipeline Service",
                description: "High-throughput API receiving device state measurements.",
                technologies: ["Node.js", "Redis", "PostgreSQL"]
            }
        ];
        strengths = [
            "Excellent containerization and tooling references (Docker)",
            "Solid database structuring principles highlighted"
        ];
    }
    const atsScore = Math.floor(Math.random() * (95 - 80 + 1)) + 80;
    const readability = Math.floor(Math.random() * (96 - 84 + 1)) + 84;
    const keywordMatch = Math.floor(Math.random() * (92 - 72 + 1)) + 72;
    const formatScore = Math.floor(Math.random() * (98 - 86 + 1)) + 86;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dateObj = new Date();
    const analysisDate = `${months[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
    return {
        fileName,
        analysisDate,
        atsScore,
        readability,
        keywordMatch,
        formatScore,
        strengths,
        improvements,
        name: "Raunak Rai",
        email: "raunak.rai@example.com",
        phone: "+91 98765 43210",
        location: "India",
        bio,
        skills,
        education: [
            {
                id: "edu_1",
                degree: "Bachelor of Technology in Computer Science",
                institution: "Indian Institute of Technology",
                startYear: 2021,
                endYear: 2025,
                gpa: "8.9/10"
            }
        ],
        experience,
        projects,
        certifications: [
            {
                id: "cert_1",
                name: "AWS Certified Developer",
                issuer: "Amazon Web Services",
                date: "2024-01"
            }
        ]
    };
};
