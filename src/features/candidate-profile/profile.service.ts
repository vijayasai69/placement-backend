import { prisma } from "../../config/prisma.js";

export class ProfileService {
  async getProfileByUserId(userId: string, profileId?: string) {
    if (!profileId) {
      return prisma.candidateProfile.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
    }
    return prisma.candidateProfile.findUnique({ where: { id: profileId, userId } });
  }

  async updateProfile(userId: string, data: any) {
    // We separate user data (name) from profile data (bio, location, phone, skills)
    const profileData: any = {};
    if (data.bio !== undefined) profileData.bio = data.bio;
    if (data.location !== undefined) profileData.location = data.location;
    if (data.phone !== undefined) profileData.phone = data.phone;
    if (data.skills !== undefined) profileData.skills = data.skills;

    if (Object.keys(profileData).length > 0) {
      const existingProfile = await prisma.candidateProfile.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      if (existingProfile) {
        await prisma.candidateProfile.update({
          where: { id: existingProfile.id },
          data: profileData,
        });
      } else {
        await prisma.candidateProfile.create({
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
      await prisma.user.update({
        where: { id: userId },
        data: { name: data.name },
      });
    }

    return this.getProfileByUserId(userId);
  }
}

export const profileService = new ProfileService();
export default profileService;
