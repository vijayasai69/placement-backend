import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { chatService } from "./chat.service.js";

export class ChatController {
  async sendMessage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: "Unauthorized", status: 401 }
        });
      }

      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({
          success: false,
          error: { message: "Messages array is required", status: 400 }
        });
      }

      const reply = await chatService.getChatResponse(userId, messages);

      res.status(200).json({
        success: true,
        data: {
          role: "assistant",
          content: reply,
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const chatController = new ChatController();
export default chatController;
