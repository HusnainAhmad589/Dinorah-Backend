import { RowDataPacket } from "mysql2";
import { pool } from "../config/database";
import {
  OverviewInsights,
  SalesInsight,
  OrderInsights,
  ProductSalesInsight,
} from "../types/insights.types";

export async function getOverviewStats(): Promise<Omit<OverviewInsights, "activeUsers" | "activeProductViewers">> {
  // Total products
  const [prodRows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) as count FROM products WHERE is_active = 1"
  );
  const totalProducts = prodRows[0]?.count || 0;

  // Total orders & revenue (excluding cancelled orders from revenue)
  const [orderRows] = await pool.query<RowDataPacket[]>(`
    SELECT 
      COUNT(*) as totalOrders,
      COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END), 0) as totalRevenue,
      COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pendingOrders,
      COALESCE(SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END), 0) as completedOrders
    FROM orders
  `);

  // Total customers
  const [custRows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) as count FROM users WHERE role = 'customer'"
  );
  const totalCustomers = custRows[0]?.count || 0;

  return {
    totalProducts: Number(totalProducts),
    totalOrders: Number(orderRows[0]?.totalOrders || 0),
    totalCustomers: Number(totalCustomers),
    totalRevenue: Number(orderRows[0]?.totalRevenue || 0),
    pendingOrders: Number(orderRows[0]?.pendingOrders || 0),
    completedOrders: Number(orderRows[0]?.completedOrders || 0),
  };
}

export async function getSalesByPeriod(period: "daily" | "weekly" | "monthly" | "yearly" = "daily"): Promise<SalesInsight[]> {
  let dateFormat = "%Y-%m-%d";
  if (period === "weekly") {
    dateFormat = "%Y-W%v";
  } else if (period === "monthly") {
    dateFormat = "%Y-%m";
  } else if (period === "yearly") {
    dateFormat = "%Y";
  }

  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT 
      DATE_FORMAT(o.created_at, '${dateFormat}') as date_label,
      COUNT(DISTINCT o.id) as orders_count,
      COALESCE(SUM(oi.quantity), 0) as items_sold,
      COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN oi.unit_price * oi.quantity ELSE 0 END), 0) as revenue
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    GROUP BY date_label
    ORDER BY date_label ASC
  `);

  return rows.map((r) => ({
    date: r.date_label,
    ordersCount: Number(r.orders_count),
    itemsSold: Number(r.items_sold),
    revenue: Number(r.revenue),
  }));
}

export async function getOrderStats(): Promise<OrderInsights> {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT 
      COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending,
      COALESCE(SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END), 0) as confirmed,
      COALESCE(SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END), 0) as shipped,
      COALESCE(SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END), 0) as delivered,
      COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancelled
    FROM orders
  `);

  const row = rows[0] || {};
  return {
    pending: Number(row.pending || 0),
    confirmed: Number(row.confirmed || 0),
    shipped: Number(row.shipped || 0),
    delivered: Number(row.delivered || 0),
    cancelled: Number(row.cancelled || 0),
  };
}

export async function getProductSalesInsights(): Promise<ProductSalesInsight[]> {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT 
      p.id as productId,
      p.name as productName,
      c.name as categoryName,
      COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN oi.quantity ELSE 0 END), 0) as quantitySold,
      COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN oi.unit_price * oi.quantity ELSE 0 END), 0) as revenue,
      p.stock as currentStock
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id
    GROUP BY p.id, p.name, c.name, p.stock
    ORDER BY quantitySold DESC, revenue DESC
  `);

  return rows.map((r) => ({
    productId: Number(r.productId),
    productName: r.productName,
    categoryName: r.categoryName,
    quantitySold: Number(r.quantitySold),
    revenue: Number(r.revenue),
    currentStock: Number(r.currentStock),
  }));
}
