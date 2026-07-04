"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendationById = exports.getRecommendations = void 0;
const db_1 = require("../services/db");
const getRecommendations = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { search, location, jobType, minMatchScore, sortBy } = req.query;
    try {
        // 1. Fetch user's parsed skills (if they uploaded a resume)
        const userProfile = await db_1.prisma.resumeProfile.findUnique({
            where: { userId: req.user.id }
        });
        const userSkills = userProfile ? JSON.parse(userProfile.skills).map((s) => s.toLowerCase()) : [];
        // 2. Fetch all jobs from DB
        const jobs = await db_1.prisma.job.findMany();
        // 3. Map and calculate dynamic match score based on overlapping skills
        let matchedJobs = jobs.map((job) => {
            const jobSkills = JSON.parse(job.skills);
            let dynamicScore = job.matchScore; // Default to seeded score if no resume uploaded
            if (userSkills.length > 0 && jobSkills.length > 0) {
                const matchingSkills = jobSkills.filter((skill) => userSkills.includes(skill.toLowerCase()));
                const ratio = matchingSkills.length / jobSkills.length;
                // Formula: baseline of 50 + up to 50 based on matching skills percentage
                dynamicScore = Math.round(50 + ratio * 50);
            }
            return {
                id: job.id,
                title: job.title,
                company: job.company,
                location: job.location,
                type: job.type,
                matchScore: dynamicScore,
                salary: job.salary,
                skills: jobSkills,
                aiInsight: userSkills.length > 0 && jobSkills.length > 0
                    ? `Matched ${jobSkills.filter(s => userSkills.includes(s.toLowerCase())).length} of ${jobSkills.length} key skills`
                    : job.aiInsight,
                postedAt: job.postedAt,
                description: job.description,
                applyUrl: job.applyUrl
            };
        });
        // 4. Apply Filters
        // Filter by search query (title, company, skills)
        if (search && typeof search === "string") {
            const searchLower = search.toLowerCase();
            matchedJobs = matchedJobs.filter((job) => job.title.toLowerCase().includes(searchLower) ||
                job.company.toLowerCase().includes(searchLower) ||
                job.skills.some((skill) => skill.toLowerCase().includes(searchLower)));
        }
        // Filter by location
        if (location) {
            const locations = Array.isArray(location)
                ? location.map(l => String(l).toLowerCase())
                : [String(location).toLowerCase()];
            matchedJobs = matchedJobs.filter((job) => locations.some(loc => job.location.toLowerCase().includes(loc)));
        }
        // Filter by jobType
        if (jobType) {
            const types = Array.isArray(jobType)
                ? jobType.map(t => String(t).toLowerCase())
                : [String(jobType).toLowerCase()];
            matchedJobs = matchedJobs.filter((job) => types.some(t => job.type.toLowerCase().includes(t)));
        }
        // Filter by minMatchScore
        if (minMatchScore) {
            const scoreLimit = parseInt(String(minMatchScore), 10);
            if (!isNaN(scoreLimit)) {
                matchedJobs = matchedJobs.filter((job) => job.matchScore >= scoreLimit);
            }
        }
        // 5. Apply Sorting
        if (sortBy === "salary") {
            // Sort roughly by salary string analysis (e.g. ₹18–24 LPA or ₹60k/month)
            matchedJobs.sort((a, b) => {
                const getVal = (sal) => {
                    const num = parseInt(sal.replace(/[^0-9]/g, ""), 10);
                    return isNaN(num) ? 0 : num;
                };
                return getVal(b.salary) - getVal(a.salary);
            });
        }
        else if (sortBy === "recent") {
            matchedJobs.sort((a, b) => b.postedAt.localeCompare(a.postedAt));
        }
        else {
            // Default: matchScore desc
            matchedJobs.sort((a, b) => b.matchScore - a.matchScore);
        }
        res.json({
            success: true,
            data: matchedJobs
        });
    }
    catch (error) {
        console.error("Get Recommendations Error:", error);
        res.status(500).json({ success: false, message: "Internal server error retrieving job recommendations." });
    }
};
exports.getRecommendations = getRecommendations;
const getRecommendationById = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { id } = req.params;
    try {
        const job = await db_1.prisma.job.findUnique({
            where: { id }
        });
        if (!job) {
            return res.status(404).json({ success: false, message: "Job recommendation not found." });
        }
        // Fetch user profile to calculate match score
        const userProfile = await db_1.prisma.resumeProfile.findUnique({
            where: { userId: req.user.id }
        });
        const userSkills = userProfile ? JSON.parse(userProfile.skills).map((s) => s.toLowerCase()) : [];
        const jobSkills = JSON.parse(job.skills);
        let dynamicScore = job.matchScore;
        if (userSkills.length > 0 && jobSkills.length > 0) {
            const matchingSkills = jobSkills.filter((skill) => userSkills.includes(skill.toLowerCase()));
            const ratio = matchingSkills.length / jobSkills.length;
            dynamicScore = Math.round(50 + ratio * 50);
        }
        res.json({
            success: true,
            data: {
                id: job.id,
                title: job.title,
                company: job.company,
                location: job.location,
                type: job.type,
                matchScore: dynamicScore,
                salary: job.salary,
                skills: jobSkills,
                aiInsight: userSkills.length > 0 && jobSkills.length > 0
                    ? `Matched ${jobSkills.filter(s => userSkills.includes(s.toLowerCase())).length} of ${jobSkills.length} key skills`
                    : job.aiInsight,
                postedAt: job.postedAt,
                description: job.description,
                applyUrl: job.applyUrl
            }
        });
    }
    catch (error) {
        console.error("Get Recommendation By Id Error:", error);
        res.status(500).json({ success: false, message: "Internal server error retrieving job detail." });
    }
};
exports.getRecommendationById = getRecommendationById;
