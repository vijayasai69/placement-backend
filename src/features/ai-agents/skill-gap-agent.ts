import { getStructuredAIResponse } from "../../providers/groq.provider.js";
import { logger } from "../../utils/logger.js";
import { z } from "zod";

const skillGapSchema = z.object({
  missingSkills: z.array(z.string()),
  learningRecommendations: z.array(z.object({
    skill: z.string(),
    resources: z.array(z.string()), // Course names, docs links, etc.
    projectIdea: z.string(),
  })),
});

export type SkillGapResult = z.infer<typeof skillGapSchema>;

export class SkillGapAgent {
  async analyzeGap(
    candidateSkills: string[],
    jobSkills: string[]
  ): Promise<SkillGapResult> {
    logger.info(`SkillGapAgent analyzing skills gaps`);

    const prompt = `
      You are an expert career growth advisor. Identify the missing skills when comparing the candidate's skills with the required job skills, and provide tailored learning recommendations.

      Candidate Skills:
      ${candidateSkills.join(", ")}

      Job Required Skills:
      ${jobSkills.join(", ")}

      Perform the following:
      1. Identify missingSkills (required skills the candidate does not have).
      2. For each missing skill, generate specific learning recommendations (reputable online courses, documentation links, book titles) and a small practice projectIdea that uses that skill.
    `;

    try {
      const result = await getStructuredAIResponse<SkillGapResult>(prompt, skillGapSchema);
      return result;
    } catch (error) {
      logger.error(`SkillGapAgent analysis failed:`, error);
      
      // Fallback skill gap identification
      const candidateLower = candidateSkills.map(s => s.toLowerCase());
      const missing = jobSkills.filter(s => !candidateLower.includes(s.toLowerCase()));
      
      return {
        missingSkills: missing,
        learningRecommendations: missing.map(skill => ({
          skill,
          resources: [
            `Official documentation for ${skill}`,
            `Coursera or Udemy course on ${skill}`
          ],
          projectIdea: `Build a simple application implementing core features of ${skill}.`
        }))
      };
    }
  }
}

export const skillGapAgent = new SkillGapAgent();
export default skillGapAgent;
