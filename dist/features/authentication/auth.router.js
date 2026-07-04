"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_js_1 = require("./auth.controller.js");
const validate_middleware_js_1 = require("../../middleware/validate.middleware.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const signupSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Name is required"),
        email: zod_1.z.string().email("Invalid email address"),
        password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    }),
});
const loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email address"),
        password: zod_1.z.string().min(1, "Password is required"),
    }),
});
router.post("/signup", (0, validate_middleware_js_1.validate)(signupSchema), auth_controller_js_1.authController.signUp);
router.post("/login", (0, validate_middleware_js_1.validate)(loginSchema), auth_controller_js_1.authController.login);
router.post("/logout", auth_controller_js_1.authController.logout);
router.get("/me", auth_middleware_js_1.authMiddleware, auth_controller_js_1.authController.me);
router.post("/forgot-password", auth_controller_js_1.authController.forgotPassword);
router.post("/verify-otp", auth_controller_js_1.authController.verifyOtp);
router.post("/reset-password", auth_controller_js_1.authController.resetPassword);
exports.authRouter = router;
exports.default = exports.authRouter;
