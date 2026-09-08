import { UserRole } from "./user.types";

/**
 * Extends Express Request type to include the authenticated user payload.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: UserRole;
      };
    }
  }
}

export {};
