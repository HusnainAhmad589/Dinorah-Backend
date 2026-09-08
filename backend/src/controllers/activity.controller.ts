import { Request, Response, NextFunction } from "express";
import {
  processHeartbeatService,
  processPageViewService,
  processProductViewService,
} from "../services/activity.service";

export async function heartbeatController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sessionId, currentPage, productId, userId } = req.body;
    if (sessionId && currentPage) {
      await processHeartbeatService({
        sessionId,
        currentPage,
        productId: productId ? Number(productId) : null,
        userId: userId ? Number(userId) : (req.user ? req.user.id : null),
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function pageViewController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sessionId, currentPage, userId } = req.body;
    if (sessionId && currentPage) {
      await processPageViewService({
        sessionId,
        currentPage,
        productId: null,
        userId: userId ? Number(userId) : (req.user ? req.user.id : null),
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function productViewController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sessionId, currentPage, productId, userId } = req.body;
    if (sessionId && currentPage && productId) {
      await processProductViewService({
        sessionId,
        currentPage,
        productId: Number(productId),
        userId: userId ? Number(userId) : (req.user ? req.user.id : null),
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}
