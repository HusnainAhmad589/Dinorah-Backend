import { RowDataPacket } from "mysql2";
import { pool } from "../config/database";
import { ActivityPayload } from "../types/activity.types";
import { ActiveUsersInsight, ProductViewerSummary } from "../types/insights.types";

export async function upsertUserActivity(payload: ActivityPayload): Promise<void> {
  const userId = payload.userId || null;
  const productId = payload.productId || null;
  const activityType = payload.activityType || "page_view";

  // Check if session already exists in user_activity
  const [existing] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM user_activity WHERE session_id = ? LIMIT 1",
    [payload.sessionId]
  );

  if (existing.length > 0) {
    await pool.query(
      `UPDATE user_activity 
       SET current_page = ?, product_id = ?, activity_type = ?, user_id = COALESCE(?, user_id), last_activity_at = NOW() 
       WHERE session_id = ?`,
      [payload.currentPage, productId, activityType, userId, payload.sessionId]
    );
  } else {
    await pool.query(
      `INSERT INTO user_activity (session_id, user_id, current_page, product_id, activity_type, last_activity_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [payload.sessionId, userId, payload.currentPage, productId, activityType]
    );
  }
}

export async function getActiveUsersData(windowMinutes = 5): Promise<ActiveUsersInsight> {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT 
      ua.session_id,
      ua.user_id,
      u.name as user_name,
      ua.current_page,
      ua.product_id,
      p.name as product_name,
      ua.last_activity_at
    FROM user_activity ua
    LEFT JOIN users u ON ua.user_id = u.id
    LEFT JOIN products p ON ua.product_id = p.id
    WHERE ua.last_activity_at >= NOW() - INTERVAL ? MINUTE
    ORDER BY ua.last_activity_at DESC
  `, [windowMinutes]);

  const users = rows.map((r) => ({
    sessionId: r.session_id,
    userId: r.user_id ? Number(r.user_id) : null,
    userName: r.user_name || undefined,
    currentPage: r.current_page,
    productId: r.product_id ? Number(r.product_id) : null,
    productName: r.product_name || undefined,
    lastActivityAt: r.last_activity_at,
  }));

  const authenticatedUsers = users.filter((u) => u.userId !== null).length;
  const anonymousVisitors = users.filter((u) => u.userId === null).length;

  return {
    activeUsers: users.length,
    anonymousVisitors,
    authenticatedUsers,
    users,
  };
}

export async function getActiveProductViewers(windowMinutes = 5): Promise<ProductViewerSummary[]> {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT 
      p.id as productId,
      p.name as productName,
      p.image_url as imageUrl,
      c.name as categoryName,
      p.price,
      COUNT(ua.id) as activeViewersCount,
      MAX(ua.last_activity_at) as lastViewedAt
    FROM user_activity ua
    JOIN products p ON ua.product_id = p.id
    JOIN categories c ON p.category_id = c.id
    WHERE ua.last_activity_at >= NOW() - INTERVAL ? MINUTE
    GROUP BY p.id, p.name, p.image_url, c.name, p.price
    ORDER BY activeViewersCount DESC, lastViewedAt DESC
  `, [windowMinutes]);

  return rows.map((r) => ({
    productId: Number(r.productId),
    productName: r.productName,
    imageUrl: r.imageUrl,
    categoryName: r.categoryName,
    price: Number(r.price),
    activeViewersCount: Number(r.activeViewersCount),
    lastViewedAt: r.lastViewedAt,
  }));
}
