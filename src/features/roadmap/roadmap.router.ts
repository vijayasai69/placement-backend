import { Router } from "express";
import { roadmapController } from "./roadmap.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/generate", authMiddleware, roadmapController.getRoadmap);
router.post("/verify-step", authMiddleware, roadmapController.verifyStep);

export { router as roadmapRouter };
