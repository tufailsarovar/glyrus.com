// Glyrus — rateLimitMiddleware.js
import rateLimit from "express-rate-limit";

const createLimiter = ({
  windowMs,
  max,
  message,
}) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      return res.status(429).json({
        success: false,
        message,
      });
    },
  });

export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: Number(
    process.env.AUTH_RATE_LIMIT || 10
  ),
  message:
    "Too many login attempts. Please try again later.",
});

export const orderLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: Number(
    process.env.ORDER_RATE_LIMIT || 30
  ),
  message:
    "Too many order requests. Please try again later.",
});

export const paymentLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: Number(
    process.env.PAYMENT_RATE_LIMIT || 20
  ),
  message:
    "Too many payment requests. Please try again later.",
});

export const contactLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: Number(
    process.env.CONTACT_RATE_LIMIT || 10
  ),
  message:
    "Too many messages submitted. Please try again later.",
});

export const requestLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: Number(
    process.env.REQUEST_RATE_LIMIT || 10
  ),
  message:
    "Too many requests submitted. Please try again later.",
});

export const trackingLimiter = createLimiter({
  windowMs: 5 * 60 * 1000,
  max: Number(
    process.env.TRACKING_RATE_LIMIT || 60
  ),
  message:
    "Too many tracking requests. Please try again later.",
});

export const adminLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: Number(
    process.env.ADMIN_RATE_LIMIT || 100
  ),
  message:
    "Too many admin requests. Please try again later.",
});

export default {
  authLimiter,
  orderLimiter,
  paymentLimiter,
  contactLimiter,
  requestLimiter,
  trackingLimiter,
  adminLimiter,
};