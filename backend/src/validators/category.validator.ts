import { ValidationError, ValidationResult } from "../types/auth.types";
import { CreateCategoryRequest, UpdateCategoryRequest } from "../types/product.types";

export function validateCreateCategory(body: unknown): ValidationResult & { data?: CreateCategoryRequest } {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== "object") {
    return {
      isValid: false,
      errors: [{ field: "root", message: "Request body must be a JSON object" }],
    };
  }

  const payload = body as Record<string, unknown>;

  if (!payload.name || typeof payload.name !== "string" || payload.name.trim().length === 0) {
    errors.push({ field: "name", message: "Category name is required" });
  } else if (payload.name.trim().length < 2) {
    errors.push({ field: "name", message: "Category name must be at least 2 characters" });
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    data: {
      name: (payload.name as string).trim(),
      slug: payload.slug ? (payload.slug as string).trim() : undefined,
      description: payload.description ? (payload.description as string).trim() : undefined,
      imageUrl: payload.imageUrl ? (payload.imageUrl as string).trim() : undefined,
    },
  };
}

export function validateUpdateCategory(body: unknown): ValidationResult & { data?: UpdateCategoryRequest } {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== "object") {
    return {
      isValid: false,
      errors: [{ field: "root", message: "Request body must be a JSON object" }],
    };
  }

  const payload = body as Record<string, unknown>;

  if (payload.name !== undefined) {
    if (typeof payload.name !== "string" || payload.name.trim().length === 0) {
      errors.push({ field: "name", message: "Category name cannot be empty" });
    } else if (payload.name.trim().length < 2) {
      errors.push({ field: "name", message: "Category name must be at least 2 characters" });
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const data: UpdateCategoryRequest = {};
  if (payload.name !== undefined) data.name = (payload.name as string).trim();
  if (payload.slug !== undefined) data.slug = (payload.slug as string).trim();
  if (payload.description !== undefined) data.description = (payload.description as string).trim();
  if (payload.imageUrl !== undefined) data.imageUrl = (payload.imageUrl as string).trim();

  return {
    isValid: true,
    errors: [],
    data,
  };
}
