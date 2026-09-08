import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { ValidationError } from "../types/auth.types";

/**
 * Custom application error with HTTP status codes and optional field-level errors.
 */
export class AppError extends Error {
  public statusCode: number;
  public errors?: ValidationError[];

  constructor(message: string, statusCode = 400, errors?: ValidationError[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Centralized Express Error Handling Middleware.
 */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = "statusCode" in err && typeof err.statusCode === "number" ? err.statusCode : 500;
  const message = err.message || "An unexpected internal server error occurred.";
  const errors = "errors" in err ? err.errors : undefined;

  // Log error details for developers
  if (statusCode >= 500) {
    console.error("[ServerError]", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && errors.length > 0 ? { errors } : {}),
    ...(env.NODE_ENV === "development" && statusCode >= 500 ? { stack: err.stack } : {}),
  });
}
