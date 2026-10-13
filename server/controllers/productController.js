// Glyrus — productController.js
import mongoose from "mongoose";
import Product from "../models/Product.js";

const sanitizeString = (value, maxLength = 5000) => {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, maxLength);
};

const normalizeProduct = (product) => {
  const item =
    typeof product.toObject === "function" ? product.toObject() : product;

  return {
    ...item,
    id: item.id || item._id?.toString(),
    image: item.image || item.images?.[0]?.url || "",
  };
};

export const getAllProducts = async (req, res, next) => {
  try {
    const { category, search, featured, limit = 50, page = 1 } = req.query;

    const filter = {
      isActive: true,
    };

    if (category && typeof category === "string") {
      filter.category = sanitizeString(category, 100);
    }

    if (featured === "true") {
      filter.isFeatured = true;
    }

    if (search && typeof search === "string") {
      const searchTerm = sanitizeString(search, 150);

      if (searchTerm) {
        filter.$text = {
          $search: searchTerm,
        };
      }
    }

    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);

    const safePage = Math.max(Number(page) || 1, 1);

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
      products: products.map(normalizeProduct),
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

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findOne({
      _id: id,
      isActive: true,
    }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      product: normalizeProduct(product),
    });
  } catch (error) {
    next(error);
  }
};
