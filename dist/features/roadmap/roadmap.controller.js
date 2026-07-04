"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roadmapController = exports.RoadmapController = void 0;
const roadmap_agent_js_1 = require("../ai-agents/roadmap-agent.js");
const prisma_js_1 = require("../../config/prisma.js");
const logger_js_1 = require("../../utils/logger.js");
class RoadmapController {
    async getRoadmap(req, res) {
        try {
            console.log("getRoadmap called for user:", req.user?.id);
            // @ts-ignore
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            // Check if user already has a roadmap
            const profile = await prisma_js_1.prisma.candidateProfile.findFirst({
                where: { userId },
                orderBy: { createdAt: "desc" }
            });
            if (!profile) {
                res.status(404).json({ error: "Candidate profile not found. Please upload a resume." });
                return;
            }
            if (profile.roadmap) {
                // Return existing
                res.json({ success: true, data: profile.roadmap });
                return;
            }
            // If no roadmap exists, generate one
            const newRoadmap = await roadmap_agent_js_1.roadmapAgent.generateRoadmap(userId);
            res.json({ success: true, data: newRoadmap });
        }
        catch (error) {
            logger_js_1.logger.error("Failed to fetch/generate roadmap:", error);
            res.status(500).json({ error: error.message || "Failed to generate roadmap" });
        }
    }
    async verifyStep(req, res) {
        try {
            // @ts-ignore
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            const { step } = req.body;
            if (!step) {
                res.status(400).json({ error: "Missing step identifier" });
                return;
            }
            // 1. Verify the user has a GitHub account linked securely via OAuth
            const githubAccount = await prisma_js_1.prisma.account.findFirst({
                where: {
                    userId,
                    providerId: "github"
                }
            });
            if (!githubAccount || !githubAccount.accountId) {
                res.status(403).json({ error: "Please link your GitHub account first." });
                return;
            }
            // 2. Fetch the actual GitHub username using the numeric accountId we securely received from OAuth
            const userRes = await fetch(`https://api.github.com/user/${githubAccount.accountId}`);
            if (!userRes.ok) {
                res.status(404).json({ error: "Failed to resolve your linked GitHub profile." });
                return;
            }
            const userData = await userRes.json();
            const actualGithubUsername = userData.login;
            // 3. Fetch their repos
            const ghRes = await fetch(`https://api.github.com/users/${actualGithubUsername}/repos?per_page=30&sort=updated`);
            if (!ghRes.ok) {
                res.status(404).json({ error: "Failed to fetch repositories or API limit exceeded." });
                return;
            }
            const repos = await ghRes.json();
            // Extract languages and topics for real-world verification
            const languages = new Set();
            repos.forEach((repo) => {
                if (repo.language)
                    languages.add(repo.language.toLowerCase());
                if (repo.topics)
                    repo.topics.forEach((t) => languages.add(t.toLowerCase()));
            });
            // Get profile roadmap
            const profile = await prisma_js_1.prisma.candidateProfile.findFirst({
                where: { userId },
                orderBy: { createdAt: "desc" }
            });
            if (!profile || !profile.roadmap) {
                res.status(404).json({ error: "Roadmap not found." });
                return;
            }
            const roadmapData = profile.roadmap;
            let foundStepIndex = -1;
            if (roadmapData && roadmapData.milestones) {
                roadmapData.milestones.forEach((m, idx) => {
                    if (m.step === step)
                        foundStepIndex = idx;
                });
            }
            if (foundStepIndex === -1) {
                res.status(404).json({ error: "Step not found in roadmap." });
                return;
            }
            const milestone = roadmapData.milestones[foundStepIndex];
            const verificationResult = await roadmap_agent_js_1.roadmapAgent.verifyGitHubSkills(milestone.title, milestone.description, Array.from(languages));
            if (!verificationResult.verified) {
                res.status(400).json({ error: `Verification failed: ${verificationResult.reason}` });
                return;
            }
            // Mark current step as completed
            roadmapData.milestones[foundStepIndex].status = "completed";
            // Mark next step as in-progress if it exists
            if (foundStepIndex + 1 < roadmapData.milestones.length) {
                roadmapData.milestones[foundStepIndex + 1].status = "in-progress";
            }
            await prisma_js_1.prisma.candidateProfile.update({
                where: { id: profile.id },
                data: { roadmap: roadmapData }
            });
            res.json({ success: true, data: roadmapData });
        }
        catch (error) {
            logger_js_1.logger.error("Failed to verify step:", error);
            res.status(500).json({ error: error.message || "Failed to verify step" });
        }
    }
}
exports.RoadmapController = RoadmapController;
exports.roadmapController = new RoadmapController();
