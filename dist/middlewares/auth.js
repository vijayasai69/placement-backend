"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const auth_1 = require("../services/auth");
const requireAuth = async (req, res, next) => {
    try {
        // Better Auth checks req.headers (including cookies) to retrieve session
        const sessionData = await auth_1.auth.api.getSession({
            headers: req.headers
        });
        if (!sessionData || !sessionData.user) {
            return res.status(401).json({ success: false, message: "Authentication session expired or invalid." });
        }
        req.user = {
            id: sessionData.user.id,
            email: sessionData.user.email,
            name: sessionData.user.name
        };
        next();
    }
    catch (error) {
        console.error("Better Auth Middleware Error:", error);
        return res.status(401).json({ success: false, message: "Session verification failed." });
    }
};
exports.requireAuth = requireAuth;
