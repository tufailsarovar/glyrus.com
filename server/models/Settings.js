// Glyrus — Settings.js

import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      default: "store",
    },

    storeName: {
      type: String,
      default: "Glyrus",
      trim: true,
    },

    supportEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    supportPhone: {
      type: String,
      default: "",
      trim: true,
    },

    codEnabled: {
      type: Boolean,
      default: true,
    },

    codCharge: {
      type: Number,
      default: 49,
      min: 0,
    },

    freeShippingThreshold: {
      type: Number,
      default: 999,
      min: 0,
    },

    shippingCharge: {
      type: Number,
      default: 79,
      min: 0,
    },

    razorpayEnabled: {
      type: Boolean,
      default: true,
    },

    orderEmailEnabled: {
      type: Boolean,
      default: true,
    },

    shippingEmailEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Settings =
  mongoose.models.Settings ||
  mongoose.model(
    "Settings",
    settingsSchema
  );

export default Settings;