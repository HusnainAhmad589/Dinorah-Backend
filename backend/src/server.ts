import { createApp } from "./app";
import { env } from "./config/env";
import { initializeDatabase } from "./config/database";

async function startServer(): Promise<void> {
  try {
    // 1. Initialize and verify MySQL database connection & schema
    await initializeDatabase();

    // 2. Create Express app instance
    const app = createApp();

    // 3. Start listening for HTTP requests
    app.listen(env.PORT, () => {
      console.log(`=========================================`);
      console.log(`💎 Dinorah Jewellery Backend Server Running`);
      console.log(`📡 URL: http://localhost:${env.PORT}`);
      console.log(`🌐 Environment: ${env.NODE_ENV}`);
      console.log(`🔒 Authentication: JWT with bcrypt`);
      console.log(`=========================================`);
    });
  } catch (error) {
    console.error("FATAL: Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
