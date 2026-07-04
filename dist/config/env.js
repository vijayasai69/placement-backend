"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default("5000").transform((val) => parseInt(val, 10)),
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]).default("development"),
    DATABASE_URL: zod_1.z.string().min(1, "DATABASE_URL is required"),
    BETTER_AUTH_SECRET: zod_1.z.string().min(1, "BETTER_AUTH_SECRET is required"),
    BETTER_AUTH_URL: zod_1.z.string().url("BETTER_AUTH_URL must be a valid URL"),
    OPENAI_API_KEY: zod_1.z.string().min(1, "OPENAI_API_KEY is required"),
    SMTP_HOST: zod_1.z.string().default("smtp.mailtrap.io"),
    SMTP_PORT: zod_1.z.string().default("2525").transform((val) => parseInt(val, 10)),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    SMTP_FROM: zod_1.z.string().default("noreply@placementrecommendation.com"),
    GOOGLE_CLIENT_ID: zod_1.z.string().optional(),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().optional(),
    GITHUB_CLIENT_ID: zod_1.z.string().optional(),
    GITHUB_CLIENT_SECRET: zod_1.z.string().optional(),
    GROQ_API_KEY: zod_1.z.string().optional(),
    NVIDIA_API_KEY: zod_1.z.string().optional(),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.format());
    process.exit(1);
}
exports.env = parsed.data;
