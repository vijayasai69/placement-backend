import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service.js";
import { AuthenticatedRequest } from "../../middleware/auth.middleware.js";

const authService = new AuthService();

export class AuthController {
  async signUp(req: Request, res: Response, next: NextFunction) {
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
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
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
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Create Headers object from express headers
      const headers = new Headers();
      Object.entries(req.headers).forEach(([key, value]) => {
        if (typeof value === "string") {
          headers.append(key, value);
        } else if (Array.isArray(value)) {
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
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
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
    } catch (error) {
      next(error);
    }
  }
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await authService.generateOTP(email);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.message === "User not found") {
        // Don't leak user existence typically, but for UI feedback let's allow it or just pretend it sent
        res.status(404).json({ success: false, message: "User not found" });
      } else {
        next(error);
      }
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, code } = req.body;
      const result = await authService.verifyOTP(email, code);
      res.status(result.valid ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, code, newPassword } = req.body;
      const result = await authService.resetPassword(email, code, newPassword);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
export const authController = new AuthController();
