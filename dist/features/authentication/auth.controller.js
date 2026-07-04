"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_js_1 = require("./auth.service.js");
const authService = new auth_service_js_1.AuthService();
class AuthController {
    async signUp(req, res, next) {
        try {
            const result = await authService.signUp(req.body);
            if (result && result.token) {
                res.cookie("better-auth.session_token", result.token, {
                    httpOnly: true,
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    path: "/",
                    sameSite: "lax",
                    secure: process.env.NODE_ENV === "production"
                });
            }
            res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const result = await authService.signIn(req.body);
            if (result && result.token) {
                res.cookie("better-auth.session_token", result.token, {
                    httpOnly: true,
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    path: "/",
                    sameSite: "lax",
                    secure: process.env.NODE_ENV === "production"
                });
            }
            res.status(200).json({
                success: true,
                message: "Logged in successfully",
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            // Create Headers object from express headers
            const headers = new Headers();
            Object.entries(req.headers).forEach(([key, value]) => {
                if (typeof value === "string") {
                    headers.append(key, value);
                }
                else if (Array.isArray(value)) {
                    value.forEach((val) => headers.append(key, val));
                }
            });
            await authService.signOut(headers);
            res.clearCookie("better-auth.session_token", {
                path: "/"
            });
            res.status(200).json({
                success: true,
                message: "Logged out successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async me(req, res, next) {
        try {
            const authenticatedReq = req;
            if (!authenticatedReq.user || !authenticatedReq.session) {
                return res.status(401).json({
                    success: false,
                    error: {
                        message: "Unauthorized",
                        status: 401,
                    },
                });
            }
            res.status(200).json({
                success: true,
                data: {
                    user: authenticatedReq.user,
                    session: authenticatedReq.session,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const result = await authService.generateOTP(email);
            res.status(200).json(result);
        }
        catch (error) {
            if (error.message === "User not found") {
                // Don't leak user existence typically, but for UI feedback let's allow it or just pretend it sent
                res.status(404).json({ success: false, message: "User not found" });
            }
            else {
                next(error);
            }
        }
    }
    async verifyOtp(req, res, next) {
        try {
            const { email, code } = req.body;
            const result = await authService.verifyOTP(email, code);
            res.status(result.valid ? 200 : 400).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const { email, code, newPassword } = req.body;
            const result = await authService.resetPassword(email, code, newPassword);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
