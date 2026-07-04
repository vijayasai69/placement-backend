"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skillGapController = exports.SkillGapController = void 0;
const skill_gap_service_js_1 = require("./skill-gap.service.js");
class SkillGapController {
    async getMissingSkills(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: { message: "Unauthorized", status: 401 }
                });
            }
            const jobId = req.query.jobId;
            const profileId = req.query.profileId;
            if (jobId) {
                const gap = await skill_gap_service_js_1.skillGapService.getMissingSkillsForJob(userId, jobId, profileId);
                return res.status(200).json({
                    success: true,
                    data: gap
                });
            }
            else {
                // Return gaps for all recommended jobs
                const gaps = await skill_gap_service_js_1.skillGapService.getAllGapsForRecommended(userId, profileId);
                return res.status(200).json({
                    success: true,
                    data: gaps
                });
            }
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SkillGapController = SkillGapController;
exports.skillGapController = new SkillGapController();
exports.default = exports.skillGapController;
