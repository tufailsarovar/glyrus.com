// Glyrus — trackingService.js

import mongoose from "mongoose";
import Order from "../models/Order.js";

/* =======================================================
   ORDER STATUSES
======================================================= */

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Customization",
  "Production",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const OPTIONAL_STATUSES = [
  "Cancelled",
  "Returned",
  "Refunded",
];

const ALL_STATUSES = [
  ...ORDER_STATUSES,
  ...OPTIONAL_STATUSES,
];

/* =======================================================
   STATUS DESCRIPTIONS
======================================================= */

const STATUS_DESCRIPTIONS = {
  Pending:
    "Your order has been received and is awaiting confirmation.",

  Confirmed:
    "Your order has been confirmed and is being prepared.",

  Customization:
    "Your NFC product customization is being processed.",

  Production:
    "Your customized product is currently in production.",

  Packed:
    "Your order has been packed and is ready for shipment.",

  Shipped:
    "Your order has been shipped and is on its way.",

  "Out for Delivery":
    "Your order is out for delivery.",

  Delivered:
    "Your order has been delivered successfully.",

  Cancelled:
    "Your order has been cancelled.",

  Returned:
    "Your order has been returned.",

  Refunded:
    "Your order has been refunded.",
};

/* =======================================================
   STATUS INDEX
======================================================= */

const STATUS_INDEX = new Map(
  ORDER_STATUSES.map(
    (status, index) => [
      status,
      index,
    ]
  )
);

/* =======================================================
   HELPERS
======================================================= */

const cleanTrackingNumber = (
  trackingNumber
) => {
  if (
    typeof trackingNumber !==
    "string"
  ) {
    return "";
  }

  return trackingNumber
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
};

const isValidTrackingFormat = (
  trackingNumber
) =>
  /^GLYRUS-[A-Z0-9]{6}$/.test(
    trackingNumber
  );

const isValidOrderId = (
  orderId
) =>
  mongoose.Types.ObjectId.isValid(
    orderId
  );

/* =======================================================
   NORMAL STATUS TIMELINE
======================================================= */

const createStatusTimeline = (
  currentStatus
) => {
  const currentIndex =
    STATUS_INDEX.has(
      currentStatus
    )
      ? STATUS_INDEX.get(
          currentStatus
        )
      : -1;

  return ORDER_STATUSES.map(
    (status, index) => ({
      status,

      description:
        STATUS_DESCRIPTIONS[
          status
        ],

      completed:
        currentIndex >= index,

      current:
        currentStatus ===
        status,

      upcoming:
        currentIndex < index,
    })
  );
};

/* =======================================================
   SPECIAL STATUS TIMELINE
======================================================= */

const createSpecialStatusTimeline = (
  currentStatus
) => [
  {
    status: currentStatus,

    description:
      STATUS_DESCRIPTIONS[
        currentStatus
      ] ||
      `Order status: ${currentStatus}`,

    completed: true,
    current: true,
    upcoming: false,
  },
];

/* =======================================================
   SHIPPING SANITIZATION
======================================================= */

const sanitizeShippingInformation =
  (
    shippingInformation = {}
  ) => ({
    courier:
      typeof shippingInformation.courier ===
      "string"
        ? shippingInformation.courier
            .trim()
            .slice(0, 150)
        : "",

    trackingId:
      typeof shippingInformation.trackingId ===
      "string"
        ? shippingInformation.trackingId
            .trim()
            .slice(0, 150)
        : "",

    trackingUrl:
      typeof shippingInformation.trackingUrl ===
      "string"
        ? shippingInformation.trackingUrl
            .trim()
            .slice(0, 500)
        : "",

    estimatedDelivery:
      shippingInformation.estimatedDelivery ||
      null,

    notes:
      typeof shippingInformation.notes ===
      "string"
        ? shippingInformation.notes
            .trim()
            .slice(0, 2000)
        : "",
  });

/* =======================================================
   FORMAT PUBLIC TRACKING RESPONSE
======================================================= */

const formatTrackingResponse = (order) => {
  const currentStatus =
    order?.orderStatus || "Pending";

  const isSpecialStatus =
    OPTIONAL_STATUSES.includes(currentStatus);

  /* -------------------------------------------------------
     ITEMS
  ------------------------------------------------------- */

  const items = Array.isArray(order?.items)
    ? order.items.map((item) => {
        const price =
          Number(item?.price) || 0;

        const quantity =
          Number(item?.quantity) || 1;

        const total =
          Number(item?.total) ||
          price * quantity;

        return {
          name:
            item?.name ||
            item?.title ||
            "Glyrus Product",

          image:
            item?.image || "",

          quantity,

          price,

          total,
        };
      })
    : [];

  /* -------------------------------------------------------
     PRICING
  ------------------------------------------------------- */

  const subtotal =
    Number(order?.pricing?.subtotal) || 0;

  const discount =
    Number(order?.pricing?.discount) || 0;

  const shipping =
    Number(order?.pricing?.shipping) || 0;

  const codCharge =
    Number(order?.pricing?.codCharge) || 0;

  const total =
    Number(
      order?.pricing?.total ??
        order?.totalAmount ??
        order?.total
    ) || 0;

  const pricing = {
    subtotal,
    discount,
    shipping,
    codCharge,
    total,
  };

  /* -------------------------------------------------------
     PAYMENT
  ------------------------------------------------------- */

  const paymentMethod =
    String(
      order?.paymentMethod ||
        order?.payment?.method ||
        ""
    )
      .trim()
      .toUpperCase();

  const paymentStatus =
    String(
      order?.payment?.status || "Pending"
    ).trim();

  /*
   * Only a captured Razorpay payment
   * counts as money already paid.
   */
  let amountPaid = 0;

  if (
    paymentStatus === "Captured"
  ) {
    amountPaid =
      Number(order?.payment?.amount) || 0;
  }

  /*
   * Never allow paid amount to be
   * greater than order total.
   */
  amountPaid = Math.min(
    Math.max(amountPaid, 0),
    Math.max(total, 0)
  );

  const remainingAmount = Math.max(
    0,
    Math.round(
      (total - amountPaid) * 100
    ) / 100
  );

  const fullyPaid =
    total > 0 &&
    remainingAmount <= 0.01;

  const partiallyPaid =
    amountPaid > 0 &&
    remainingAmount > 0.01;

  let paymentDisplayStatus =
    "Payment Pending";

  if (fullyPaid) {
    paymentDisplayStatus = "Fully Paid";
  } else if (partiallyPaid) {
    paymentDisplayStatus = "Partially Paid";
  } else if (
    paymentMethod === "COD"
  ) {
    paymentDisplayStatus =
      "Due on Delivery";
  }

  const payment = {
    method:
      order?.payment?.method ||
      order?.paymentMethod ||
      "",

    status: paymentStatus,

    amount:
      Number(order?.payment?.amount) || 0,

    currency:
      order?.payment?.currency ||
      "INR",

    paidAt:
      order?.payment?.paidAt ||
      null,
  };

  /* -------------------------------------------------------
     PAYMENT SUMMARY
  ------------------------------------------------------- */

  const paymentSummary = {
    orderTotal: total,

    amountPaid,

    remainingAmount,

    fullyPaid,

    partiallyPaid,

    paymentPending:
      amountPaid <= 0 &&
      !fullyPaid,

    paymentStatus:
      paymentDisplayStatus,

    paymentMethod,

    codCharge,

    dueOnDelivery:
      paymentMethod === "COD" &&
      remainingAmount > 0
        ? remainingAmount
        : 0,
  };

  /* -------------------------------------------------------
     RESPONSE
  ------------------------------------------------------- */

  return {
    success: true,

    tracking: {
      orderNumber:
        order?.orderNumber || "",

      trackingNumber:
        order?.trackingNumber || "",

      orderStatus:
        currentStatus,

      statusDescription:
        STATUS_DESCRIPTIONS[
          currentStatus
        ] ||
        "Your order is being processed.",

      timeline:
        isSpecialStatus
          ? createSpecialStatusTimeline(
              currentStatus
            )
          : createStatusTimeline(
              currentStatus
            ),

      customer: {
        name:
          order?.customer?.name || "",
      },

      items,

      pricing,

      payment,

      paymentSummary,

      paymentMethod:
        order?.paymentMethod ||
        payment.method ||
        "",

      address:
        order?.address || null,

      shippingInformation:
        sanitizeShippingInformation(
          order?.shippingInformation
        ),

      createdAt:
        order?.createdAt || null,

      updatedAt:
        order?.updatedAt || null,
    },
  };
};

/* =======================================================
   FIND ORDER BY TRACKING NUMBER
======================================================= */

export const findOrderByTrackingNumber =
  async (
    trackingNumber
  ) => {
    const normalizedTrackingNumber =
      cleanTrackingNumber(
        trackingNumber
      );

    if (
      !normalizedTrackingNumber
    ) {
      const error =
        new Error(
          "Tracking number is required."
        );

      error.statusCode = 400;

      throw error;
    }

    if (
      !isValidTrackingFormat(
        normalizedTrackingNumber
      )
    ) {
      const error =
        new Error(
          "Invalid Glyrus tracking number."
        );

      error.statusCode = 400;

      throw error;
    }

    const order =
      await Order.findOne({
        trackingNumber:
          normalizedTrackingNumber,
      }).lean();

    if (!order) {
      const error =
        new Error(
          "No order found for this tracking number."
        );

      error.statusCode = 404;

      throw error;
    }

    return order;
  };

/* =======================================================
   PUBLIC TRACKING DETAILS
======================================================= */

export const getPublicTrackingDetails =
  async (
    trackingNumber
  ) => {
    const order =
      await findOrderByTrackingNumber(
        trackingNumber
      );

    return formatTrackingResponse(
      order
    );
  };

/* =======================================================
   ALIAS USED BY trackingController.js
======================================================= */

export const getPublicTracking =
  async (
    trackingNumber
  ) =>
    getPublicTrackingDetails(
      trackingNumber
    );

/* =======================================================
   UPDATE SHIPPING INFORMATION
======================================================= */

export const updateShippingInformation =
  async (
    orderId,
    shippingData = {}
  ) => {
    if (
      !orderId ||
      !isValidOrderId(orderId)
    ) {
      const error =
        new Error(
          "Valid order ID is required."
        );

      error.statusCode = 400;

      throw error;
    }

    const update = {};

    if (
      shippingData.courier !==
      undefined
    ) {
      update[
        "shippingInformation.courier"
      ] =
        String(
          shippingData.courier
        )
          .trim()
          .slice(0, 150);
    }

    if (
      shippingData.trackingId !==
      undefined
    ) {
      update[
        "shippingInformation.trackingId"
      ] =
        String(
          shippingData.trackingId
        )
          .trim()
          .slice(0, 150);
    }

    if (
      shippingData.trackingUrl !==
      undefined
    ) {
      const trackingUrl =
        String(
          shippingData.trackingUrl
        ).trim();

      if (
        trackingUrl &&
        !/^https?:\/\//i.test(
          trackingUrl
        )
      ) {
        const error =
          new Error(
            "Tracking URL must start with http:// or https://."
          );

        error.statusCode = 400;

        throw error;
      }

      update[
        "shippingInformation.trackingUrl"
      ] = trackingUrl.slice(
        0,
        500
      );
    }

    if (
      shippingData.estimatedDelivery !==
      undefined
    ) {
      if (
        shippingData.estimatedDelivery ===
          null ||
        shippingData.estimatedDelivery ===
          ""
      ) {
        update[
          "shippingInformation.estimatedDelivery"
        ] = null;
      } else {
        const date =
          new Date(
            shippingData.estimatedDelivery
          );

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          const error =
            new Error(
              "Invalid estimated delivery date."
            );

          error.statusCode = 400;

          throw error;
        }

        update[
          "shippingInformation.estimatedDelivery"
        ] = date;
      }
    }

    if (
      shippingData.notes !==
      undefined
    ) {
      update[
        "shippingInformation.notes"
      ] =
        String(
          shippingData.notes
        )
          .trim()
          .slice(0, 2000);
    }

    if (
      Object.keys(update)
        .length === 0
    ) {
      const error =
        new Error(
          "No shipping information was provided."
        );

      error.statusCode = 400;

      throw error;
    }

    const order =
      await Order.findByIdAndUpdate(
        orderId,
        {
          $set: update,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!order) {
      const error =
        new Error(
          "Order not found."
        );

      error.statusCode = 404;

      throw error;
    }

    return order;
  };

/* =======================================================
   UPDATE TRACKING NUMBER
======================================================= */

export const updateTrackingNumber =
  async (
    orderId,
    trackingNumber
  ) => {
    if (
      !orderId ||
      !isValidOrderId(orderId)
    ) {
      const error =
        new Error(
          "Valid order ID is required."
        );

      error.statusCode = 400;

      throw error;
    }

    const normalizedTrackingNumber =
      cleanTrackingNumber(
        trackingNumber
      );

    if (
      !isValidTrackingFormat(
        normalizedTrackingNumber
      )
    ) {
      const error =
        new Error(
          "Invalid Glyrus tracking number."
        );

      error.statusCode = 400;

      throw error;
    }

    const existingOrder =
      await Order.findOne({
        trackingNumber:
          normalizedTrackingNumber,

        _id: {
          $ne: orderId,
        },
      }).select("_id");

    if (existingOrder) {
      const error =
        new Error(
          "This tracking number is already assigned to another order."
        );

      error.statusCode = 409;

      throw error;
    }

    const order =
      await Order.findByIdAndUpdate(
        orderId,
        {
          $set: {
            trackingNumber:
              normalizedTrackingNumber,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!order) {
      const error =
        new Error(
          "Order not found."
        );

      error.statusCode = 404;

      throw error;
    }

    return order;
  };

/* =======================================================
   UPDATE ORDER TRACKING + SHIPPING
======================================================= */

export const updateOrderTracking =
  async ({
    orderId,
    trackingNumber,
    shippingInformation,
  }) => {
    if (
      !orderId ||
      !isValidOrderId(orderId)
    ) {
      const error =
        new Error(
          "Valid order ID is required."
        );

      error.statusCode = 400;

      throw error;
    }

    const normalizedTrackingNumber =
      cleanTrackingNumber(
        trackingNumber
      );

    if (
      !isValidTrackingFormat(
        normalizedTrackingNumber
      )
    ) {
      const error =
        new Error(
          "Invalid Glyrus tracking number."
        );

      error.statusCode = 400;

      throw error;
    }

    const existingOrder =
      await Order.findOne({
        trackingNumber:
          normalizedTrackingNumber,

        _id: {
          $ne: orderId,
        },
      }).select("_id");

    if (existingOrder) {
      const error =
        new Error(
          "This tracking number is already assigned to another order."
        );

      error.statusCode = 409;

      throw error;
    }

    const update = {
      trackingNumber:
        normalizedTrackingNumber,
    };

    if (
      shippingInformation !==
        undefined &&
      shippingInformation !==
        null
    ) {
      const shipping =
        sanitizeShippingInformation(
          shippingInformation
        );

      Object.assign(
        update,
        {
          shippingInformation:
            shipping,
        }
      );
    }

    const order =
      await Order.findByIdAndUpdate(
        orderId,
        {
          $set: update,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!order) {
      const error =
        new Error(
          "Order not found."
        );

      error.statusCode = 404;

      throw error;
    }

    return order;
  };

/* =======================================================
   TRACKING TIMELINE
======================================================= */

export const getTrackingTimeline =
  async (
    trackingNumber
  ) => {
    const order =
      await findOrderByTrackingNumber(
        trackingNumber
      );

    const currentStatus =
      order.orderStatus ||
      "Pending";

    const isSpecialStatus =
      OPTIONAL_STATUSES.includes(
        currentStatus
      );

    return isSpecialStatus
      ? createSpecialStatusTimeline(
          currentStatus
        )
      : createStatusTimeline(
          currentStatus
        );
  };

/* =======================================================
   STATUS DESCRIPTION
======================================================= */

export const getStatusDescription =
  (status) =>
    STATUS_DESCRIPTIONS[
      status
    ] || "";

/* =======================================================
   ALL ORDER STATUSES
======================================================= */

export const getAllOrderStatuses =
  () => [...ALL_STATUSES];

/* =======================================================
   DEFAULT EXPORT
======================================================= */

export default {
  findOrderByTrackingNumber,
  getPublicTrackingDetails,
  getPublicTracking,
  updateShippingInformation,
  updateTrackingNumber,
  updateOrderTracking,
  getTrackingTimeline,
  getStatusDescription,
  getAllOrderStatuses,
};