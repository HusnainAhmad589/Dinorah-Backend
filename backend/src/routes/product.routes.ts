import { Router } from "express";
import {
  getProductsController,
  getProductByIdController,
  createProductController,
  updateProductController,
  deleteProductController,
} from "../controllers/product.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";

const router = Router();

// Public Product Routes
router.get("/products", getProductsController);
router.get("/products/:id", getProductByIdController);

// Admin-Protected Product Routes
router.post("/products", authenticateToken, requireAdmin, createProductController);
router.put("/products/:id", authenticateToken, requireAdmin, updateProductController);
router.delete("/products/:id", authenticateToken, requireAdmin, deleteProductController);

export default router;
