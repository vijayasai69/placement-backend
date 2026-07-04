import { Router } from "express";
import { dashboardController } from "./dashboard.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/stats", authMiddleware, dashboardController.getStats);

export const dashboardRouter = router;
export default dashboardRouter;
