import express from "express";
import {
  adminLogin,
  requestAdminOtp,
  verifyAdminOtp,
  adminLogout,
  getAdminProfile,
  googleAdminLogin,
  googleAdminCallback,
  exchangeGoogleLoginTicket,
} from "../controllers/adminAuthController.js";
import { adminAuthMiddleware } from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

router.post("/request-otp", requestAdminOtp);
router.post("/verify-otp", verifyAdminOtp);

router.get("/google", googleAdminLogin);
router.get("/google/callback", googleAdminCallback);
router.post("/google/exchange-ticket", exchangeGoogleLoginTicket);

router.post("/login", adminLogin);
router.post("/logout", adminAuthMiddleware, adminLogout);
router.get("/profile", adminAuthMiddleware, getAdminProfile);

export default router;
