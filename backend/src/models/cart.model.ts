import { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../config/database";
import { Cart, CartItem } from "../types/cart.types";

interface CartRow extends RowDataPacket {
  id: number;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

interface CartItemDbRow extends RowDataPacket {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  created_at: Date;
  updated_at: Date;
  // Joined product fields
  name: string;
  slug: string;
  price: string | number;
  image_url: string;
  stock: number;
  material: string;
  gemstone: string;
  is_active: number;
}

export async function findOrCreateCart(userId: number): Promise<number> {
  // Check if cart exists
  const [existing] = await pool.query<CartRow[]>(
    "SELECT id FROM cart WHERE user_id = ? LIMIT 1",
    [userId]
  );
  if (existing.length > 0) {
    return existing[0].id;
  }

  // Create new cart
  const [insertResult] = await pool.query<ResultSetHeader>(
    "INSERT INTO cart (user_id) VALUES (?)",
    [userId]
  );
  return insertResult.insertId;
}

export async function getCartWithItems(userId: number): Promise<Cart> {
  const cartId = await findOrCreateCart(userId);

  // Retrieve cart metadata
  const [cartRows] = await pool.query<CartRow[]>(
    "SELECT * FROM cart WHERE id = ? LIMIT 1",
    [cartId]
  );

  const cartRow = cartRows[0];

  // Retrieve joined items with DB-verified prices and stock
  const [itemRows] = await pool.query<CartItemDbRow[]>(
    `SELECT 
      ci.id, ci.cart_id, ci.product_id, ci.quantity, ci.created_at, ci.updated_at,
      p.name, p.slug, p.price, p.image_url, p.stock, p.material, p.gemstone, p.is_active
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.cart_id = ?
     ORDER BY ci.created_at DESC`,
    [cartId]
  );

  let totalQuantity = 0;
  let subtotal = 0;

  const items: CartItem[] = itemRows.map((row) => {
    const unitPrice = Number(row.price);
    const qty = Number(row.quantity);
    const itemTotal = Number((unitPrice * qty).toFixed(2));

    totalQuantity += qty;
    subtotal += itemTotal;

    return {
      id: row.id,
      cartId: row.cart_id,
      productId: row.product_id,
      name: row.name,
      slug: row.slug,
      image: row.image_url,
      price: unitPrice,
      quantity: qty,
      stock: Number(row.stock || 0),
      material: row.material,
      gemstone: row.gemstone,
      itemTotal,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });

  return {
    id: cartId,
    userId,
    items,
    totalQuantity,
    subtotal: Number(subtotal.toFixed(2)),
    createdAt: cartRow?.created_at,
    updatedAt: cartRow?.updated_at,
  };
}

export async function findCartItemByProduct(cartId: number, productId: number): Promise<CartItemDbRow | null> {
  const [rows] = await pool.query<CartItemDbRow[]>(
    `SELECT ci.*, p.stock, p.price, p.is_active 
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.cart_id = ? AND ci.product_id = ? LIMIT 1`,
    [cartId, productId]
  );
  if (rows.length === 0) return null;
  return rows[0];
}

export async function findCartItemById(itemId: number, cartId: number): Promise<CartItemDbRow | null> {
  const [rows] = await pool.query<CartItemDbRow[]>(
    `SELECT ci.*, p.stock, p.price, p.is_active 
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.id = ? AND ci.cart_id = ? LIMIT 1`,
    [itemId, cartId]
  );
  if (rows.length === 0) return null;
  return rows[0];
}

export async function upsertCartItem(cartId: number, productId: number, quantityToAdd: number): Promise<void> {
  const existing = await findCartItemByProduct(cartId, productId);

  if (existing) {
    const newQty = existing.quantity + quantityToAdd;
    await pool.query(
      "UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [newQty, existing.id]
    );
  } else {
    await pool.query(
      "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
      [cartId, productId, quantityToAdd]
    );
  }
}

export async function updateCartItemQuantity(itemId: number, cartId: number, quantity: number): Promise<void> {
  if (quantity <= 0) {
    await deleteCartItem(itemId, cartId);
  } else {
    await pool.query(
      "UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND cart_id = ?",
      [quantity, itemId, cartId]
    );
  }
}

export async function deleteCartItem(itemId: number, cartId: number): Promise<void> {
  await pool.query(
    "DELETE FROM cart_items WHERE id = ? AND cart_id = ?",
    [itemId, cartId]
  );
}

export async function clearAllCartItems(cartId: number): Promise<void> {
  await pool.query(
    "DELETE FROM cart_items WHERE cart_id = ?",
    [cartId]
  );
}
