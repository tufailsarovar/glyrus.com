// Glyrus — adminAuthController.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* -------------------------------------------------------
   ADMIN LOGIN
------------------------------------------------------- */

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    const adminEmail = String(
      process.env.ADMIN_EMAIL || ""
    )
      .trim()
      .toLowerCase();

    const adminPassword = String(
      process.env.ADMIN_PASSWORD || ""
    );

    const jwtSecret = String(
      process.env.ADMIN_JWT_SECRET || ""
    );

    if (
      !adminEmail ||
      !adminPassword ||
      !jwtSecret
    ) {
      return res.status(500).json({
        success: false,
        message:
          "Admin authentication is not properly configured.",
      });
    }

    const loginEmail = String(
      email || ""
    )
      .trim()
      .toLowerCase();

    const loginPassword = String(
      password || ""
    );

    if (!loginEmail || !loginPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    /* -----------------------------------------------
       EMAIL CHECK
    ------------------------------------------------ */

    if (loginEmail !== adminEmail) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid admin credentials.",
      });
    }

    /* -----------------------------------------------
       PASSWORD CHECK
    ------------------------------------------------ */

    let passwordMatches = false;

    const isBcryptPassword =
      adminPassword.startsWith("$2a$") ||
      adminPassword.startsWith("$2b$") ||
      adminPassword.startsWith("$2y$");

    if (isBcryptPassword) {
      passwordMatches =
        await bcrypt.compare(
          loginPassword,
          adminPassword
        );
    } else {
      passwordMatches =
        loginPassword === adminPassword;
    }

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid admin credentials.",
      });
    }

    /* -----------------------------------------------
       CREATE JWT
    ------------------------------------------------ */

    const token = jwt.sign(
      {
        role: "admin",
        type: "admin",
        email: adminEmail,
      },
      jwtSecret,
      {
        expiresIn: "1h",
      }
    );

    const isProduction =
      process.env.NODE_ENV === "production";

    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction
        ? "none"
        : "lax",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message:
        "Admin login successful.",

      token,

      admin: {
        email: adminEmail,
        role: "admin",
        type: "admin",
      },
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------
   ADMIN LOGOUT
------------------------------------------------------- */

export const adminLogout = async (
  req,
  res,
  next
) => {
  try {
    const isProduction =
      process.env.NODE_ENV === "production";

    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction
        ? "none"
        : "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message:
        "Admin logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------
   ADMIN PROFILE
------------------------------------------------------- */

export const getAdminProfile = async (
  req,
  res,
  next
) => {
  try {
    const adminEmail = String(
      process.env.ADMIN_EMAIL || ""
    )
      .trim()
      .toLowerCase();

    return res.status(200).json({
      success: true,
      admin: {
        email:
          req.admin?.email ||
          adminEmail,
        role:
          req.admin?.role ||
          "admin",
        type:
          req.admin?.type ||
          "admin",
      },
    });
  } catch (error) {
    next(error);
  }
};