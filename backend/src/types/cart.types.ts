export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
  material?: string;
  gemstone?: string;
  itemTotal: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
