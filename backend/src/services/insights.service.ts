import {
  getOverviewStats,
  getSalesByPeriod,
  getOrderStats,
  getProductSalesInsights,
} from "../models/order.model";
import { getActiveUsersData, getActiveProductViewers } from "../models/activity.model";
import {
  OverviewInsights,
  SalesInsight,
  OrderInsights,
  ProductSalesInsight,
  ActiveUsersInsight,
  ProductViewerSummary,
} from "../types/insights.types";

export async function getOverviewInsightsService(): Promise<OverviewInsights> {
  const [orderStats, activeUsersData, activeViewers] = await Promise.all([
    getOverviewStats(),
    getActiveUsersData(5),
    getActiveProductViewers(5),
  ]);

  return {
    ...orderStats,
    activeUsers: activeUsersData.activeUsers,
    activeProductViewers: activeViewers.length,
  };
}

export async function getSalesInsightsService(
  period: "daily" | "weekly" | "monthly" | "yearly" = "daily"
): Promise<SalesInsight[]> {
  return await getSalesByPeriod(period);
}

export async function getOrderInsightsService(): Promise<OrderInsights> {
  return await getOrderStats();
}

export async function getProductSalesInsightsService(): Promise<ProductSalesInsight[]> {
  return await getProductSalesInsights();
}

export async function getActiveUsersInsightsService(): Promise<ActiveUsersInsight> {
  return await getActiveUsersData(5);
}

export async function getProductViewsInsightsService(): Promise<ProductViewerSummary[]> {
  return await getActiveProductViewers(5);
}
