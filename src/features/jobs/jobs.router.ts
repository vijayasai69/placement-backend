import { Router } from "express";
import { jobsController } from "./jobs.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { recommendationController } from "../recommendations/recommendation.controller.js";

const router = Router();

// Endpoint for student recommendation matching
router.get("/recommended", authMiddleware, recommendationController.getRecommendedJobs);

// Standard jobs list and single job endpoints
router.get("/", authMiddleware, jobsController.getJobs);
router.get("/:id", authMiddleware, jobsController.getJob);

export const jobsRouter = router;
export default jobsRouter;
