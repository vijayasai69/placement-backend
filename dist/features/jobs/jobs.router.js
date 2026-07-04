"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobsRouter = void 0;
const express_1 = require("express");
const jobs_controller_js_1 = require("./jobs.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const recommendation_controller_js_1 = require("../recommendations/recommendation.controller.js");
const router = (0, express_1.Router)();
// Endpoint for student recommendation matching
router.get("/recommended", auth_middleware_js_1.authMiddleware, recommendation_controller_js_1.recommendationController.getRecommendedJobs);
// Standard jobs list and single job endpoints
router.get("/", auth_middleware_js_1.authMiddleware, jobs_controller_js_1.jobsController.getJobs);
router.get("/:id", auth_middleware_js_1.authMiddleware, jobs_controller_js_1.jobsController.getJob);
exports.jobsRouter = router;
exports.default = exports.jobsRouter;
