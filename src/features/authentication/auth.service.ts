import { auth } from "../../config/better-auth.js";
import { prisma } from "../../config/prisma.js";
import { sendOtpEmail } from "../../config/email.js";

export class AuthService {
  async signUp(data: any) {
    // Better Auth sign up with email and password
    const response = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.name,
      },
    });
    return response;
  }

  async signIn(data: any) {
    // Better Auth sign in with email and password
    const response = await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
      },
    });
    return response;
  }

  async signOut(headers: Headers) {
    const response = await auth.api.signOut({
      headers,
    });
    return response;
  }

  async getMe(headers: Headers) {
    const session = await auth.api.getSession({
      headers,
    });
    return session;
  }

  async generateOTP(email: string) {
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB, expire in 10 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Clean up old OTPs for this email
    await prisma.verificationCode.deleteMany({
      where: { email },
    });

    await prisma.verificationCode.create({
      data: {
        email,
        code: otp,
        expiresAt,
      },
    });

    // Send real OTP email
    await sendOtpEmail(email, otp);

    return { success: true, message: "OTP sent to your email address" };
  }

  async verifyOTP(email: string, code: string) {
    const record = await prisma.verificationCode.findFirst({
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

  async resetPassword(email: string, otp: string, newPassword: string) {
    // 1. Verify OTP again to be secure
    const verification = await this.verifyOTP(email, otp);
    if (!verification.valid) {
      throw new Error(verification.message);
    }

    // 2. Find user
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    // 3. Hash new password using better-auth's internal hasher
    const { hashPassword } = await import("better-auth/crypto");
    const hashedPassword = await hashPassword(newPassword);

    // 4. Update or create the credential account
    const existingCredentialAccount = await prisma.account.findFirst({
      where: { userId: user.id, providerId: "credential" }
    });

    if (existingCredentialAccount) {
      await prisma.account.update({
        where: { id: existingCredentialAccount.id },
        data: { password: hashedPassword }
      });
    } else {
      // Create a new credential account for OAuth users setting a password
      await prisma.account.create({
        data: {
          userId: user.id,
          providerId: "credential",
          accountId: email,
          password: hashedPassword,
        }
      });
    }

    // 5. Delete the OTP so it can't be reused
    await prisma.verificationCode.deleteMany({
      where: { email }
    });

    return { success: true, message: "Password updated successfully" };
  }
}
