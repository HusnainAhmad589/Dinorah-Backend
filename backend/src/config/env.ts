import dotenv from "dotenv";
import path from "path";

// Load .env file from the backend root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD?: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  FRONTEND_URL: string;
}

/**
 * Validates critical environment variables at startup and throws descriptive errors if missing.
 */
function validateEnv(): EnvConfig {
  const PORT = Number(process.env.PORT) || 5000;
  const NODE_ENV = process.env.NODE_ENV || "development";
  const DB_HOST = process.env.DB_HOST || "localhost";
  const DB_PORT = Number(process.env.DB_PORT) || 3306;
  const DB_NAME = process.env.DB_NAME || "dinorah";
  const DB_USER = process.env.DB_USER || "root";
  const DB_PASSWORD = process.env.DB_PASSWORD ?? "";
  const JWT_SECRET = process.env.JWT_SECRET || "dinorah_default_dev_secret_key_change_in_production";
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

  if (!process.env.JWT_SECRET && NODE_ENV === "production") {
    throw new Error("FATAL: JWT_SECRET environment variable is missing in production!");
  }

  return {
    PORT,
    NODE_ENV,
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    FRONTEND_URL,
  };
}

export const env = validateEnv();
