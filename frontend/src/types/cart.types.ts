export interface CartItem {
  id: number;
  productId: number;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
  material?: string;
  gemstone?: string;
  itemTotal?: number;
}

export interface CartState {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export interface AddToCartPayload {
  productId: number;
  quantity: number;
  // Optional product snapshot for optimistic/guest cart addition
  productSnapshot?: {
    name: string;
    slug: string;
    image: string;
    price: number;
    stock: number;
    material?: string;
    gemstone?: string;
  };
}

export interface UpdateCartItemPayload {
  itemId: number;
  productId?: number;
  quantity: number;
}

export interface CartResponse {
  success: boolean;
  message?: string;
  cart: {
    id: number;
    userId: number;
    items: CartItem[];
    totalQuantity: number;
    subtotal: number;
  };
}
