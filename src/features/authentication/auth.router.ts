import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { z } from "zod";

const router = Router();

const signupSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

router.post("/signup", validate(signupSchema), authController.signUp);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.get("/me", authMiddleware, authController.me);

router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-otp", authController.verifyOtp);
router.post("/reset-password", authController.resetPassword);

export const authRouter = router;
export default authRouter;
