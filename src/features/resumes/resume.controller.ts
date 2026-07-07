import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { resumeService } from "./resume.service.js";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

// Setup storage and validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype === "application/pdf";

    if (mimetype && extname) {
      return cb(null, true);
    }
    return cb(new Error("File validation failed. Only PDF files are allowed."));
  },
});

export const uploadMiddleware = upload.single("resume");

export class ResumeController {
  async uploadResume(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: "Unauthorized", status: 401 }
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { message: "No file uploaded. Please upload a PDF resume.", status: 400 }
        });
      }

      // Prepare target directory inside workspace
      const uploadDir = path.join(process.cwd(), "uploads");
      await fs.mkdir(uploadDir, { recursive: true });

      const fileName = `${userId}-${Date.now()}.pdf`;
      const filePath = path.join("uploads", fileName);
      const fullPath = path.join(uploadDir, fileName);

      // Save buffer to file on disk
      await fs.writeFile(fullPath, req.file.buffer);

      // Trigger parsing service
      const { resume } = await resumeService.handleResumeUpload(
        userId,
        filePath,
        req.file.buffer,
        req.file.originalname
      );

      res.status(202).json({
        success: true,
        message: "Resume uploaded successfully. Parsing in background.",
        data: {
          id: resume.id,
          filePath: resume.filePath,
          processingStatus: resume.processingStatus,
          uploadedAt: resume.uploadedAt,
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getResumeStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: "Unauthorized", status: 401 }
        });
      }

      const { jobId } = req.params;
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const resume = await prisma.resume.findUnique({
        where: { id: jobId }
      });

      if (!resume || resume.userId !== userId) {
        return res.status(404).json({
          success: false,
          error: { message: "Resume job not found", status: 404 }
        });
      }

      let profile = null;
      if (resume.processingStatus === "ANALYZED") {
        profile = await prisma.candidateProfile.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: resume.id,
          processingStatus: resume.processingStatus,
        },
        profile
      });
    } catch (error) {
      next(error);
    }
  }

  async getResume(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: "Unauthorized", status: 401 }
        });
      }

      const resume = await resumeService.getResumeByUserId(userId);
      if (!resume) {
        return res.status(404).json({
          success: false,
          error: { message: "Resume not found", status: 404 }
        });
      }

      res.status(200).json({
        success: true,
        data: resume
      });
    } catch (error) {
      next(error);
    }
  }

  async getResumeHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: "Unauthorized", status: 401 }
        });
      }

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const profiles = await prisma.candidateProfile.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({
        success: true,
        data: profiles
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteResumeProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: "Unauthorized", status: 401 }
        });
      }

      const { profileId } = req.params;
      if (!profileId) {
        return res.status(400).json({
          success: false,
          error: { message: "Profile ID is required", status: 400 }
        });
      }

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      // Check if profile belongs to the user
      const profile = await prisma.candidateProfile.findUnique({
        where: { id: profileId }
      });

      if (!profile || profile.userId !== userId) {
        return res.status(404).json({
          success: false,
          error: { message: "Profile not found or unauthorized", status: 404 }
        });
      }

      // Delete associated recommendations first to prevent orphaned records
      await prisma.recommendation.deleteMany({
        where: { profileId }
      });

      // Delete the candidate profile
      await prisma.candidateProfile.delete({
        where: { id: profileId }
      });

      res.status(200).json({
        success: true,
        message: "Resume profile deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  }

  async downloadResume(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: { message: "Unauthorized", status: 401 } });
      }

      const { profileId } = req.params;
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const profile = await prisma.candidateProfile.findUnique({
        where: { id: profileId }
      });

      if (!profile || profile.userId !== userId) {
        return res.status(404).json({ success: false, error: { message: "Profile not found", status: 404 } });
      }

      // Since profile doesn't have resumeId, find the closest Resume record by time
      const resumes = await prisma.resume.findMany({
        where: { userId },
        orderBy: { uploadedAt: 'desc' }
      });

      // Find the one closest in time (within a few seconds)
      const targetResume = resumes.find(r => 
        Math.abs(r.uploadedAt.getTime() - profile.createdAt.getTime()) < 10000
      ) || resumes[0]; // fallback to latest

      if (!targetResume) {
        return res.status(404).json({ success: false, error: { message: "Resume file not found", status: 404 } });
      }

      const fullPath = path.join(process.cwd(), targetResume.filePath);
      
      try {
        await fs.access(fullPath);
        res.download(fullPath, profile.fileName);
      } catch (e) {
        return res.status(404).json({ success: false, error: { message: "File not found on disk", status: 404 } });
      }
    } catch (error) {
      next(error);
    }
  }

  async resetUserData(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: "Unauthorized", status: 401 }
        });
      }

      await resumeService.resetUserData(userId);

      res.status(200).json({
        success: true,
        message: "User resume and all associated data have been reset successfully"
      });
    } catch (error) {
      next(error);
    }
  }
}

export const resumeController = new ResumeController();
export default resumeController;
