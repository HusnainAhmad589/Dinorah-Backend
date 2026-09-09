import { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../config/database";
import { Order, OrderItem, OrderStatus, CreateOrderInput } from "../types/order.types";
import { AppError } from "../middleware/error.middleware";

/**
 * Place a new Order using Cash on Delivery (COD).
 * Atomic transaction ensuring:
 * 1. Cart non-emptiness verification.
 * 2. Real-time product pricing & stock locks (`FOR UPDATE`).
 * 3. Total calculation strictly on the backend.
 * 4. Insertion of order & order items.
 * 5. Stock decrement.
 * 6. Cart clearing.
 */
export async function createOrderService(userId: number, input: CreateOrderInput): Promise<Order> {
  // 1. Fetch user's active cart
  const [cartRows] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM cart WHERE user_id = ?",
    [userId]
  );

  if (cartRows.length === 0) {
    throw new AppError("Cannot checkout with an empty cart. Please add items to your cart first.", 400);
  }

  const cartId = cartRows[0].id;

  // 2. Fetch all cart items
  const [cartItems] = await pool.query<RowDataPacket[]>(
    `SELECT ci.product_id, ci.quantity, p.name as product_name, p.price, p.stock, p.is_active
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.cart_id = ?`,
    [cartId]
  );

  if (cartItems.length === 0) {
    throw new AppError("Cannot checkout with an empty cart. Please add items to your cart first.", 400);
  }

  // 3. Acquire dedicated connection for transaction
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    let calculatedTotal = 0;
    const validatedItems: Array<{
      productId: number;
      productName: string;
      quantity: number;
      unitPrice: number;
    }> = [];

    // Verify stock and lock rows
    for (const item of cartItems) {
      const [prodRows] = await connection.query<RowDataPacket[]>(
        "SELECT id, name, price, stock, is_active FROM products WHERE id = ? FOR UPDATE",
        [item.product_id]
      );

      if (prodRows.length === 0 || !prodRows[0].is_active) {
        throw new AppError(`Jewellery piece "${item.product_name}" is no longer available in the atelier collection.`, 400);
      }

      const currentProduct = prodRows[0];
      const unitPrice = Number(currentProduct.price);
      const stock = Number(currentProduct.stock);

      if (stock < item.quantity) {
        throw new AppError(
          `Insufficient inventory for "${currentProduct.name}". Only ${stock} piece(s) available, but ${item.quantity} requested.`,
          400
        );
      }

      const lineTotal = unitPrice * item.quantity;
      calculatedTotal += lineTotal;

      validatedItems.push({
        productId: currentProduct.id,
        productName: currentProduct.name,
        quantity: item.quantity,
        unitPrice,
      });
    }

    // 4. Insert into `orders` table
    const [orderResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO orders 
       (user_id, status, total_amount, customer_name, customer_email, customer_phone, shipping_address, city, postal_code, payment_method)
       VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        calculatedTotal,
        input.name,
        input.email,
        input.phone,
        input.address,
        input.city,
        input.postalCode,
        input.paymentMethod || "cod",
      ]
    );

    const orderId = orderResult.insertId;

    // 5. Insert order items & decrement stock
    for (const item of validatedItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.productId, item.quantity, item.unitPrice]
      );

      // Decrement stock & update in_stock flag
      await connection.query(
        `UPDATE products 
         SET stock = stock - ?,
             in_stock = CASE WHEN stock - ? <= 0 THEN 0 ELSE 1 END
         WHERE id = ?`,
        [item.quantity, item.quantity, item.productId]
      );
    }

    // 6. Clear customer's cart
    await connection.query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);

    // 7. Commit transaction
    await connection.commit();

    // 8. Return newly created order
    return await getOrderByIdService(orderId, userId, "customer");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Fetch all orders placed by an authenticated customer.
 */
export async function getUserOrdersService(userId: number): Promise<Order[]> {
  const [orderRows] = await pool.query<RowDataPacket[]>(
    `SELECT id, user_id, status, total_amount, customer_name, customer_email, customer_phone,
            shipping_address, city, postal_code, payment_method, created_at, updated_at
     FROM orders
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );

  if (orderRows.length === 0) {
    return [];
  }

  const orderIds = orderRows.map((r) => r.id);
  const [itemRows] = await pool.query<RowDataPacket[]>(
    `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.unit_price, oi.created_at,
            p.name as product_name, p.slug as product_slug, p.image_url as product_image
     FROM order_items oi
     LEFT JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id IN (?)`,
    [orderIds]
  );

  const itemsByOrder: Record<number, OrderItem[]> = {};
  for (const item of itemRows) {
    if (!itemsByOrder[item.order_id]) {
      itemsByOrder[item.order_id] = [];
    }
    itemsByOrder[item.order_id].push({
      id: item.id,
      orderId: item.order_id,
      productId: item.product_id,
      productName: item.product_name || "Bespoke Jewellery Piece",
      productSlug: item.product_slug,
      productImage: item.product_image,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      subtotal: Number(item.quantity) * Number(item.unit_price),
      createdAt: item.created_at,
    });
  }

  return orderRows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    status: row.status,
    totalAmount: Number(row.total_amount),
    customerName: row.customer_name || "",
    customerEmail: row.customer_email || "",
    customerPhone: row.customer_phone || "",
    shippingAddress: row.shipping_address || "",
    city: row.city || "",
    postalCode: row.postal_code || "",
    paymentMethod: row.payment_method || "cod",
    items: itemsByOrder[row.id] || [],
    itemCount: (itemsByOrder[row.id] || []).reduce((acc, curr) => acc + curr.quantity, 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Fetch a single order by ID with strict customer isolation authorization.
 */
export async function getOrderByIdService(orderId: number, userId: number, userRole: string): Promise<Order> {
  const [orderRows] = await pool.query<RowDataPacket[]>(
    `SELECT id, user_id, status, total_amount, customer_name, customer_email, customer_phone,
            shipping_address, city, postal_code, payment_method, created_at, updated_at
     FROM orders
     WHERE id = ?`,
    [orderId]
  );

  if (orderRows.length === 0) {
    throw new AppError("Order not found", 404);
  }

  const orderRow = orderRows[0];

  // Authorization check: only owner or admin can view
  if (userRole !== "admin" && orderRow.user_id !== userId) {
    throw new AppError("Access denied. You can only view your own orders.", 403);
  }

  const [itemRows] = await pool.query<RowDataPacket[]>(
    `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.unit_price, oi.created_at,
            p.name as product_name, p.slug as product_slug, p.image_url as product_image
     FROM order_items oi
     LEFT JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ?`,
    [orderId]
  );

  const items: OrderItem[] = itemRows.map((item) => ({
    id: item.id,
    orderId: item.order_id,
    productId: item.product_id,
    productName: item.product_name || "Bespoke Jewellery Piece",
    productSlug: item.product_slug,
    productImage: item.product_image,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unit_price),
    subtotal: Number(item.quantity) * Number(item.unit_price),
    createdAt: item.created_at,
  }));

  return {
    id: orderRow.id,
    userId: orderRow.user_id,
    status: orderRow.status,
    totalAmount: Number(orderRow.total_amount),
    customerName: orderRow.customer_name || "",
    customerEmail: orderRow.customer_email || "",
    customerPhone: orderRow.customer_phone || "",
    shippingAddress: orderRow.shipping_address || "",
    city: orderRow.city || "",
    postalCode: orderRow.postal_code || "",
    paymentMethod: orderRow.payment_method || "cod",
    items,
    itemCount: items.reduce((acc, curr) => acc + curr.quantity, 0),
    createdAt: orderRow.created_at,
    updatedAt: orderRow.updated_at,
  };
}

/**
 * Fetch all orders for Admin with optional status filtering.
 */
export async function getAllOrdersAdminService(statusFilter?: string): Promise<Order[]> {
  let query = `
    SELECT o.id, o.user_id, o.status, o.total_amount, o.customer_name, o.customer_email, o.customer_phone,
           o.shipping_address, o.city, o.postal_code, o.payment_method, o.created_at, o.updated_at,
           u.name as registered_user_name, u.email as registered_user_email
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
  `;
  const params: any[] = [];

  if (statusFilter && statusFilter !== "all") {
    query += " WHERE o.status = ?";
    params.push(statusFilter);
  }

  query += " ORDER BY o.created_at DESC";

  const [orderRows] = await pool.query<RowDataPacket[]>(query, params);

  if (orderRows.length === 0) {
    return [];
  }

  const orderIds = orderRows.map((r) => r.id);
  const [itemRows] = await pool.query<RowDataPacket[]>(
    `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.unit_price, oi.created_at,
            p.name as product_name, p.slug as product_slug, p.image_url as product_image
     FROM order_items oi
     LEFT JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id IN (?)`,
    [orderIds]
  );

  const itemsByOrder: Record<number, OrderItem[]> = {};
  for (const item of itemRows) {
    if (!itemsByOrder[item.order_id]) {
      itemsByOrder[item.order_id] = [];
    }
    itemsByOrder[item.order_id].push({
      id: item.id,
      orderId: item.order_id,
      productId: item.product_id,
      productName: item.product_name || "Bespoke Jewellery Piece",
      productSlug: item.product_slug,
      productImage: item.product_image,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      subtotal: Number(item.quantity) * Number(item.unit_price),
      createdAt: item.created_at,
    });
  }

  return orderRows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    status: row.status,
    totalAmount: Number(row.total_amount),
    customerName: row.customer_name || row.registered_user_name || "Customer",
    customerEmail: row.customer_email || row.registered_user_email || "",
    customerPhone: row.customer_phone || "",
    shippingAddress: row.shipping_address || "",
    city: row.city || "",
    postalCode: row.postal_code || "",
    paymentMethod: row.payment_method || "cod",
    items: itemsByOrder[row.id] || [],
    itemCount: (itemsByOrder[row.id] || []).reduce((acc, curr) => acc + curr.quantity, 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Admin updates order status (pending -> confirmed -> shipped -> delivered / cancelled).
 * If transitioning to cancelled, restores stock to product inventory.
 */
export async function updateOrderStatusService(orderId: number, newStatus: OrderStatus): Promise<Order> {
  const [orderRows] = await pool.query<RowDataPacket[]>(
    "SELECT id, status FROM orders WHERE id = ?",
    [orderId]
  );

  if (orderRows.length === 0) {
    throw new AppError("Order not found", 404);
  }

  const previousStatus = orderRows[0].status;

  if (previousStatus === newStatus) {
    return await getOrderByIdService(orderId, 0, "admin");
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // If order is newly cancelled, restore product stock
    if (newStatus === "cancelled" && previousStatus !== "cancelled") {
      const [items] = await connection.query<RowDataPacket[]>(
        "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
        [orderId]
      );

      for (const item of items) {
        if (item.product_id) {
          await connection.query(
            "UPDATE products SET stock = stock + ?, in_stock = 1 WHERE id = ?",
            [item.quantity, item.product_id]
          );
        }
      }
    }

    // Update status in orders table
    await connection.query(
      "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [newStatus, orderId]
    );

    await connection.commit();
    return await getOrderByIdService(orderId, 0, "admin");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
