import { Router } from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  getAdminOrders,
  updateAdminOrderStatus,
} from "../controllers/order.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";

// Customer Order Routes: mounted at /api/orders
const router = Router();

router.post("/", authenticateToken, createOrder);
router.get("/", authenticateToken, getUserOrders);
router.get("/:id", authenticateToken, getOrderById);

// Admin Order Routes: mounted at /api/admin/orders
const adminRouter = Router();

adminRouter.get("/", authenticateToken, requireAdmin, getAdminOrders);
adminRouter.put("/:id/status", authenticateToken, requireAdmin, updateAdminOrderStatus);

export default router;
export { adminRouter as adminOrderRouter };
