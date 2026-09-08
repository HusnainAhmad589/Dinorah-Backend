import { ValidationError, ValidationResult } from "../types/auth.types";
import { CreateProductRequest, UpdateProductRequest } from "../types/product.types";

export function validateCreateProduct(body: unknown): ValidationResult & { data?: CreateProductRequest } {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== "object") {
    return {
      isValid: false,
      errors: [{ field: "root", message: "Request body must be a JSON object" }],
    };
  }

  const payload = body as Record<string, unknown>;

  // Name
  if (!payload.name || typeof payload.name !== "string" || payload.name.trim().length === 0) {
    errors.push({ field: "name", message: "Product name is required" });
  } else if (payload.name.trim().length < 2) {
    errors.push({ field: "name", message: "Product name must be at least 2 characters" });
  }

  // Description
  if (!payload.description || typeof payload.description !== "string" || payload.description.trim().length === 0) {
    errors.push({ field: "description", message: "Product description is required" });
  }

  // Price
  if (payload.price === undefined || payload.price === null || isNaN(Number(payload.price))) {
    errors.push({ field: "price", message: "Valid product price is required" });
  } else if (Number(payload.price) <= 0) {
    errors.push({ field: "price", message: "Product price must be greater than 0" });
  }

  // Category ID
  if (!payload.categoryId || isNaN(Number(payload.categoryId))) {
    errors.push({ field: "categoryId", message: "Valid category ID is required" });
  }

  // Image URL
  if (!payload.imageUrl || typeof payload.imageUrl !== "string" || payload.imageUrl.trim().length === 0) {
    errors.push({ field: "imageUrl", message: "Product image URL is required" });
  }

  // Stock (optional, default 10)
  if (payload.stock !== undefined && (isNaN(Number(payload.stock)) || Number(payload.stock) < 0)) {
    errors.push({ field: "stock", message: "Stock must be a non-negative number" });
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
      description: (payload.description as string).trim(),
      price: Number(payload.price),
      categoryId: Number(payload.categoryId),
      imageUrl: (payload.imageUrl as string).trim(),
      material: payload.material ? (payload.material as string).trim() : "18K Yellow Gold",
      gemstone: payload.gemstone ? (payload.gemstone as string).trim() : "Natural Diamond",
      caratWeight: payload.caratWeight ? (payload.caratWeight as string).trim() : "1.00 ct",
      stock: payload.stock !== undefined ? Number(payload.stock) : 10,
      inStock: payload.inStock !== undefined ? Boolean(payload.inStock) : true,
      isFeatured: payload.isFeatured !== undefined ? Boolean(payload.isFeatured) : false,
      isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
    },
  };
}

export function validateUpdateProduct(body: unknown): ValidationResult & { data?: UpdateProductRequest } {
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
      errors.push({ field: "name", message: "Product name cannot be empty" });
    } else if (payload.name.trim().length < 2) {
      errors.push({ field: "name", message: "Product name must be at least 2 characters" });
    }
  }

  if (payload.price !== undefined) {
    if (isNaN(Number(payload.price)) || Number(payload.price) <= 0) {
      errors.push({ field: "price", message: "Product price must be a number greater than 0" });
    }
  }

  if (payload.stock !== undefined) {
    if (isNaN(Number(payload.stock)) || Number(payload.stock) < 0) {
      errors.push({ field: "stock", message: "Stock must be a non-negative number" });
    }
  }

  if (payload.categoryId !== undefined) {
    if (isNaN(Number(payload.categoryId))) {
      errors.push({ field: "categoryId", message: "Valid category ID is required" });
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const data: UpdateProductRequest = {};
  if (payload.name !== undefined) data.name = (payload.name as string).trim();
  if (payload.slug !== undefined) data.slug = (payload.slug as string).trim();
  if (payload.description !== undefined) data.description = (payload.description as string).trim();
  if (payload.price !== undefined) data.price = Number(payload.price);
  if (payload.categoryId !== undefined) data.categoryId = Number(payload.categoryId);
  if (payload.imageUrl !== undefined) data.imageUrl = (payload.imageUrl as string).trim();
  if (payload.material !== undefined) data.material = (payload.material as string).trim();
  if (payload.gemstone !== undefined) data.gemstone = (payload.gemstone as string).trim();
  if (payload.caratWeight !== undefined) data.caratWeight = (payload.caratWeight as string).trim();
  if (payload.stock !== undefined) data.stock = Number(payload.stock);
  if (payload.inStock !== undefined) data.inStock = Boolean(payload.inStock);
  if (payload.isFeatured !== undefined) data.isFeatured = Boolean(payload.isFeatured);
  if (payload.isActive !== undefined) data.isActive = Boolean(payload.isActive);

  return {
    isValid: true,
    errors: [],
    data,
  };
}
