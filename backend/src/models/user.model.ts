import { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../config/database";
import { UserDbRow, SafeUser, UserRole } from "../types/user.types";

interface UserRowPacket extends RowDataPacket, UserDbRow {}

/**
 * Transforms a raw database row into a safe User object without password.
 */
function toSafeUser(row: UserDbRow): SafeUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Finds a user in MySQL by their unique email address (includes password hash for auth checks).
 */
export async function findUserByEmail(email: string): Promise<UserDbRow | null> {
  const [rows] = await pool.query<UserRowPacket[]>(
    "SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
}

/**
 * Finds a safe user by ID (omits password hash).
 */
export async function findUserById(id: number): Promise<SafeUser | null> {
  const [rows] = await pool.query<UserRowPacket[]>(
    "SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
    [id]
  );

  if (rows.length === 0) {
    return null;
  }

  return toSafeUser(rows[0]);
}

/**
 * Inserts a new user record into MySQL.
 */
export async function createUser(
  name: string,
  email: string,
  passwordHash: string,
  role: UserRole = "customer"
): Promise<SafeUser> {
  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, passwordHash, role]
  );

  const newId = result.insertId;
  const user = await findUserById(newId);

  if (!user) {
    throw new Error("Failed to retrieve created user from database");
  }

  return user;
}
