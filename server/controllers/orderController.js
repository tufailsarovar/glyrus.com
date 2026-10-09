// Glyrus — orderController.js
import mongoose from "mongoose";

import Order from "../models/Order.js";
import Product from "../models/Product.js";

import {
  createOrderData,
  calculateOrderPricing,
} from "../services/orderService.js";

import { sendOrderConfirmationEmail } from "../services/emailService.js";

const sanitizeString = (value, maxLength = 500) => {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, maxLength);
};

const normalizeCustomer = (customer = {}, address = {}) => {
  const source =
    customer && typeof customer === "object" && Object.keys(customer).length > 0
      ? customer
      : address;

  return {
    name: sanitizeString(source.name, 100),

    email: sanitizeString(source.email, 150).toLowerCase(),

    mobile: sanitizeString(source.mobile, 20),
  };
};

const normalizeAddress = (address = {}, customer = {}) => ({
  name: sanitizeString(address.name, 100) || sanitizeString(customer.name, 100),

  email:
    sanitizeString(address.email, 150).toLowerCase() ||
    sanitizeString(customer.email, 150).toLowerCase(),

  mobile:
    sanitizeString(address.mobile, 20) || sanitizeString(customer.mobile, 20),

  house: sanitizeString(address.house || address.houseFlat, 200),

  street: sanitizeString(address.street, 250),

  area: sanitizeString(address.area, 250),

  city: sanitizeString(address.city, 100),

  state: sanitizeString(address.state, 100),

  pincode: sanitizeString(address.pincode, 10),
});

const validateCustomer = (customer) => {
  const errors = {};

  if (!customer.name || customer.name.length < 2) {
    errors.name = "Name is required.";
  }

  if (!customer.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    errors.email = "A valid email address is required.";
  }

  const mobile = customer.mobile.replace(/\s+/g, "");

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    errors.mobile = "A valid 10-digit mobile number is required.";
  }

  return errors;
};

const validateAddress = (address) => {
  const errors = {};

  const requiredFields = [
    ["house", "House/Flat"],
    ["street", "Street"],
    ["area", "Area"],
    ["city", "City"],
    ["state", "State"],
    ["pincode", "Pincode"],
  ];

  requiredFields.forEach(([field, label]) => {
    if (!address[field]) {
      errors[field] = `${label} is required.`;
    }
  });

  if (address.pincode && !/^\d{6}$/.test(address.pincode)) {
    errors.pincode = "Pincode must contain 6 digits.";
  }

  return errors;
};

const validateItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return "At least one product is required.";
  }

  if (items.length > 50) {
    return "Too many products in one order.";
  }

  for (const item of items) {
    if (!item || !(item.productId || item._id || item.id)) {
      return "Every cart item must contain a product ID.";
    }

    const quantity = Number(item.quantity);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      return "Product quantity must be between 1 and 100.";
    }
  }

  return null;
};

const getOrderResponse = (order) => ({
  success: true,
  order: {
    id: order._id?.toString() || order.id,

    orderNumber: order.orderNumber,

    trackingNumber: order.trackingNumber,

    customer: order.customer,

    address: order.address,

    items: order.items,

    pricing: order.pricing,

    paymentMethod: order.paymentMethod,

    payment: {
      status: order.payment?.status,

      method: order.payment?.method,

      razorpayOrderId: order.payment?.razorpayOrderId || "",
    },

    orderStatus: order.orderStatus,

    shippingInformation: order.shippingInformation,

    notes: order.notes || "",

    createdAt: order.createdAt,

    updatedAt: order.updatedAt,
  },
});

export const createOrder = async (req, res, next) => {
  try {
    const body = req.body || {};

    const customerInput = body.customer || {};

    const addressInput = body.address || {};

    const customer = normalizeCustomer(customerInput, addressInput);

    const address = normalizeAddress(addressInput, customer);

    const items = Array.isArray(body.items) ? body.items : [];

    const paymentMethod = String(body.paymentMethod || "COD")
      .trim()
      .toUpperCase();

    const itemError = validateItems(items);

    if (itemError) {
      return res.status(400).json({
        success: false,
        message: itemError,
      });
    }

    const customerErrors = validateCustomer(customer);

    const addressErrors = validateAddress(address);

    if (
      Object.keys(customerErrors).length > 0 ||
      Object.keys(addressErrors).length > 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid customer and delivery details.",
        errors: {
          customer: customerErrors,
          address: addressErrors,
        },
      });
    }

    if (!["COD", "RAZORPAY"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method.",
      });
    }

    const orderData = await createOrderData({
      customer,
      address,
      items,
      paymentMethod,
      couponCode: typeof body.couponCode === "string" ? body.couponCode : "",
      notes: typeof body.notes === "string" ? body.notes : "",
    });

    /*
     * Pricing is calculated completely
     * from the current database products.
     * Frontend prices are never trusted.
     */
    const order = await Order.create(orderData);

    /*
     * Reduce stock only after the order
     * has been successfully created.
     */
    for (const item of order.items) {
      const product = await Product.findById(item.product);

      if (!product) {
        await Order.findByIdAndDelete(order._id);

        return res.status(409).json({
          success: false,
          message: "A product became unavailable while creating the order.",
        });
      }

      if (product.stock !== undefined && product.stock !== null) {
        if (product.stock < item.quantity) {
          await Order.findByIdAndDelete(order._id);

          return res.status(409).json({
            success: false,
            message: `${product.title} is no longer available in the requested quantity.`,
          });
        }

        product.stock -= item.quantity;

        await product.save();
      }
    }

    // Send order confirmation email only for COD.
    // Razorpay orders receive their single confirmation
    // email after successful payment verification.
    if (paymentMethod === "COD") {
      try {
        await sendOrderConfirmationEmail(order);
      } catch (emailError) {
        console.error("Order confirmation email failed:", emailError);
      }
    }

    return res.status(201).json(getOrderResponse(order));
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findById(id)
      .populate("items.product", "title category image images")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json(getOrderResponse(order));
  } catch (error) {
    next(error);
  }
};
