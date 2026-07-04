import { getStructuredAIResponse } from "../../providers/groq.provider.js";
import { logger } from "../../utils/logger.js";
import { z } from "zod";

const matchingSchema = z.object({
  matchScore: z.number().min(0).max(100),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  recommendationReason: z.string(),
});

export type MatchingResult = z.infer<typeof matchingSchema>;

export interface EducationEntry {
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate?: string;
  endDate?: string;
}

export interface ProjectEntry {
  title: string;
  description: string;
  technologies: string[];
}

export interface ExperienceEntry {
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
  description: string;
}

export interface CandidateProfileInput {
  skills: string[];
  education?: EducationEntry[] | any;
  projects?: ProjectEntry[] | any;
  experience?: ExperienceEntry[] | any;
}

export interface JobInput {
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
}

export class MatchingAgent {
  /**
   * Safely truncates a text string to a maximum length without splitting in the middle of a word if possible.
   */
  private truncateText(text: string, maxLength: number): string {
    if (typeof text !== "string") return "";
    if (text.length <= maxLength) return text;
    
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    
    // If we can find a space in the last 20% of the truncated text, cut there for cleaner output
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + "...";
    }
    return truncated + "...";
  }

  /**
   * Formats candidate education details into a clean string list.
   */
  private formatEducation(education: any): string {
    if (!education) return "None";
    const entries = Array.isArray(education) ? education : [education];
    
    return entries
      .map((edu: any) => {
        if (!edu) return "";
        const school = edu.school || "N/A";
        const degree = edu.degree || "N/A";
        const field = edu.fieldOfStudy || "N/A";
        const dates = edu.startDate || edu.endDate
          ? ` (${edu.startDate || ""}${edu.startDate && edu.endDate ? " - " : ""}${edu.endDate || ""})`
          : "";
        return `- ${degree} in ${field} from ${school}${dates}`;
      })
      .filter(Boolean)
      .join("\n");
  }

  /**
   * Formats candidate projects details into a clean, token-efficient text block.
   */
  private formatProjects(projects: any, maxDescLength: number = 300): string {
    if (!projects) return "None";
    const entries = Array.isArray(projects) ? projects : [projects];
    
    return entries
      .map((proj: any) => {
        if (!proj) return "";
        const title = proj.title || "N/A";
        const techs = Array.isArray(proj.technologies) ? proj.technologies.join(", ") : "";
        const desc = this.truncateText(proj.description || "", maxDescLength);
        return `- Project: ${title}\n  Technologies: ${techs || "None"}\n  Description: ${desc}`;
      })
      .filter(Boolean)
      .join("\n\n");
  }

  /**
   * Formats candidate professional experience into a clean, token-efficient text block.
   */
  private formatExperience(experience: any, maxDescLength: number = 300): string {
    if (!experience) return "None";
    const entries = Array.isArray(experience) ? experience : [experience];
    
    return entries
      .map((exp: any) => {
        if (!exp) return "";
        const company = exp.company || "N/A";
        const position = exp.position || "N/A";
        const dates = exp.startDate || exp.endDate
          ? ` (${exp.startDate || ""}${exp.startDate && exp.endDate ? " - " : ""}${exp.endDate || ""})`
          : "";
        const desc = this.truncateText(exp.description || "", maxDescLength);
        return `- Position: ${position} at ${company}${dates}\n  Description: ${desc}`;
      })
      .filter(Boolean)
      .join("\n\n");
  }

  async compareProfileWithJob(
    candidateProfile: CandidateProfileInput,
    job: JobInput
  ): Promise<MatchingResult> {
    logger.info(
      `MatchingAgent comparing profile for job: ${job.title} at ${job.company}`
    );

    // Limit lengths to prevent large token usage
    const formattedEdu = this.formatEducation(candidateProfile.education);
    const formattedProj = this.truncateText(this.formatProjects(candidateProfile.projects), 300);
    const formattedExp = this.truncateText(this.formatExperience(candidateProfile.experience), 400);
    const truncatedJobDesc = this.truncateText(job.description, 800);

    const prompt = `
You are an expert technical recruiter and AI matching agent. Your task is to evaluate how well a candidate's profile matches a job description and calculate a match score.

Job Details:
- Title: ${job.title}
- Company: ${job.company}
- Required Skills: ${job.requiredSkills.join(", ")}
- Description:
${truncatedJobDesc}

Candidate Details:
- Skills: ${candidateProfile.skills.join(", ")}
- Education:
${formattedEdu}
- Projects:
${formattedProj}
- Experience:
${formattedExp}

Analysis Guidelines:
Compare the candidate's profile against the job requirements using the following weighted criteria:
1. Skills Match (50% weight): Compare candidate's skills against job required skills. Check for direct matches and synonyms.
2. Projects Relevance (20% weight): Assess how relevant the candidate's projects are to the job description and required technologies.
3. Experience Relevance (20% weight): Assess how well the candidate's professional experience (roles, responsibilities) aligns with the job.
4. Education Relevance (10% weight): Assess how well the candidate's educational background (degree, field of study) meets the job requirements.

Scoring Steps:
1. Rate Skills Match from 0 to 100.
2. Rate Projects Relevance from 0 to 100.
3. Rate Experience Relevance from 0 to 100.
4. Rate Education Relevance from 0 to 100.
5. Compute the final weighted matchScore: (Skills Match * 0.5) + (Projects Relevance * 0.2) + (Experience Relevance * 0.2) + (Education Relevance * 0.1). Round to an integer between 0 and 100.

Output Requirements:
- matchScore: An integer between 0 and 100 calculated using the formula above.
- matchedSkills: A list of candidate skills that match the required job skills (direct or highly related).
- missingSkills: A list of REQUIRED job skills that are MISSING from the candidate's profile. YOU MUST BE STRICT. If the candidate does not explicitly list the required skill or a highly related synonym, you MUST add it to this missingSkills array. Do not return an empty array unless the candidate is truly a perfect 100% match.
- recommendationReason: A clear, structured explanation of the candidate's fit. It must include:
  1. A brief overview of candidate's suitability.
  2. The scoring breakdown (e.g. Skills: X/100, Projects: X/100, Experience: X/100, Education: X/100) and how they sum up to the final score.
  3. Key strengths and notable projects/experience.
  4. Specific areas of misalignment or missing skills.

Return JSON matching the schema.
`;

    try {
      const evaluation = await getStructuredAIResponse<MatchingResult>(
        prompt,
        matchingSchema,
        true // USE BACKGROUND MODEL (llama3-70b-8192) TO AVOID RATE LIMIT COLLISIONS
      );

      return evaluation;
    } catch (error) {
      logger.error(
        `MatchingAgent failed to compare profile and job via Groq. Using fallback logic:`,
        error
      );

      const jobSkillsLower = job.requiredSkills.map((s) => s.toLowerCase());
      const candidateSkillsLower = candidateProfile.skills.map((s) => s.toLowerCase());

      const matched = job.requiredSkills.filter((s) =>
        candidateSkillsLower.includes(s.toLowerCase())
      );

      const missing = job.requiredSkills.filter(
        (s) => !candidateSkillsLower.includes(s.toLowerCase())
      );

      const matchScore =
        jobSkillsLower.length > 0
          ? Math.round((matched.length / jobSkillsLower.length) * 100)
          : 50;

      return {
        matchScore,
        matchedSkills: matched,
        missingSkills: missing,
        recommendationReason: `Fallback logic generated: Candidate matches ${matched.length} of ${job.requiredSkills.length} required skills. Missing skills: ${missing.join(", ") || "None"}.`,
      };
    }
  }
}

export const matchingAgent = new MatchingAgent();
export default matchingAgent;
