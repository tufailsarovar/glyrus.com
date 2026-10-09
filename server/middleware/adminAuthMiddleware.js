// Glyrus — adminAuthMiddleware.js
import jwt from "jsonwebtoken";

const getTokenFromRequest = (req) => {
  const cookieToken = req.cookies?.adminToken;

  if (cookieToken) {
    return cookieToken;
  }

  const authorization =
    req.headers?.authorization;

  if (
    authorization &&
    authorization.startsWith("Bearer ")
  ) {
    return authorization.substring(7).trim();
  }

  return null;
};

export const adminAuthMiddleware = (
  req,
  res,
  next
) => {
  try {
    const token =
      getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Admin authentication required.",
      });
    }

    const secret =
      process.env.ADMIN_JWT_SECRET;

    if (!secret) {
      console.error(
        "ADMIN_JWT_SECRET is not configured."
      );

      return res.status(500).json({
        success: false,
        message:
          "Admin authentication is not configured.",
      });
    }

    const decoded = jwt.verify(
      token,
      secret
    );

    if (
      !decoded ||
      decoded.role !== "admin" ||
      decoded.type !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Invalid admin authorization.",
      });
    }

    req.admin = {
      role: decoded.role,
      type: decoded.type,
    };

    next();
  } catch (error) {
    if (
      error?.name ===
      "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Admin session has expired. Please login again.",
      });
    }

    if (
      error?.name ===
      "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid admin authentication token.",
      });
    }

    console.error(
      "Admin authentication error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to authenticate admin.",
    });
  }
};

export default adminAuthMiddleware;