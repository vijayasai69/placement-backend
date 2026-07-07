"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const error_middleware_js_1 = require("./middleware/error.middleware.js");
const node_1 = require("better-auth/node");
const better_auth_js_1 = require("./config/better-auth.js");
// Import Routers
const auth_router_js_1 = require("./features/authentication/auth.router.js");
const resume_router_js_1 = require("./features/resumes/resume.router.js");
const profile_router_js_1 = require("./features/candidate-profile/profile.router.js");
const jobs_router_js_1 = require("./features/jobs/jobs.router.js");
const recommendation_router_js_1 = require("./features/recommendations/recommendation.router.js");
const skill_gap_router_js_1 = require("./features/skill-gap/skill-gap.router.js");
const notification_router_js_1 = require("./features/notifications/notification.router.js");
const chat_router_js_1 = require("./features/chat/chat.router.js");
const dashboard_router_js_1 = require("./features/dashboard/dashboard.router.js");
const roadmap_router_js_1 = require("./features/roadmap/roadmap.router.js");
const market_router_js_1 = require("./features/market/market.router.js");
// Import Controllers and Middleware for compatibility routing
const auth_middleware_js_1 = require("./middleware/auth.middleware.js");
const profile_controller_js_1 = require("./features/candidate-profile/profile.controller.js");
const app = (0, express_1.default)();
exports.app = app;
// Trust reverse proxies (Vercel, Render, etc.) to get correct IPs and Host headers
app.set("trust proxy", 1);
// Standard rate limiter for API security
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per window during dev
    message: {
        success: false,
        error: {
            message: "Too many requests from this IP, please try again after 15 minutes.",
            status: 429,
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Configure Middlewares
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
}));
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.url} (Host: ${req.headers.host}, Origin: ${req.headers.origin})`);
    next();
});
app.use(apiLimiter);
// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is healthy!" });
});
// Proxy Header Middleware for Better Auth (crucial for Vercel -> Render proxy)
app.use((req, res, next) => {
    if (req.headers["x-forwarded-host"]) {
        req.headers.host = req.headers["x-forwarded-host"];
    }
    next();
});
// Setup Express Routers
app.use("/api/auth", auth_router_js_1.authRouter);
// Setup Better-Auth
app.all("/api/auth/*", (0, node_1.toNodeHandler)(better_auth_js_1.auth));
app.use("/api/resume", resume_router_js_1.resumeRouter);
app.use("/api/profile", profile_router_js_1.profileRouter);
app.use("/api/jobs", jobs_router_js_1.jobsRouter);
app.use("/api/recommendations", recommendation_router_js_1.recommendationRouter);
app.use("/api/skills", skill_gap_router_js_1.skillGapRouter);
app.use("/api/notifications", notification_router_js_1.notificationRouter);
app.use("/api/chat", chat_router_js_1.chatRouter);
app.use("/api/dashboard", dashboard_router_js_1.dashboardRouter);
app.use("/api/roadmap", roadmap_router_js_1.roadmapRouter);
app.use("/api/market", market_router_js_1.marketRouter);
// Compatibility route mappings to support the existing React frontend
app.get("/api/users/profile", auth_middleware_js_1.authMiddleware, profile_controller_js_1.profileController.getProfile);
app.get("/api/resume/profile", auth_middleware_js_1.authMiddleware, profile_controller_js_1.profileController.getProfile);
// Global Error Handler Middleware
app.use(error_middleware_js_1.errorMiddleware);
exports.default = app;
