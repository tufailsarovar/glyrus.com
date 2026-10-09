// Glyrus — contactController.js
import mongoose from "mongoose";

import Contact from "../models/Contact.js";

import {
  sendSupportEmail,
} from "../services/emailService.js";

const cleanString = (
  value,
  maxLength = 500
) => {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, maxLength);
};

const normalizeEmail = (value) =>
  cleanString(
    value,
    150
  ).toLowerCase();

const normalizeMobile = (value) =>
  cleanString(
    value,
    20
  ).replace(/\s+/g, "");

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );

const isValidMobile = (mobile) =>
  /^[6-9]\d{9}$/.test(
    mobile
  );

/* -------------------------------------------------------
   CREATE CONTACT MESSAGE
------------------------------------------------------- */

export const createContact =
  async (req, res, next) => {
    try {
      const body =
        req.body || {};

      const name = cleanString(
        body.name,
        100
      );

      const email =
        normalizeEmail(
          body.email
        );

      const mobile =
        normalizeMobile(
          body.mobile
        );

      const subject =
        cleanString(
          body.subject ||
            "Glyrus Support",
          200
        );

      const message =
        cleanString(
          body.message,
          3000
        );

      const errors = {};

      if (
        !name ||
        name.length < 2
      ) {
        errors.name =
          "Name is required.";
      }

      if (
        !email ||
        !isValidEmail(email)
      ) {
        errors.email =
          "Please provide a valid email address.";
      }

      if (
        mobile &&
        !isValidMobile(mobile)
      ) {
        errors.mobile =
          "Please provide a valid 10-digit mobile number.";
      }

      if (
        !message ||
        message.length < 5
      ) {
        errors.message =
          "Please enter a valid message.";
      }

      if (
        Object.keys(errors)
          .length > 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide valid contact details.",
          errors,
        });
      }

      const contact =
        await Contact.create({
          name,
          email,
          mobile,
          subject:
            subject ||
            "Glyrus Support",
          message,
          status: "Unread",
        });

      /*
       * Save the message first.
       * If SMTP is temporarily unavailable,
       * the customer's message remains stored.
       */
      try {
        await sendSupportEmail({
          name,
          email,
          mobile,
          subject:
            subject ||
            "Glyrus Support Request",
          message,
        });
      } catch (emailError) {
        console.error(
          "Support notification email failed:",
          emailError
        );
      }

      return res.status(201).json({
        success: true,
        message:
          "Your message has been sent successfully.",
        contact: {
          id:
            contact._id.toString(),
          name:
            contact.name,
          email:
            contact.email,
          subject:
            contact.subject,
          status:
            contact.status,
          createdAt:
            contact.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

/* -------------------------------------------------------
   GET CONTACT MESSAGES
------------------------------------------------------- */

export const getContacts =
  async (req, res, next) => {
    try {
      const {
        status,
        search,
        page = 1,
        limit = 20,
      } = req.query;

      const filter = {};

      const allowedStatuses = [
        "Unread",
        "Read",
        "Replied",
        "Closed",
      ];

      if (
        status &&
        allowedStatuses.includes(
          status
        )
      ) {
        filter.status =
          status;
      }

      if (
        search &&
        typeof search ===
          "string"
      ) {
        const searchTerm =
          cleanString(
            search,
            150
          );

        if (searchTerm) {
          filter.$or = [
            {
              name: {
                $regex:
                  searchTerm,
                $options:
                  "i",
              },
            },
            {
              email: {
                $regex:
                  searchTerm,
                $options:
                  "i",
              },
            },
            {
              mobile: {
                $regex:
                  searchTerm,
                $options:
                  "i",
              },
            },
            {
              subject: {
                $regex:
                  searchTerm,
                $options:
                  "i",
              },
            },
            {
              message: {
                $regex:
                  searchTerm,
                $options:
                  "i",
              },
            },
          ];
        }
      }

      const safePage =
        Math.max(
          Number(page) || 1,
          1
        );

      const safeLimit =
        Math.min(
          Math.max(
            Number(limit) || 20,
            1
          ),
          100
        );

      const skip =
        (safePage - 1) *
        safeLimit;

      const [
        messages,
        total,
      ] = await Promise.all([
        Contact.find(filter)
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(safeLimit)
          .lean(),

        Contact.countDocuments(
          filter
        ),
      ]);

      return res.status(200).json({
        success: true,
        messages,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages:
            Math.ceil(
              total /
                safeLimit
            ),
        },
      });
    } catch (error) {
      next(error);
    }
  };

/* -------------------------------------------------------
   GET CONTACT BY ID
------------------------------------------------------- */

export const getContactById =
  async (req, res, next) => {
    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid message ID.",
        });
      }

      const contact =
        await Contact.findById(
          id
        ).lean();

      if (!contact) {
        return res.status(404).json({
          success: false,
          message:
            "Message not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: contact,
      });
    } catch (error) {
      next(error);
    }
  };

/* -------------------------------------------------------
   UPDATE CONTACT MESSAGE
------------------------------------------------------- */

export const updateContact =
  async (req, res, next) => {
    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid message ID.",
        });
      }

      const body =
        req.body || {};

      const update = {};

      if (
        body.status !==
        undefined
      ) {
        const allowedStatuses = [
          "Unread",
          "Read",
          "Replied",
          "Closed",
        ];

        if (
          !allowedStatuses.includes(
            body.status
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid message status.",
          });
        }

        update.status =
          body.status;

        if (
          body.status ===
          "Replied"
        ) {
          update.repliedAt =
            new Date();
        }
      }

      if (
        body.adminReply !==
        undefined
      ) {
        update.adminReply =
          cleanString(
            body.adminReply,
            3000
          );

        if (
          update.adminReply
        ) {
          update.status =
            "Replied";

          update.repliedAt =
            new Date();
        }
      }

      if (
        Object.keys(update)
          .length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "No valid fields were provided for update.",
        });
      }

      const contact =
        await Contact.findByIdAndUpdate(
          id,
          {
            $set: update,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!contact) {
        return res.status(404).json({
          success: false,
          message:
            "Message not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Message updated successfully.",
        contact,
      });
    } catch (error) {
      next(error);
    }
  };

/* -------------------------------------------------------
   DELETE CONTACT MESSAGE
------------------------------------------------------- */

export const deleteContact =
  async (req, res, next) => {
    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid message ID.",
        });
      }

      const contact =
        await Contact.findByIdAndDelete(
          id
        );

      if (!contact) {
        return res.status(404).json({
          success: false,
          message:
            "Message not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Message deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  };