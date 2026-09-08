import { Router } from "express";
import {
  heartbeatController,
  pageViewController,
  productViewController,
} from "../controllers/activity.controller";

const router = Router();

// Activity routes are public (session-based for anonymous visitors and authenticated clients)
router.post("/heartbeat", heartbeatController);
router.post("/page-view", pageViewController);
router.post("/product-view", productViewController);

export default router;
