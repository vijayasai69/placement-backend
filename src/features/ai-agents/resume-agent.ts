import { prisma } from "../../config/prisma.js";
import { getStructuredAIResponse } from "../../providers/groq.provider.js";
import { generateEmbedding } from "../../utils/vector.js";
import { logger } from "../../utils/logger.js";
import { z } from "zod";

// Zod schema matching database CandidateProfile JSON layouts
const profileExtractionSchema = z.object({
  skills: z.array(z.string()),
  education: z.array(z.object({
    school: z.string(),
    degree: z.string(),
    fieldOfStudy: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })),
  projects: z.array(z.object({
    title: z.string(),
    description: z.string(),
    technologies: z.array(z.string()),
  })),
  certifications: z.array(z.string()),
  experience: z.array(z.object({
    company: z.string(),
    position: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    description: z.string(),
  })),
  atsScore: z.number().min(0).max(100),
  readability: z.number().min(0).max(100),
  keywordMatch: z.number().min(0).max(100),
  formatScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  aiSuggestions: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    text: z.string(),
    effort: z.enum(["Low", "Medium", "High"]),
  })).optional(),
});

export type ExtractedProfile = z.infer<typeof profileExtractionSchema>;

export class ResumeAgent {
  async analyzeAndCreateProfile(userId: string, rawText: string, fileName: string = "resume.pdf"): Promise<ExtractedProfile> {
    logger.info(`ResumeAgent starting analysis for userId: ${userId}`);

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
      const extracted = await getStructuredAIResponse<ExtractedProfile>(prompt, profileExtractionSchema, true);
      logger.info(`Successfully extracted candidate profile via Groq for userId: ${userId}`);

      // Generate embedding for pgvector search from extracted skills list
      const safeSkills = extracted.skills || [];
      const skillsText = safeSkills.join(", ");
      const embedding = await generateEmbedding(skillsText);

      const analysisDate = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });

      // Save extracted profile to database
      // Since prisma does not directly support writing Unsupported vector types via create/update,
      // we can do a standard upsert for JSON fields, then write the vector using a raw SQL update query!
      await prisma.candidateProfile.create({
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
        } as any
      });

      // Update skillsEmbedding using raw query safely
      // Convert vector to string representation "[val1, val2, ...]" for postgres cast
      try {
        const vectorString = `[${embedding.join(",")}]`;
        await prisma.$executeRawUnsafe(
          `UPDATE "CandidateProfile" SET "skillsEmbedding" = $1::vector WHERE "userId" = $2`,
          vectorString,
          userId
        );
      } catch (vectorError) {
        logger.warn(`Failed to update skillsEmbedding (pgvector might not be enabled): ${vectorError}`);
      }

      logger.info(`Profile and embeddings persisted successfully for userId: ${userId}`);
      return extracted;
    } catch (error) {
      logger.error(`ResumeAgent failed for userId: ${userId}:`, error);
      throw error;
    }
  }
}

export const resumeAgent = new ResumeAgent();
export default resumeAgent;
