export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName?: string;
  productSlug?: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
  createdAt: Date;
}

export interface Order {
  id: number;
  userId: number | null;
  status: OrderStatus;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  paymentMethod: string;
  items?: OrderItem[];
  itemCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderDbRow {
  id: number;
  user_id: number | null;
  status: OrderStatus;
  total_amount: number;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: string | null;
  city: string | null;
  postal_code: string | null;
  payment_method: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateOrderInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod?: string;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
}
