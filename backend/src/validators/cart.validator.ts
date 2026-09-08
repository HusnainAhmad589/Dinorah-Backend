import { AddToCartRequest, UpdateCartItemRequest } from "../types/cart.types";
import { ValidationError } from "../types/auth.types";

export interface ValidationResult<T> {
  isValid: boolean;
  errors: ValidationError[];
  data?: T;
}

export function validateAddToCart(body: any): ValidationResult<AddToCartRequest> {
  const errors: ValidationError[] = [];

  const productId = Number(body?.productId);
  if (!productId || isNaN(productId) || productId <= 0 || !Number.isInteger(productId)) {
    errors.push({ field: "productId", message: "Valid positive integer product ID is required" });
  }

  const quantity = Number(body?.quantity !== undefined ? body.quantity : 1);
  if (isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
    errors.push({ field: "quantity", message: "Quantity must be a positive whole integer greater than 0" });
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    data: {
      productId,
      quantity,
    },
  };
}

export function validateUpdateCartItem(body: any): ValidationResult<UpdateCartItemRequest> {
  const errors: ValidationError[] = [];

  const quantity = Number(body?.quantity);
  if (quantity === undefined || isNaN(quantity) || quantity < 0 || !Number.isInteger(quantity)) {
    errors.push({ field: "quantity", message: "Quantity must be a non-negative whole integer (0 or greater)" });
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    data: {
      quantity,
    },
  };
}
