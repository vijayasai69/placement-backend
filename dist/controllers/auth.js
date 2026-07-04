"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSession = exports.logout = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../services/db");
const JWT_SECRET = process.env.JWT_SECRET || "placeai_jwt_secret_key_2026_secure";
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 3600 * 1000 // 7 days
};
const register = async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({ success: false, message: "Please provide name, email, and password." });
    }
    try {
        const existingUser = await db_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "An account with this email already exists." });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await db_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            }
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
        // Set cookie
        res.cookie("session_token", token, COOKIE_OPTIONS);
        // Create session in DB
        const session = await db_1.prisma.session.create({
            data: {
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000)
            }
        });
        res.status(201).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            session: {
                id: session.id,
                expiresAt: session.expiresAt
            }
        });
    }
    catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ success: false, message: "Internal server error during registration." });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Please provide email and password." });
    }
    try {
        const user = await db_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid email or password." });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid email or password." });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
        res.cookie("session_token", token, COOKIE_OPTIONS);
        const session = await db_1.prisma.session.create({
            data: {
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000)
            }
        });
        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            session: {
                id: session.id,
                expiresAt: session.expiresAt
            }
        });
    }
    catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Internal server error during login." });
    }
};
exports.login = login;
const logout = async (req, res) => {
    const token = req.cookies.session_token;
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            await db_1.prisma.session.deleteMany({ where: { userId: decoded.userId } });
        }
        catch (e) {
            // Ignore token verification errors on logout
        }
    }
    res.clearCookie("session_token");
    res.json({ success: true, message: "Successfully logged out." });
};
exports.logout = logout;
const getSession = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    try {
        const user = await db_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }
        // Find active session or mock session data
        const activeSession = await db_1.prisma.session.findFirst({
            where: { userId: user.id },
            orderBy: { expiresAt: "desc" }
        });
        res.json({
            success: true,
            user,
            session: {
                id: activeSession?.id || "mock-session-id",
                expiresAt: activeSession?.expiresAt || new Date(Date.now() + 2 * 3600 * 1000).toISOString()
            }
        });
    }
    catch (error) {
        console.error("Get Session Error:", error);
        res.status(500).json({ success: false, message: "Internal server error retrieving session." });
    }
};
exports.getSession = getSession;
