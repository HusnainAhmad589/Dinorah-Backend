import { apiFetch } from "./api";
import {
  Product,
  Category,
  ProductFilterParams,
  CreateProductRequest,
  UpdateProductRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../types/product.types";

interface ProductsResponse {
  success: boolean;
  count: number;
  products: Product[];
}

interface ProductResponse {
  success: boolean;
  product: Product;
}

interface CategoriesResponse {
  success: boolean;
  count: number;
  categories: Category[];
}

interface CategoryResponse {
  success: boolean;
  category: Category;
}

interface DeleteResponse {
  success: boolean;
  message: string;
}

// ----------------------------------------------------
// Public Product & Category Methods
// ----------------------------------------------------

export async function fetchProducts(params: ProductFilterParams = {}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params.category && params.category !== "all") query.append("category", params.category);
  if (params.search) query.append("search", params.search);
  if (params.sort) query.append("sort", params.sort);
  if (params.featured !== undefined) query.append("featured", String(params.featured));
  if (params.active !== undefined) query.append("active", String(params.active));

  const queryString = query.toString();
  const endpoint = queryString ? `/products?${queryString}` : "/products";
  const res = await apiFetch<ProductsResponse>(endpoint);
  return res.products;
}

export async function fetchProductById(id: number): Promise<Product> {
  const res = await apiFetch<ProductResponse>(`/products/${id}`);
  return res.product;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await apiFetch<CategoriesResponse>("/categories");
  return res.categories;
}

export async function fetchCategoryById(id: number): Promise<Category> {
  const res = await apiFetch<CategoryResponse>(`/categories/${id}`);
  return res.category;
}

// ----------------------------------------------------
// Admin Product Mutation Methods
// ----------------------------------------------------

export async function createProduct(data: CreateProductRequest): Promise<Product> {
  const res = await apiFetch<ProductResponse>("/products", {
    method: "POST",
    data,
  });
  return res.product;
}

export async function updateProduct(id: number, data: UpdateProductRequest): Promise<Product> {
  const res = await apiFetch<ProductResponse>(`/products/${id}`, {
    method: "PUT",
    data,
  });
  return res.product;
}

export async function deleteProduct(id: number): Promise<void> {
  await apiFetch<DeleteResponse>(`/products/${id}`, {
    method: "DELETE",
  });
}

// ----------------------------------------------------
// Admin Category Mutation Methods
// ----------------------------------------------------

export async function createCategory(data: CreateCategoryRequest): Promise<Category> {
  const res = await apiFetch<CategoryResponse>("/categories", {
    method: "POST",
    data,
  });
  return res.category;
}

export async function updateCategory(id: number, data: UpdateCategoryRequest): Promise<Category> {
  const res = await apiFetch<CategoryResponse>(`/categories/${id}`, {
    method: "PUT",
    data,
  });
  return res.category;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiFetch<DeleteResponse>(`/categories/${id}`, {
    method: "DELETE",
  });
}
