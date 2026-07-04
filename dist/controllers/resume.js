"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResumeProfile = exports.getResumeStatus = exports.uploadResume = exports.formatProfileResponse = void 0;
const db_1 = require("../services/db");
const resume_parser_1 = require("../services/resume-parser");
// Helper to format DB resume profile into JSON arrays for frontend
const formatProfileResponse = (dbProfile) => {
    try {
        return {
            id: dbProfile.id,
            userId: dbProfile.userId,
            fileName: dbProfile.fileName,
            analysisDate: dbProfile.analysisDate,
            atsScore: dbProfile.atsScore,
            readability: dbProfile.readability,
            keywordMatch: dbProfile.keywordMatch,
            formatScore: dbProfile.formatScore,
            strengths: JSON.parse(dbProfile.strengths),
            improvements: JSON.parse(dbProfile.improvements),
            phone: dbProfile.phone,
            location: dbProfile.location,
            bio: dbProfile.bio,
            skills: JSON.parse(dbProfile.skills),
            education: JSON.parse(dbProfile.education),
            experience: JSON.parse(dbProfile.experience),
            projects: JSON.parse(dbProfile.projects),
            certifications: JSON.parse(dbProfile.certifications),
            profileStrength: dbProfile.profileStrength,
            parsedAt: dbProfile.parsedAt
        };
    }
    catch (e) {
        console.error("Format Profile Response Error:", e);
        return dbProfile;
    }
};
exports.formatProfileResponse = formatProfileResponse;
const uploadResume = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No resume PDF file uploaded." });
    }
    try {
        const parsedData = await (0, resume_parser_1.parseResume)(req.file.originalname, req.file.buffer);
        // Save or update in database
        const savedProfile = await db_1.prisma.resumeProfile.upsert({
            where: { userId: req.user.id },
            update: {
                fileName: parsedData.fileName,
                analysisDate: parsedData.analysisDate,
                atsScore: parsedData.atsScore,
                readability: parsedData.readability,
                keywordMatch: parsedData.keywordMatch,
                formatScore: parsedData.formatScore,
                strengths: JSON.stringify(parsedData.strengths),
                improvements: JSON.stringify(parsedData.improvements),
                phone: parsedData.phone,
                location: parsedData.location,
                bio: parsedData.bio,
                skills: JSON.stringify(parsedData.skills),
                education: JSON.stringify(parsedData.education),
                experience: JSON.stringify(parsedData.experience),
                projects: JSON.stringify(parsedData.projects),
                certifications: JSON.stringify(parsedData.certifications),
                profileStrength: Math.floor((parsedData.atsScore + parsedData.readability) / 2)
            },
            create: {
                userId: req.user.id,
                fileName: parsedData.fileName,
                analysisDate: parsedData.analysisDate,
                atsScore: parsedData.atsScore,
                readability: parsedData.readability,
                keywordMatch: parsedData.keywordMatch,
                formatScore: parsedData.formatScore,
                strengths: JSON.stringify(parsedData.strengths),
                improvements: JSON.stringify(parsedData.improvements),
                phone: parsedData.phone,
                location: parsedData.location,
                bio: parsedData.bio,
                skills: JSON.stringify(parsedData.skills),
                education: JSON.stringify(parsedData.education),
                experience: JSON.stringify(parsedData.experience),
                projects: JSON.stringify(parsedData.projects),
                certifications: JSON.stringify(parsedData.certifications),
                profileStrength: Math.floor((parsedData.atsScore + parsedData.readability) / 2)
            }
        });
        res.json({
            success: true,
            message: "Resume processed successfully.",
            jobId: "job_" + savedProfile.id,
            profile: (0, exports.formatProfileResponse)(savedProfile)
        });
    }
    catch (error) {
        console.error("Resume Upload Error:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to parse resume." });
    }
};
exports.uploadResume = uploadResume;
const getResumeStatus = async (req, res) => {
    const { jobId } = req.params;
    // Since we run it synchronously for simplicity in this dev environment
    res.json({
        success: true,
        jobId,
        status: "completed",
        progress: 100
    });
};
exports.getResumeStatus = getResumeStatus;
const getResumeProfile = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    try {
        const profile = await db_1.prisma.resumeProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!profile) {
            return res.json({
                success: false,
                message: "No resume profile exists. Please upload your resume first."
            });
        }
        res.json({
            success: true,
            profile: (0, exports.formatProfileResponse)(profile)
        });
    }
    catch (error) {
        console.error("Get Resume Profile Error:", error);
        res.status(500).json({ success: false, message: "Internal server error retrieving resume profile." });
    }
};
exports.getResumeProfile = getResumeProfile;
