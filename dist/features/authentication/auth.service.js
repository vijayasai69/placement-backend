"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const better_auth_js_1 = require("../../config/better-auth.js");
const prisma_js_1 = require("../../config/prisma.js");
const email_js_1 = require("../../config/email.js");
class AuthService {
    async signUp(data) {
        // Better Auth sign up with email and password
        const response = await better_auth_js_1.auth.api.signUpEmail({
            body: {
                email: data.email,
                password: data.password,
                name: data.name,
            },
        });
        return response;
    }
    async signIn(data) {
        // Better Auth sign in with email and password
        const response = await better_auth_js_1.auth.api.signInEmail({
            body: {
                email: data.email,
                password: data.password,
            },
        });
        return response;
    }
    async signOut(headers) {
        const response = await better_auth_js_1.auth.api.signOut({
            headers,
        });
        return response;
    }
    async getMe(headers) {
        const session = await better_auth_js_1.auth.api.getSession({
            headers,
        });
        return session;
    }
    async generateOTP(email) {
        const user = await prisma_js_1.prisma.user.findFirst({ where: { email } });
        if (!user) {
            throw new Error("User not found");
        }
        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Store in DB, expire in 10 minutes
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);
        // Clean up old OTPs for this email
        await prisma_js_1.prisma.verificationCode.deleteMany({
            where: { email },
        });
        await prisma_js_1.prisma.verificationCode.create({
            data: {
                email,
                code: otp,
                expiresAt,
            },
        });
        // Send real OTP email
        await (0, email_js_1.sendOtpEmail)(email, otp);
        return { success: true, message: "OTP sent to your email address" };
    }
    async verifyOTP(email, code) {
        const record = await prisma_js_1.prisma.verificationCode.findFirst({
            where: { email, code },
        });
        if (!record) {
            return { valid: false, message: "Invalid OTP" };
        }
        if (new Date() > record.expiresAt) {
            return { valid: false, message: "OTP has expired" };
        }
        return { valid: true, message: "OTP verified" };
    }
    async resetPassword(email, otp, newPassword) {
        // 1. Verify OTP again to be secure
        const verification = await this.verifyOTP(email, otp);
        if (!verification.valid) {
            throw new Error(verification.message);
        }
        // 2. Find user
        const user = await prisma_js_1.prisma.user.findFirst({ where: { email } });
        if (!user) {
            throw new Error("User not found");
        }
        // 3. Hash new password using better-auth's internal hasher
        const { hashPassword } = await import("better-auth/crypto");
        const hashedPassword = await hashPassword(newPassword);
        // 4. Update or create the credential account
        const existingCredentialAccount = await prisma_js_1.prisma.account.findFirst({
            where: { userId: user.id, providerId: "credential" }
        });
        if (existingCredentialAccount) {
            await prisma_js_1.prisma.account.update({
                where: { id: existingCredentialAccount.id },
                data: { password: hashedPassword }
            });
        }
        else {
            // Create a new credential account for OAuth users setting a password
            await prisma_js_1.prisma.account.create({
                data: {
                    userId: user.id,
                    providerId: "credential",
                    accountId: email,
                    password: hashedPassword,
                }
            });
        }
        // 5. Delete the OTP so it can't be reused
        await prisma_js_1.prisma.verificationCode.deleteMany({
            where: { email }
        });
        return { success: true, message: "Password updated successfully" };
    }
}
exports.AuthService = AuthService;
