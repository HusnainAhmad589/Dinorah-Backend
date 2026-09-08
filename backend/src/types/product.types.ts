export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  createdAt?: Date;
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
  createdAt?: Date;
  updatedAt?: Date;
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

export interface ProductDbRow {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  image_url: string;
  material: string;
  gemstone: string;
  carat_weight?: string;
  stock: number;
  in_stock: number | boolean;
  is_featured: number | boolean;
  is_active: number | boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProductFilterQuery {
  category?: string;
  search?: string;
  sort?: "featured" | "price_asc" | "price_desc" | "name_asc";
  featuredOnly?: boolean;
  activeOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}
