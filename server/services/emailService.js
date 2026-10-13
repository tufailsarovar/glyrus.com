// Glyrus — emailService.js

import nodemailer from "nodemailer";

/* =======================================================
   SMTP CONFIGURATION
======================================================= */

const smtpPort = Number(process.env.SMTP_PORT) || 587;

const smtpPassword = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || "";

const transporter =
  process.env.SMTP_HOST && process.env.SMTP_USER && smtpPassword
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: smtpPassword,
        },
      })
    : null;

/* =======================================================
   HELPERS
======================================================= */

const getFromAddress = () =>
  process.env.SMTP_FROM ||
  process.env.SMTP_USER ||
  "Glyrus <no-reply@Glyrus.com>";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getCustomerName = (order) =>
  order?.customer?.name || order?.customerName || order?.name || "Customer";

const getCustomerEmail = (order) =>
  order?.customer?.email || order?.email || "";

const getOrderItems = (order) =>
  Array.isArray(order?.items) ? order.items : [];

/* =======================================================
   EMAIL LAYOUT
======================================================= */

const emailLayout = ({ title, preheader = "", content }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <title>${escapeHtml(title)}</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f7f7f7;
    font-family:Arial,Helvetica,sans-serif;
    color:#171717;
  "
>
  <div
    style="
      display:none;
      max-height:0;
      overflow:hidden;
      opacity:0;
    "
  >
    ${escapeHtml(preheader)}
  </div>

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      background:#f7f7f7;
      padding:30px 12px;
    "
  >
    <tr>
      <td align="center">

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width:650px;
            background:#ffffff;
            border-radius:18px;
            overflow:hidden;
            border:1px solid #eeeeee;
          "
        >
          <tr>
            <td
              style="
                padding:26px 30px;
                background:#f5c518;
              "
            >
              <div
                style="
                  font-size:28px;
                  font-weight:800;
                  letter-spacing:-1px;
                  color:#111111;
                "
              >
                Glyrus
              </div>

              <div
                style="
                  margin-top:5px;
                  font-size:13px;
                  color:#252525;
                "
              >
                NFC Products Marketplace
              </div>
            </td>
          </tr>

          <tr>
            <td
              style="
                padding:32px 30px;
                line-height:1.6;
              "
            >
              ${content}
            </td>
          </tr>

          <tr>
            <td
              style="
                padding:22px 30px;
                background:#111111;
                color:#ffffff;
                text-align:center;
                font-size:12px;
              "
            >
              © ${new Date().getFullYear()} Glyrus.
              All rights reserved.
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;

/* =======================================================
   TRANSPORTER
======================================================= */

const ensureTransporter = () => {
  if (!transporter) {
    throw new Error("SMTP configuration is incomplete.");
  }

  return transporter;
};

const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  if (!to) {
    throw new Error("Recipient email is required.");
  }

  const mailer = ensureTransporter();

  return mailer.sendMail({
    from: getFromAddress(),
    to,
    subject,
    text,
    html,
    ...(replyTo ? { replyTo } : {}),
  });
};

/* =======================================================
   ORDER ITEMS
======================================================= */

const buildItemsHtml = (items) =>
  items
    .map(
      (item) => `
        <tr>
          <td
            style="
              padding:12px 8px;
              border-bottom:1px solid #eeeeee;
            "
          >
            <strong>
              ${escapeHtml(item.name || item.title || "Glyrus Product")}
            </strong>

            ${
              item.customization
                ? `
                  <div
                    style="
                      margin-top:4px;
                      font-size:12px;
                      color:#666666;
                    "
                  >
                    Customization:
                    ${escapeHtml(
                      typeof item.customization === "object"
                        ? JSON.stringify(item.customization)
                        : item.customization,
                    )}
                  </div>
                `
                : ""
            }
          </td>

          <td
            align="center"
            style="
              padding:12px 8px;
              border-bottom:1px solid #eeeeee;
            "
          >
            ${Number(item.quantity) || 1}
          </td>

          <td
            align="right"
            style="
              padding:12px 8px;
              border-bottom:1px solid #eeeeee;
            "
          >
            ${formatCurrency(Number(item.price) * (Number(item.quantity) || 1))}
          </td>
        </tr>
      `,
    )
    .join("");

/* =======================================================
   ADDRESS
======================================================= */

const buildAddressHtml = (address) => {
  if (!address) {
    return "";
  }

  return `
    <div
      style="
        margin-top:22px;
        padding:18px;
        border:1px solid #eeeeee;
        border-radius:12px;
      "
    >
      <strong>Delivery Address</strong>

      <div
        style="
          margin-top:8px;
          color:#555555;
          font-size:14px;
          line-height:1.7;
        "
      >
        ${escapeHtml(address.name || "")}<br />

        ${escapeHtml(address.house || address.houseFlat || "")}

        ${address.street ? `<br />${escapeHtml(address.street)}` : ""}

        ${address.area ? `<br />${escapeHtml(address.area)}` : ""}

        <br />

        ${escapeHtml(address.city || "")},
        ${escapeHtml(address.state || "")}
        - ${escapeHtml(address.pincode || "")}

        ${address.mobile ? `<br />Mobile: ${escapeHtml(address.mobile)}` : ""}
      </div>
    </div>
  `;
};

/* =======================================================
   ORDER SUMMARY
======================================================= */

const buildOrderSummaryHtml = (order) => {
  const pricing = order?.pricing || {};

  const subtotal = Number(pricing.subtotal ?? order?.subtotal ?? 0) || 0;

  const discount = Number(pricing.discount ?? order?.discount ?? 0) || 0;

  const shipping = Number(pricing.shipping ?? order?.shippingCharge ?? 0) || 0;

  const codCharge = Number(pricing.codCharge ?? order?.codCharge ?? 0) || 0;

  const total =
    Number(
      pricing.grandTotal ??
        pricing.total ??
        order?.totalAmount ??
        order?.total ??
        0,
    ) || 0;

  return `
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="
        margin-top:22px;
        font-size:14px;
      "
    >
      <tr>
        <td style="padding:7px 0;">
          Subtotal
        </td>

        <td
          align="right"
          style="padding:7px 0;"
        >
          ${formatCurrency(subtotal)}
        </td>
      </tr>

      ${
        discount > 0
          ? `
            <tr>
              <td
                style="
                  padding:7px 0;
                  color:#188038;
                "
              >
                Discount
              </td>

              <td
                align="right"
                style="
                  padding:7px 0;
                  color:#188038;
                "
              >
                -${formatCurrency(discount)}
              </td>
            </tr>
          `
          : ""
      }

      <tr>
        <td style="padding:7px 0;">
          Shipping
        </td>

        <td
          align="right"
          style="padding:7px 0;"
        >
          ${shipping === 0 ? "FREE" : formatCurrency(shipping)}
        </td>
      </tr>

      ${
        codCharge > 0
          ? `
            <tr>
              <td style="padding:7px 0;">
                COD Charge
              </td>

              <td
                align="right"
                style="padding:7px 0;"
              >
                ${formatCurrency(codCharge)}
              </td>
            </tr>
          `
          : ""
      }

      <tr>
        <td
          style="
            padding:14px 0 0;
            border-top:1px solid #dddddd;
            font-size:17px;
            font-weight:700;
          "
        >
          Total
        </td>

        <td
          align="right"
          style="
            padding:14px 0 0;
            border-top:1px solid #dddddd;
            font-size:17px;
            font-weight:700;
          "
        >
          ${formatCurrency(total)}
        </td>
      </tr>
    </table>
  `;
};

/* =======================================================
   ORDER CONFIRMATION
======================================================= */

export const sendOrderConfirmationEmail = async (order) => {
  const email = getCustomerEmail(order);

  if (!email) {
    return null;
  }

  const name = getCustomerName(order);

  const items = getOrderItems(order);

  const orderNumber = order?.orderNumber || "N/A";

  const trackingNumber = order?.trackingNumber || "Will be generated shortly";

  const html = emailLayout({
    title: "Order Confirmation",

    preheader: `Your Glyrus order ${orderNumber} has been received.`,

    content: `
          <h1
            style="
              margin:0 0 12px;
              font-size:25px;
            "
          >
            Order Confirmed 🎉
          </h1>

          <p>
            Hello ${escapeHtml(name)},
          </p>

          <p>
            Thank you for shopping with Glyrus.
            Your order has been received successfully.
          </p>

          <div
            style="
              margin:22px 0;
              padding:18px;
              background:#fff8d9;
              border-radius:12px;
            "
          >
            <strong>Order Number:</strong>
            ${escapeHtml(orderNumber)}
            <br />

            <strong>Tracking Number:</strong>
            ${escapeHtml(trackingNumber)}
          </div>

          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
              border-collapse:collapse;
              font-size:14px;
            "
          >
            <thead>
              <tr>
                <th
                  align="left"
                  style="
                    padding:10px 8px;
                    border-bottom:2px solid #111111;
                  "
                >
                  Product
                </th>

                <th
                  align="center"
                  style="
                    padding:10px 8px;
                    border-bottom:2px solid #111111;
                  "
                >
                  Qty
                </th>

                <th
                  align="right"
                  style="
                    padding:10px 8px;
                    border-bottom:2px solid #111111;
                  "
                >
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              ${buildItemsHtml(items)}
            </tbody>
          </table>

          ${buildOrderSummaryHtml(order)}

          ${buildAddressHtml(order?.address)}
        `,
  });

  return sendEmail({
    to: email,
    subject: `Glyrus Order Confirmed - ${orderNumber}`,
    html,
    text: `Your Glyrus order ${orderNumber} has been confirmed. Tracking number: ${trackingNumber}.`,
  });
};

/* =======================================================
   PAYMENT CONFIRMATION
======================================================= */

export const sendPaymentConfirmationEmail = async (order) => {
  const email = getCustomerEmail(order);

  if (!email) {
    return null;
  }

  const name = getCustomerName(order);
  const items = getOrderItems(order);

  const orderNumber = order?.orderNumber || "N/A";

  const trackingNumber = order?.trackingNumber || "Will be generated shortly";

  const paymentId =
    order?.payment?.razorpayPaymentId || order?.razorpayPaymentId || "N/A";

  const paymentMethod = String(
    order?.paymentMethod || order?.payment?.method || "",
  ).toUpperCase();

  const amountPaid =
    Number(
      order?.payment?.amount ??
        order?.pricing?.codCharge ??
        order?.pricing?.total ??
        order?.totalAmount ??
        order?.total ??
        0,
    ) || 0;

  const orderTotal =
    Number(order?.pricing?.total ?? order?.totalAmount ?? order?.total ?? 0) ||
    0;

  const codCharge =
    Number(order?.pricing?.codCharge ?? order?.codCharge ?? 0) || 0;

  const remainingCodAmount =
    paymentMethod === "COD" ? Math.max(0, orderTotal - amountPaid) : 0;

  const paymentDate = order?.payment?.paidAt
    ? new Date(order.payment.paidAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });

  const trackingUrl =
    order?.shippingInformation?.trackingUrl || order?.trackingUrl || "";

  const html = emailLayout({
    title: "Payment Confirmation",

    preheader: `Payment received successfully for Glyrus order ${orderNumber}.`,

    content: `
      <h1
        style="
          margin:0 0 12px;
          font-size:25px;
        "
      >
        Payment Confirmed ✓
      </h1>

      <p>
        Hello ${escapeHtml(name)},
      </p>

      <p>
        Thank you for your payment. Your Glyrus order has been
        successfully confirmed.
      </p>

      <!-- ORDER DETAILS -->

      <div
        style="
          margin:22px 0;
          padding:20px;
          background:#fff8d9;
          border-radius:12px;
        "
      >
        <strong>Order Number:</strong>
        ${escapeHtml(orderNumber)}
        <br /><br />

        <strong>Tracking Number:</strong>
        ${escapeHtml(trackingNumber)}
        <br /><br />

        <strong>Payment Date:</strong>
        ${escapeHtml(paymentDate)}
        <br /><br />

        <strong>Payment Method:</strong>
        ${escapeHtml(
          paymentMethod === "COD" ? "COD + Online COD Charge" : "Razorpay",
        )}
        <br /><br />

        <strong>Payment ID:</strong>
        ${escapeHtml(paymentId)}
      </div>

      <!-- PAYMENT SUMMARY -->

      <div
        style="
          margin:22px 0;
          padding:20px;
          background:#f7f7f7;
          border-radius:12px;
        "
      >
        <h3
          style="
            margin:0 0 15px;
            font-size:18px;
          "
        >
          Payment Summary
        </h3>

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="font-size:14px;"
        >
          <tr>
            <td style="padding:7px 0;">
              Order Total
            </td>

            <td
              align="right"
              style="padding:7px 0;"
            >
              ${formatCurrency(orderTotal)}
            </td>
          </tr>

          ${
            paymentMethod === "COD"
              ? `
                <tr>
                  <td style="padding:7px 0;">
                    COD Charge Paid Online
                  </td>

                  <td
                    align="right"
                    style="
                      padding:7px 0;
                      color:#188038;
                      font-weight:700;
                    "
                  >
                    ${formatCurrency(codCharge)}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:12px 0 0;
                      border-top:1px solid #dddddd;
                      font-weight:700;
                    "
                  >
                    Remaining Amount on Delivery
                  </td>

                  <td
                    align="right"
                    style="
                      padding:12px 0 0;
                      border-top:1px solid #dddddd;
                      font-weight:700;
                    "
                  >
                    ${formatCurrency(remainingCodAmount)}
                  </td>
                </tr>
              `
              : `
                <tr>
                  <td
                    style="
                      padding:12px 0 0;
                      border-top:1px solid #dddddd;
                      font-weight:700;
                    "
                  >
                    Amount Paid
                  </td>

                  <td
                    align="right"
                    style="
                      padding:12px 0 0;
                      border-top:1px solid #dddddd;
                      font-weight:700;
                    "
                  >
                    ${formatCurrency(amountPaid)}
                  </td>
                </tr>
              `
          }
        </table>
      </div>

      <!-- PRODUCTS -->

      <h3
        style="
          margin:26px 0 10px;
          font-size:18px;
        "
      >
        Order Items
      </h3>

      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        style="
          border-collapse:collapse;
          font-size:14px;
        "
      >
        <thead>
          <tr>
            <th
              align="left"
              style="
                padding:10px 8px;
                border-bottom:2px solid #111111;
              "
            >
              Product
            </th>

            <th
              align="center"
              style="
                padding:10px 8px;
                border-bottom:2px solid #111111;
              "
            >
              Qty
            </th>

            <th
              align="right"
              style="
                padding:10px 8px;
                border-bottom:2px solid #111111;
              "
            >
              Amount
            </th>
          </tr>
        </thead>

        <tbody>
          ${buildItemsHtml(items)}
        </tbody>
      </table>

      ${buildAddressHtml(order?.address)}

      ${
        trackingUrl
          ? `
            <div style="text-align:center; margin-top:25px;">
              <a
                href="${escapeHtml(trackingUrl)}"
                style="
                  display:inline-block;
                  padding:12px 22px;
                  background:#f5c518;
                  color:#111111;
                  text-decoration:none;
                  border-radius:8px;
                  font-weight:700;
                "
              >
                Track My Order
              </a>
            </div>
          `
          : ""
      }

      <p style="margin-top:25px;">
        Your payment has been verified successfully and your
        order is now confirmed.
      </p>
    `,
  });

  const text = `
Glyrus Payment Confirmation

Hello ${name},

Your payment has been successfully received.

Order Number: ${orderNumber}
Tracking Number: ${trackingNumber}
Payment Date: ${paymentDate}
Payment Method: ${
    paymentMethod === "COD" ? "COD + Online COD Charge" : "Razorpay"
  }
Payment ID: ${paymentId}

Order Total: ${formatCurrency(orderTotal)}
Amount Paid: ${formatCurrency(amountPaid)}
${
  paymentMethod === "COD"
    ? `COD Charge Paid Online: ${formatCurrency(codCharge)}
Remaining Amount on Delivery: ${formatCurrency(remainingCodAmount)}`
    : ""
}

Your order is now confirmed.

Thank you for shopping with Glyrus.
  `.trim();

  return sendEmail({
    to: email,
    subject: `Payment Confirmed - Glyrus ${orderNumber}`,
    html,
    text,
  });
};

/* =======================================================
   ORDER STATUS EMAIL
======================================================= */

export const sendOrderStatusEmail = async (order, status, options = {}) => {
  const email = getCustomerEmail(order);

  if (!email) {
    return null;
  }

  const name = getCustomerName(order);

  const orderNumber = order?.orderNumber || "N/A";

  const trackingNumber = order?.trackingNumber || "";

  const trackingUrl =
    typeof options === "object" && options !== null
      ? options.trackingUrl || order?.shippingInformation?.trackingUrl || ""
      : order?.shippingInformation?.trackingUrl || "";

  const statusMessages = {
    Pending: "Your order has been received and is awaiting confirmation.",

    Confirmed: "Your order has been confirmed and is being prepared.",

    Customization: "Your customized NFC product is being prepared.",

    Production: "Your order has entered production.",

    Packed: "Your order has been packed and is ready for shipment.",

    Shipped: "Your order has been shipped.",

    "Out for Delivery": "Your order is out for delivery.",

    Delivered: "Your order has been delivered successfully.",

    Cancelled: "Your order has been cancelled.",

    Returned: "Your order has been marked as returned.",

    Refunded: "Your order has been refunded.",
  };

  const message =
    statusMessages[status] || `Your order status is now ${status}.`;

  const trackingSection = trackingNumber
    ? `
          <div
            style="
              margin:22px 0;
              padding:18px;
              background:#fff8d9;
              border-radius:12px;
            "
          >
            <strong>
              Tracking Number:
            </strong>

            ${escapeHtml(trackingNumber)}

            ${
              trackingUrl
                ? `
                  <div style="margin-top:12px;">
                    <a
                      href="${escapeHtml(trackingUrl)}"
                      style="
                        display:inline-block;
                        padding:11px 18px;
                        background:#f5c518;
                        color:#111111;
                        text-decoration:none;
                        border-radius:8px;
                        font-weight:700;
                      "
                    >
                      Track Order
                    </a>
                  </div>
                `
                : ""
            }
          </div>
        `
    : "";

  const html = emailLayout({
    title: `Order ${status}`,

    preheader: `Glyrus order ${orderNumber} is now ${status}.`,

    content: `
          <h1
            style="
              margin:0 0 12px;
              font-size:25px;
            "
          >
            Order Update
          </h1>

          <p>
            Hello ${escapeHtml(name)},
          </p>

          <p>
            ${escapeHtml(message)}
          </p>

          <div
            style="
              margin:22px 0;
              padding:16px 18px;
              border-left:4px solid #f5c518;
              background:#f8f8f8;
            "
          >
            <strong>
              Current Status:
            </strong>

            ${escapeHtml(status)}

            <br />

            <strong>
              Order Number:
            </strong>

            ${escapeHtml(orderNumber)}
          </div>

          ${trackingSection}
        `,
  });

  return sendEmail({
    to: email,
    subject: `Glyrus Order ${status} - ${orderNumber}`,
    html,
    text: `Your Glyrus order ${orderNumber} is now ${status}. ${message}`,
  });
};

/* =======================================================
   CANCELLATION
======================================================= */

export const sendCancellationEmail = async (order) =>
  sendOrderStatusEmail(order, "Cancelled");

/* =======================================================
   REFUND
======================================================= */

export const sendRefundEmail = async (order) =>
  sendOrderStatusEmail(order, "Refunded");

/* =======================================================
   CANCELLATION / REFUND
   COMPATIBILITY EXPORT
======================================================= */

export const sendCancellationRefundEmail = async (order, status) => {
  const normalizedStatus = status === "Refunded" ? "Refunded" : "Cancelled";

  return sendOrderStatusEmail(order, normalizedStatus);
};

/* =======================================================
   SUPPORT EMAIL
======================================================= */

export const sendSupportEmail = async ({
  name,
  email,
  mobile = "",
  subject = "Glyrus Support Request",
  message,
}) => {
  const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER;

  if (!supportEmail) {
    throw new Error("SUPPORT_EMAIL or SMTP_USER must be configured.");
  }

  const html = emailLayout({
    title: "New Support Request",

    preheader: "A new Glyrus support request has been received.",

    content: `
          <h1
            style="
              margin:0 0 20px;
              font-size:25px;
            "
          >
            New Support Request
          </h1>

          <p>
            <strong>Name:</strong>
            ${escapeHtml(name)}
          </p>

          <p>
            <strong>Email:</strong>
            ${escapeHtml(email)}
          </p>

          ${
            mobile
              ? `
                <p>
                  <strong>Mobile:</strong>
                  ${escapeHtml(mobile)}
                </p>
              `
              : ""
          }

          <p>
            <strong>Subject:</strong>
            ${escapeHtml(subject)}
          </p>

          <div
            style="
              margin-top:20px;
              padding:18px;
              background:#f7f7f7;
              border-radius:12px;
            "
          >
            <strong>
              Message
            </strong>

            <p
              style="
                margin-bottom:0;
                white-space:pre-wrap;
              "
            >
              ${escapeHtml(message)}
            </p>
          </div>
        `,
  });

  return sendEmail({
    to: supportEmail,
    replyTo: email,
    subject,
    html,
    text: `Support request from ${name} (${email}): ${message}`,
  });
};

/* =======================================================
   NFC REQUEST NOTIFICATION
======================================================= */

export const sendRequestNotificationEmail = async ({
  name,
  email,
  mobile,
  requirement,
}) => {
  const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER;

  if (!supportEmail) {
    throw new Error("SUPPORT_EMAIL or SMTP_USER must be configured.");
  }

  const html = emailLayout({
    title: "New NFC Request",

    preheader: "A new NFC product request has been submitted.",

    content: `
          <h1
            style="
              margin:0 0 20px;
              font-size:25px;
            "
          >
            New NFC Product Request
          </h1>

          <p>
            <strong>Name:</strong>
            ${escapeHtml(name)}
          </p>

          <p>
            <strong>Email:</strong>
            ${escapeHtml(email)}
          </p>

          <p>
            <strong>Mobile:</strong>
            ${escapeHtml(mobile)}
          </p>

          <div
            style="
              margin-top:20px;
              padding:18px;
              background:#fff8d9;
              border-radius:12px;
            "
          >
            <strong>
              Requirement
            </strong>

            <p
              style="
                margin-bottom:0;
                white-space:pre-wrap;
              "
            >
              ${escapeHtml(requirement)}
            </p>
          </div>
        `,
  });

  return sendEmail({
    to: supportEmail,
    replyTo: email,
    subject: `New Glyrus NFC Request - ${name}`,
    html,
    text: `New NFC request from ${name} (${email}). Requirement: ${requirement}`,
  });
};

/* =======================================================
   SMTP CONNECTION TEST
======================================================= */

export const verifyEmailConnection = async () => {
  const mailer = ensureTransporter();

  return mailer.verify();
};

export const sendAdminLoginOtpEmail = async (email, otp) => {
  const html = emailLayout({
    title: "Admin Login Verification",
    preheader: "Your Glyrus admin login verification code.",
    content: `
      <h2 style="margin:0 0 16px;">Verify Your Login</h2>
      <p>Your one-time password (OTP) for Glyrus Admin is:</p>
      <div style="margin:24px 0;padding:20px;background:#fff8d9;border-radius:12px;text-align:center;">
        <strong style="font-size:32px;letter-spacing:8px;">${escapeHtml(otp)}</strong>
      </div>
      <p>This code expires in 5 minutes. Do not share it with anyone.</p>
      <p>If you did not request this code, you can ignore this email.</p>
    `,
  });

  return sendEmail({
    to: email,
    subject: "Glyrus Admin Login OTP",
    html,
    text: `Your Glyrus Admin login OTP is ${otp}. It expires in 5 minutes. Do not share this code.`,
  });
};

/* =======================================================
   DEFAULT EXPORT
======================================================= */

export default {
  sendOrderConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendOrderStatusEmail,
  sendCancellationEmail,
  sendRefundEmail,
  sendCancellationRefundEmail,
  sendSupportEmail,
  sendRequestNotificationEmail,
  verifyEmailConnection,
  sendAdminLoginOtpEmail,
};
