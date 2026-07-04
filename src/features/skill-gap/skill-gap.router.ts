import { Router } from "express";
import { skillGapController } from "./skill-gap.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/missing", authMiddleware, skillGapController.getMissingSkills);

export const skillGapRouter = router;
export default skillGapRouter;
