import { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../config/database";
import {
  Product,
  ProductDbRow,
  Category,
  ProductFilterQuery,
  CreateProductRequest,
  UpdateProductRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../types/product.types";

interface ProductRowPacket extends RowDataPacket, ProductDbRow {}
interface CategoryRowPacket extends RowDataPacket, Category {}

function toProduct(row: ProductDbRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    categoryId: row.category_id,
    categoryName: row.category_name,
    categorySlug: row.category_slug,
    imageUrl: row.image_url,
    material: row.material,
    gemstone: row.gemstone,
    caratWeight: row.carat_weight,
    stock: Number(row.stock || 0),
    inStock: Boolean(row.in_stock && Number(row.stock || 0) > 0),
    isFeatured: Boolean(row.is_featured),
    isActive: Boolean(row.is_active !== undefined ? row.is_active : 1),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function findAllProducts(filter: ProductFilterQuery = {}): Promise<Product[]> {
  let query = `
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filter.activeOnly !== false) {
    query += " AND (p.is_active = 1 OR p.is_active IS NULL)";
  }

  if (filter.category && filter.category !== "all") {
    query += " AND (c.slug = ? OR c.name = ?)";
    params.push(filter.category, filter.category);
  }

  if (filter.search) {
    query += " AND (p.name LIKE ? OR p.description LIKE ? OR p.material LIKE ? OR p.gemstone LIKE ?)";
    const term = `%${filter.search}%`;
    params.push(term, term, term, term);
  }

  if (filter.featuredOnly) {
    query += " AND p.is_featured = 1";
  }

  if (filter.minPrice !== undefined && !isNaN(filter.minPrice)) {
    query += " AND p.price >= ?";
    params.push(filter.minPrice);
  }

  if (filter.maxPrice !== undefined && !isNaN(filter.maxPrice)) {
    query += " AND p.price <= ?";
    params.push(filter.maxPrice);
  }

  if (filter.sort === "price_asc") {
    query += " ORDER BY p.price ASC";
  } else if (filter.sort === "price_desc") {
    query += " ORDER BY p.price DESC";
  } else if (filter.sort === "name_asc") {
    query += " ORDER BY p.name ASC";
  } else {
    query += " ORDER BY p.is_featured DESC, p.id ASC";
  }

  if (filter.limit && filter.limit > 0) {
    const page = filter.page && filter.page > 0 ? filter.page : 1;
    const offset = (page - 1) * filter.limit;
    query += " LIMIT ? OFFSET ?";
    params.push(Number(filter.limit), Number(offset));
  }

  const [rows] = await pool.query<ProductRowPacket[]>(query, params);
  return rows.map(toProduct);
}

export async function findProductById(id: number): Promise<Product | null> {
  const [rows] = await pool.query<ProductRowPacket[]>(
    `SELECT p.*, c.name as category_name, c.slug as category_slug
     FROM products p
     JOIN categories c ON p.category_id = c.id
     WHERE p.id = ? LIMIT 1`,
    [id]
  );
  if (rows.length === 0) return null;
  return toProduct(rows[0]);
}

export async function findProductBySlug(slug: string): Promise<Product | null> {
  const [rows] = await pool.query<ProductRowPacket[]>(
    `SELECT p.*, c.name as category_name, c.slug as category_slug
     FROM products p
     JOIN categories c ON p.category_id = c.id
     WHERE p.slug = ? LIMIT 1`,
    [slug]
  );
  if (rows.length === 0) return null;
  return toProduct(rows[0]);
}

export async function createProduct(data: CreateProductRequest): Promise<Product> {
  let slug = data.slug ? generateSlug(data.slug) : generateSlug(data.name);
  
  // Ensure unique slug
  let uniqueSlug = slug;
  let counter = 1;
  while (true) {
    const existing = await findProductBySlug(uniqueSlug);
    if (!existing) break;
    uniqueSlug = `${slug}-${counter++}`;
  }

  const stock = data.stock !== undefined ? data.stock : 10;
  const inStock = data.inStock !== undefined ? (data.inStock ? 1 : 0) : stock > 0 ? 1 : 0;
  const isFeatured = data.isFeatured ? 1 : 0;
  const isActive = data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1;
  const material = data.material || "18K Yellow Gold";
  const gemstone = data.gemstone || "Natural Diamond";
  const caratWeight = data.caratWeight || "1.00 ct";

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO products 
      (name, slug, description, price, category_id, image_url, material, gemstone, carat_weight, stock, in_stock, is_featured, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      uniqueSlug,
      data.description,
      data.price,
      data.categoryId,
      data.imageUrl,
      material,
      gemstone,
      caratWeight,
      stock,
      inStock,
      isFeatured,
      isActive,
    ]
  );

  const created = await findProductById(result.insertId);
  if (!created) throw new Error("Failed to retrieve created product");
  return created;
}

export async function updateProduct(id: number, data: UpdateProductRequest): Promise<Product | null> {
  const existing = await findProductById(id);
  if (!existing) return null;

  const updates: string[] = [];
  const params: any[] = [];

  if (data.name !== undefined) {
    updates.push("name = ?");
    params.push(data.name);
  }
  if (data.slug !== undefined) {
    updates.push("slug = ?");
    params.push(generateSlug(data.slug));
  }
  if (data.description !== undefined) {
    updates.push("description = ?");
    params.push(data.description);
  }
  if (data.price !== undefined) {
    updates.push("price = ?");
    params.push(data.price);
  }
  if (data.categoryId !== undefined) {
    updates.push("category_id = ?");
    params.push(data.categoryId);
  }
  if (data.imageUrl !== undefined) {
    updates.push("image_url = ?");
    params.push(data.imageUrl);
  }
  if (data.material !== undefined) {
    updates.push("material = ?");
    params.push(data.material);
  }
  if (data.gemstone !== undefined) {
    updates.push("gemstone = ?");
    params.push(data.gemstone);
  }
  if (data.caratWeight !== undefined) {
    updates.push("carat_weight = ?");
    params.push(data.caratWeight);
  }
  if (data.stock !== undefined) {
    updates.push("stock = ?");
    params.push(data.stock);
    updates.push("in_stock = ?");
    params.push(data.stock > 0 ? 1 : 0);
  }
  if (data.inStock !== undefined) {
    updates.push("in_stock = ?");
    params.push(data.inStock ? 1 : 0);
  }
  if (data.isFeatured !== undefined) {
    updates.push("is_featured = ?");
    params.push(data.isFeatured ? 1 : 0);
  }
  if (data.isActive !== undefined) {
    updates.push("is_active = ?");
    params.push(data.isActive ? 1 : 0);
  }

  if (updates.length > 0) {
    params.push(id);
    await pool.query(`UPDATE products SET ${updates.join(", ")} WHERE id = ?`, params);
  }

  return await findProductById(id);
}

export async function deleteProduct(id: number): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>("DELETE FROM products WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

// ----------------------------------------------------
// Categories Queries & Mutations
// ----------------------------------------------------

export async function findAllCategories(): Promise<Category[]> {
  const [rows] = await pool.query<CategoryRowPacket[]>(
    "SELECT * FROM categories ORDER BY id ASC"
  );
  return rows;
}

export async function findCategoryById(id: number): Promise<Category | null> {
  const [rows] = await pool.query<CategoryRowPacket[]>(
    "SELECT * FROM categories WHERE id = ? LIMIT 1",
    [id]
  );
  if (rows.length === 0) return null;
  return rows[0];
}

export async function findCategoryBySlug(slug: string): Promise<Category | null> {
  const [rows] = await pool.query<CategoryRowPacket[]>(
    "SELECT * FROM categories WHERE slug = ? LIMIT 1",
    [slug]
  );
  if (rows.length === 0) return null;
  return rows[0];
}

export async function createCategory(data: CreateCategoryRequest): Promise<Category> {
  const slug = data.slug ? generateSlug(data.slug) : generateSlug(data.name);
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)`,
    [data.name, slug, data.description || null, data.imageUrl || "/images/hero-bg.jpg"]
  );
  const created = await findCategoryById(result.insertId);
  if (!created) throw new Error("Failed to retrieve created category");
  return created;
}

export async function updateCategory(id: number, data: UpdateCategoryRequest): Promise<Category | null> {
  const existing = await findCategoryById(id);
  if (!existing) return null;

  const updates: string[] = [];
  const params: any[] = [];

  if (data.name !== undefined) {
    updates.push("name = ?");
    params.push(data.name);
  }
  if (data.slug !== undefined) {
    updates.push("slug = ?");
    params.push(generateSlug(data.slug));
  }
  if (data.description !== undefined) {
    updates.push("description = ?");
    params.push(data.description);
  }
  if (data.imageUrl !== undefined) {
    updates.push("image_url = ?");
    params.push(data.imageUrl);
  }

  if (updates.length > 0) {
    params.push(id);
    await pool.query(`UPDATE categories SET ${updates.join(", ")} WHERE id = ?`, params);
  }

  return await findCategoryById(id);
}

export async function deleteCategory(id: number): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>("DELETE FROM categories WHERE id = ?", [id]);
  return result.affectedRows > 0;
}
