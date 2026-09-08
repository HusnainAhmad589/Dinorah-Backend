import { apiFetch } from "./api";

export interface ActivitySendPayload {
  sessionId: string;
  currentPage: string;
  productId?: number | null;
  userId?: number | null;
}

export async function sendHeartbeat(payload: ActivitySendPayload): Promise<void> {
  try {
    await apiFetch<{ success: boolean }>("/activity/heartbeat", {
      method: "POST",
      data: payload,
    });
  } catch (e) {
    // Fail silently in background
  }
}

export async function sendPageView(payload: ActivitySendPayload): Promise<void> {
  try {
    await apiFetch<{ success: boolean }>("/activity/page-view", {
      method: "POST",
      data: payload,
    });
  } catch (e) {
    // Fail silently in background
  }
}

export async function sendProductView(payload: ActivitySendPayload): Promise<void> {
  try {
    await apiFetch<{ success: boolean }>("/activity/product-view", {
      method: "POST",
      data: payload,
    });
  } catch (e) {
    // Fail silently in background
  }
}
