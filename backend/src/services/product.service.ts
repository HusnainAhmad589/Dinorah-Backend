import {
  findAllProducts,
  findProductById,
  findProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  findAllCategories,
  findCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../models/product.model";
import {
  Product,
  Category,
  ProductFilterQuery,
  CreateProductRequest,
  UpdateProductRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../types/product.types";
import { AppError } from "../middleware/error.middleware";

export async function getProductsService(filter: ProductFilterQuery = {}): Promise<Product[]> {
  return await findAllProducts(filter);
}

export async function getProductByIdService(id: number): Promise<Product> {
  if (isNaN(id)) {
    throw new AppError("Invalid product ID", 400);
  }
  const product = await findProductById(id);
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  return product;
}

export async function getProductBySlugService(slug: string): Promise<Product> {
  const product = await findProductBySlug(slug);
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  return product;
}

export async function createProductService(data: CreateProductRequest): Promise<Product> {
  const category = await findCategoryById(data.categoryId);
  if (!category) {
    throw new AppError("Invalid category ID: Category does not exist", 400);
  }
  return await createProduct(data);
}

export async function updateProductService(id: number, data: UpdateProductRequest): Promise<Product> {
  if (isNaN(id)) {
    throw new AppError("Invalid product ID", 400);
  }
  const existing = await findProductById(id);
  if (!existing) {
    throw new AppError("Product not found", 404);
  }
  if (data.categoryId !== undefined) {
    const category = await findCategoryById(data.categoryId);
    if (!category) {
      throw new AppError("Invalid category ID: Category does not exist", 400);
    }
  }
  const updated = await updateProduct(id, data);
  if (!updated) {
    throw new AppError("Failed to update product", 500);
  }
  return updated;
}

export async function deleteProductService(id: number): Promise<void> {
  if (isNaN(id)) {
    throw new AppError("Invalid product ID", 400);
  }
  const existing = await findProductById(id);
  if (!existing) {
    throw new AppError("Product not found", 404);
  }
  const deleted = await deleteProduct(id);
  if (!deleted) {
    throw new AppError("Failed to delete product", 500);
  }
}

// ----------------------------------------------------
// Categories Service
// ----------------------------------------------------

export async function getCategoriesService(): Promise<Category[]> {
  return await findAllCategories();
}

export async function getCategoryByIdService(id: number): Promise<Category> {
  if (isNaN(id)) {
    throw new AppError("Invalid category ID", 400);
  }
  const category = await findCategoryById(id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  return category;
}

export async function createCategoryService(data: CreateCategoryRequest): Promise<Category> {
  return await createCategory(data);
}

export async function updateCategoryService(id: number, data: UpdateCategoryRequest): Promise<Category> {
  if (isNaN(id)) {
    throw new AppError("Invalid category ID", 400);
  }
  const existing = await findCategoryById(id);
  if (!existing) {
    throw new AppError("Category not found", 404);
  }
  const updated = await updateCategory(id, data);
  if (!updated) {
    throw new AppError("Failed to update category", 500);
  }
  return updated;
}

export async function deleteCategoryService(id: number): Promise<void> {
  if (isNaN(id)) {
    throw new AppError("Invalid category ID", 400);
  }
  const existing = await findCategoryById(id);
  if (!existing) {
    throw new AppError("Category not found", 404);
  }
  const deleted = await deleteCategory(id);
  if (!deleted) {
    throw new AppError("Failed to delete category", 500);
  }
}
