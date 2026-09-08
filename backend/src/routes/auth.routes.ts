import { Router } from "express";
import {
  registerController,
  loginController,
  meController,
  adminStatsController,
} from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

// Public Authentication Routes
router.post("/register", registerController);
router.post("/login", loginController);

// Protected Routes (Requires valid JWT)
router.get("/me", authenticateToken, meController);

// Admin-Only Protected Route (Requires valid JWT + Admin Role)
router.get("/admin-only", authenticateToken, requireRole("admin"), adminStatsController);

export default router;
