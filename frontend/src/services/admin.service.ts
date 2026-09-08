import { apiFetch } from "./api";
import {
  OverviewInsights,
  SalesInsight,
  OrderInsights,
  ProductSalesInsight,
  ActiveUsersInsight,
  ProductViewerSummary,
} from "../types/admin.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  period?: string;
  count?: number;
}

export async function fetchOverviewInsights(): Promise<OverviewInsights> {
  const res = await apiFetch<ApiResponse<OverviewInsights>>("/admin/insights/overview");
  return res.data;
}

export async function fetchSalesInsights(period: "daily" | "weekly" | "monthly" | "yearly" = "daily"): Promise<SalesInsight[]> {
  const res = await apiFetch<ApiResponse<SalesInsight[]>>(`/admin/insights/sales?period=${period}`);
  return res.data;
}

export async function fetchOrderInsights(): Promise<OrderInsights> {
  const res = await apiFetch<ApiResponse<OrderInsights>>("/admin/insights/orders");
  return res.data;
}

export async function fetchProductSalesInsights(): Promise<ProductSalesInsight[]> {
  const res = await apiFetch<ApiResponse<ProductSalesInsight[]>>("/admin/insights/products");
  return res.data;
}

export async function fetchActiveUsers(): Promise<ActiveUsersInsight> {
  const res = await apiFetch<ApiResponse<ActiveUsersInsight>>("/admin/insights/active-users");
  return res.data;
}

export async function fetchProductViews(): Promise<ProductViewerSummary[]> {
  const res = await apiFetch<ApiResponse<ProductViewerSummary[]>>("/admin/insights/product-views");
  return res.data;
}
