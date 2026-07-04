import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/better-auth.js";

// Import Routers
import { authRouter } from "./features/authentication/auth.router.js";
import { resumeRouter } from "./features/resumes/resume.router.js";
import { profileRouter } from "./features/candidate-profile/profile.router.js";
import { jobsRouter } from "./features/jobs/jobs.router.js";
import { recommendationRouter } from "./features/recommendations/recommendation.router.js";
import { skillGapRouter } from "./features/skill-gap/skill-gap.router.js";
import { notificationRouter } from "./features/notifications/notification.router.js";
import { chatRouter } from "./features/chat/chat.router.js";
import { dashboardRouter } from "./features/dashboard/dashboard.router.js";
import { roadmapRouter } from "./features/roadmap/roadmap.router.js";
import { marketRouter } from "./features/market/market.router.js";

// Import Controllers and Middleware for compatibility routing
import { authMiddleware } from "./middleware/auth.middleware.js";
import { profileController } from "./features/candidate-profile/profile.controller.js";

const app = express();

// Trust reverse proxies (Vercel, Render, etc.) to get correct IPs and Host headers
app.set("trust proxy", 1);

// Standard rate limiter for API security
const apiLimiter = rateLimit({
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
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
}));
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "http://localhost:3000",
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    req.headers.host = req.headers["x-forwarded-host"] as string;
  }
  next();
});

// Setup Express Routers
app.use("/api/auth", authRouter);

// Setup Better-Auth
app.all("/api/auth/*", toNodeHandler(auth));
app.use("/api/resume", resumeRouter);
app.use("/api/profile", profileRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/recommendations", recommendationRouter);
app.use("/api/skills", skillGapRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/chat", chatRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/roadmap", roadmapRouter);
app.use("/api/market", marketRouter);

// Compatibility route mappings to support the existing React frontend
app.get("/api/users/profile", authMiddleware, profileController.getProfile);
app.get("/api/resume/profile", authMiddleware, profileController.getProfile);

// Global Error Handler Middleware
app.use(errorMiddleware);

export default app;
export { app };
