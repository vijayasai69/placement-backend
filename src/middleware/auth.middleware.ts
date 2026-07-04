import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
  session?: any;
}

import { auth } from "../config/better-auth.js";
import { fromNodeHeaders } from "better-auth/node";

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const sessionData = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!sessionData || !sessionData.session || !sessionData.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Authorization token or session cookie missing or invalid",
          status: 401,
        },
      });
    }

    req.user = {
      id: sessionData.user.id,
      email: sessionData.user.email,
      name: sessionData.user.name,
    };

    req.session = sessionData.session;

    next();
  } catch (error) {
    next(error);
  }
}