import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * Hashes a plain-text password using bcrypt.
 * @param password Plain text password
 * @returns Hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a plain-text password with an existing bcrypt hash.
 * @param password Plain text password
 * @param hash Stored bcrypt hash
 * @returns Boolean indicating if match
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
