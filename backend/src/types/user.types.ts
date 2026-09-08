/**
 * Available user roles in the Dinorah Jewellery platform.
 */
export type UserRole = "customer" | "admin";

/**
 * Clean User interface exposed safely to clients (omits password hash).
 */
export interface SafeUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Raw User database row representation from MySQL (includes password hash).
 */
export interface UserDbRow {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

/**
 * Legacy/Standard User interface as requested by acceptance criteria.
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}
