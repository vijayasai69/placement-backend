"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skillGapAgent = exports.SkillGapAgent = void 0;
const groq_provider_js_1 = require("../../providers/groq.provider.js");
const logger_js_1 = require("../../utils/logger.js");
const zod_1 = require("zod");
const skillGapSchema = zod_1.z.object({
    missingSkills: zod_1.z.array(zod_1.z.string()),
    learningRecommendations: zod_1.z.array(zod_1.z.object({
        skill: zod_1.z.string(),
        resources: zod_1.z.array(zod_1.z.string()), // Course names, docs links, etc.
        projectIdea: zod_1.z.string(),
    })),
});
class SkillGapAgent {
    async analyzeGap(candidateSkills, jobSkills) {
        logger_js_1.logger.info(`SkillGapAgent analyzing skills gaps`);
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
            const result = await (0, groq_provider_js_1.getStructuredAIResponse)(prompt, skillGapSchema);
            return result;
        }
        catch (error) {
            logger_js_1.logger.error(`SkillGapAgent analysis failed:`, error);
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
exports.SkillGapAgent = SkillGapAgent;
exports.skillGapAgent = new SkillGapAgent();
exports.default = exports.skillGapAgent;
