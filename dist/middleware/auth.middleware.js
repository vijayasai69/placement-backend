"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const better_auth_js_1 = require("../config/better-auth.js");
const node_1 = require("better-auth/node");
async function authMiddleware(req, res, next) {
    try {
        const sessionData = await better_auth_js_1.auth.api.getSession({
            headers: (0, node_1.fromNodeHeaders)(req.headers),
        });
        if (!sessionData || !sessionData.session || !sessionData.user) {
            return res.status(401).json({
                success: false,
                error: {
                    message: "Authorization token or session cookie missing or invalid",
                    status: 401,
                },
            });
        }
        req.user = {
            id: sessionData.user.id,
            email: sessionData.user.email,
            name: sessionData.user.name,
        };
        req.session = sessionData.session;
        next();
    }
    catch (error) {
        next(error);
    }
}
