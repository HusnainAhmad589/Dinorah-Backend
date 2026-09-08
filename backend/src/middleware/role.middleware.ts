import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types/user.types";
import { AppError } from "./error.middleware";

/**
 * Role-Based Access Control (RBAC) Middleware.
 * Ensures the authenticated user has at least one of the required roles.
 * @param allowedRoles List of roles permitted to access the route
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError("User is not authenticated", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(`Access forbidden: requires role [${allowedRoles.join(", ")}]`, 403));
    }

    next();
  };
}
