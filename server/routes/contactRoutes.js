// Glyrus — contactRoutes.js
import express from "express";

import {
  createContact,
} from "../controllers/contactController.js";

import {
  contactLimiter,
} from "../middleware/rateLimitMiddleware.js";

const router =
  express.Router();

router.post(
  "/",
  contactLimiter,
  createContact
);

export default router;