"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = exports.DashboardService = void 0;
const prisma_js_1 = require("../../config/prisma.js");
const logger_js_1 = require("../../utils/logger.js");
const recommendation_service_js_1 = require("../recommendations/recommendation.service.js");
class DashboardService {
    async getStats(userId, profileId) {
        logger_js_1.logger.info(`Fetching dashboard stats for user: ${userId}`);
        if (!profileId) {
            const totalJobs = await prisma_js_1.prisma.job.count({ where: { isActive: true } });
            return {
                atsScore: 0, readability: 0, keywordMatch: 0, formatScore: 0,
                skills: [], strengths: [], improvements: [],
                bestMatchScore: 0, avgMatchScore: 0, totalRecommendations: 0,
                totalJobs, jobCategories: {}, matchScoreTrend: [],
            };
        }
        // 1. Fetch CandidateProfile for ATS metrics
        const profile = await prisma_js_1.prisma.candidateProfile.findUnique({ where: { id: profileId, userId } });
        // 2. Fetch all recommendations for this user (with job data)
        let recommendations = await prisma_js_1.prisma.recommendation.findMany({
            where: { userId, profileId },
            orderBy: { matchScore: "desc" },
        });
        if (recommendations.length === 0 && profileId) {
            // Trigger async generation in the background so the dashboard loads instantly
            recommendation_service_js_1.recommendationService.generateRecommendations(userId, profileId).catch((err) => {
                logger_js_1.logger.error(`Dashboard background recommendation generation failed: ${err}`);
            });
            // Return empty recommendations for now; they will populate once the background task finishes
        }
        // 3. Fetch total active jobs count
        const totalJobs = await prisma_js_1.prisma.job.count({
            where: { isActive: true },
        });
        // 4. Compute metrics
        const atsScore = profile?.atsScore ?? 0;
        const readability = profile?.readability ?? 0;
        const keywordMatch = profile?.keywordMatch ?? 0;
        const formatScore = profile?.formatScore ?? 0;
        const skills = profile?.skills ?? [];
        const strengths = profile?.strengths ?? [];
        const improvements = profile?.improvements ?? [];
        // Best match score from recommendations
        const bestMatchScore = recommendations.length > 0
            ? Math.round(Math.max(...recommendations.map((r) => r.matchScore)))
            : 0;
        // Average match score
        const avgMatchScore = recommendations.length > 0
            ? Math.round(recommendations.reduce((sum, r) => sum + r.matchScore, 0) /
                recommendations.length)
            : 0;
        const totalRecommendations = recommendations.length;
        // 5. Build job category breakdown from recommendation job data
        const jobIds = recommendations.map((r) => r.jobId);
        const jobs = await prisma_js_1.prisma.job.findMany({
            where: { id: { in: jobIds } },
            select: { id: true, title: true, requiredSkills: true },
        });
        // Categorize jobs by title keywords
        const categories = {};
        for (const job of jobs) {
            const titleLower = job.title.toLowerCase();
            let category = "Other";
            if (titleLower.includes("frontend") ||
                titleLower.includes("front-end") ||
                titleLower.includes("react") ||
                titleLower.includes("angular") ||
                titleLower.includes("vue") ||
                titleLower.includes("ui")) {
                category = "Frontend";
            }
            else if (titleLower.includes("backend") ||
                titleLower.includes("back-end") ||
                titleLower.includes("node") ||
                titleLower.includes("java") ||
                titleLower.includes("python") ||
                titleLower.includes("api")) {
                category = "Backend";
            }
            else if (titleLower.includes("full") ||
                titleLower.includes("fullstack") ||
                titleLower.includes("full-stack") ||
                titleLower.includes("software engineer") ||
                titleLower.includes("software developer")) {
                category = "Full Stack";
            }
            else if (titleLower.includes("data") ||
                titleLower.includes("analyst") ||
                titleLower.includes("analytics")) {
                category = "Data Science";
            }
            else if (titleLower.includes("ml") ||
                titleLower.includes("machine learning") ||
                titleLower.includes("ai") ||
                titleLower.includes("deep learning")) {
                category = "AI/ML";
            }
            else if (titleLower.includes("devops") ||
                titleLower.includes("cloud") ||
                titleLower.includes("sre") ||
                titleLower.includes("infrastructure")) {
                category = "DevOps";
            }
            else if (titleLower.includes("mobile") ||
                titleLower.includes("ios") ||
                titleLower.includes("android") ||
                titleLower.includes("flutter")) {
                category = "Mobile";
            }
            categories[category] = (categories[category] || 0) + 1;
        }
        // 6. Build per-recommendation scores array for trend chart
        const matchScoreTrend = recommendations.map((r) => {
            const jobTitle = jobs.find((j) => j.id === r.jobId)?.title || "Unknown Role";
            return {
                jobId: r.jobId,
                jobTitle,
                score: Math.round(r.matchScore),
                createdAt: r.createdAt,
            };
        });
        // Profile completion calculation
        let profileCompletion = 0;
        if (profile) {
            if (skills.length > 0)
                profileCompletion += 25;
            if (profile.education && Object.keys(profile.education).length > 0)
                profileCompletion += 20;
            if (profile.experience && Object.keys(profile.experience).length > 0)
                profileCompletion += 20;
            if (profile.projects && Object.keys(profile.projects).length > 0)
                profileCompletion += 15;
            if (profile.certifications.length > 0)
                profileCompletion += 10;
            if (strengths.length > 0)
                profileCompletion += 5;
            if (improvements.length > 0)
                profileCompletion += 5;
        }
        return {
            hasProfile: !!profile,
            profileCompletion,
            atsScore,
            readability,
            keywordMatch,
            formatScore,
            skills,
            strengths,
            improvements,
            bestMatchScore,
            avgMatchScore,
            totalRecommendations,
            totalJobs,
            jobCategories: categories,
            matchScoreTrend,
        };
    }
}
exports.DashboardService = DashboardService;
exports.dashboardService = new DashboardService();
exports.default = exports.dashboardService;
