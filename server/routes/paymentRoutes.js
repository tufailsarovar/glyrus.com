// Glyrus — paymentRoutes.js
import express from "express";

import {
  createPaymentOrder,
  verifyPayment,
} from "../controllers/paymentController.js";

import {
  paymentLimiter,
} from "../middleware/rateLimitMiddleware.js";

const router =
  express.Router();

router.post(
  "/create-order",
  paymentLimiter,
  createPaymentOrder
);

router.post(
  "/verify",
  paymentLimiter,
  verifyPayment
);

export default router;