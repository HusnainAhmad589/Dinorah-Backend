import { Router } from "express";
import {
  getOverviewController,
  getSalesController,
  getOrdersController,
  getProductSalesController,
  getActiveUsersController,
  getProductViewsController,
} from "../controllers/insights.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";

const router = Router();

// All Admin Insights endpoints require authentication and admin privileges
router.use(authenticateToken, requireAdmin);

router.get("/overview", getOverviewController);
router.get("/sales", getSalesController);
router.get("/orders", getOrdersController);
router.get("/products", getProductSalesController);
router.get("/active-users", getActiveUsersController);
router.get("/product-views", getProductViewsController);

export default router;
