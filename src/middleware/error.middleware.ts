import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(`${req.method} ${req.path} failed:`, err);

  let status = 500;

  if (typeof err.status === "number") {
    status = err.status;
  } else if (typeof err.statusCode === "number") {
    status = err.statusCode;
  }

  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    error: {
      message,
      status,
      details: err.errors || undefined,
    },
  });
}