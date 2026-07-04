"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileService = exports.ProfileService = void 0;
const prisma_js_1 = require("../../config/prisma.js");
class ProfileService {
    async getProfileByUserId(userId, profileId) {
        if (!profileId) {
            return prisma_js_1.prisma.candidateProfile.findFirst({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            });
        }
        return prisma_js_1.prisma.candidateProfile.findUnique({ where: { id: profileId, userId } });
    }
    async updateProfile(userId, data) {
        // We separate user data (name) from profile data (bio, location, phone, skills)
        const profileData = {};
        if (data.bio !== undefined)
            profileData.bio = data.bio;
        if (data.location !== undefined)
            profileData.location = data.location;
        if (data.phone !== undefined)
            profileData.phone = data.phone;
        if (data.skills !== undefined)
            profileData.skills = data.skills;
        if (Object.keys(profileData).length > 0) {
            const existingProfile = await prisma_js_1.prisma.candidateProfile.findFirst({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            });
            if (existingProfile) {
                await prisma_js_1.prisma.candidateProfile.update({
                    where: { id: existingProfile.id },
                    data: profileData,
                });
            }
            else {
                await prisma_js_1.prisma.candidateProfile.create({
                    data: {
                        userId,
                        ...profileData,
                        education: {},
                        projects: {},
                        certifications: [],
                        experience: {},
                    },
                });
            }
        }
        if (data.name !== undefined) {
            await prisma_js_1.prisma.user.update({
                where: { id: userId },
                data: { name: data.name },
            });
        }
        return this.getProfileByUserId(userId);
    }
}
exports.ProfileService = ProfileService;
exports.profileService = new ProfileService();
exports.default = exports.profileService;
