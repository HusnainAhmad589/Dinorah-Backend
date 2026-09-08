import { Router } from "express";
import {
  getCategoriesController,
  getCategoryByIdController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from "../controllers/category.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";

const router = Router();

// Public Category Routes
router.get("/categories", getCategoriesController);
router.get("/categories/:id", getCategoryByIdController);

// Admin-Protected Category Routes
router.post("/categories", authenticateToken, requireAdmin, createCategoryController);
router.put("/categories/:id", authenticateToken, requireAdmin, updateCategoryController);
router.delete("/categories/:id", authenticateToken, requireAdmin, deleteCategoryController);

export default router;
