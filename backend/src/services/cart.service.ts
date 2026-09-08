import {
  findOrCreateCart,
  getCartWithItems,
  findCartItemByProduct,
  findCartItemById,
  upsertCartItem,
  updateCartItemQuantity,
  deleteCartItem,
  clearAllCartItems,
} from "../models/cart.model";
import { findProductById } from "../models/product.model";
import { Cart } from "../types/cart.types";
import { AppError } from "../middleware/error.middleware";

export async function getCartService(userId: number): Promise<Cart> {
  return await getCartWithItems(userId);
}

export async function addItemToCartService(userId: number, productId: number, quantity: number): Promise<Cart> {
  const cartId = await findOrCreateCart(userId);

  // 1. Fetch Product from DB to verify price, active status, and available stock
  const product = await findProductById(productId);
  if (!product) {
    throw new AppError("Product does not exist in atelier collection", 404);
  }

  if (!product.isActive) {
    throw new AppError("This jewellery piece is currently inactive and unavailable for acquisition", 400);
  }

  if (product.stock <= 0) {
    throw new AppError("This jewellery piece is currently out of stock", 400);
  }

  // 2. Check current quantity in user's cart
  const existingItem = await findCartItemByProduct(cartId, productId);
  const currentInCart = existingItem ? existingItem.quantity : 0;
  const newTotalRequested = currentInCart + quantity;

  if (newTotalRequested > product.stock) {
    throw new AppError(
      `Only ${product.stock} unit(s) available in atelier inventory. You already have ${currentInCart} in your cart.`,
      400
    );
  }

  // 3. Upsert cart item
  await upsertCartItem(cartId, productId, quantity);

  // 4. Return fresh synchronized cart
  return await getCartWithItems(userId);
}

export async function updateCartItemService(userId: number, itemId: number, quantity: number): Promise<Cart> {
  const cartId = await findOrCreateCart(userId);

  // 1. Verify item belongs to this user's cart
  const item = await findCartItemById(itemId, cartId);
  if (!item) {
    throw new AppError("Cart item not found in your cart", 404);
  }

  // 2. If quantity is 0 or less, remove item
  if (quantity <= 0) {
    await deleteCartItem(itemId, cartId);
    return await getCartWithItems(userId);
  }

  // 3. Validate requested quantity against product stock
  if (quantity > item.stock) {
    throw new AppError(
      `Requested quantity of ${quantity} exceeds atelier inventory limit of ${item.stock}`,
      400
    );
  }

  // 4. Update quantity
  await updateCartItemQuantity(itemId, cartId, quantity);

  // 5. Return updated cart
  return await getCartWithItems(userId);
}

export async function removeCartItemService(userId: number, itemId: number): Promise<Cart> {
  const cartId = await findOrCreateCart(userId);

  const item = await findCartItemById(itemId, cartId);
  if (!item) {
    throw new AppError("Cart item not found in your cart", 404);
  }

  await deleteCartItem(itemId, cartId);
  return await getCartWithItems(userId);
}

export async function clearCartService(userId: number): Promise<Cart> {
  const cartId = await findOrCreateCart(userId);
  await clearAllCartItems(cartId);
  return await getCartWithItems(userId);
}
