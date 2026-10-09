// Glyrus — trackingController.js
import {
  getPublicTracking,
  getTrackingTimeline,
  updateShippingInformation,
  updateTrackingNumber,
} from "../services/trackingService.js";

/* -------------------------------------------------------
   GET PUBLIC TRACKING DETAILS
------------------------------------------------------- */

export const getTrackingDetails =
  async (req, res, next) => {
    try {
      const trackingNumber =
        String(
          req.params.trackingNumber || ""
        )
          .trim()
          .toUpperCase();

      if (!trackingNumber) {
        return res.status(400).json({
          success: false,
          message:
            "Tracking number is required.",
        });
      }

      const result =
        await getPublicTracking(
          trackingNumber
        );

      if (!result) {
        return res.status(404).json({
          success: false,
          message:
            "No order found for this tracking number.",
        });
      }

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

/* -------------------------------------------------------
   GET TRACKING TIMELINE
------------------------------------------------------- */

export const getTrackingHistory =
  async (req, res, next) => {
    try {
      const trackingNumber =
        String(
          req.params.trackingNumber || ""
        )
          .trim()
          .toUpperCase();

      if (!trackingNumber) {
        return res.status(400).json({
          success: false,
          message:
            "Tracking number is required.",
        });
      }

      const timeline =
        await getTrackingTimeline(
          trackingNumber
        );

      if (!timeline) {
        return res.status(404).json({
          success: false,
          message:
            "Tracking information not found.",
        });
      }

      return res.status(200).json({
        success: true,
        timeline,
      });
    } catch (error) {
      next(error);
    }
  };

/* -------------------------------------------------------
   UPDATE SHIPPING INFORMATION
   ADMIN USE
------------------------------------------------------- */

export const updateShipping =
  async (req, res, next) => {
    try {
      const orderId =
        String(
          req.params.orderId || ""
        ).trim();

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message:
            "Order ID is required.",
        });
      }

      const {
        courier,
        trackingId,
        trackingUrl,
        estimatedDelivery,
        notes,
      } = req.body || {};

      const shippingInformation = {
        courier:
          typeof courier === "string"
            ? courier.trim().slice(0, 150)
            : "",

        trackingId:
          typeof trackingId === "string"
            ? trackingId
                .trim()
                .slice(0, 150)
            : "",

        trackingUrl:
          typeof trackingUrl === "string"
            ? trackingUrl
                .trim()
                .slice(0, 500)
            : "",

        estimatedDelivery:
          estimatedDelivery
            ? new Date(
                estimatedDelivery
              )
            : null,

        notes:
          typeof notes === "string"
            ? notes
                .trim()
                .slice(0, 1000)
            : "",
      };

      if (
        shippingInformation
          .trackingUrl
      ) {
        try {
          const url =
            new URL(
              shippingInformation.trackingUrl
            );

          if (
            ![
              "http:",
              "https:",
            ].includes(url.protocol)
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Tracking URL must use HTTP or HTTPS.",
            });
          }
        } catch {
          return res.status(400).json({
            success: false,
            message:
              "Please provide a valid tracking URL.",
          });
        }
      }

      if (
        shippingInformation.estimatedDelivery &&
        Number.isNaN(
          shippingInformation
            .estimatedDelivery
            .getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid estimated delivery date.",
        });
      }

      const order =
        await updateShippingInformation(
          orderId,
          shippingInformation
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Shipping information updated successfully.",
        order,
      });
    } catch (error) {
      next(error);
    }
  };

/* -------------------------------------------------------
   UPDATE TRACKING NUMBER
   ADMIN USE
------------------------------------------------------- */

export const updateOrderTrackingNumber =
  async (req, res, next) => {
    try {
      const orderId =
        String(
          req.params.orderId || ""
        ).trim();

      const trackingNumber =
        String(
          req.body?.trackingNumber || ""
        )
          .trim()
          .toUpperCase();

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message:
            "Order ID is required.",
        });
      }

      if (!trackingNumber) {
        return res.status(400).json({
          success: false,
          message:
            "Tracking number is required.",
        });
      }

      if (
        trackingNumber.length >
        100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Tracking number is too long.",
        });
      }

      const order =
        await updateTrackingNumber(
          orderId,
          trackingNumber
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Tracking number updated successfully.",
        order,
      });
    } catch (error) {
      next(error);
    }
  };