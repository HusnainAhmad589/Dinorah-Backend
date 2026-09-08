import { Request, Response, NextFunction } from "express";
import {
  getCartService,
  addItemToCartService,
  updateCartItemService,
  removeCartItemService,
  clearCartService,
} from "../services/cart.service";
import {
  validateAddToCart,
  validateUpdateCartItem,
} from "../validators/cart.validator";
import { AppError } from "../middleware/error.middleware";

export async function getCartController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const cart = await getCartService(userId);

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    next(error);
  }
}

export async function addItemToCartController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;

    const validation = validateAddToCart(req.body);
    if (!validation.isValid || !validation.data) {
      throw new AppError("Invalid cart request payload", 400, validation.errors);
    }

    const { productId, quantity } = validation.data;
    const cart = await addItemToCartService(userId, productId, quantity);

    res.status(200).json({
      success: true,
      message: "Piece added to your shopping bag",
      cart,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCartItemController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const itemId = Number(req.params.id);

    if (isNaN(itemId) || itemId <= 0) {
      throw new AppError("Invalid cart item identifier", 400);
    }

    const validation = validateUpdateCartItem(req.body);
    if (!validation.isValid || !validation.data) {
      throw new AppError("Invalid cart item update payload", 400, validation.errors);
    }

    const { quantity } = validation.data;
    const cart = await updateCartItemService(userId, itemId, quantity);

    res.status(200).json({
      success: true,
      message: "Shopping bag updated",
      cart,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeCartItemController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const itemId = Number(req.params.id);

    if (isNaN(itemId) || itemId <= 0) {
      throw new AppError("Invalid cart item identifier", 400);
    }

    const cart = await removeCartItemService(userId, itemId);

    res.status(200).json({
      success: true,
      message: "Piece removed from shopping bag",
      cart,
    });
  } catch (error) {
    next(error);
  }
}

export async function clearCartController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const cart = await clearCartService(userId);

    res.status(200).json({
      success: true,
      message: "Shopping bag cleared",
      cart,
    });
  } catch (error) {
    next(error);
  }
}
