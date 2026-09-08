import { Request, Response, NextFunction } from "express";
import { validateRegisterInput, validateLoginInput } from "../validators/auth.validator";
import { registerService, loginService, getMeService } from "../services/auth.service";
import { AppError } from "../middleware/error.middleware";

/**
 * Controller for registering a new user.
 * POST /api/auth/register
 */
export async function registerController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validation = validateRegisterInput(req.body);
    if (!validation.isValid || !validation.data) {
      throw new AppError("Validation failed", 400, validation.errors);
    }

    const result = await registerService(validation.data);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller for logging in an existing user.
 * POST /api/auth/login
 */
export async function loginController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validation = validateLoginInput(req.body);
    if (!validation.isValid || !validation.data) {
      throw new AppError("Validation failed", 400, validation.errors);
    }

    const result = await loginService(validation.data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller for getting the current authenticated user's profile.
 * GET /api/auth/me
 */
export async function meController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await getMeService(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller for admin-only endpoint test / verification.
 * GET /api/auth/admin-only
 */
export async function adminStatsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.status(200).json({
      success: true,
      message: "Admin authorization verified. Access granted to privileged data.",
      adminUser: req.user,
      systemStatus: {
        serverTime: new Date().toISOString(),
        database: "MySQL connected",
        activeFeatures: ["JWT Auth", "Role-Based Access Control", "Prepared SQL Statements"],
      },
    });
  } catch (error) {
    next(error);
  }
}
