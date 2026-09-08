import { Router } from "express";
import {
  getCartController,
  addItemToCartController,
  updateCartItemController,
  removeCartItemController,
  clearCartController,
} from "../controllers/cart.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// All customer cart endpoints require customer authentication
router.use(authenticateToken);

router.get("/", getCartController);
router.post("/items", addItemToCartController);
router.put("/items/:id", updateCartItemController);
router.delete("/items/:id", removeCartItemController);
router.delete("/", clearCartController);

export default router;
