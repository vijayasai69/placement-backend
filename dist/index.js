"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// @ts-ignore
const xss_clean_1 = __importDefault(require("xss-clean"));
const node_1 = require("better-auth/node");
const auth_1 = require("./services/auth");
const profile_1 = __importDefault(require("./routes/profile"));
const resume_1 = __importDefault(require("./routes/resume"));
const recommendations_1 = __importDefault(require("./routes/recommendations"));
const pdf_1 = __importDefault(require("./routes/pdf"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Security Middlewares
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
// Apply XSS sanitization, skipping Better Auth endpoints to avoid type errors with non-string fields
const xss = (0, xss_clean_1.default)();
app.use((req, res, next) => {
    if (req.path.startsWith("/api/auth")) {
        return next();
    }
    return xss(req, res, next);
});
// Rate Limiting to prevent API abuse
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests from this IP, please try again later." }
});
app.use("/api/", limiter);
// CORS configuration supporting dynamic localhost port checks
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (origin.startsWith("http://localhost:") ||
            origin.startsWith("https://localhost:") ||
            origin.startsWith("http://127.0.0.1:") ||
            origin.startsWith("https://127.0.0.1:")) {
            return callback(null, true);
        }
        const allowed = [process.env.FRONTEND_URL || "http://localhost:5173", "http://127.0.0.1:5173"];
        if (allowed.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        return callback(new Error("CORS policy violation"), false);
    },
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Better Auth Node Handler mounted at standard endpoint
app.all("/api/auth/*", (0, node_1.toNodeHandler)(auth_1.auth));
// Mount standard API routes
app.use("/api/users", profile_1.default);
app.use("/api/resume", resume_1.default);
app.use("/api/recommendations", recommendations_1.default);
app.use("/api/pdf", pdf_1.default);
// Base healthcheck route
app.get("/health", (req, res) => {
    res.json({ success: true, status: "healthy" });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error"
    });
});
app.listen(port, () => {
    console.log(`Production Server is running at http://localhost:${port}`);
});
exports.default = app;
