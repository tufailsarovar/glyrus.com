// Glyrus — requestRoutes.js
import express from "express";

import {
  createRequest,
} from "../controllers/requestController.js";

import {
  requestLimiter,
} from "../middleware/rateLimitMiddleware.js";

const router =
  express.Router();

router.post(
  "/",
  requestLimiter,
  createRequest
);

export default router;