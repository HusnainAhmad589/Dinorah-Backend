import { User, SafeUser, UserRole } from "./user.types";

/**
 * Registration request payload.
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

/**
 * Login request payload.
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Field-level validation error structure.
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Result of validator checks.
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Generic authentication API response format.
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: SafeUser | User;
  errors?: ValidationError[];
}

/**
 * JWT decoded payload structure.
 */
export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
