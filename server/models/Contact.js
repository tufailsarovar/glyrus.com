// Glyrus — Contact.js
import mongoose from "mongoose";

const contactSchema =
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
        trim: true,
        maxlength: 20,
        default: "",
      },

      subject: {
        type: String,
        trim: true,
        maxlength: 200,
        default: "Glyrus Support",
      },

      message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 3000,
      },

      status: {
        type: String,
        enum: [
          "Unread",
          "Read",
          "Replied",
          "Closed",
        ],
        default: "Unread",
        index: true,
      },

      adminReply: {
        type: String,
        trim: true,
        maxlength: 3000,
        default: "",
      },

      repliedAt: {
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

contactSchema.index({
  email: 1,
  createdAt: -1,
});

contactSchema.index({
  status: 1,
  createdAt: -1,
});

/* -------------------------------------------------------
   JSON TRANSFORM
------------------------------------------------------- */

contactSchema.set(
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

const Contact =
  mongoose.models.Contact ||
  mongoose.model(
    "Contact",
    contactSchema
  );

export default Contact;