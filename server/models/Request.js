// Glyrus — Request.js
import mongoose from "mongoose";

const requestSchema =
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

      requirement: {
        type: String,
        required: true,
        trim: true,
        maxlength: 3000,
      },

      status: {
        type: String,
        enum: [
          "Pending",
          "Contacted",
          "Processing",
          "Completed",
          "Rejected",
        ],
        default: "Pending",
        index: true,
      },

      adminNotes: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: "",
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

requestSchema.index({
  email: 1,
  createdAt: -1,
});

requestSchema.index({
  mobile: 1,
  createdAt: -1,
});

requestSchema.index({
  status: 1,
  createdAt: -1,
});

/* -------------------------------------------------------
   JSON TRANSFORM
------------------------------------------------------- */

requestSchema.set(
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

const Request =
  mongoose.models.Request ||
  mongoose.model(
    "Request",
    requestSchema
  );

export default Request;