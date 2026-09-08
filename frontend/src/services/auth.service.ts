import { apiFetch } from "./api";
import { RegisterRequest, LoginRequest, AuthResponse } from "../types/auth.types";
import { User } from "../types/user.types";

/**
 * Registers a new user account with the backend.
 */
export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  return await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    data,
  });
}

/**
 * Logs in an existing user and retrieves the JWT token.
 */
export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  return await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    data,
  });
}

/**
 * Retrieves current authenticated user's profile.
 */
export async function getCurrentUser(): Promise<{ success: boolean; user: User }> {
  return await apiFetch<{ success: boolean; user: User }>("/auth/me", {
    method: "GET",
  });
}

/**
 * Tests admin-only access endpoint.
 */
export async function getAdminStats(): Promise<{
  success: boolean;
  message: string;
  adminUser: { id: number; email: string; role: string };
  systemStatus: Record<string, unknown>;
}> {
  return await apiFetch("/auth/admin-only", {
    method: "GET",
  });
}
