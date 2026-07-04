"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketController = void 0;
const prisma_js_1 = require("../../config/prisma.js");
const openai_1 = require("@langchain/openai");
exports.marketController = {
    getMarketIntelligence: async (req, res) => {
        try {
            // @ts-ignore - Assuming auth middleware attaches user
            const userId = req.user?.id || req.body.userId; // fallback if needed
            // Let's rely on standard auth middleware attaching req.user
            const uid = req.user?.id;
            if (!uid) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            // Fetch user profile to get skills and location
            const profile = await prisma_js_1.prisma.candidateProfile.findFirst({
                where: { userId: uid },
                orderBy: { createdAt: "desc" },
            });
            if (!profile) {
                res.status(404).json({ error: "Candidate profile not found. Please upload a resume first." });
                return;
            }
            // If we already generated market intelligence and it has the new schema, return the whole profile
            const currentIntelligence = profile.marketIntelligence;
            if (currentIntelligence && currentIntelligence.skillsSimulator) {
                res.json({ profile });
                return;
            }
            const skills = profile.skills.length > 0 ? profile.skills.join(", ") : "General Tech";
            const location = profile.location || "Global";
            // Initialize OpenAI
            const model = new openai_1.ChatOpenAI({
                modelName: "gpt-4o-mini",
                maxTokens: 2048,
            });
            const prompt = `
      You are an expert tech recruiter and market analyst.
      Analyze the current job market for a candidate with the following profile:
      Skills: ${skills}
      Target Location: ${location}

      Return a JSON object containing real-time market intelligence for this specific skill profile. The JSON MUST follow this exact structure:
      {
        "salaryRange": {
          "low": 0,
          "median": 0,
          "high": 0
        },
        "hiringTrend": {
          "growthPercentage": 0,
          "analysis": "Short 1-sentence analysis of demand for these skills."
        },
        "topCompanies": [
          "Company 1",
          "Company 2",
          "Company 3",
          "Company 4",
          "Company 5"
        ],
        "topLocations": [
          "Location 1",
          "Location 2"
        ],
        "topEarners": [
          { "salary": "₹30-40 LPA", "company": "High-growth Startups", "whatTheyDid": ["Mastered System Design", "Contributed to Open Source"] },
          { "salary": "₹20-30 LPA", "company": "Top IT Services", "whatTheyDid": ["Built end-to-end products", "Cloud certifications"] }
        ],
        "skillsSimulator": [
          { "name": "Skill Name", "boost": 50000 }
        ],
        "trendingSkills": [
          { "name": "Skill Name", "score": 95, "color": "bg-emerald-500" }
        ],
        "companyReadiness": [
          { "name": "Company Name", "match": 85, "salary": "₹15-20 LPA", "difficulty": "High", "trend": "+10%", "deadline": "Ongoing", "logo": "C" }
        ]
      }

      CRITICAL CONSTRAINTS:
      1. Ensure the salary numbers are realistic and provided in INR (Indian Rupees). You MUST strictly follow this rubric based on the skills provided:
         - Tier 1 (Basic IT/Admin/Data Entry): ₹50,000 - ₹2,50,000
         - Tier 2 (Basic Web Dev - HTML, CSS, JS, PHP): ₹2,50,000 - ₹5,00,000
         - Tier 3 (Modern Stack - MERN, Spring Boot, Python, SQL): ₹5,00,000 - ₹10,00,000
         - Tier 4 (Advanced - Cloud, DevOps, AI/ML, System Design, Data Eng): ₹12,00,000 - ₹25,00,000+
         Analyze the skills and pick the exact median salary within the matched tier. DO NOT just default to 1200000.
      2. For the "topCompanies" list, ensure approximately 80% are from India and 20% are from other top global tech hubs. 
      3. For the "topLocations" list, you MUST dynamically determine the 5 to 10 best cities based on the candidate's exact skills. Do NOT just default to Bengaluru. Analyze which cities genuinely have the highest demand for these specific skills globally and in India.
      4. For "topEarners", provide 2-3 realistic profiles of high earners in this specific role. Include their salary bracket, the type of company they work for, and an array of 2-3 specific, actionable steps they took to reach that tier.
      5. For "skillsSimulator", provide 8-10 skills that complement the candidate's current skills and would boost their salary. The boost should be in realistic INR increments (e.g., 50000, 100000, 300000).
      6. For "trendingSkills", provide 5-8 currently trending skills related to the candidate's domain with scores out of 100 and a Tailwind CSS color class (e.g., bg-emerald-500, bg-blue-400, bg-violet-500).
      7. For "companyReadiness", provide 5 companies the candidate could target, with realistic match percentages based on their skills, salary ranges, difficulty levels, hiring trends, application deadlines, and a 1-character logo string (usually the first letter).
      
      Return ONLY valid JSON.
      `;
            const aiResponse = await model.invoke(prompt);
            const text = aiResponse.content.toString();
            // Clean markdown formatting if present
            const cleanJsonStr = text.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
            const marketData = JSON.parse(cleanJsonStr);
            // Save to database so we don't spam the API
            const updatedProfile = await prisma_js_1.prisma.candidateProfile.update({
                where: { id: profile.id },
                data: {
                    marketIntelligence: marketData,
                },
            });
            res.json({ profile: updatedProfile });
        }
        catch (error) {
            console.error("Market Intelligence Error:", error);
            res.status(500).json({ error: "Failed to generate market intelligence." });
        }
    },
};
