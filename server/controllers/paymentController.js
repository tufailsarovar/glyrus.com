// Glyrus — paymentController.js
import mongoose from "mongoose";

import Order from "../models/Order.js";

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  fetchRazorpayPayment,
} from "../services/razorpayService.js";

import { sendPaymentConfirmationEmail } from "../services/emailService.js";

import { calculateOrderPricing } from "../services/orderService.js";

const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const roundMoney = (value) => Math.round(toNumber(value) * 100) / 100;

const getOrderId = (body) => body?.orderId || body?.order_id || body?.id || "";

const getPaymentAmount = (order) => {
  const paymentMethod = String(order?.paymentMethod || "")
    .trim()
    .toUpperCase();

  if (paymentMethod === "COD") {
    return roundMoney(order?.pricing?.codCharge ?? 0);
  }

  return roundMoney(
    order?.pricing?.total ?? order?.totalAmount ?? order?.total ?? 0,
  );
};

const getCustomerEmail = (order) =>
  order?.customer?.email || order?.address?.email || "";

const isSameAmount = (first, second) =>
  Math.abs(toNumber(first) - toNumber(second)) < 0.01;

/* -------------------------------------------------------
   CREATE RAZORPAY ORDER
------------------------------------------------------- */

export const createPaymentOrder = async (req, res, next) => {
  try {
    const body = req.body || {};

    const orderId = getOrderId(body);

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Valid order ID is required.",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (!["RAZORPAY", "COD"].includes(order.paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "This order does not support online payment.",
      });
    }

    if (["Captured", "Refunded"].includes(order.payment?.status)) {
      return res.status(409).json({
        success: false,
        message: "Payment for this order has already been processed.",
      });
    }

    const amount = getPaymentAmount(order);

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount.",
      });
    }

    /*
     * Recalculate pricing from the database
     * before creating the Razorpay order.
     */
    if (Array.isArray(order.items) && order.items.length > 0) {
      const recalculated = await calculateOrderPricing({
        items: order.items.map((item) => ({
          productId: item.product,
          quantity: item.quantity,
          customization: item.customization,
        })),
        paymentMethod: order.paymentMethod,
      });

      if (!isSameAmount(recalculated.total, amount)) {
        order.pricing = {
          subtotal: recalculated.subtotal,
          discount: recalculated.discount,
          shipping: recalculated.shipping,
          codCharge: recalculated.codCharge,
          total: recalculated.total,
        };

        await order.save();
      }
    }

    const finalAmount = getPaymentAmount(order);

    if (finalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount.",
      });
    }

    let razorpayOrderId = order.payment?.razorpayOrderId;

    /*
     * Reuse an existing Razorpay order
     * while it is still pending/created.
     */
    if (
      !razorpayOrderId ||
      !["Created", "Pending"].includes(order.payment?.status)
    ) {
      const razorpayOrder = await createRazorpayOrder({
        amount: finalAmount,
        receipt: order.orderNumber,
        notes: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          trackingNumber: order.trackingNumber,
        },
      });

      razorpayOrderId = razorpayOrder.id;

      order.payment.razorpayOrderId = razorpayOrderId;

      order.payment.status = "Created";

      order.payment.amount = finalAmount;

      order.payment.currency = razorpayOrder.currency || "INR";

      await order.save();
    }

    return res.status(200).json({
      success: true,
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      razorpayOrderId,
      amount: Math.round(finalAmount * 100),
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID || "",
      customer: {
        name: order.customer?.name || "",
        email: order.customer?.email || "",
        mobile: order.customer?.mobile || "",
      },
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------
   VERIFY RAZORPAY PAYMENT
------------------------------------------------------- */

export const verifyPayment = async (req, res, next) => {
  try {
    const body = req.body || {};

    const orderId = getOrderId(body);

    const razorpayOrderId =
      body.razorpay_order_id || body.razorpayOrderId || "";

    const razorpayPaymentId =
      body.razorpay_payment_id || body.razorpayPaymentId || "";

    const razorpaySignature =
      body.razorpay_signature || body.razorpaySignature || "";

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Valid order ID is required.",
      });
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Complete Razorpay payment details are required.",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (!["RAZORPAY", "COD"].includes(order.paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "This order does not support online payment.",
      });
    }

    /*
     * Idempotency:
     * If the same payment was already captured,
     * return success without processing it again.
     */
    if (
      order.payment?.status === "Captured" &&
      order.payment?.razorpayPaymentId === razorpayPaymentId
    ) {
      return res.status(200).json({
        success: true,
        message: "Payment already verified.",
        orderNumber: order.orderNumber,
        trackingNumber: order.trackingNumber,
        paymentStatus: order.payment.status,
      });
    }

    if (
      order.payment?.razorpayOrderId &&
      order.payment.razorpayOrderId !== razorpayOrderId
    ) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order does not match this Glyrus order.",
      });
    }

    const signatureValid = verifyRazorpayPayment({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!signatureValid) {
      order.payment.status = "Failed";

      await order.save();

      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed.",
      });
    }

    /*
     * Fetch payment directly from Razorpay
     * and verify the actual captured amount.
     */
    const razorpayPayment = await fetchRazorpayPayment(razorpayPaymentId);

    const expectedAmount = Math.round(getPaymentAmount(order) * 100);

    const receivedAmount = Number(razorpayPayment?.amount);

    if (!Number.isFinite(receivedAmount) || receivedAmount !== expectedAmount) {
      order.payment.status = "Failed";

      await order.save();

      return res.status(400).json({
        success: false,
        message: "Payment amount does not match the order amount.",
      });
    }

    const paymentStatus = String(razorpayPayment?.status || "").toLowerCase();

    if (paymentStatus !== "captured") {
      order.payment.status =
        paymentStatus === "authorized" ? "Authorized" : "Failed";

      await order.save();

      return res.status(400).json({
        success: false,
        message: "Razorpay payment has not been captured.",
        paymentStatus,
      });
    }

    order.payment.status = "Captured";

    order.payment.method = "RAZORPAY";

    order.payment.razorpayOrderId = razorpayOrderId;

    order.payment.razorpayPaymentId = razorpayPaymentId;

    order.payment.razorpaySignature = razorpaySignature;

    order.payment.amount = getPaymentAmount(order);

    order.payment.currency = razorpayPayment.currency || "INR";

    order.payment.paidAt = new Date();

    /*
     * Payment is captured, so move the order
     * into the normal fulfilment workflow.
     */
    if (order.orderStatus === "Pending") {
      order.orderStatus = "Confirmed";
    }

    await order.save();

    try {
      await sendPaymentConfirmationEmail(order);
    } catch (emailError) {
      console.error("Payment confirmation email failed:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      orderNumber: order.orderNumber,
      trackingNumber: order.trackingNumber,
      paymentStatus: order.payment.status,
      orderStatus: order.orderStatus,
    });
  } catch (error) {
    next(error);
  }
};
