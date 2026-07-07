import { Router } from "express";
import { resumeController, uploadMiddleware } from "./resume.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/upload", authMiddleware, uploadMiddleware, resumeController.uploadResume);
router.get("/status/:jobId", authMiddleware, resumeController.getResumeStatus);
router.get("/", authMiddleware, resumeController.getResume);
router.get("/history", authMiddleware, resumeController.getResumeHistory);
router.get("/download/:profileId", authMiddleware, resumeController.downloadResume);
router.delete("/profile/:profileId", authMiddleware, resumeController.deleteResumeProfile);
router.delete("/reset", authMiddleware, resumeController.resetUserData);

export const resumeRouter = router;
export default resumeRouter;
