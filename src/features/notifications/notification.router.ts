import { Router } from "express";
import { notificationController } from "./notification.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, notificationController.getNotifications);
router.patch("/:id/read", authMiddleware, notificationController.markAsRead);

export const notificationRouter = router;
export default notificationRouter;
