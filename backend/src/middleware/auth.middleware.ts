import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { AppError } from "./error.middleware";

/**
 * Authentication Middleware
 * Validates the Bearer JWT token from the Authorization header and attaches the user payload to `req.user`.
 */
export function authenticateToken(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AppError("Authorization token required", 401));
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return next(new AppError("Invalid authorization format. Format should be 'Bearer <token>'", 401));
  }

  const token = parts[1];

  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    return next(new AppError("Invalid or expired authentication token", 401));
  }
}
