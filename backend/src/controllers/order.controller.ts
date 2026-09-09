import { Request, Response, NextFunction } from "express";
import {
  createOrderService,
  getUserOrdersService,
  getOrderByIdService,
  getAllOrdersAdminService,
  updateOrderStatusService,
} from "../services/order.service";
import { validateCreateOrder, validateUpdateOrderStatus } from "../validators/order.validator";
import { AppError } from "../middleware/error.middleware";

/**
 * POST /api/orders
 * Customer places an order via Cash on Delivery
 */
export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required to place an order", 401);
    }

    const validation = validateCreateOrder(req.body);
    if (!validation.isValid || !validation.data) {
      res.status(400).json({
        success: false,
        message: "Invalid checkout shipping information",
        errors: validation.errors,
      });
      return;
    }

    const order = await createOrderService(req.user.id, validation.data);

    res.status(201).json({
      success: true,
      message: "Your order has been placed successfully via Cash on Delivery",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orders
 * Authenticated customer views their own order history
 */
export async function getUserOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const orders = await getUserOrdersService(req.user.id);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orders/:id
 * Customer or Admin views single order details
 */
export async function getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const orderId = parseInt(req.params.id, 10);
    if (isNaN(orderId)) {
      throw new AppError("Invalid order ID parameter", 400);
    }

    const order = await getOrderByIdService(orderId, req.user.id, req.user.role);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/orders
 * Admin views all orders with optional status filter
 */
export async function getAdminOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const statusFilter = typeof req.query.status === "string" ? req.query.status : undefined;
    const orders = await getAllOrdersAdminService(statusFilter);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/orders/:id/status
 * Admin updates order status
 */
export async function updateAdminOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const orderId = parseInt(req.params.id, 10);
    if (isNaN(orderId)) {
      throw new AppError("Invalid order ID parameter", 400);
    }

    const validation = validateUpdateOrderStatus(req.body);
    if (!validation.isValid || !validation.data) {
      res.status(400).json({
        success: false,
        message: "Invalid status update request",
        errors: validation.errors,
      });
      return;
    }

    const updatedOrder = await updateOrderStatusService(orderId, validation.data.status);

    res.status(200).json({
      success: true,
      message: `Order status updated to ${validation.data.status}`,
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
}
