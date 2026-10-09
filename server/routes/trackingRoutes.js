// Glyrus — trackingRoutes.js
import express from "express";

import {
  getTrackingDetails,
} from "../controllers/trackingController.js";

import {
  trackingLimiter,
} from "../middleware/rateLimitMiddleware.js";

const router =
  express.Router();

router.get(
  "/:trackingNumber",
  trackingLimiter,
  getTrackingDetails
);

export default router;