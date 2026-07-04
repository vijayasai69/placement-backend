"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = void 0;
const db_1 = require("../services/db");
const getProfile = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    try {
        const user = await db_1.prisma.user.findUnique({
            where: { id: req.user.id },
            include: { profile: true }
        });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                bio: user.profile?.bio || "",
                phone: user.profile?.phone || "",
                location: user.profile?.location || ""
            }
        });
    }
    catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ success: false, message: "Internal server error retrieving profile." });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { name, email, bio, phone, location } = req.body;
    try {
        const user = await db_1.prisma.user.findUnique({
            where: { id: req.user.id },
            include: { profile: true }
        });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        // Update user record
        const updatedUser = await db_1.prisma.user.update({
            where: { id: req.user.id },
            data: {
                name: name !== undefined ? name : user.name,
                email: email !== undefined ? email : user.email
            }
        });
        // Update or create linked resume profile record for bio/phone/location
        if (user.profile) {
            await db_1.prisma.resumeProfile.update({
                where: { userId: req.user.id },
                data: {
                    bio: bio !== undefined ? bio : user.profile.bio,
                    phone: phone !== undefined ? phone : user.profile.phone,
                    location: location !== undefined ? location : user.profile.location
                }
            });
        }
        else {
            // Create a skeleton resume profile if none exists yet, so profile fields can be saved
            await db_1.prisma.resumeProfile.create({
                data: {
                    userId: req.user.id,
                    fileName: "not_uploaded.pdf",
                    analysisDate: new Date().toLocaleDateString(),
                    atsScore: 0,
                    readability: 0,
                    keywordMatch: 0,
                    formatScore: 0,
                    strengths: JSON.stringify([]),
                    improvements: JSON.stringify([]),
                    bio: bio || "",
                    phone: phone || "",
                    location: location || "",
                    skills: JSON.stringify([]),
                    education: JSON.stringify([]),
                    experience: JSON.stringify([]),
                    projects: JSON.stringify([]),
                    certifications: JSON.stringify([])
                }
            });
        }
        res.json({
            success: true,
            message: "Profile updated successfully.",
            data: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                bio: bio,
                phone: phone,
                location: location
            }
        });
    }
    catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ success: false, message: "Internal server error updating profile." });
    }
};
exports.updateProfile = updateProfile;
