import express, { Application, Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import insightsRoutes from "./routes/insights.routes";
import activityRoutes from "./routes/activity.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes, { adminOrderRouter } from "./routes/order.routes";
import { errorHandler } from "./middleware/error.middleware";

export function createApp(): Application {
  const app: Application = express();

  // Standard middleware
  app.use(cors());
  app.use(express.json());

  // Health check route
  app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      service: "Dinorah Jewellery Backend API",
      timestamp: new Date().toISOString(),
    });
  });

  // Authentication & User Routes
  app.use("/api/auth", authRoutes);

  // Cart Routes (Sprint 3)
  app.use("/api/cart", cartRoutes);

  // Orders Routes (Sprint 4: Customer & Admin)
  app.use("/api/orders", orderRoutes);
  app.use("/api/admin/orders", adminOrderRouter);

  // Products & Categories Routes
  app.use("/api", productRoutes);
  app.use("/api", categoryRoutes);

  // Admin Insights Routes
  app.use("/api/admin/insights", insightsRoutes);

  // User Activity Tracking Routes
  app.use("/api/activity", activityRoutes);

  // 404 Route Handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: "API endpoint not found",
    });
  });

  // Central Error Handler Middleware
  app.use(errorHandler);

  return app;
}
