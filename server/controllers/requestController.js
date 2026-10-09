// Glyrus — requestController.js
import mongoose from "mongoose";

import Request from "../models/Request.js";

import {
  sendRequestNotificationEmail,
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
  cleanString(value, 150).toLowerCase();

const normalizeMobile = (value) =>
  cleanString(value, 20).replace(
    /\s+/g,
    ""
  );

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );

const validateMobile = (mobile) =>
  /^[6-9]\d{9}$/.test(
    mobile
  );

export const createRequest =
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

      const requirement =
        cleanString(
          body.requirement ||
            body.message ||
            body.details,
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
        !validateEmail(email)
      ) {
        errors.email =
          "Please provide a valid email address.";
      }

      if (
        !mobile ||
        !validateMobile(mobile)
      ) {
        errors.mobile =
          "Please provide a valid 10-digit mobile number.";
      }

      if (
        !requirement ||
        requirement.length < 5
      ) {
        errors.requirement =
          "Please describe your NFC product requirement.";
      }

      if (
        Object.keys(errors)
          .length > 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide valid request details.",
          errors,
        });
      }

      const request =
        await Request.create({
          name,
          email,
          mobile,
          requirement,
          status: "Pending",
        });

      /*
       * The request is already saved successfully.
       * SMTP failure should not make the submitted
       * request disappear.
       */
      try {
        await sendRequestNotificationEmail({
          name,
          email,
          mobile,
          requirement,
        });
      } catch (emailError) {
        console.error(
          "NFC request notification email failed:",
          emailError
        );
      }

      return res.status(201).json({
        success: true,
        message:
          "Your NFC request has been submitted successfully.",
        request: {
          id:
            request._id.toString(),
          name:
            request.name,
          email:
            request.email,
          mobile:
            request.mobile,
          requirement:
            request.requirement,
          status:
            request.status,
          createdAt:
            request.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

export const getRequests =
  async (req, res, next) => {
    try {
      const {
        status,
        search,
        page = 1,
        limit = 20,
      } = req.query;

      const filter = {};

      if (
        status &&
        typeof status === "string"
      ) {
        const allowedStatuses = [
          "Pending",
          "Contacted",
          "Processing",
          "Completed",
          "Rejected",
        ];

        if (
          allowedStatuses.includes(
            status
          )
        ) {
          filter.status =
            status;
        }
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
              requirement: {
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
        requests,
        total,
      ] = await Promise.all([
        Request.find(filter)
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(safeLimit)
          .lean(),

        Request.countDocuments(
          filter
        ),
      ]);

      return res.status(200).json({
        success: true,
        requests,
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

export const getRequestById =
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
            "Invalid request ID.",
        });
      }

      const request =
        await Request.findById(
          id
        ).lean();

      if (!request) {
        return res.status(404).json({
          success: false,
          message:
            "Request not found.",
        });
      }

      return res.status(200).json({
        success: true,
        request,
      });
    } catch (error) {
      next(error);
    }
  };

export const updateRequest =
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
            "Invalid request ID.",
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
          "Pending",
          "Contacted",
          "Processing",
          "Completed",
          "Rejected",
        ];

        if (
          !allowedStatuses.includes(
            body.status
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid request status.",
          });
        }

        update.status =
          body.status;
      }

      if (
        body.adminNotes !==
        undefined
      ) {
        update.adminNotes =
          cleanString(
            body.adminNotes,
            2000
          );
      }

      if (
        body.name !==
        undefined
      ) {
        update.name =
          cleanString(
            body.name,
            100
          );
      }

      if (
        body.mobile !==
        undefined
      ) {
        const mobile =
          normalizeMobile(
            body.mobile
          );

        if (
          mobile &&
          !validateMobile(
            mobile
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid mobile number.",
          });
        }

        update.mobile =
          mobile;
      }

      if (
        body.requirement !==
        undefined
      ) {
        update.requirement =
          cleanString(
            body.requirement,
            3000
          );
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

      const request =
        await Request.findByIdAndUpdate(
          id,
          {
            $set: update,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!request) {
        return res.status(404).json({
          success: false,
          message:
            "Request not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Request updated successfully.",
        request,
      });
    } catch (error) {
      next(error);
    }
  };

export const deleteRequest =
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
            "Invalid request ID.",
        });
      }

      const request =
        await Request.findByIdAndDelete(
          id
        );

      if (!request) {
        return res.status(404).json({
          success: false,
          message:
            "Request not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Request deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  };