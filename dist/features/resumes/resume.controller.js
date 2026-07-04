"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeController = exports.ResumeController = exports.uploadMiddleware = void 0;
const resume_service_js_1 = require("./resume.service.js");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
// Setup storage and validation
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf/;
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = file.mimetype === "application/pdf";
        if (mimetype && extname) {
            return cb(null, true);
        }
        return cb(new Error("File validation failed. Only PDF files are allowed."));
    },
});
exports.uploadMiddleware = upload.single("resume");
class ResumeController {
    async uploadResume(req, res, next) {
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
            const uploadDir = path_1.default.join(process.cwd(), "uploads");
            await promises_1.default.mkdir(uploadDir, { recursive: true });
            const fileName = `${userId}-${Date.now()}.pdf`;
            const filePath = path_1.default.join("uploads", fileName);
            const fullPath = path_1.default.join(uploadDir, fileName);
            // Save buffer to file on disk
            await promises_1.default.writeFile(fullPath, req.file.buffer);
            // Trigger parsing service
            const { resume, profile } = await resume_service_js_1.resumeService.handleResumeUpload(userId, filePath, req.file.buffer, req.file.originalname);
            res.status(200).json({
                success: true,
                message: "Resume uploaded successfully. Parsing completed.",
                data: {
                    id: resume.id,
                    filePath: resume.filePath,
                    processingStatus: "ANALYZED",
                    uploadedAt: resume.uploadedAt,
                },
                profile: {
                    id: profile?.id,
                    userId: profile?.userId,
                    skills: profile?.skills || [],
                    education: profile?.education || [],
                    projects: profile?.projects || [],
                    certifications: profile?.certifications || [],
                    experience: profile?.experience || [],
                    atsScore: profile?.atsScore || 70,
                    readability: profile?.readability || 70,
                    keywordMatch: profile?.keywordMatch || 70,
                    formatScore: profile?.formatScore || 70,
                    strengths: profile?.strengths || [],
                    improvements: profile?.improvements || [],
                    fileName: profile?.fileName || req.file.originalname,
                    analysisDate: profile?.analysisDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getResume(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: { message: "Unauthorized", status: 401 }
                });
            }
            const resume = await resume_service_js_1.resumeService.getResumeByUserId(userId);
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
        }
        catch (error) {
            next(error);
        }
    }
    async getResumeHistory(req, res, next) {
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
        }
        catch (error) {
            next(error);
        }
    }
    async deleteResumeProfile(req, res, next) {
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
        }
        catch (error) {
            next(error);
        }
    }
    async downloadResume(req, res, next) {
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
            const targetResume = resumes.find(r => Math.abs(r.uploadedAt.getTime() - profile.createdAt.getTime()) < 10000) || resumes[0]; // fallback to latest
            if (!targetResume) {
                return res.status(404).json({ success: false, error: { message: "Resume file not found", status: 404 } });
            }
            const fullPath = path_1.default.join(process.cwd(), targetResume.filePath);
            try {
                await promises_1.default.access(fullPath);
                res.download(fullPath, profile.fileName);
            }
            catch (e) {
                return res.status(404).json({ success: false, error: { message: "File not found on disk", status: 404 } });
            }
        }
        catch (error) {
            next(error);
        }
    }
    async resetUserData(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: { message: "Unauthorized", status: 401 }
                });
            }
            await resume_service_js_1.resumeService.resetUserData(userId);
            res.status(200).json({
                success: true,
                message: "User resume and all associated data have been reset successfully"
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ResumeController = ResumeController;
exports.resumeController = new ResumeController();
exports.default = exports.resumeController;
