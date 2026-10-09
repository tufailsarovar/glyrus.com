// Glyrus — adminController.js
import Settings from "../models/Settings.js";
import mongoose from "mongoose";

import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Request from "../models/Request.js";
import Contact from "../models/Contact.js";

import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";

import {
  sendOrderStatusEmail,
  sendCancellationRefundEmail,
} from "../services/emailService.js";

import {
  updateShippingInformation,
  updateTrackingNumber,
} from "../services/trackingService.js";

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */

const cleanString = (value, maxLength = 500) => {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, maxLength);
};

const parseNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/* -------------------------------------------------------
   DASHBOARD STATS
------------------------------------------------------- */

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalRequests,
      pendingRequests,
      totalMessages,
      unreadMessages,
    ] = await Promise.all([
      Product.countDocuments(),

      Product.countDocuments({
        isActive: true,
      }),

      Order.countDocuments(),

      Order.countDocuments({
        orderStatus: "Pending",
      }),

      Order.countDocuments({
        orderStatus: "Delivered",
      }),

      Request.countDocuments(),

      Request.countDocuments({
        status: "Pending",
      }),

      Contact.countDocuments(),

      Contact.countDocuments({
        status: "Unread",
      }),
    ]);

    /* ==========================================================
       UNIQUE CUSTOMERS
       ========================================================== */

    const customerResult = await Order.aggregate([
      {
        $match: {
          "customer.email": {
            $exists: true,
            $nin: ["", null],
          },
        },
      },
      {
        $group: {
          _id: "$customer.email",
        },
      },
      {
        $count: "total",
      },
    ]);

    const totalCustomers = customerResult[0]?.total || 0;

    /* ==========================================================
       REVENUE
       ========================================================== */

    const revenueResult = await Order.aggregate([
      {
        $match: {
          "payment.status": "Paid",
          orderStatus: {
            $nin: ["Cancelled", "Refunded"],
          },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $ifNull: ["$pricing.grandTotal", 0],
            },
          },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    /* ==========================================================
       RECENT ORDERS
       ========================================================== */

    const recentOrders = await Order.find({})
      .sort({
        createdAt: -1,
      })
      .limit(6)
      .select(
        [
          "_id",
          "orderNumber",
          "orderStatus",
          "payment",
          "pricing",
          "customer",
          "createdAt",
        ].join(" "),
      )
      .lean();

    /* ==========================================================
       RESPONSE
       ========================================================== */

    return res.status(200).json({
      success: true,

      stats: {
        totalProducts,
        activeProducts,

        totalOrders,
        pendingOrders,
        deliveredOrders,

        totalCustomers,

        totalRequests,
        pendingRequests,

        totalMessages,
        unreadMessages,

        totalRevenue,
      },

      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------
   ADMIN PRODUCTS
------------------------------------------------------- */

export const getAdminProducts = async (req, res, next) => {
  try {
    const { search, category, status, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (category) {
      filter.category = cleanString(category, 100);
    }

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    if (search) {
      const searchTerm = cleanString(search, 150);

      if (searchTerm) {
        filter.$or = [
          {
            title: {
              $regex: searchTerm,
              $options: "i",
            },
          },
          {
            sku: {
              $regex: searchTerm,
              $options: "i",
            },
          },
          {
            category: {
              $regex: searchTerm,
              $options: "i",
            },
          },
        ];
      }
    }

    const safePage = Math.max(Number(page) || 1, 1);

    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const skip = (safePage - 1) * safeLimit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({
          sortOrder: 1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(safeLimit)
        .lean(),

      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------
   CREATE PRODUCT
------------------------------------------------------- */

export const createProduct = async (req, res, next) => {
  try {
    const body = req.body || {};

    const title = cleanString(body.title, 200);

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Product title is required.",
      });
    }

    const price = parseNumber(body.price, NaN);

    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid product price.",
      });
    }

    const discountPrice =
  body.discountPrice !== undefined &&
  body.discountPrice !== ""
    ? parseNumber(body.discountPrice, NaN)
    : 0;

if (
  !Number.isFinite(discountPrice) ||
  discountPrice < 0 ||
  discountPrice > price
) {
  return res.status(400).json({
    success: false,
    message:
      "Discount price must be greater than or equal to 0 and cannot exceed the product price.",
  });
}

    const compareAtPrice =
      body.compareAtPrice !== undefined && body.compareAtPrice !== ""
        ? parseNumber(body.compareAtPrice, NaN)
        : undefined;

    if (
      compareAtPrice !== undefined &&
      (!Number.isFinite(compareAtPrice) || compareAtPrice < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid compare-at price.",
      });
    }

    const stock = Math.max(Math.floor(parseNumber(body.stock, 0)), 0);

    const techStack = Array.isArray(body.techStack)
      ? body.techStack.map((item) => cleanString(item, 100)).filter(Boolean)
      : typeof body.techStack === "string"
        ? body.techStack
            .split(",")
            .map((item) => cleanString(item, 100))
            .filter(Boolean)
        : [];

    const features = Array.isArray(body.features)
      ? body.features.map((item) => cleanString(item, 300)).filter(Boolean)
      : typeof body.features === "string"
        ? body.features
            .split("\n")
            .map((item) => cleanString(item, 300))
            .filter(Boolean)
        : [];

    const images = [];

    const uploadedFiles = Array.isArray(req.files?.images)
      ? req.files.images
      : [];

    for (const file of uploadedFiles) {
      const uploaded = await uploadToCloudinary(file.buffer, {
        folder: "Glyrus/products",
        resource_type: "image",
      });

      if (uploaded?.secure_url) {
        images.push({
          url: uploaded.secure_url,
          publicId: uploaded.public_id,
        });
      }
    }
    const product = await Product.create({
      title,
      category: cleanString(body.category, 100),
      description: cleanString(body.description, 5000),
      shortDescription: cleanString(body.shortDescription, 500),
      price,
      discountPrice,
      ...(compareAtPrice !== undefined
        ? {
            compareAtPrice,
          }
        : {}),
      stock,
      sku: cleanString(body.sku, 100) || undefined,
      images,
      video: cleanString(body.video, 500),
      techStack,
      features,
      customizationEnabled:
        body.customizationEnabled === true ||
        body.customizationEnabled === "true",
      customizationOptions: body.customizationOptions || {},
      isFeatured: body.isFeatured === true || body.isFeatured === "true",
      isActive:
        body.isActive !== false && body.isActive !== "false" ? true : false,
      sortOrder: Math.floor(parseNumber(body.sortOrder, 0)),
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------
   UPDATE PRODUCT
------------------------------------------------------- */

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const body = req.body || {};

    if (body.title !== undefined) {
      product.title = cleanString(body.title, 200);
    }

    if (body.category !== undefined) {
      product.category = cleanString(body.category, 100);
    }

    if (body.description !== undefined) {
      product.description = cleanString(body.description, 5000);
    }

    if (body.shortDescription !== undefined) {
      product.shortDescription = cleanString(body.shortDescription, 500);
    }

    if (body.price !== undefined) {
      const price = parseNumber(body.price, NaN);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid product price.",
        });
      }

      product.price = price;
    }

    if (body.discountPrice !== undefined) {
  if (
    body.discountPrice === "" ||
    body.discountPrice === null
  ) {
    product.discountPrice = 0;
  } else {
    const discountPrice = parseNumber(
      body.discountPrice,
      NaN
    );

    if (
      !Number.isFinite(discountPrice) ||
      discountPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount price.",
      });
    }

    const currentPrice = Number(product.price) || 0;

    if (discountPrice > currentPrice) {
      return res.status(400).json({
        success: false,
        message:
          "Discount price cannot exceed the product price.",
      });
    }

    product.discountPrice = discountPrice;
  }
}

    if (body.compareAtPrice !== undefined) {
      if (body.compareAtPrice === "" || body.compareAtPrice === null) {
        product.compareAtPrice = undefined;
      } else {
        const compareAtPrice = parseNumber(body.compareAtPrice, NaN);

        if (!Number.isFinite(compareAtPrice) || compareAtPrice < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid compare-at price.",
          });
        }

        product.compareAtPrice = compareAtPrice;
      }
    }

    if (body.stock !== undefined) {
      const stock = parseNumber(body.stock, NaN);

      if (!Number.isFinite(stock) || stock < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid stock quantity.",
        });
      }

      product.stock = Math.floor(stock);
    }

    if (body.sku !== undefined) {
      product.sku = cleanString(body.sku, 100);
    }

    if (body.video !== undefined) {
      product.video = cleanString(body.video, 500);
    }

    if (body.techStack !== undefined) {
      product.techStack = Array.isArray(body.techStack)
        ? body.techStack.map((item) => cleanString(item, 100)).filter(Boolean)
        : String(body.techStack)
            .split(",")
            .map((item) => cleanString(item, 100))
            .filter(Boolean);
    }

    if (body.features !== undefined) {
      product.features = Array.isArray(body.features)
        ? body.features.map((item) => cleanString(item, 300)).filter(Boolean)
        : String(body.features)
            .split("\n")
            .map((item) => cleanString(item, 300))
            .filter(Boolean);
    }

    if (body.customizationEnabled !== undefined) {
      product.customizationEnabled =
        body.customizationEnabled === true ||
        body.customizationEnabled === "true";
    }

    if (body.customizationOptions !== undefined) {
      product.customizationOptions = body.customizationOptions;
    }

    if (body.isFeatured !== undefined) {
      product.isFeatured =
        body.isFeatured === true || body.isFeatured === "true";
    }

    if (body.isActive !== undefined) {
      product.isActive = body.isActive === true || body.isActive === "true";
    }

    if (body.sortOrder !== undefined) {
      product.sortOrder = Math.floor(parseNumber(body.sortOrder, 0));
    }

    /* ---------------------------------------------------
   NEW IMAGES → CLOUDINARY
--------------------------------------------------- */

    const uploadedFiles = Array.isArray(req.files?.images)
      ? req.files.images
      : [];

    if (uploadedFiles.length > 0) {
      if (!Array.isArray(product.images)) {
        product.images = [];
      }

      for (const file of uploadedFiles) {
        const uploaded = await uploadToCloudinary(file.buffer, {
          folder: "Glyrus/products",
          resource_type: "image",
        });

        if (uploaded?.secure_url) {
          product.images.push({
            url: uploaded.secure_url,
            publicId: uploaded.public_id,
          });
        }
      }
    }

    /* ---------------------------------------------------
         IMAGE REMOVAL
      --------------------------------------------------- */

    if (body.removeImageIds) {
      let removeIds = [];

      try {
        removeIds = Array.isArray(body.removeImageIds)
          ? body.removeImageIds
          : JSON.parse(body.removeImageIds);
      } catch {
        removeIds = [];
      }

      if (Array.isArray(removeIds)) {
        const idsToRemove = removeIds
          .filter((id) => typeof id === "string")
          .map((id) => id.trim())
          .filter(Boolean);

        for (const publicId of idsToRemove) {
          try {
            await deleteFromCloudinary(publicId);
          } catch (cloudinaryError) {
            console.error("Cloudinary image deletion failed:", cloudinaryError);
          }
        }

        product.images = product.images.filter(
          (image) => !idsToRemove.includes(image.publicId),
        );
      }
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------
   DELETE PRODUCT
------------------------------------------------------- */

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (Array.isArray(product.images)) {
      for (const image of product.images) {
        if (image.publicId) {
          try {
            await deleteFromCloudinary(image.publicId);
          } catch (cloudinaryError) {
            console.error("Cloudinary image deletion failed:", cloudinaryError);
          }
        }
      }
    }

    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------
   GET ADMIN ORDERS
------------------------------------------------------- */

export const getAdminOrders = async (req, res, next) => {
  try {
    const {
      status,
      paymentStatus,
      search,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    /* -------------------------------------------------------
   DATE FILTER
------------------------------------------------------- */

    if (dateFrom || dateTo) {
      const createdAtFilter = {};

      if (dateFrom) {
        const parsedFrom = new Date(dateFrom);

        if (!Number.isNaN(parsedFrom.getTime())) {
          createdAtFilter.$gte = parsedFrom;
        }
      }

      if (dateTo) {
        const parsedTo = new Date(dateTo);

        if (!Number.isNaN(parsedTo.getTime())) {
          createdAtFilter.$lt = parsedTo;
        }
      }

      if (Object.keys(createdAtFilter).length > 0) {
        filter.createdAt = createdAtFilter;
      }
    }

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Customization",
      "Production",
      "Packed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
      "Returned",
      "Refunded",
    ];

    if (status && allowedStatuses.includes(status)) {
      filter.orderStatus = status;
    }

    if (paymentStatus) {
      filter["payment.status"] = cleanString(paymentStatus, 50);
    }

    if (search) {
      const searchTerm = cleanString(search, 150);

      if (searchTerm) {
        filter.$or = [
          {
            orderNumber: {
              $regex: searchTerm,
              $options: "i",
            },
          },
          {
            trackingNumber: {
              $regex: searchTerm,
              $options: "i",
            },
          },
          {
            "customer.name": {
              $regex: searchTerm,
              $options: "i",
            },
          },
          {
            "customer.email": {
              $regex: searchTerm,
              $options: "i",
            },
          },
          {
            "customer.mobile": {
              $regex: searchTerm,
              $options: "i",
            },
          },
        ];
      }
    }

    const safePage = Math.max(Number(page) || 1, 1);

    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const skip = (safePage - 1) * safeLimit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(safeLimit)
        .lean(),

      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------
   GET ADMIN ORDER DETAILS
------------------------------------------------------- */

export const getAdminOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findById(id).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------
   DELETE ADMIN ORDER
------------------------------------------------------- */

export const deleteAdminOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully.",
      orderId: id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------
   DELETE ALL ORDERS
------------------------------------------------------- */

export const deleteAllOrders = async (req, res, next) => {
  try {
    const result = await Order.deleteMany({});

    return res.status(200).json({
      success: true,
      message:
        result.deletedCount > 0
          ? `${result.deletedCount} order(s) deleted successfully.`
          : "No orders found to delete.",
      deletedCount: result.deletedCount || 0,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------
   UPDATE ORDER STATUS
------------------------------------------------------- */

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { status, notes } = req.body || {};

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Customization",
      "Production",
      "Packed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
      "Returned",
      "Refunded",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const previousStatus = order.orderStatus;

    order.orderStatus = status;

    if (notes !== undefined) {
      order.notes = cleanString(notes, 2000);
    }

    await order.save();

    if (previousStatus !== status && order.customer?.email) {
      try {
        await sendOrderStatusEmail(order, previousStatus, status);
      } catch (emailError) {
        console.error("Order status email failed:", emailError);
      }
    }

    if (
      ["Cancelled", "Refunded"].includes(status) &&
      previousStatus !== status &&
      order.customer?.email
    ) {
      try {
        await sendCancellationRefundEmail(order, status);
      } catch (emailError) {
        console.error("Cancellation/refund email failed:", emailError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------
   UPDATE ORDER SHIPPING
------------------------------------------------------- */

export const updateOrderShipping = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const { courier, trackingId, trackingUrl, estimatedDelivery, notes } =
      req.body || {};

    const shippingInformation = {
      courier: cleanString(courier, 150),

      trackingId: cleanString(trackingId, 150),

      trackingUrl: cleanString(trackingUrl, 500),

      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,

      notes: cleanString(notes, 1000),
    };

    if (shippingInformation.trackingUrl) {
      try {
        const url = new URL(shippingInformation.trackingUrl);

        if (!["http:", "https:"].includes(url.protocol)) {
          return res.status(400).json({
            success: false,
            message: "Tracking URL must use HTTP or HTTPS.",
          });
        }
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid tracking URL.",
        });
      }
    }

    const order = await updateShippingInformation(id, shippingInformation);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Shipping information updated successfully.",
      order,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------
   UPDATE ORDER TRACKING NUMBER
------------------------------------------------------- */

export const updateAdminTrackingNumber = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trackingNumber = cleanString(
      req.body?.trackingNumber,
      100,
    ).toUpperCase();

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    if (!trackingNumber) {
      return res.status(400).json({
        success: false,
        message: "Tracking number is required.",
      });
    }

    const order = await updateTrackingNumber(id, trackingNumber);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tracking number updated successfully.",
      order,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------
   GET CUSTOMERS
------------------------------------------------------- */

export const getCustomers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    const match = {};

    if (search) {
      const searchTerm = cleanString(search, 150);

      if (searchTerm) {
        match.$or = [
          {
            "customer.name": {
              $regex: searchTerm,
              $options: "i",
            },
          },
          {
            "customer.email": {
              $regex: searchTerm,
              $options: "i",
            },
          },
          {
            "customer.mobile": {
              $regex: searchTerm,
              $options: "i",
            },
          },
        ];
      }
    }

    const safePage = Math.max(Number(page) || 1, 1);

    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const skip = (safePage - 1) * safeLimit;

    const customers = await Order.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: {
            email: "$customer.email",
          },
          name: {
            $last: "$customer.name",
          },
          email: {
            $last: "$customer.email",
          },
          mobile: {
            $last: "$customer.mobile",
          },
          totalOrders: {
            $sum: 1,
          },
          totalSpent: {
            $sum: {
              $cond: [
                {
                  $in: ["$orderStatus", ["Cancelled", "Refunded"]],
                },
                0,
                "$pricing.grandTotal",
              ],
            },
          },
          lastOrderAt: {
            $max: "$createdAt",
          },
        },
      },
      {
        $sort: {
          lastOrderAt: -1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: safeLimit,
      },
    ]);

    const countResult = await Order.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: "$customer.email",
        },
      },
      {
        $count: "total",
      },
    ]);

    const total = countResult[0]?.total || 0;

    return res.status(200).json({
      success: true,
      customers,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------
   GET REQUESTS
------------------------------------------------------- */

export const getRequests = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const filter = {};

    const allowedStatuses = [
      "Pending",
      "Contacted",
      "Processing",
      "Completed",
      "Rejected",
    ];

    if (status && allowedStatuses.includes(status)) {
      filter.status = status;
    }

    if (search) {
      const searchTerm = cleanString(search, 150);

      if (searchTerm) {
        filter.$or = [
          {
            name: {
              $regex: searchTerm,
              $options: "i",
            },
          },
          {
            email: {
              $regex: searchTerm,
              $options: "i",
            },
          },
          {
            mobile: {
              $regex: searchTerm,
              $options: "i",
            },
          },
          {
            requirement: {
              $regex: searchTerm,
              $options: "i",
            },
          },
        ];
      }
    }

    const safePage = Math.max(Number(page) || 1, 1);

    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const skip = (safePage - 1) * safeLimit;

    const [requests, total] = await Promise.all([
      Request.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(safeLimit)
        .lean(),

      Request.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      requests,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------
   GET REQUEST BY ID
------------------------------------------------------- */

export const getRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID.",
      });
    }

    const request = await Request.findById(id).lean();

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------
   UPDATE REQUEST
------------------------------------------------------- */

export const updateRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID.",
      });
    }

    const update = {};

    if (req.body?.status !== undefined) {
      const allowedStatuses = [
        "Pending",
        "Contacted",
        "Processing",
        "Completed",
        "Rejected",
      ];

      if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid request status.",
        });
      }

      update.status = req.body.status;
    }

    if (req.body?.adminNotes !== undefined) {
      update.adminNotes = cleanString(req.body.adminNotes, 2000);
    }

    const request = await Request.findByIdAndUpdate(
      id,
      {
        $set: update,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Request updated successfully.",
      request,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------
   DELETE REQUEST
------------------------------------------------------- */

export const deleteRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID.",
      });
    }

    const request = await Request.findByIdAndDelete(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Request deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------
   GET CONTACT MESSAGES
------------------------------------------------------- */

export const getMessages = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const filter = {};

    const allowedStatuses = ["Unread", "Read", "Replied", "Closed"];

    if (status && allowedStatuses.includes(status)) {
      filter.status = status;
    }

    if (search) {
      const searchTerm = cleanString(search, 150);

      if (searchTerm) {
        filter.$or = [
          {
            name: {
              $regex: searchTerm,
              $options: "i",
            },
          },
          {
            email: {
              $regex: searchTerm,
              $options: "i",
            },
          },
          {
            mobile: {
              $regex: searchTerm,
              $options: "i",
            },
          },
          {
            subject: {
              $regex: searchTerm,
              $options: "i",
            },
          },
          {
            message: {
              $regex: searchTerm,
              $options: "i",
            },
          },
        ];
      }
    }

    const safePage = Math.max(Number(page) || 1, 1);

    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const skip = (safePage - 1) * safeLimit;

    const [messages, total] = await Promise.all([
      Contact.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(safeLimit)
        .lean(),

      Contact.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      messages,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------
   UPDATE MESSAGE
------------------------------------------------------- */

export const updateMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    const update = {};

    if (req.body?.status !== undefined) {
      const allowedStatuses = ["Unread", "Read", "Replied", "Closed"];

      if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid message status.",
        });
      }

      update.status = req.body.status;

      if (req.body.status === "Replied") {
        update.repliedAt = new Date();
      }
    }

    if (req.body?.adminReply !== undefined) {
      update.adminReply = cleanString(req.body.adminReply, 3000);

      if (update.adminReply) {
        update.status = "Replied";

        update.repliedAt = new Date();
      }
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      {
        $set: update,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message updated successfully.",
      contact,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------
   DELETE MESSAGE
------------------------------------------------------- */

export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------
   ADMIN SETTINGS
------------------------------------------------------- */

const DEFAULT_SETTINGS = {
  key: "store",
  storeName: "Glyrus",
  supportEmail: "",
  supportPhone: "",
  codEnabled: true,
  codCharge: 49,
  freeShippingThreshold: 999,
  shippingCharge: 79,
  razorpayEnabled: true,
  orderEmailEnabled: true,
  shippingEmailEnabled: true,
};

/* -------------------------------------------------------
   GET SETTINGS
------------------------------------------------------- */

export const getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { key: "store" },
      {
        $setOnInsert: DEFAULT_SETTINGS,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    ).lean();

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------
   UPDATE SETTINGS
------------------------------------------------------- */

export const updateSettings = async (req, res, next) => {
  try {
    const body = req.body || {};

    const update = {};

    if (body.storeName !== undefined) {
      update.storeName = cleanString(body.storeName, 200);
    }

    if (body.supportEmail !== undefined) {
      update.supportEmail = cleanString(body.supportEmail, 200).toLowerCase();
    }

    if (body.supportPhone !== undefined) {
      update.supportPhone = cleanString(body.supportPhone, 50);
    }

    if (body.codEnabled !== undefined) {
      update.codEnabled =
        body.codEnabled === true || body.codEnabled === "true";
    }

    if (body.codCharge !== undefined) {
      const codCharge = parseNumber(body.codCharge, NaN);

      if (!Number.isFinite(codCharge) || codCharge < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid COD charge.",
        });
      }

      update.codCharge = codCharge;
    }

    if (body.freeShippingThreshold !== undefined) {
      const threshold = parseNumber(body.freeShippingThreshold, NaN);

      if (!Number.isFinite(threshold) || threshold < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid free shipping threshold.",
        });
      }

      update.freeShippingThreshold = threshold;
    }

    if (body.shippingCharge !== undefined) {
      const shippingCharge = parseNumber(body.shippingCharge, NaN);

      if (!Number.isFinite(shippingCharge) || shippingCharge < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid shipping charge.",
        });
      }

      update.shippingCharge = shippingCharge;
    }

    if (body.razorpayEnabled !== undefined) {
      update.razorpayEnabled =
        body.razorpayEnabled === true || body.razorpayEnabled === "true";
    }

    if (body.orderEmailEnabled !== undefined) {
      update.orderEmailEnabled =
        body.orderEmailEnabled === true || body.orderEmailEnabled === "true";
    }

    if (body.shippingEmailEnabled !== undefined) {
      update.shippingEmailEnabled =
        body.shippingEmailEnabled === true ||
        body.shippingEmailEnabled === "true";
    }

    const insertDefaults = Object.fromEntries(
      Object.entries(DEFAULT_SETTINGS).filter(
        ([field]) => !Object.prototype.hasOwnProperty.call(update, field),
      ),
    );

    const settings = await Settings.findOneAndUpdate(
      {
        key: "store",
      },
      {
        $set: update,
        $setOnInsert: insertDefaults,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    ).lean();

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully.",
      settings,
    });
  } catch (error) {
    next(error);
  }
};
