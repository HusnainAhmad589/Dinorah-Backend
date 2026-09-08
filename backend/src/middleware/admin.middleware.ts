import { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware";

/**
 * Admin Authorization Middleware
 * Verifies that the authenticated user attached to `req.user` has the 'admin' role.
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new AppError("Authentication required", 401));
  }

  if (req.user.role !== "admin") {
    return next(new AppError("Access denied: Administrative privileges required", 403));
  }

  next();
}
