"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = exports.ChatService = void 0;
const prisma_js_1 = require("../../config/prisma.js");
const groq_provider_js_1 = require("../../providers/groq.provider.js");
const logger_js_1 = require("../../utils/logger.js");
class ChatService {
    async getChatResponse(userId, messages) {
        // 1. Fetch User details
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error("User not found");
        }
        // 2. Fetch Profile details
        const profile = await prisma_js_1.prisma.candidateProfile.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
        // 3. Fetch Job Recommendations details
        const recommendations = await prisma_js_1.prisma.recommendation.findMany({
            where: { userId },
            take: 5,
            orderBy: { matchScore: "desc" },
        });
        const recommendationsWithJobs = await Promise.all(recommendations.map(async (rec) => {
            const job = await prisma_js_1.prisma.job.findUnique({ where: { id: rec.jobId } });
            return {
                title: job?.title || "Unknown Role",
                company: job?.company || "Unknown Company",
                matchScore: Math.round(rec.matchScore),
                missingSkills: rec.missingSkills || [],
            };
        }));
        // 4. Construct System Prompt with live candidate context
        const systemPrompt = `
You are the AI Career Navigator Coach, a helpful, encouraging, and intelligent career advisor.
Your goal is to guide the student/candidate with their resume, career development, interview preparation, and job matching.

Candidate Information:
Name: ${user.name}
Email: ${user.email}

Candidate Profile & Resume Stats:
Skills: ${profile?.skills?.join(", ") || "No resume uploaded yet. Advise the user to upload their resume first to unlock personalized analytics."}
ATS Score: ${profile?.atsScore || 70}%
Readability Score: ${profile?.readability || 70}%
Keyword Match Score: ${profile?.keywordMatch || 70}%
Format Layout Score: ${profile?.formatScore || 70}%
Strengths: ${profile?.strengths?.join("; ") || "None"}
Areas to Improve: ${profile?.improvements?.join("; ") || "None"}

Top Job Matches (Real-Time recommendations):
${recommendationsWithJobs.map(r => `- ${r.title} at ${r.company} (${r.matchScore}% Match). Missing skills: ${r.missingSkills.join(", ")}`).join("\n") || "No recommendations generated yet. Advise the user to upload their resume first."}

Guidelines for responding:
1. Be concise, clear, and highly professional.
2. Structure your response using EXCELLENT Markdown formatting. 
   - ALWAYS use bullet points (-) or numbered lists (1.) for multiple items.
   - Use **bold text** to highlight key terms, job titles, or skills.
   - Use headings (###) to separate distinct sections.
   - Add blank lines between paragraphs and list items to ensure proper spacing.
3. Suggest concrete courses, resources, or project designs when they ask about improving missing skills.
4. Keep the tone inspiring and action-oriented. Never output large, dense walls of text.
`;
        // 5. Build full messages payload for Groq
        const fullMessages = [
            { role: "system", content: systemPrompt },
            ...messages.map((msg) => ({
                role: msg.role === "user" ? "user" : "assistant",
                content: msg.content,
            })),
        ];
        try {
            logger_js_1.logger.info(`ChatService calling Groq for user ${userId}`);
            const response = await groq_provider_js_1.chatGroq.invoke(fullMessages);
            return response.content;
        }
        catch (error) {
            logger_js_1.logger.error("ChatService failed to invoke Groq API:", error);
            throw new Error("Failed to generate response from the AI career coach.");
        }
    }
}
exports.ChatService = ChatService;
exports.chatService = new ChatService();
exports.default = exports.chatService;
