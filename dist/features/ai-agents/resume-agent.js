"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeAgent = exports.ResumeAgent = void 0;
const prisma_js_1 = require("../../config/prisma.js");
const groq_provider_js_1 = require("../../providers/groq.provider.js");
const vector_js_1 = require("../../utils/vector.js");
const logger_js_1 = require("../../utils/logger.js");
const zod_1 = require("zod");
// Zod schema matching database CandidateProfile JSON layouts
const profileExtractionSchema = zod_1.z.object({
    skills: zod_1.z.array(zod_1.z.string()),
    education: zod_1.z.array(zod_1.z.object({
        school: zod_1.z.string(),
        degree: zod_1.z.string(),
        fieldOfStudy: zod_1.z.string(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
    })),
    projects: zod_1.z.array(zod_1.z.object({
        title: zod_1.z.string(),
        description: zod_1.z.string(),
        technologies: zod_1.z.array(zod_1.z.string()),
    })),
    certifications: zod_1.z.array(zod_1.z.string()),
    experience: zod_1.z.array(zod_1.z.object({
        company: zod_1.z.string(),
        position: zod_1.z.string(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
        description: zod_1.z.string(),
    })),
    atsScore: zod_1.z.number().min(0).max(100),
    readability: zod_1.z.number().min(0).max(100),
    keywordMatch: zod_1.z.number().min(0).max(100),
    formatScore: zod_1.z.number().min(0).max(100),
    strengths: zod_1.z.array(zod_1.z.string()),
    improvements: zod_1.z.array(zod_1.z.string()),
    aiSuggestions: zod_1.z.array(zod_1.z.object({
        priority: zod_1.z.enum(["high", "medium", "low"]),
        text: zod_1.z.string(),
        effort: zod_1.z.enum(["Low", "Medium", "High"]),
    })).optional(),
});
class ResumeAgent {
    async analyzeAndCreateProfile(userId, rawText, fileName = "resume.pdf") {
        logger_js_1.logger.info(`ResumeAgent starting analysis for userId: ${userId}`);
        // Truncate text to 6000 chars to avoid hitting token limits while capturing most 1-2 page resumes
        const truncatedText = rawText.length > 6000 ? rawText.substring(0, 6000) + "..." : rawText;
        const prompt = `
      You are an expert ATS (Applicant Tracking System) parser and career coach. Parse the following raw text extracted from a resume.
      Extract education details, projects, experience, skills, and certifications into a clean, structured format.
      Additionally, evaluate the candidate's profile and generate the following ATS scoring metrics:
      - atsScore: An overall ATS compatibility rating (0 to 100).
      - readability: A readability and presentation quality rating (0 to 100).
      - keywordMatch: A key technical terminology match score (0 to 100).
      - formatScore: A structure and layout compliance rating (0 to 100).
      - strengths: A list of 3-4 notable strengths observed in their experience/projects.
      - improvements: A list of 3-4 actionable feedback items to improve their ATS score (legacy string format).
      - aiSuggestions: A detailed list of 4-5 highly personalized, actionable improvements. 
        CRITICAL: At least 1-2 suggestions MUST recommend REAL-WORLD CERTIFICATIONS (e.g., "AWS Certified Solutions Architect", "CKA", "PMP") that perfectly align with their current skills to boost their resume visibility. 
        For each suggestion, provide:
        - priority: "high", "medium", or "low"
        - text: The actionable suggestion (e.g., "Add AWS/GCP certification to increase matches by ~34%")
        - effort: "Low", "Medium", or "High"

      Ensure you output a JSON matching the requested structure exactly.

      Resume Text:
      ---
      ${truncatedText}
      ---
    `;
        try {
            const extracted = await (0, groq_provider_js_1.getStructuredAIResponse)(prompt, profileExtractionSchema, true);
            logger_js_1.logger.info(`Successfully extracted candidate profile via Groq for userId: ${userId}`);
            // Generate embedding for pgvector search from extracted skills list
            const safeSkills = extracted.skills || [];
            const skillsText = safeSkills.join(", ");
            const embedding = await (0, vector_js_1.generateEmbedding)(skillsText);
            const analysisDate = new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
            });
            // Save extracted profile to database
            // Since prisma does not directly support writing Unsupported vector types via create/update,
            // we can do a standard upsert for JSON fields, then write the vector using a raw SQL update query!
            await prisma_js_1.prisma.candidateProfile.create({
                data: {
                    userId,
                    skills: extracted.skills || [],
                    education: extracted.education || [],
                    projects: extracted.projects || [],
                    certifications: extracted.certifications || [],
                    experience: extracted.experience || [],
                    atsScore: extracted.atsScore || 50,
                    readability: extracted.readability || 50,
                    keywordMatch: extracted.keywordMatch || 50,
                    formatScore: extracted.formatScore || 50,
                    strengths: extracted.strengths || [],
                    improvements: extracted.improvements || [],
                    aiSuggestions: extracted.aiSuggestions || [],
                    fileName,
                    analysisDate,
                }
            });
            // Update skillsEmbedding using raw query safely
            // Convert vector to string representation "[val1, val2, ...]" for postgres cast
            try {
                const vectorString = `[${embedding.join(",")}]`;
                await prisma_js_1.prisma.$executeRawUnsafe(`UPDATE "CandidateProfile" SET "skillsEmbedding" = $1::vector WHERE "userId" = $2`, vectorString, userId);
            }
            catch (vectorError) {
                logger_js_1.logger.warn(`Failed to update skillsEmbedding (pgvector might not be enabled): ${vectorError}`);
            }
            logger_js_1.logger.info(`Profile and embeddings persisted successfully for userId: ${userId}`);
            return extracted;
        }
        catch (error) {
            logger_js_1.logger.error(`ResumeAgent failed for userId: ${userId}:`, error);
            throw error;
        }
    }
}
exports.ResumeAgent = ResumeAgent;
exports.resumeAgent = new ResumeAgent();
exports.default = exports.resumeAgent;
