import { Request, Response } from "express";
import { roadmapAgent } from "../ai-agents/roadmap-agent.js";
import { prisma } from "../../config/prisma.js";
import { logger } from "../../utils/logger.js";

export class RoadmapController {
  async getRoadmap(req: Request, res: Response): Promise<void> {
    try {
      console.log("getRoadmap called for user:", (req as any).user?.id);
      // @ts-ignore
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Check if user already has a roadmap
      const profile = await prisma.candidateProfile.findFirst({
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
      const newRoadmap = await roadmapAgent.generateRoadmap(userId);
      res.json({ success: true, data: newRoadmap });
    } catch (error: any) {
      logger.error("Failed to fetch/generate roadmap:", error);
      res.status(500).json({ error: error.message || "Failed to generate roadmap" });
    }
  }

  async verifyStep(req: Request, res: Response): Promise<void> {
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
      const githubAccount = await prisma.account.findFirst({
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
      const userData = await userRes.json() as any;
      const actualGithubUsername = userData.login;

      // 3. Fetch their repos
      const ghRes = await fetch(`https://api.github.com/users/${actualGithubUsername}/repos?per_page=30&sort=updated`);
      if (!ghRes.ok) {
        res.status(404).json({ error: "Failed to fetch repositories or API limit exceeded." });
        return;
      }
      
      const repos = await ghRes.json() as any[];
      
      // Extract languages and topics for real-world verification
      const languages = new Set<string>();
      repos.forEach((repo: any) => {
        if (repo.language) languages.add(repo.language.toLowerCase());
        if (repo.topics) repo.topics.forEach((t: string) => languages.add(t.toLowerCase()));
      });

      // Get profile roadmap
      const profile = await prisma.candidateProfile.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" }
      });

      if (!profile || !profile.roadmap) {
        res.status(404).json({ error: "Roadmap not found." });
        return;
      }

      const roadmapData: any = profile.roadmap;
      let foundStepIndex = -1;
      
      if (roadmapData && roadmapData.milestones) {
         roadmapData.milestones.forEach((m: any, idx: number) => {
            if (m.step === step) foundStepIndex = idx;
         });
      }

      if (foundStepIndex === -1) {
         res.status(404).json({ error: "Step not found in roadmap." });
         return;
      }

      const milestone = roadmapData.milestones[foundStepIndex];

      const verificationResult = await roadmapAgent.verifyGitHubSkills(
        milestone.title,
        milestone.description,
        Array.from(languages)
      );

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

      await prisma.candidateProfile.update({
        where: { id: profile.id },
        data: { roadmap: roadmapData }
      });

      res.json({ success: true, data: roadmapData });
    } catch (error: any) {
      logger.error("Failed to verify step:", error);
      res.status(500).json({ error: error.message || "Failed to verify step" });
    }
  }
}

export const roadmapController = new RoadmapController();
