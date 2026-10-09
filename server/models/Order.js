// Glyrus — Order.js
import mongoose from "mongoose";

const customizationSchema =
  new mongoose.Schema(
    {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    {
      _id: false,
    }
  );

const orderItemSchema =
  new mongoose.Schema(
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },

      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150,
      },

      image: {
        type: String,
        trim: true,
        default: "",
      },

      price: {
        type: Number,
        required: true,
        min: 0,
      },

      quantity: {
        type: Number,
        required: true,
        min: 1,
        max: 100,
      },

      customization:
        customizationSchema,

      total: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    {
      _id: false,
    }
  );

const customerSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxlength: 150,
      },

      mobile: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20,
      },
    },
    {
      _id: false,
    }
  );

const addressSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxlength: 150,
      },

      mobile: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20,
      },

      house: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
      },

      street: {
        type: String,
        required: true,
        trim: true,
        maxlength: 250,
      },

      area: {
        type: String,
        required: true,
        trim: true,
        maxlength: 250,
      },

      city: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },

      state: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },

      pincode: {
        type: String,
        required: true,
        trim: true,
        maxlength: 10,
      },
    },
    {
      _id: false,
    }
  );

const pricingSchema =
  new mongoose.Schema(
    {
      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },

      discount: {
        type: Number,
        default: 0,
        min: 0,
      },

      shipping: {
        type: Number,
        default: 0,
        min: 0,
      },

      codCharge: {
        type: Number,
        default: 0,
        min: 0,
      },

      total: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    {
      _id: false,
    }
  );

const paymentSchema =
  new mongoose.Schema(
    {
      status: {
        type: String,
        enum: [
          "Pending",
          "Created",
          "Authorized",
          "Captured",
          "Failed",
          "Refunded",
          "Partially Refunded",
        ],
        default: "Pending",
      },

      method: {
        type: String,
        enum: [
          "COD",
          "RAZORPAY",
        ],
        required: true,
      },

      razorpayOrderId: {
        type: String,
        trim: true,
        default: "",
        index: true,
      },

      razorpayPaymentId: {
        type: String,
        trim: true,
        default: "",
        index: true,
      },

      razorpaySignature: {
        type: String,
        trim: true,
        default: "",
      },

      amount: {
        type: Number,
        min: 0,
        default: 0,
      },

      currency: {
        type: String,
        default: "INR",
        trim: true,
      },

      paidAt: {
        type: Date,
        default: null,
      },

      refundedAt: {
        type: Date,
        default: null,
      },

      refundId: {
        type: String,
        trim: true,
        default: "",
      },
    },
    {
      _id: false,
    }
  );

const shippingInformationSchema =
  new mongoose.Schema(
    {
      courier: {
        type: String,
        trim: true,
        maxlength: 150,
        default: "",
      },

      trackingId: {
        type: String,
        trim: true,
        maxlength: 150,
        default: "",
      },

      trackingUrl: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },

      estimatedDelivery: {
        type: Date,
        default: null,
      },

      notes: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: "",
      },
    },
    {
      _id: false,
    }
  );

const orderSchema =
  new mongoose.Schema(
    {
      orderNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
        index: true,
      },

      trackingNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
        index: true,
      },

      customer: {
        type: customerSchema,
        required: true,
      },

      address: {
        type: addressSchema,
        required: true,
      },

      items: {
        type: [orderItemSchema],
        required: true,
        validate: {
          validator: (items) =>
            Array.isArray(items) &&
            items.length > 0,
          message:
            "An order must contain at least one product.",
        },
      },

      pricing: {
        type: pricingSchema,
        required: true,
      },

      paymentMethod: {
        type: String,
        enum: [
          "COD",
          "RAZORPAY",
        ],
        required: true,
      },

      payment: {
        type: paymentSchema,
        required: true,
      },

      orderStatus: {
        type: String,
        enum: [
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
        ],
        default: "Pending",
        index: true,
      },

      shippingInformation: {
        type:
          shippingInformationSchema,
        default: () => ({}),
      },

      notes: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: "",
      },

      cancelledAt: {
        type: Date,
        default: null,
      },

      deliveredAt: {
        type: Date,
        default: null,
      },

      refundedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
      strict: true,
    }
  );

/* -------------------------------------------------------
   INDEXES
------------------------------------------------------- */

orderSchema.index({
  "customer.email": 1,
  createdAt: -1,
});

orderSchema.index({
  "customer.mobile": 1,
  createdAt: -1,
});

orderSchema.index({
  orderStatus: 1,
  createdAt: -1,
});

orderSchema.index({
  trackingNumber: 1,
  orderStatus: 1,
});

orderSchema.index({
  "payment.razorpayOrderId": 1,
});

orderSchema.index({
  "payment.razorpayPaymentId": 1,
});

/* -------------------------------------------------------
   STATUS TIMESTAMPS
------------------------------------------------------- */

orderSchema.pre(
  "save",
  function (next) {
    if (
      this.isModified(
        "orderStatus"
      )
    ) {
      if (
        this.orderStatus ===
        "Delivered"
      ) {
        this.deliveredAt =
          this.deliveredAt ||
          new Date();
      }

      if (
        this.orderStatus ===
        "Cancelled"
      ) {
        this.cancelledAt =
          this.cancelledAt ||
          new Date();
      }

      if (
        this.orderStatus ===
        "Refunded"
      ) {
        this.refundedAt =
          this.refundedAt ||
          new Date();
      }
    }

    next();
  }
);

/* -------------------------------------------------------
   JSON TRANSFORM
------------------------------------------------------- */

orderSchema.set(
  "toJSON",
  {
    transform: (
      document,
      returnedObject
    ) => {
      returnedObject.id =
        returnedObject._id;

      delete returnedObject._id;
      delete returnedObject.__v;

      return returnedObject;
    },
  }
);

const Order =
  mongoose.models.Order ||
  mongoose.model(
    "Order",
    orderSchema
  );

export default Order;