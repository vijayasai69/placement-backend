import { Router } from "express";
import { recommendationController } from "./recommendation.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, recommendationController.getRecommendedJobs);
router.post("/generate", authMiddleware, recommendationController.generateRecommendations);
router.patch("/:id/view", authMiddleware, recommendationController.markAsRead);

export const recommendationRouter = router;
export default recommendationRouter;
