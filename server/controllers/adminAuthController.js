import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendAdminLoginOtpEmail } from "../services/emailService.js";

const otpStore = new Map();

const googleLoginTickets = new Map();

const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

const getAdminEmail = () => normalizeEmail(process.env.ADMIN_EMAIL);

const getJwtSecret = () => String(process.env.ADMIN_JWT_SECRET || "");

const createAdminToken = (email) =>
  jwt.sign(
    {
      role: "admin",
      type: "admin",
      email,
    },
    getJwtSecret(),
    { expiresIn: "1h" },
  );

const setAdminCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("adminToken", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 60 * 60 * 1000,
    path: "/",
  });
};

export const adminLogin = async (req, res, next) => {
  try {
    return res.status(400).json({
      success: false,
      message: "Use email OTP login.",
    });
  } catch (error) {
    next(error);
  }
};

export const requestAdminOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const adminEmail = getAdminEmail();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    if (!adminEmail || !process.env.ADMIN_JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Admin authentication is not configured.",
      });
    }

    // Only the configured admin email can receive an OTP.
    if (email !== adminEmail) {
      return res.status(403).json({
        success: false,
        message: "Access denied. This email is not registered as an admin.",
      });
    }

    const now = Date.now();
    const existing = otpStore.get(email);

    if (existing?.lastSentAt && now - existing.lastSentAt < 60_000) {
      return res.status(429).json({
        success: false,
        message: "Please wait 60 seconds before requesting another OTP.",
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    otpStore.set(email, {
      otpHash,
      expiresAt: now + 5 * 60 * 1000,
      attempts: 0,
      lastSentAt: now,
    });

    try {
      await sendAdminLoginOtpEmail(email, otp);
    } catch (error) {
      otpStore.delete(email);
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent to your admin email address.",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyAdminOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp || "").trim();
    const adminEmail = getAdminEmail();

    if (!adminEmail || email !== adminEmail) {
      return res.status(403).json({
        success: false,
        message: "Access denied. This email is not registered as an admin.",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "Enter the valid 6-digit OTP.",
      });
    }

    const record = otpStore.get(email);

    if (!record || record.expiresAt < Date.now()) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });
    }

    if (record.attempts >= 5) {
      otpStore.delete(email);
      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Request a new OTP.",
      });
    }

    record.attempts += 1;

    const submittedHash = crypto.createHash("sha256").update(otp).digest("hex");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(record.otpHash, "hex"),
        Buffer.from(submittedHash, "hex"),
      )
    ) {
      return res.status(401).json({
        success: false,
        message: "Incorrect OTP. Please try again.",
      });
    }

    otpStore.delete(email);

    const token = createAdminToken(email);
    setAdminCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      token,
      admin: {
        email,
        role: "admin",
        type: "admin",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const adminLogout = async (req, res, next) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Admin logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProfile = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      admin: {
        email: req.admin?.email || getAdminEmail(),
        role: "admin",
        type: "admin",
      },
    });
  } catch (error) {
    next(error);
  }
};

// ================= GOOGLE ADMIN LOGIN =================

const generateGoogleState = () => crypto.randomBytes(32).toString("hex");

export const googleAdminLogin = async (req, res, next) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL;

    if (!clientId || !callbackUrl) {
      return res.status(503).json({
        success: false,
        message: "Google login is not configured.",
      });
    }

    const state = generateGoogleState();
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("googleAdminState", state, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 5 * 60 * 1000,
      path: "/",
    });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: "code",
      scope: "openid email profile",
      state,
      prompt: "select_account",
    });

    return res.status(200).json({
      success: true,
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    });
  } catch (error) {
    next(error);
  }
};

export const googleAdminCallback = async (req, res) => {
  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")[0]
    .trim();

  const failLogin = (message) =>
    res.redirect(
      `${clientUrl}/admin/login?google_error=${encodeURIComponent(message)}`,
    );

  try {
    const { code, state, error } = req.query;

    if (error || !code || !state) {
      return failLogin("Google sign-in was cancelled or failed.");
    }

    const expectedState = req.cookies?.googleAdminState;

    console.log("Google OAuth state check:", {
      hasQueryState: Boolean(state),
      hasStateCookie: Boolean(expectedState),
      nodeEnv: process.env.NODE_ENV,
    });

    res.clearCookie("googleAdminState", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/api/admin/auth",
    });

    if (
      !expectedState ||
      typeof state !== "string" ||
      !crypto.timingSafeEqual(Buffer.from(state), Buffer.from(expectedState))
    ) {
      return failLogin("Invalid login session. Please try again.");
    }

    const {
      GOOGLE_CLIENT_ID: clientId,
      GOOGLE_CLIENT_SECRET: clientSecret,
      GOOGLE_CALLBACK_URL: callbackUrl,
      ADMIN_EMAIL,
      ADMIN_JWT_SECRET,
    } = process.env;

    if (
      !clientId ||
      !clientSecret ||
      !callbackUrl ||
      !ADMIN_EMAIL ||
      !ADMIN_JWT_SECRET
    ) {
      return failLogin("Google admin authentication is not configured.");
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code: String(code),
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      return failLogin("Unable to verify your Google account.");
    }

    const profileResponse = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );

    const profile = await profileResponse.json();

    if (
      !profileResponse.ok ||
      !profile.email ||
      profile.email_verified !== true
    ) {
      return failLogin("Unable to verify your Google email.");
    }

    const email = normalizeEmail(profile.email);

    if (email !== normalizeEmail(ADMIN_EMAIL)) {
      return failLogin(
        "Access denied. This Google account is not registered as an admin.",
      );
    }

    const token = createAdminToken(email);
    const ticket = crypto.randomBytes(32).toString("hex");

    googleLoginTickets.set(ticket, {
      token,
      email,
      expiresAt: Date.now() + 60 * 1000,
    });

    return res.redirect(
      `${clientUrl}/admin/login?google_ticket=${encodeURIComponent(ticket)}`,
    );
  } catch (error) {
    console.error("Google admin login error:", error.message);
    return failLogin("Google sign-in failed. Please try again.");
  }
};

export const exchangeGoogleLoginTicket = (req, res) => {
  const ticket = String(req.body?.ticket || "");
  const record = googleLoginTickets.get(ticket);

  if (!record || record.expiresAt < Date.now()) {
    googleLoginTickets.delete(ticket);

    return res.status(401).json({
      success: false,
      message: "Google login session expired. Please try again.",
    });
  }

  googleLoginTickets.delete(ticket);

  return res.status(200).json({
    success: true,
    token: record.token,
    admin: {
      email: record.email,
      role: "admin",
      type: "admin",
    },
  });
};
