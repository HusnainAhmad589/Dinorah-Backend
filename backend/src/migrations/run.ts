import { runMigrations } from "./runner";
import { pool } from "../config/database";

async function main() {
  try {
    console.log("=========================================");
    console.log("💎 Running Dinorah Database Migrations...");
    console.log("=========================================");
    await runMigrations();
    console.log("✅ All migrations and seeds applied successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
