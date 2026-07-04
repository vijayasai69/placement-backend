import { Router } from "express";
import { chatController } from "./chat.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/message", authMiddleware, chatController.sendMessage);

export const chatRouter = router;
export default chatRouter;
