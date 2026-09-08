import { Request, Response, NextFunction } from "express";
import {
  getOverviewInsightsService,
  getSalesInsightsService,
  getOrderInsightsService,
  getProductSalesInsightsService,
  getActiveUsersInsightsService,
  getProductViewsInsightsService,
} from "../services/insights.service";

export async function getOverviewController(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getOverviewInsightsService();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSalesController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const period = (req.query.period as "daily" | "weekly" | "monthly" | "yearly") || "daily";
    const data = await getSalesInsightsService(period);
    res.status(200).json({
      success: true,
      period,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrdersController(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getOrderInsightsService();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductSalesController(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getProductSalesInsightsService();
    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getActiveUsersController(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getActiveUsersInsightsService();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductViewsController(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getProductViewsInsightsService();
    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
}
