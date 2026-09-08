import { ValidationError, ValidationResult, RegisterRequest, LoginRequest } from "../types/auth.types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates registration input payload.
 */
export function validateRegisterInput(body: unknown): ValidationResult & { data?: RegisterRequest } {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== "object") {
    return {
      isValid: false,
      errors: [{ field: "root", message: "Request body must be a JSON object" }],
    };
  }

  const payload = body as Record<string, unknown>;

  // Name Validation
  if (!payload.name || typeof payload.name !== "string" || payload.name.trim().length === 0) {
    errors.push({ field: "name", message: "Name is required" });
  } else if (payload.name.trim().length < 2) {
    errors.push({ field: "name", message: "Name must be at least 2 characters long" });
  } else if (payload.name.trim().length > 100) {
    errors.push({ field: "name", message: "Name cannot exceed 100 characters" });
  }

  // Email Validation
  if (!payload.email || typeof payload.email !== "string" || payload.email.trim().length === 0) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!EMAIL_REGEX.test(payload.email.trim())) {
    errors.push({ field: "email", message: "A valid email address is required" });
  }

  // Password Validation
  if (!payload.password || typeof payload.password !== "string") {
    errors.push({ field: "password", message: "Password is required" });
  } else if (payload.password.length < 6) {
    errors.push({ field: "password", message: "Password must be at least 6 characters long" });
  }

  // Role Validation (optional)
  if (payload.role !== undefined && payload.role !== "customer" && payload.role !== "admin") {
    errors.push({ field: "role", message: "Role must be either 'customer' or 'admin'" });
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    data: {
      name: (payload.name as string).trim(),
      email: (payload.email as string).trim().toLowerCase(),
      password: payload.password as string,
      role: (payload.role as "customer" | "admin") || "customer",
    },
  };
}

/**
 * Validates login input payload.
 */
export function validateLoginInput(body: unknown): ValidationResult & { data?: LoginRequest } {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== "object") {
    return {
      isValid: false,
      errors: [{ field: "root", message: "Request body must be a JSON object" }],
    };
  }

  const payload = body as Record<string, unknown>;

  // Email Validation
  if (!payload.email || typeof payload.email !== "string" || payload.email.trim().length === 0) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!EMAIL_REGEX.test(payload.email.trim())) {
    errors.push({ field: "email", message: "A valid email address is required" });
  }

  // Password Validation
  if (!payload.password || typeof payload.password !== "string" || payload.password.length === 0) {
    errors.push({ field: "password", message: "Password is required" });
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    data: {
      email: (payload.email as string).trim().toLowerCase(),
      password: payload.password as string,
    },
  };
}
