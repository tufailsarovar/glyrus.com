// Glyrus — orderRoutes.js
import express from "express";

import {
  createOrder,
  getOrderById,
} from "../controllers/orderController.js";

import {
  orderLimiter,
} from "../middleware/rateLimitMiddleware.js";

const router =
  express.Router();

router.post(
  "/",
  orderLimiter,
  createOrder
);

router.get(
  "/:id",
  getOrderById
);

export default router;