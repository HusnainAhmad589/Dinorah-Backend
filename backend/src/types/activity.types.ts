export type ActivityType = "page_view" | "product_view" | "heartbeat";

export interface UserActivity {
  id: number;
  sessionId: string;
  userId: number | null;
  currentPage: string;
  productId: number | null;
  productName?: string;
  activityType: ActivityType;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityPayload {
  sessionId: string;
  userId?: number | null;
  currentPage: string;
  productId?: number | null;
  activityType?: ActivityType;
}

export interface ActiveUserRecord {
  sessionId: string;
  userId: number | null;
  userName?: string;
  currentPage: string;
  productId: number | null;
  productName?: string;
  lastActivityAt: string | Date;
}
