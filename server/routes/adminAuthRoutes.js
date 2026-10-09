import express from "express";

import {
  adminLogin,
  adminLogout,
  getAdminProfile,
} from "../controllers/adminAuthController.js";

import {
  adminAuthMiddleware,
} from "../middleware/adminAuthMiddleware.js";

const router =
  express.Router();

/* -------------------------------------------------------
   ADMIN LOGIN
------------------------------------------------------- */

router.post(
  "/login",
  adminLogin
);

/* -------------------------------------------------------
   ADMIN LOGOUT
------------------------------------------------------- */

router.post(
  "/logout",
  adminAuthMiddleware,
  adminLogout
);

/* -------------------------------------------------------
   ADMIN PROFILE
------------------------------------------------------- */

router.get(
  "/profile",
  adminAuthMiddleware,
  getAdminProfile
);

export default router;