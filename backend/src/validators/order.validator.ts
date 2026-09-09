import { CreateOrderInput, UpdateOrderStatusInput, OrderStatus } from "../types/order.types";
import { ValidationError } from "../types/auth.types";

export interface ValidationResult<T> {
  isValid: boolean;
  errors: ValidationError[];
  data?: T;
}

const VALID_STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export function validateCreateOrder(body: any): ValidationResult<CreateOrderInput> {
  const errors: ValidationError[] = [];

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name || name.length < 2) {
    errors.push({ field: "name", message: "Recipient name must be at least 2 characters" });
  }

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push({ field: "email", message: "Valid contact email address is required" });
  }

  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  if (!phone || phone.length < 6) {
    errors.push({ field: "phone", message: "Valid contact phone number is required (minimum 6 digits)" });
  }

  const address = typeof body?.address === "string" ? body.address.trim() : "";
  if (!address || address.length < 5) {
    errors.push({ field: "address", message: "Detailed delivery address must be at least 5 characters" });
  }

  const city = typeof body?.city === "string" ? body.city.trim() : "";
  if (!city || city.length < 2) {
    errors.push({ field: "city", message: "Delivery city is required" });
  }

  const postalCode = typeof body?.postalCode === "string" ? body.postalCode.trim() : "";
  if (!postalCode || postalCode.length < 2) {
    errors.push({ field: "postalCode", message: "Postal/ZIP code is required" });
  }

  let paymentMethod = typeof body?.paymentMethod === "string" ? body.paymentMethod.trim().toLowerCase() : "cod";
  if (paymentMethod !== "cod") {
    // We strictly support Cash on Delivery per intern requirements
    errors.push({ field: "paymentMethod", message: "Currently only 'cod' (Cash on Delivery) is supported" });
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    data: {
      name,
      email,
      phone,
      address,
      city,
      postalCode,
      paymentMethod,
    },
  };
}

export function validateUpdateOrderStatus(body: any): ValidationResult<UpdateOrderStatusInput> {
  const errors: ValidationError[] = [];

  const status = typeof body?.status === "string" ? body.status.trim().toLowerCase() as OrderStatus : undefined;

  if (!status || !VALID_STATUSES.includes(status)) {
    errors.push({
      field: "status",
      message: `Invalid order status. Allowed values: ${VALID_STATUSES.join(", ")}`,
    });
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    data: {
      status: status!,
    },
  };
}
