export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  createdAt: Date;
}

export interface Order {
  id: number;
  userId: number | null;
  userName?: string;
  userEmail?: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress?: string;
  items?: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderDbRow {
  id: number;
  user_id: number | null;
  status: OrderStatus;
  total_amount: number;
  shipping_address?: string;
  created_at: Date;
  updated_at: Date;
}
