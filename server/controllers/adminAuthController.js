import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendAdminLoginOtpEmail } from "../services/emailService.js";

// NOTE: In-memory OTP storage is temporary and may not persist between
// serverless invocations. Use Redis or a database for reliable OTP storage.
const otpStore = new Map();

const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

const getAdminEmail = () => normalizeEmail(process.env.ADMIN_EMAIL);

const getJwtSecret = () => String(process.env.ADMIN_JWT_SECRET || "");

const getGoogleStateSecret = () =>
  String(process.env.GOOGLE_STATE_SECRET || getJwtSecret());

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

const getClientUrl = () =>
  String(process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")[0]
    .trim()
    .replace(/\/+$/, "");

const createGoogleState = (nonce) =>
  jwt.sign(
    {
      type: "google-oauth-state",
      nonce,
    },
    getGoogleStateSecret(),
    { expiresIn: "5m" },
  );

const verifyGoogleState = (state) => {
  const decoded = jwt.verify(state, getGoogleStateSecret());

  if (
    decoded.type !== "google-oauth-state" ||
    typeof decoded.nonce !== "string" ||
    !/^[a-f0-9]{64}$/i.test(decoded.nonce)
  ) {
    throw new Error("Invalid Google OAuth state.");
  }

  return decoded;
};

const createGoogleLoginTicket = (email, nonce) =>
  jwt.sign(
    {
      type: "google-admin-ticket",
      email,
      nonce,
    },
    getGoogleStateSecret(),
    { expiresIn: "60s" },
  );

// ================= ADMIN EMAIL OTP LOGIN =================

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

    if (!adminEmail || !getJwtSecret()) {
      return res.status(500).json({
        success: false,
        message: "Admin authentication is not configured.",
      });
    }

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

    const hashesMatch = crypto.timingSafeEqual(
      Buffer.from(record.otpHash, "hex"),
      Buffer.from(submittedHash, "hex"),
    );

    if (!hashesMatch) {
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

// Step 1: Frontend requests the Google authorization URL.
// The frontend must send a cryptographically random 64-character nonce.

export const googleAdminLogin = async (req, res, next) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL;
    const nonce = String(req.query?.nonce || "");

    if (!clientId || !callbackUrl || !getGoogleStateSecret()) {
      return res.status(503).json({
        success: false,
        message: "Google login is not configured.",
      });
    }

    if (!/^[a-f0-9]{64}$/i.test(nonce)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Google login request. Please try again.",
      });
    }

    const state = createGoogleState(nonce);

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

// Step 2: Google redirects back to the backend callback.
// State is verified cryptographically; no state cookie is required.

export const googleAdminCallback = async (req, res) => {
  const clientUrl = getClientUrl();

  const failLogin = (message) =>
    res.redirect(
      `${clientUrl}/admin/login?google_error=${encodeURIComponent(message)}`,
    );

  try {
    const { code, state, error } = req.query;

    if (error || !code || !state || typeof state !== "string") {
      return failLogin("Google sign-in was cancelled or failed.");
    }

    let decodedState;

    try {
      decodedState = verifyGoogleState(state);
    } catch {
      return failLogin("Invalid login session. Please try again.");
    }

    const {
      GOOGLE_CLIENT_ID: clientId,
      GOOGLE_CLIENT_SECRET: clientSecret,
      GOOGLE_CALLBACK_URL: callbackUrl,
      ADMIN_EMAIL,
    } = process.env;

    if (
      !clientId ||
      !clientSecret ||
      !callbackUrl ||
      !ADMIN_EMAIL ||
      !getJwtSecret()
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

    // Signed, short-lived ticket works across serverless instances.
    const ticket = createGoogleLoginTicket(email, decodedState.nonce);

    return res.redirect(
      `${clientUrl}/admin/login?google_ticket=${encodeURIComponent(ticket)}&google_nonce=${encodeURIComponent(decodedState.nonce)}`,
    );
  } catch (error) {
    console.error("Google admin login error:", error.message);
    return failLogin("Google sign-in failed. Please try again.");
  }
};

// Step 3: Frontend exchanges the ticket for the admin JWT.

export const exchangeGoogleLoginTicket = (req, res) => {
  const ticket = String(req.body?.ticket || "");
  const nonce = String(req.body?.nonce || "");

  if (!ticket || !nonce || !/^[a-f0-9]{64}$/i.test(nonce)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Google login session. Please try again.",
    });
  }

  let decoded;

  try {
    decoded = jwt.verify(ticket, getGoogleStateSecret());
  } catch {
    return res.status(401).json({
      success: false,
      message: "Google login session expired. Please try again.",
    });
  }

  if (
    decoded.type !== "google-admin-ticket" ||
    !decoded.email ||
    !decoded.nonce ||
    decoded.nonce !== nonce
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid Google login session. Please try again.",
    });
  }

  const email = normalizeEmail(decoded.email);
  const adminEmail = getAdminEmail();

  if (!adminEmail || email !== adminEmail) {
    return res.status(403).json({
      success: false,
      message:
        "Access denied. This Google account is not registered as an admin.",
    });
  }

  if (!getJwtSecret()) {
    return res.status(500).json({
      success: false,
      message: "Admin authentication is not configured.",
    });
  }

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
};
