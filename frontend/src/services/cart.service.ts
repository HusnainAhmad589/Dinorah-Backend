import { apiFetch } from "./api";
import { CartResponse } from "../types/cart.types";

export async function fetchBackendCart(): Promise<CartResponse> {
  return await apiFetch<CartResponse>("/cart");
}

export async function addBackendCartItem(productId: number, quantity: number): Promise<CartResponse> {
  return await apiFetch<CartResponse>("/cart/items", {
    method: "POST",
    data: { productId, quantity },
  });
}

export async function updateBackendCartItem(itemId: number, quantity: number): Promise<CartResponse> {
  return await apiFetch<CartResponse>(`/cart/items/${itemId}`, {
    method: "PUT",
    data: { quantity },
  });
}

export async function removeBackendCartItem(itemId: number): Promise<CartResponse> {
  return await apiFetch<CartResponse>(`/cart/items/${itemId}`, {
    method: "DELETE",
  });
}

export async function clearBackendCart(): Promise<CartResponse> {
  return await apiFetch<CartResponse>("/cart", {
    method: "DELETE",
  });
}
