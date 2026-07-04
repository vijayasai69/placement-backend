import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { profileService } from "./profile.service.js";

export class ProfileController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: "Unauthorized", status: 401 }
        });
      }

      const profileId = req.query.profileId as string | undefined;
      const profile = await profileService.getProfileByUserId(userId, profileId);
      if (!profile) {
        return res.status(404).json({
          success: false,
          error: { message: "Candidate profile not found. Please upload your resume first.", status: 404 }
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: profile.id,
          userId: profile.userId,
          skills: profile.skills,
          education: profile.education,
          projects: profile.projects,
          certifications: profile.certifications,
          experience: profile.experience,
          name: req.user?.name || "",
          email: req.user?.email || "",
          bio: profile.bio || "Aspiring Software Engineer",
          location: profile.location || "India",
          phone: profile.phone || "+91 98765 43210"
        },
        profile: {
          id: profile.id,
          userId: profile.userId,
          skills: profile.skills,
          education: profile.education,
          projects: profile.projects,
          certifications: profile.certifications,
          experience: profile.experience,
          name: req.user?.name || "",
          email: req.user?.email || "",
          bio: profile.bio || "Aspiring Software Engineer",
          location: profile.location || "India",
          phone: profile.phone || "+91 98765 43210",
          atsScore: profile.atsScore || 70,
          readability: profile.readability || 70,
          keywordMatch: profile.keywordMatch || 70,
          formatScore: profile.formatScore || 70,
          strengths: profile.strengths || [],
          improvements: profile.improvements || [],
          fileName: profile.fileName || "resume.pdf",
          analysisDate: profile.analysisDate || "Jun 20, 2026"
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: "Unauthorized", status: 401 }
        });
      }

      const updatedProfile = await profileService.updateProfile(userId, req.body);

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedProfile
      });
    } catch (error) {
      next(error);
    }
  }
}

export const profileController = new ProfileController();
export default profileController;
