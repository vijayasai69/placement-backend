import { Router } from "express";
import { marketController } from "./market.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/insights", authMiddleware, marketController.getMarketIntelligence);

export { router as marketRouter };
