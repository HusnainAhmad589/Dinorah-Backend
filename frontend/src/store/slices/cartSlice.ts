import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { CartState, CartItem, AddToCartPayload, UpdateCartItemPayload } from "../../types/cart.types";
import {
  fetchBackendCart,
  addBackendCartItem,
  updateBackendCartItem,
  removeBackendCartItem,
  clearBackendCart,
} from "../../services/cart.service";

const CART_STORAGE_KEY = "dinorah_cart_state";

// Helper to safely load persisted cart from localStorage
export function loadPersistedCart(): Partial<CartState> | null {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.items)) {
      return {
        items: parsed.items,
        totalQuantity: parsed.totalQuantity || calculateTotalQuantity(parsed.items),
        subtotal: parsed.subtotal || calculateSubtotal(parsed.items),
      };
    }
  } catch (e) {
    console.error("Failed to load persisted cart:", e);
  }
  return null;
}

// Helper to save cart state to localStorage
export function savePersistedCart(items: CartItem[]) {
  try {
    const totalQuantity = calculateTotalQuantity(items);
    const subtotal = calculateSubtotal(items);
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ items, totalQuantity, subtotal })
    );
  } catch (e) {
    console.error("Failed to persist cart:", e);
  }
}

function calculateTotalQuantity(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.quantity, 0);
}

function calculateSubtotal(items: CartItem[]): number {
  const sum = items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
  return Number(sum.toFixed(2));
}

// Initial state with persisted items if available
const persisted = typeof window !== "undefined" ? loadPersistedCart() : null;

const initialState: CartState = {
  items: persisted?.items || [],
  totalQuantity: persisted?.totalQuantity || (persisted?.items ? calculateTotalQuantity(persisted.items) : 0),
  subtotal: persisted?.subtotal || (persisted?.items ? calculateSubtotal(persisted.items) : 0),
  loading: false,
  error: null,
  isInitialized: false,
};

// ----------------------------------------------------
// Async Thunks
// ----------------------------------------------------

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("dinorah_token");
    if (!token) {
      // Guest user: cart is local
      return null;
    }
    try {
      const res = await fetchBackendCart();
      return res.cart;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Unable to load cart");
    }
  }
);

export const addItemToCart = createAsyncThunk(
  "cart/addItemToCart",
  async (payload: AddToCartPayload, { rejectWithValue }) => {
    const token = localStorage.getItem("dinorah_token");
    if (token) {
      try {
        const res = await addBackendCartItem(payload.productId, payload.quantity);
        return { isBackend: true, cart: res.cart };
      } catch (err: unknown) {
        return rejectWithValue(err instanceof Error ? err.message : "Failed to add piece to cart");
      }
    }
    // Guest user: handle locally
    return { isBackend: false, payload };
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async (payload: UpdateCartItemPayload, { rejectWithValue }) => {
    const token = localStorage.getItem("dinorah_token");
    if (token && payload.itemId > 0) {
      try {
        const res = await updateBackendCartItem(payload.itemId, payload.quantity);
        return { isBackend: true, cart: res.cart };
      } catch (err: unknown) {
        return rejectWithValue(err instanceof Error ? err.message : "Failed to update quantity");
      }
    }
    // Guest user: update locally
    return { isBackend: false, payload };
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async (itemId: number, { rejectWithValue }) => {
    const token = localStorage.getItem("dinorah_token");
    if (token && itemId > 0) {
      try {
        const res = await removeBackendCartItem(itemId);
        return { isBackend: true, cart: res.cart };
      } catch (err: unknown) {
        return rejectWithValue(err instanceof Error ? err.message : "Failed to remove piece");
      }
    }
    // Guest user: remove locally
    return { isBackend: false, itemId };
  }
);

export const clearCustomerCart = createAsyncThunk(
  "cart/clearCustomerCart",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("dinorah_token");
    if (token) {
      try {
        const res = await clearBackendCart();
        return { isBackend: true, cart: res.cart };
      } catch (err: unknown) {
        return rejectWithValue(err instanceof Error ? err.message : "Failed to clear cart");
      }
    }
    return { isBackend: false };
  }
);

// ----------------------------------------------------
// Cart Slice
// ----------------------------------------------------

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find((i) => i.productId === action.payload.productId);
      if (existing) {
        const newQty = existing.quantity + action.payload.quantity;
        existing.quantity = Math.min(newQty, existing.stock);
        existing.itemTotal = Number((existing.quantity * existing.price).toFixed(2));
      } else {
        state.items.push({
          ...action.payload,
          itemTotal: Number((action.payload.quantity * action.payload.price).toFixed(2)),
        });
      }
      state.totalQuantity = calculateTotalQuantity(state.items);
      state.subtotal = calculateSubtotal(state.items);
      state.error = null;
      savePersistedCart(state.items);
    },

    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.id !== action.payload && i.productId !== action.payload);
      state.totalQuantity = calculateTotalQuantity(state.items);
      state.subtotal = calculateSubtotal(state.items);
      state.error = null;
      savePersistedCart(state.items);
    },

    increaseQuantity: (state, action: PayloadAction<number>) => {
      const item = state.items.find((i) => i.id === action.payload || i.productId === action.payload);
      if (item) {
        if (item.quantity < item.stock) {
          item.quantity += 1;
          item.itemTotal = Number((item.quantity * item.price).toFixed(2));
          state.totalQuantity = calculateTotalQuantity(state.items);
          state.subtotal = calculateSubtotal(state.items);
          state.error = null;
          savePersistedCart(state.items);
        } else {
          state.error = `Only ${item.stock} unit(s) available in atelier inventory.`;
        }
      }
    },

    decreaseQuantity: (state, action: PayloadAction<number>) => {
      const item = state.items.find((i) => i.id === action.payload || i.productId === action.payload);
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
          item.itemTotal = Number((item.quantity * item.price).toFixed(2));
        } else {
          state.items = state.items.filter((i) => i !== item);
        }
        state.totalQuantity = calculateTotalQuantity(state.items);
        state.subtotal = calculateSubtotal(state.items);
        state.error = null;
        savePersistedCart(state.items);
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.subtotal = 0;
      state.error = null;
      savePersistedCart([]);
    },

    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.totalQuantity = calculateTotalQuantity(action.payload);
      state.subtotal = calculateSubtotal(action.payload);
      state.error = null;
      savePersistedCart(action.payload);
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchCart
    builder.addCase(fetchCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.loading = false;
      state.isInitialized = true;
      if (action.payload) {
        // Backend cart returned
        state.items = action.payload.items;
        state.totalQuantity = action.payload.totalQuantity;
        state.subtotal = action.payload.subtotal;
        savePersistedCart(action.payload.items);
      }
    });
    builder.addCase(fetchCart.rejected, (state, action) => {
      state.loading = false;
      state.isInitialized = true;
      state.error = action.payload as string;
    });

    // addItemToCart
    builder.addCase(addItemToCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addItemToCart.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.isBackend && action.payload.cart) {
        state.items = action.payload.cart.items;
        state.totalQuantity = action.payload.cart.totalQuantity;
        state.subtotal = action.payload.cart.subtotal;
        savePersistedCart(action.payload.cart.items);
      } else if (!action.payload.isBackend && action.payload.payload) {
        const { productId, quantity, productSnapshot } = action.payload.payload;
        const existing = state.items.find((i) => i.productId === productId);
        if (existing) {
          const maxStock = productSnapshot?.stock || existing.stock;
          existing.quantity = Math.min(existing.quantity + quantity, maxStock);
          existing.itemTotal = Number((existing.quantity * existing.price).toFixed(2));
        } else if (productSnapshot) {
          const newItem: CartItem = {
            id: Date.now(),
            productId,
            name: productSnapshot.name,
            slug: productSnapshot.slug,
            image: productSnapshot.image,
            price: productSnapshot.price,
            quantity,
            stock: productSnapshot.stock,
            material: productSnapshot.material,
            gemstone: productSnapshot.gemstone,
            itemTotal: Number((quantity * productSnapshot.price).toFixed(2)),
          };
          state.items.push(newItem);
        }
        state.totalQuantity = calculateTotalQuantity(state.items);
        state.subtotal = calculateSubtotal(state.items);
        savePersistedCart(state.items);
      }
    });
    builder.addCase(addItemToCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // updateCartItem
    builder.addCase(updateCartItem.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateCartItem.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.isBackend && action.payload.cart) {
        state.items = action.payload.cart.items;
        state.totalQuantity = action.payload.cart.totalQuantity;
        state.subtotal = action.payload.cart.subtotal;
        savePersistedCart(action.payload.cart.items);
      } else if (!action.payload.isBackend && action.payload.payload) {
        const { itemId, productId, quantity } = action.payload.payload;
        const item = state.items.find((i) => i.id === itemId || i.productId === productId);
        if (item) {
          if (quantity <= 0) {
            state.items = state.items.filter((i) => i !== item);
          } else {
            item.quantity = Math.min(quantity, item.stock);
            item.itemTotal = Number((item.quantity * item.price).toFixed(2));
          }
          state.totalQuantity = calculateTotalQuantity(state.items);
          state.subtotal = calculateSubtotal(state.items);
          savePersistedCart(state.items);
        }
      }
    });
    builder.addCase(updateCartItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // removeCartItem
    builder.addCase(removeCartItem.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(removeCartItem.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.isBackend && action.payload.cart) {
        state.items = action.payload.cart.items;
        state.totalQuantity = action.payload.cart.totalQuantity;
        state.subtotal = action.payload.cart.subtotal;
        savePersistedCart(action.payload.cart.items);
      } else if (!action.payload.isBackend && action.payload.itemId !== undefined) {
        state.items = state.items.filter(
          (i) => i.id !== action.payload.itemId && i.productId !== action.payload.itemId
        );
        state.totalQuantity = calculateTotalQuantity(state.items);
        state.subtotal = calculateSubtotal(state.items);
        savePersistedCart(state.items);
      }
    });
    builder.addCase(removeCartItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // clearCustomerCart
    builder.addCase(clearCustomerCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(clearCustomerCart.fulfilled, (state) => {
      state.loading = false;
      state.items = [];
      state.totalQuantity = 0;
      state.subtotal = 0;
      savePersistedCart([]);
    });
    builder.addCase(clearCustomerCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  addItem,
  removeItem,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
  setCart,
  setLoading,
  setError,
} = cartSlice.actions;

export default cartSlice.reducer;
