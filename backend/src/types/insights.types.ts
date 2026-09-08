import { ActiveUserRecord } from "./activity.types";

export interface OverviewInsights {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  activeUsers: number;
  activeProductViewers: number;
}

export interface SalesInsight {
  date: string;
  ordersCount: number;
  itemsSold: number;
  revenue: number;
}

export interface OrderInsights {
  pending: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export interface ProductSalesInsight {
  productId: number;
  productName: string;
  categoryName: string;
  quantitySold: number;
  revenue: number;
  currentStock: number;
}

export interface ActiveUsersInsight {
  activeUsers: number;
  anonymousVisitors: number;
  authenticatedUsers: number;
  users: ActiveUserRecord[];
}

export interface ProductViewerSummary {
  productId: number;
  productName: string;
  imageUrl: string;
  categoryName: string;
  price: number;
  activeViewersCount: number;
  lastViewedAt: string | Date;
}
