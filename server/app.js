// Glyrus — app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import trackingRoutes from "./routes/trackingRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import connectDB from "./config/db.js";
const app = express();

/* -------------------------------------------------------
   TRUST PROXY
------------------------------------------------------- */

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

/* -------------------------------------------------------
   SECURITY
------------------------------------------------------- */

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

/* -------------------------------------------------------
   CORS
------------------------------------------------------- */

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests and tools
      // that do not send an Origin header.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS."));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

/* -------------------------------------------------------
   BODY PARSING
------------------------------------------------------- */

app.use(
  express.json({
    limit: "2mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  }),
);

app.use(cookieParser());

/* -------------------------------------------------------
   GLOBAL RATE LIMIT
------------------------------------------------------- */

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.GLOBAL_RATE_LIMIT || 300),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use(globalLimiter);

/* -------------------------------------------------------
   HEALTH CHECK
------------------------------------------------------- */

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Glyrus API is running.",
    timestamp: new Date().toISOString(),
  });
});

/* -------------------------------------------------------
   DATABASE CONNECTION — VERCEL
------------------------------------------------------- */

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(503).json({
      success: false,
      message: "Database connection unavailable.",
    });
  }
});

/* -------------------------------------------------------
   API ROUTES
------------------------------------------------------- */

// Public routes
app.use("/api/products", productRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/requests", requestRoutes);

app.use("/api/contact", contactRoutes);

app.use("/api/tracking", trackingRoutes);

// Admin authentication
app.use("/api/admin/auth", adminAuthRoutes);

app.get("/api/settings", async (req, res, next) => {
  try {
    const Settings = (await import("./models/Settings.js")).default;

    const settings = await Settings.findOne({
      key: "store",
    }).lean();

    return res.status(200).json({
      success: true,
      settings: settings || {
        shippingCharge: 79,
        freeShippingThreshold: 999,
        codEnabled: true,
        razorpayEnabled: true,
      },
    });
  } catch (error) {
    next(error);
  }
});
// Protected admin routes
app.use("/api/admin", adminRoutes);

/* -------------------------------------------------------
   404 HANDLER
------------------------------------------------------- */

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "API route not found.",
    path: req.originalUrl,
  });
});

/* -------------------------------------------------------
   ERROR HANDLER
------------------------------------------------------- */

app.use((error, req, res, next) => {
  console.error("API Error:", error);

  if (error?.message === "Not allowed by CORS.") {
    return res.status(403).json({
      success: false,
      message: "Request origin is not allowed.",
    });
  }

  if (error?.name === "ValidationError") {
    const errors = Object.values(error.errors || {}).map(
      (item) => item.message,
    );

    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors,
    });
  }

  if (error?.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid resource ID.",
    });
  }

  if (error?.code === 11000) {
    const duplicateFields = Object.keys(error.keyPattern || {});

    return res.status(409).json({
      success: false,
      message:
        duplicateFields.length > 0
          ? `Duplicate value for: ${duplicateFields.join(", ")}.`
          : "A record with this value already exists.",
    });
  }

  if (error?.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: error.message || "File upload failed.",
    });
  }

  const statusCode = Number(error?.statusCode) || Number(error?.status) || 500;

  return res
    .status(statusCode >= 400 && statusCode < 600 ? statusCode : 500)
    .json({
      success: false,
      message:
        statusCode >= 500
          ? "Internal server error."
          : error?.message || "Something went wrong.",
    });
});

export default app;
