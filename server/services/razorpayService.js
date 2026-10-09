// Glyrus — razorpayService.js
import Razorpay from "razorpay";
import crypto from "crypto";

const getRazorpay = () => {
  const keyId =
    process.env.RAZORPAY_KEY_ID;

  const keySecret =
    process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay credentials are not configured."
    );
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

export const createRazorpayOrder =
  async ({
    amount,
    receipt,
    notes = {},
  }) => {
    if (
      amount === undefined ||
      amount === null
    ) {
      throw new Error(
        "Razorpay amount is required."
      );
    }

    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      throw new Error(
        "Razorpay amount must be greater than zero."
      );
    }

    const razorpay = getRazorpay();

    const orderAmount = Math.round(
      numericAmount * 100
    );

    return razorpay.orders.create({
      amount: orderAmount,
      currency: "INR",
      receipt:
        receipt ||
        `Glyrus-${Date.now()}`,
      notes,
    });
  };

export const fetchRazorpayOrder =
  async (razorpayOrderId) => {
    if (!razorpayOrderId) {
      throw new Error(
        "Razorpay order ID is required."
      );
    }

    const razorpay = getRazorpay();

    return razorpay.orders.fetch(
      razorpayOrderId
    );
  };

export const fetchRazorpayPayment =
  async (razorpayPaymentId) => {
    if (!razorpayPaymentId) {
      throw new Error(
        "Razorpay payment ID is required."
      );
    }

    const razorpay = getRazorpay();

    return razorpay.payments.fetch(
      razorpayPaymentId
    );
  };

export const verifyRazorpayPayment =
  ({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  }) => {
    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return false;
    }

    const secret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      throw new Error(
        "RAZORPAY_KEY_SECRET is not configured."
      );
    }

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          secret
        )
        .update(
          `${razorpayOrderId}|${razorpayPaymentId}`
        )
        .digest("hex");

    const expectedBuffer =
      Buffer.from(
        generatedSignature,
        "utf8"
      );

    const receivedBuffer =
      Buffer.from(
        String(razorpaySignature),
        "utf8"
      );

    if (
      expectedBuffer.length !==
      receivedBuffer.length
    ) {
      return false;
    }

    return crypto.timingSafeEqual(
      expectedBuffer,
      receivedBuffer
    );
  };


export const refundRazorpayPayment =
  async ({
    paymentId,
    amount,
    notes = {},
  }) => {
    if (!paymentId) {
      throw new Error(
        "Razorpay payment ID is required."
      );
    }

    const razorpay = getRazorpay();

    const refundData = {
      notes,
    };

    if (
      amount !== undefined &&
      amount !== null
    ) {
      const numericAmount =
        Number(amount);

      if (
        !Number.isFinite(
          numericAmount
        ) ||
        numericAmount <= 0
      ) {
        throw new Error(
          "Refund amount must be greater than zero."
        );
      }

      refundData.amount =
        Math.round(
          numericAmount * 100
        );
    }

    return razorpay.payments.refund(
      paymentId,
      refundData
    );
  };

export default {
  createRazorpayOrder,
  fetchRazorpayOrder,
  fetchRazorpayPayment,
  verifyRazorpayPayment,
  refundRazorpayPayment,
};