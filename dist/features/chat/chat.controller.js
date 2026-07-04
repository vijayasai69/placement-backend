"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = exports.ChatController = void 0;
const chat_service_js_1 = require("./chat.service.js");
class ChatController {
    async sendMessage(req, res, next) {
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
            const reply = await chat_service_js_1.chatService.getChatResponse(userId, messages);
            res.status(200).json({
                success: true,
                data: {
                    role: "assistant",
                    content: reply,
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ChatController = ChatController;
exports.chatController = new ChatController();
exports.default = exports.chatController;
