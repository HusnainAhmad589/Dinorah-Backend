export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  createdAt?: string | Date;
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: number;
  categoryName?: string;
  categorySlug?: string;
  imageUrl: string;
  material: string;
  gemstone: string;
  caratWeight?: string;
  stock: number;
  inStock: boolean;
  isFeatured: boolean;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateProductRequest {
  name: string;
  slug?: string;
  description: string;
  price: number;
  categoryId: number;
  imageUrl: string;
  material?: string;
  gemstone?: string;
  caratWeight?: string;
  stock?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface UpdateProductRequest {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  categoryId?: number;
  imageUrl?: string;
  material?: string;
  gemstone?: string;
  caratWeight?: string;
  stock?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface ProductFilterParams {
  category?: string;
  search?: string;
  sort?: "featured" | "price_asc" | "price_desc" | "name_asc";
  featured?: boolean;
  active?: boolean;
}
