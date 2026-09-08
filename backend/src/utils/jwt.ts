import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { JwtPayload } from "../types/auth.types";

/**
 * Generates a signed JWT token containing user identity and role.
 * @param payload Object containing user id, email, role
 * @returns Encrypted JWT string
 */
export function generateToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as unknown as number | undefined,
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

/**
 * Verifies and decodes a JWT token.
 * @param token Encrypted JWT string
 * @returns Decoded JwtPayload
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
