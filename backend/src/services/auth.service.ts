import { RegisterRequest, LoginRequest, AuthResponse } from "../types/auth.types";
import { SafeUser } from "../types/user.types";
import { findUserByEmail, findUserById, createUser } from "../models/user.model";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import { AppError } from "../middleware/error.middleware";

/**
 * Service function to handle user registration logic.
 */
export async function registerService(data: RegisterRequest): Promise<AuthResponse> {
  const existingUser = await findUserByEmail(data.email);
  if (existingUser) {
    throw new AppError("Email address is already registered", 409, [
      { field: "email", message: "This email address is already associated with an account" },
    ]);
  }

  const hashedPassword = await hashPassword(data.password);
  const user = await createUser(data.name, data.email, hashedPassword, data.role || "customer");

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    success: true,
    message: "User registered successfully",
    token,
    user,
  };
}

/**
 * Service function to handle user login logic.
 */
export async function loginService(data: LoginRequest): Promise<AuthResponse> {
  const user = await findUserByEmail(data.email);
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await comparePassword(data.password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const safeUser: SafeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };

  return {
    success: true,
    message: "Login successful",
    token,
    user: safeUser,
  };
}

/**
 * Service function to retrieve the profile of the current authenticated user.
 */
export async function getMeService(userId: number): Promise<SafeUser> {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
}
