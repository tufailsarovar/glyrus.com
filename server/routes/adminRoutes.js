// Glyrus — adminRoutes.js

import express from "express";

import {
  getDashboardStats,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminOrders,
  getAdminOrderById,
  deleteAdminOrder,
  deleteAllOrders,
  updateOrderStatus,
  updateOrderShipping,
  updateAdminTrackingNumber,
  getCustomers,
  getRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  getMessages,
  updateMessage,
  deleteMessage,
  getSettings,
  updateSettings,
} from "../controllers/adminController.js";

import { adminAuthMiddleware } from "../middleware/adminAuthMiddleware.js";

import { uploadProductImages } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* -------------------------------------------------------
   ADMIN AUTHORIZATION
------------------------------------------------------- */

router.use(adminAuthMiddleware);

/* -------------------------------------------------------
   DASHBOARD
------------------------------------------------------- */

router.get("/dashboard", getDashboardStats);

/* -------------------------------------------------------
   PRODUCTS
------------------------------------------------------- */

router.get("/products", getAdminProducts);

router.post("/products", uploadProductImages, createProduct);

router.put("/products/:id", uploadProductImages, updateProduct);

router.delete("/products/:id", deleteProduct);

/* -------------------------------------------------------
   ORDERS
------------------------------------------------------- */

router.get("/orders", getAdminOrders);

router.get("/orders/:id", getAdminOrderById);

router.delete("/orders", deleteAllOrders);

router.delete("/orders/:id", deleteAdminOrder);

router.patch("/orders/:id/status", updateOrderStatus);

router.patch("/orders/:id/shipping", updateOrderShipping);

router.patch("/orders/:id/tracking", updateAdminTrackingNumber);

/* -------------------------------------------------------
   CUSTOMERS
------------------------------------------------------- */

router.get("/customers", getCustomers);

/* -------------------------------------------------------
   REQUESTS
------------------------------------------------------- */

router.get("/requests", getRequests);

router.get("/requests/:id", getRequestById);

router.patch("/requests/:id", updateRequest);

router.delete("/requests/:id", deleteRequest);

/* -------------------------------------------------------
   CONTACT / MESSAGES
------------------------------------------------------- */

router.get("/messages", getMessages);

router.patch("/messages/:id", updateMessage);

router.delete("/messages/:id", deleteMessage);

/* -------------------------------------------------------
   SETTINGS
------------------------------------------------------- */

router.get("/settings", getSettings);

router.put("/settings", updateSettings);

export default router;
