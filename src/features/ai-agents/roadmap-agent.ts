import { prisma } from "../../config/prisma.js";
import { getStructuredAIResponse } from "../../providers/groq.provider.js";
import { logger } from "../../utils/logger.js";
import { z } from "zod";

const roadmapSchema = z.object({
  milestones: z.array(z.object({
    step: z.string(),
    title: z.string(),
    description: z.string(),
    targetSkills: z.array(z.string()).describe("An array of 2 to 3 specific technical skills or keywords this milestone focuses on (e.g. ['Node.js', 'MySQL'])."),
    status: z.enum(["completed", "in-progress", "pending"]),
    date: z.string(),
  }))
});

export type Roadmap = z.infer<typeof roadmapSchema>;

const verifySchema = z.object({
  verified: z.boolean(),
  reason: z.string()
});

export class RoadmapAgent {
  async generateRoadmap(userId: string): Promise<Roadmap> {
    console.log(`generateRoadmap called for user: ${userId}`);
    logger.info(`RoadmapAgent starting roadmap generation for userId: ${userId}`);

    // Fetch candidate profile to get context
    const profile = await prisma.candidateProfile.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    if (!profile) {
      throw new Error("No candidate profile found to generate a roadmap. Please upload a resume first.");
    }

    const prompt = `
      You are an expert tech career coach and technical recruiter. 
      Based on the candidate's profile data, generate a realistic, structured, 4 to 5 step career roadmap to help them reach a senior engineering or target placement role.
      
      CRITICAL INSTRUCTION: The roadmap MUST BE STRICTLY tailored to the specific Skills, Strengths, and Areas to Improve listed below. 
      DO NOT generate generic milestones like "Leadership Experience", "Networking", or "Resume Building". Focus ENTIRELY on bridging the specific technical gaps and advancing the specific technical skills mentioned in their resume profile.

      Here is the candidate's current profile:
      Skills: ${profile.skills.join(", ")}
      Strengths: ${profile.strengths.join(", ")}
      Areas to Improve: ${profile.improvements.join(", ")}

      Generate exactly 4 or 5 milestones.
      - Each milestone should have a 'step' number (e.g. "01", "02").
      - A concise 'title'.
      - 'targetSkills' which MUST be an array of 2 to 3 specific hard technical skills or programming languages the candidate is deficient in for this step (e.g., ['Node.js', 'MySQL']). DO NOT use generic terms like 'Certifications', 'Advanced Concepts', or 'Soft Skills'. It must be an exact search keyword for finding technical courses.
      - A detailed but brief 'description' of what they should accomplish.
      - A 'status' of either "completed", "in-progress", or "pending". (The first step can be "completed" representing their baseline, next "in-progress", and future ones "pending").
      - A 'date' representing the target timeframe (e.g. "Completed Jun 2024", "Target: Jul 2024", "Target: Q3 2024").

      Ensure you output a JSON matching the requested structure.
    `;

    try {
      const extracted = await getStructuredAIResponse<Roadmap>(prompt, roadmapSchema);
      
      // Save it back to the DB
      await prisma.candidateProfile.update({
        where: { id: profile.id },
        data: {
          roadmap: extracted
        } as any
      });

      logger.info(`Roadmap generated and persisted successfully for userId: ${userId}`);
      return extracted;
    } catch (error) {
      logger.error(`RoadmapAgent failed for userId: ${userId}:`, error);
      throw error;
    }
  }

  async verifyGitHubSkills(title: string, description: string, githubTopics: string[]): Promise<{verified: boolean, reason: string}> {
    const prompt = `
      You are an expert technical assessor.
      The user is trying to complete a roadmap milestone titled "${title}".
      The milestone description is: "${description}".
      
      We extracted the following primary languages and topics from their public GitHub repositories:
      [${githubTopics.join(", ")}]

      Does the user's GitHub repository data provide reasonable evidence that they have the skills required for this milestone?
      Be lenient but realistic. If the milestone requires "React" and they have "javascript" and "react" repos, it's a pass.
      If the milestone requires "Backend Node.js" and they only have "html" and "css" repos, it's a fail.
      If they have no topics or languages, they fail.
      
      Output a JSON object matching the requested structure.
    `;

    return await getStructuredAIResponse(prompt, verifySchema);
  }
}

export const roadmapAgent = new RoadmapAgent();
export default roadmapAgent;
