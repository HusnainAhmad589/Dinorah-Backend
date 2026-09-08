import mysql from "mysql2/promise";
import { env } from "./env";
import { runMigrations } from "../migrations/runner";

/**
 * MySQL Connection Pool configured via environment variables.
 */
export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * Initializes database connection and executes pending migrations/seeds.
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Connected successfully to MySQL database "${env.DB_NAME}" at ${env.DB_HOST}:${env.DB_PORT}`);
    connection.release();

    // Run migrations to ensure all tables (users, categories, products, inquiries) exist & are seeded
    await runMigrations();
  } catch (error) {
    console.error("[Database] Failed to connect or initialize MySQL database:", error);
    throw error;
  }
}
