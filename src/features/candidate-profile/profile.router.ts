import { Router } from "express";
import { profileController } from "./profile.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, profileController.getProfile);
router.put("/", authMiddleware, profileController.updateProfile);

export const profileRouter = router;
export default profileRouter;
