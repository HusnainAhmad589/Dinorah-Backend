import { upsertUserActivity } from "../models/activity.model";
import { ActivityPayload } from "../types/activity.types";

export async function processHeartbeatService(payload: ActivityPayload): Promise<void> {
  if (!payload.sessionId) return;
  await upsertUserActivity({
    ...payload,
    activityType: "heartbeat",
  });
}

export async function processPageViewService(payload: ActivityPayload): Promise<void> {
  if (!payload.sessionId) return;
  await upsertUserActivity({
    ...payload,
    activityType: "page_view",
  });
}

export async function processProductViewService(payload: ActivityPayload): Promise<void> {
  if (!payload.sessionId) return;
  await upsertUserActivity({
    ...payload,
    activityType: "product_view",
  });
}
