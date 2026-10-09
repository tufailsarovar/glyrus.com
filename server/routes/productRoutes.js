import express from "express";

import {
  getAllProducts,
  getProductById,
} from "../controllers/productController.js";

const router =
  express.Router();

/* -------------------------------------------------------
   PUBLIC PRODUCTS
------------------------------------------------------- */

router.get(
  "/",
  getAllProducts
);

router.get(
  "/:id",
  getProductById
);

export default router;