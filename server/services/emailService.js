// Glyrus — server/services/emailService.js

import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoDirectory = path.resolve(__dirname, "../../client/src/assets/logo");
const roundLogoPath = path.join(logoDirectory, "glyrus_round_logo.png");
const nameLogoPath = path.join(logoDirectory, "name_logo.png");

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

const getFromAddress = () =>
  process.env.SMTP_FROM ||
  process.env.SMTP_USER ||
  "Glyrus <no-reply@glyrus.com>";

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

const ensureTransporter = () => {
  if (!transporter) {
    throw new Error("SMTP configuration is incomplete.");
  }

  return transporter;
};

const sendEmail = async ({
  to,
  subject,
  html,
  text,
  replyTo,
  attachments = [],
}) => {
  if (!to) throw new Error("Recipient email is required.");

  return ensureTransporter().sendMail({
    from: getFromAddress(),
    to,
    subject,
    html,
    text,
    attachments,
    ...(replyTo ? { replyTo } : {}),
  });
};

// Shared layout for non-order emails.
const emailLayout = ({ title, preheader = "", content }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;background:#f5f6f8;font-family:Arial,Helvetica,sans-serif;color:#171717;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${escapeHtml(preheader)}
  </div>
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
    style="background:#f5f6f8;padding:20px 8px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
          style="max-width:620px;background:#fff;border:1px solid #e8e8e8;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:20px 24px;background:#f5c518;">
              <div style="font-size:27px;font-weight:800;letter-spacing:1px;color:#111;">GLYRUS</div>
              <div style="margin-top:3px;font-size:12px;color:#333;">NFC Products Marketplace</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;line-height:1.6;">${content}</td>
          </tr>
          <tr>
            <td style="padding:16px;background:#111;color:#fff;text-align:center;font-size:11px;">
              © ${new Date().getFullYear()} Glyrus. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/* =========================================================
   PDF INVOICE
========================================================= */

const generateInvoicePdf = (order, details) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 42, bottom: 48, left: 42, right: 42 },
        bufferPages: true,
        info: {
          Title: `Glyrus Invoice ${details.orderNumber}`,
          Author: "Glyrus",
          Subject: "Order and Payment Invoice",
        },
      });

      const chunks = [];
      const pageWidth =
        doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const left = doc.page.margins.left;
      const right = doc.page.width - doc.page.margins.right;
      const bottom = doc.page.height - doc.page.margins.bottom;

      const pricing = order?.pricing || {};
      const address = order?.address || {};
      const items = getOrderItems(order);

      const safeText = (value, fallback = "—") => {
        if (value === undefined || value === null || value === "") {
          return fallback;
        }
        return String(value);
      };

      const money = (value) => formatCurrency(Number(value) || 0);

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("error", reject);
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // Brand palette
      const C = {
        black: "#171717",
        dark: "#252525",
        gray: "#646464",
        muted: "#858585",
        border: "#E5E7EB",
        soft: "#F7F8FA",
        yellow: "#F5C518",
        yellowSoft: "#FFF9E4",
        green: "#16803C",
        greenSoft: "#EAF6EE",
        white: "#FFFFFF",
      };

      const roundedRect = (x, y, w, h, radius, fill, stroke) => {
        doc.roundedRect(x, y, w, h, radius);
        if (fill) doc.fillColor(fill);
        if (stroke) doc.strokeColor(stroke);
        if (fill && stroke) doc.fillAndStroke();
        else if (fill) doc.fill();
        else if (stroke) doc.stroke();
      };

      const drawLine = (y, color = C.border, thickness = 1) => {
        doc.save();
        doc
          .moveTo(left, y)
          .lineTo(right, y)
          .lineWidth(thickness)
          .strokeColor(color)
          .stroke();
        doc.restore();
      };

      const sectionTitle = (title, x = left, y = doc.y) => {
        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .fillColor(C.black)
          .text(title.toUpperCase(), x, y, { width: pageWidth });

        return y + 22;
      };

      const drawLabelValue = (label, value, x, y, width, options = {}) => {
        doc
          .font("Helvetica")
          .fontSize(options.labelSize || 8)
          .fillColor(C.muted)
          .text(label.toUpperCase(), x, y, { width });

        doc
          .font(options.bold ? "Helvetica-Bold" : "Helvetica")
          .fontSize(options.valueSize || 9)
          .fillColor(options.color || C.dark)
          .text(safeText(value), x, y + 13, {
            width,
            lineGap: 1,
          });
      };

      const formatDate = (value) => {
        if (!value) return details.paymentDate || "—";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);

        return date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      };

      const addressParts = [
        address.house || address.houseFlat,
        address.street,
        address.area,
        address.city,
        address.state,
        address.pincode,
      ].filter(Boolean);

      const customerName = details.name || getCustomerName(order);

      const invoiceDate =
        formatDate(order?.payment?.paidAt) || details.paymentDate;

      const subtotal = Number(pricing.subtotal ?? order?.subtotal ?? 0) || 0;
      const discount = Number(pricing.discount ?? order?.discount ?? 0) || 0;
      const shipping =
        Number(pricing.shipping ?? order?.shippingCharge ?? 0) || 0;
      const codCharge =
        Number(
          pricing.codCharge ?? order?.codCharge ?? details.codCharge ?? 0,
        ) || 0;

      // =====================================================
      // HEADER — balanced logo, wordmark and invoice number
      // =====================================================

      const headerY = 38;
      const logoSize = 43;
      const wordmarkX = left + 55;
      const wordmarkWidth = 165;
      const headerRightWidth = 155;

      if (fs.existsSync(roundLogoPath)) {
        doc.image(roundLogoPath, left, headerY, {
          fit: [logoSize, logoSize],
          align: "center",
          valign: "center",
        });
      } else {
        roundedRect(left, headerY, logoSize, logoSize, 9, C.yellow);
        doc
          .font("Helvetica-Bold")
          .fontSize(21)
          .fillColor(C.black)
          .text("G", left, headerY + 8, {
            width: logoSize,
            align: "center",
          });
      }

      if (fs.existsSync(nameLogoPath)) {
        doc.image(nameLogoPath, wordmarkX, headerY + 4, {
          fit: [wordmarkWidth, 35],
          align: "left",
          valign: "center",
        });
      } else {
        doc
          .font("Helvetica-Bold")
          .fontSize(24)
          .fillColor(C.black)
          .text("GLYRUS", wordmarkX, headerY + 8, {
            width: wordmarkWidth,
          });
      }

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor(C.black)
        .text("TAX / ORDER", right - headerRightWidth, headerY + 5, {
          width: headerRightWidth,
          align: "right",
        });

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(C.gray)
        .text("PAYMENT INVOICE", right - headerRightWidth, headerY + 22, {
          width: headerRightWidth,
          align: "right",
        });

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(C.gray)
        .text(
          `Invoice date: ${safeText(details.paymentDate)}`,
          right - headerRightWidth,
          headerY + 36,
          {
            width: headerRightWidth,
            align: "right",
          },
        );

      // Yellow accent rule
      doc.rect(left, 96, pageWidth, 4).fill(C.yellow);

      // Invoice number strip
      roundedRect(left, 113, pageWidth, 43, 7, C.soft);

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(C.gray)
        .text("INVOICE NUMBER", left + 13, 122);

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(C.black)
        .text(safeText(details.orderNumber), left + 13, 135, {
          width: pageWidth * 0.58,
        });

      roundedRect(right - 116, 122, 102, 23, 11, C.greenSoft);

      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(C.green)
        .text("✓  PAID / CONFIRMED", right - 112, 130, {
          width: 94,
          align: "center",
        });

      // =====================================================
      // CUSTOMER AND PAYMENT CARDS
      // =====================================================

      const cardY = 174;
      const gap = 14;
      const cardWidth = (pageWidth - gap) / 2;
      const cardHeight = 130;
      const rightCardX = left + cardWidth + gap;

      roundedRect(left, cardY, cardWidth, cardHeight, 8, C.white, C.border);
      roundedRect(
        rightCardX,
        cardY,
        cardWidth,
        cardHeight,
        8,
        C.white,
        C.border,
      );

      // Customer card
      doc.rect(left, cardY, cardWidth, 4).fill(C.yellow);

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(C.black)
        .text("BILL TO", left + 13, cardY + 15);

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(C.dark)
        .text(safeText(customerName), left + 13, cardY + 36, {
          width: cardWidth - 26,
        });

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(C.gray)
        .text(safeText(details.email), left + 13, cardY + 53, {
          width: cardWidth - 26,
        });

      const addressText =
        addressParts.join(", ") || "Delivery address not provided";
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(C.gray)
        .text(addressText, left + 13, cardY + 69, {
          width: cardWidth - 26,
          height: 34,
          lineGap: 2,
          ellipsis: true,
        });

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(C.gray)
        .text(
          `Mobile: ${safeText(address.mobile || order?.mobile || order?.phone)}`,
          left + 13,
          cardY + 108,
          { width: cardWidth - 26 },
        );

      // Payment card
      doc.rect(rightCardX, cardY, cardWidth, 4).fill(C.black);

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(C.black)
        .text("PAYMENT DETAILS", rightCardX + 13, cardY + 15);

      const paymentRows = [
        ["Payment method", details.paymentMethod],
        ["Payment ID", details.paymentId],
        ["Payment date", details.paymentDate],
        ["Tracking ID", details.trackingNumber],
      ];

      let paymentY = cardY + 37;

      for (const [label, value] of paymentRows) {
        doc
          .font("Helvetica")
          .fontSize(7.5)
          .fillColor(C.muted)
          .text(`${label}:`, rightCardX + 13, paymentY, {
            width: 76,
          });

        doc
          .font("Helvetica-Bold")
          .fontSize(7.5)
          .fillColor(C.dark)
          .text(safeText(value), rightCardX + 91, paymentY, {
            width: cardWidth - 104,
            ellipsis: true,
          });

        paymentY += 19;
      }

      // Tracking hyperlink row
      if (details.trackingUrl) {
        doc
          .font("Helvetica-Bold")
          .fontSize(8)
          .fillColor("#2457C5")
          .text(
            "Track your order online",
            rightCardX + 13,
            cardY + cardHeight - 19,
            {
              width: cardWidth - 26,
              link: details.trackingUrl,
              underline: true,
            },
          );
      }

      // =====================================================
      // ITEMS TABLE
      // =====================================================

      const tableTitleY = 326;

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor(C.black)
        .text("Order Items", left, tableTitleY);

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(C.gray)
        .text(
          `${items.length} item${items.length === 1 ? "" : "s"}`,
          left,
          tableTitleY + 17,
        );

      const tableTop = tableTitleY + 36;
      const tableHeaderHeight = 30;

      const columns = {
        product: left + 12,
        qty: left + pageWidth * 0.64,
        unit: left + pageWidth * 0.75,
        amount: left + pageWidth * 0.87,
      };

      const productWidth = pageWidth * 0.54;

      const drawTableHeader = (y) => {
        roundedRect(left, y, pageWidth, tableHeaderHeight, 5, C.black);

        doc.font("Helvetica-Bold").fontSize(8).fillColor(C.white);

        doc.text("PRODUCT DESCRIPTION", columns.product, y + 10, {
          width: productWidth,
        });

        doc.text("QTY", columns.qty, y + 10, {
          width: 28,
          align: "right",
        });

        doc.text("UNIT PRICE", columns.unit - 5, y + 10, {
          width: 48,
          align: "right",
        });

        doc.text("AMOUNT", columns.amount - 5, y + 10, {
          width: 53,
          align: "right",
        });
      };

      let tableY = tableTop;
      drawTableHeader(tableY);
      tableY += tableHeaderHeight;

      const drawNewTablePage = () => {
        doc.addPage();
        doc.x = left;
        tableY = doc.page.margins.top;

        doc
          .font("Helvetica-Bold")
          .fontSize(15)
          .fillColor(C.black)
          .text("ORDER ITEMS — CONTINUED", left, tableY);

        tableY += 30;
        drawTableHeader(tableY);
        tableY += tableHeaderHeight;
      };

      if (!items.length) {
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor(C.gray)
          .text(
            "No item details were provided for this order.",
            left + 12,
            tableY + 13,
          );

        tableY += tableHeaderHeight + 35;
      } else {
        items.forEach((item, index) => {
          const productName = safeText(
            item.name || item.title,
            "Glyrus Product",
          );
          const quantity = Number(item.quantity) || 1;
          const price = Number(item.price) || 0;
          const customization = item.customization
            ? typeof item.customization === "object"
              ? JSON.stringify(item.customization)
              : String(item.customization)
            : "";

          const nameHeight = doc.heightOfString(productName, {
            width: productWidth,
            font: "Helvetica",
            fontSize: 9,
          });

          const customizationHeight = customization
            ? doc.heightOfString(customization, {
                width: productWidth,
                font: "Helvetica",
                fontSize: 7,
              }) + 4
            : 0;

          const rowHeight = Math.max(43, nameHeight + customizationHeight + 18);

          if (tableY + rowHeight > bottom - 145) {
            drawNewTablePage();
          }

          if (index % 2 === 0) {
            doc.rect(left, tableY, pageWidth, rowHeight).fill("#FAFAFA");
          }

          const contentY = tableY + 12;

          doc
            .font("Helvetica")
            .fontSize(9)
            .fillColor(C.dark)
            .text(productName, columns.product, contentY, {
              width: productWidth,
            });

          if (customization) {
            doc
              .font("Helvetica")
              .fontSize(7)
              .fillColor(C.gray)
              .text(customization, columns.product, contentY + nameHeight + 3, {
                width: productWidth,
              });
          }

          doc
            .font("Helvetica")
            .fontSize(9)
            .fillColor(C.dark)
            .text(String(quantity), columns.qty, contentY, {
              width: 28,
              align: "right",
            });

          doc.text(money(price), columns.unit - 5, contentY, {
            width: 48,
            align: "right",
          });

          doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .fillColor(C.dark)
            .text(money(price * quantity), columns.amount - 5, contentY, {
              width: 53,
              align: "right",
            });

          tableY += rowHeight;
          doc
            .moveTo(left, tableY)
            .lineTo(right, tableY)
            .lineWidth(0.6)
            .strokeColor(C.border)
            .stroke();
        });
      }

      // =====================================================
      // TOTALS — ALIGNED, CLEAR HIERARCHY
      // =====================================================

      let totalsY = Math.max(tableY + 25, 455);
      const totalsWidth = 255;
      const totalsX = right - totalsWidth;

      if (totalsY + 150 > bottom) {
        doc.addPage();
        totalsY = doc.page.margins.top + 8;
      }

      const drawTotalRow = (label, value, options = {}) => {
        const rowHeight = options.rowHeight || 23;

        doc
          .font(options.bold ? "Helvetica-Bold" : "Helvetica")
          .fontSize(options.fontSize || 9)
          .fillColor(options.color || C.dark)
          .text(label, totalsX, totalsY, {
            width: totalsWidth * 0.58,
          });

        doc
          .font(options.bold ? "Helvetica-Bold" : "Helvetica")
          .fontSize(options.fontSize || 9)
          .fillColor(options.color || C.dark)
          .text(value, totalsX + totalsWidth * 0.58, totalsY, {
            width: totalsWidth * 0.42,
            align: "right",
          });

        totalsY += rowHeight;
      };

      drawTotalRow("Subtotal", money(subtotal));
      if (discount > 0) {
        drawTotalRow("Discount", `−${money(discount)}`, {
          color: C.green,
        });
      }
      drawTotalRow("Shipping", shipping === 0 ? "FREE" : money(shipping));
      if (codCharge > 0) {
        drawTotalRow("COD charge", money(codCharge));
      }

      totalsY += 3;
      doc
        .moveTo(totalsX, totalsY)
        .lineTo(right, totalsY)
        .lineWidth(1)
        .strokeColor(C.border)
        .stroke();

      totalsY += 13;

      roundedRect(
        totalsX - 10,
        totalsY - 8,
        totalsWidth + 10,
        38,
        6,
        C.yellowSoft,
      );

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(C.black)
        .text("ORDER TOTAL", totalsX, totalsY + 3, {
          width: totalsWidth * 0.58,
        });

      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .fillColor(C.black)
        .text(
          money(details.orderTotal),
          totalsX + totalsWidth * 0.58,
          totalsY + 2,
          {
            width: totalsWidth * 0.42,
            align: "right",
          },
        );

      totalsY += 42;

      drawTotalRow("Amount paid", money(details.amountPaid), {
        bold: true,
        color: C.green,
        fontSize: 10,
        rowHeight: 22,
      });

      if (details.remainingCodAmount > 0) {
        drawTotalRow(
          "Remaining on delivery",
          money(details.remainingCodAmount),
          {
            bold: true,
            fontSize: 9,
          },
        );
      }

      // =====================================================
      // TRACKING + DASHBOARD INFORMATION
      // =====================================================

      let infoY = Math.max(totalsY + 18, 625);

      if (infoY + 65 > bottom) {
        doc.addPage();
        infoY = doc.page.margins.top + 10;
      }

      roundedRect(left, infoY, pageWidth, 55, 7, C.soft, C.border);

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(C.black)
        .text("ORDER SUPPORT & TRACKING", left + 12, infoY + 10);

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(C.gray)
        .text(
          details.trackingUrl
            ? "Use the clickable tracking link above or in your email to follow your order."
            : "Your tracking details will be available when tracking information is provided.",
          left + 12,
          infoY + 25,
          { width: pageWidth - 24 },
        );

      // =====================================================
      // FOOTER
      // =====================================================

      const footerY = doc.page.height - 38;

      doc
        .moveTo(left, footerY - 8)
        .lineTo(right, footerY - 8)
        .lineWidth(0.7)
        .strokeColor(C.border)
        .stroke();

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(C.black)
        .text("Thank you for choosing Glyrus.", left, footerY, {
          width: pageWidth,
          align: "center",
        });

      doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(C.muted)
        .text(
          "This invoice is generated electronically for your order records.",
          left,
          footerY + 13,
          {
            width: pageWidth,
            align: "center",
          },
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });

/* =========================================================
   EMAIL HELPERS
========================================================= */

const buildItemsHtml = (items) =>
  items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;">
            <strong>${escapeHtml(item.name || item.title || "Glyrus Product")}</strong>
          </td>
          <td align="center" style="padding:12px 8px;border-bottom:1px solid #eee;">
            ${Number(item.quantity) || 1}
          </td>
          <td align="right" style="padding:12px 8px;border-bottom:1px solid #eee;">
            ${formatCurrency(Number(item.price) * (Number(item.quantity) || 1))}
          </td>
        </tr>
      `,
    )
    .join("");

const buildAddressHtml = (address) => {
  if (!address) return "";

  return `
    <div style="margin-top:22px;padding:18px;border:1px solid #eee;border-radius:10px;">
      <strong>Delivery Address</strong>
      <div style="margin-top:8px;color:#555;font-size:13px;line-height:1.7;">
        ${escapeHtml(address.name || "")}<br/>
        ${escapeHtml(address.house || address.houseFlat || "")}
        ${address.street ? `<br/>${escapeHtml(address.street)}` : ""}
        ${address.area ? `<br/>${escapeHtml(address.area)}` : ""}
        <br/>
        ${escapeHtml(address.city || "")}, ${escapeHtml(address.state || "")}
        - ${escapeHtml(address.pincode || "")}
        ${address.mobile ? `<br/>Mobile: ${escapeHtml(address.mobile)}` : ""}
      </div>
    </div>
  `;
};

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
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;font-size:13px;">
      <tr><td style="padding:7px 0;">Subtotal</td><td align="right">${formatCurrency(subtotal)}</td></tr>
      ${
        discount > 0
          ? `<tr><td style="padding:7px 0;color:#188038;">Discount</td><td align="right" style="color:#188038;">-${formatCurrency(discount)}</td></tr>`
          : ""
      }
      <tr><td style="padding:7px 0;">Shipping</td><td align="right">${shipping === 0 ? "FREE" : formatCurrency(shipping)}</td></tr>
      ${
        codCharge > 0
          ? `<tr><td style="padding:7px 0;">COD Charge</td><td align="right">${formatCurrency(codCharge)}</td></tr>`
          : ""
      }
      <tr>
        <td style="padding-top:12px;border-top:1px solid #ddd;font-size:16px;font-weight:bold;">Total</td>
        <td align="right" style="padding-top:12px;border-top:1px solid #ddd;font-size:16px;font-weight:bold;">${formatCurrency(total)}</td>
      </tr>
    </table>
  `;
};

/* =========================================================
   ORDER CONFIRMATION
   Payment email includes the invoice; prevent duplicate email.
========================================================= */

export const sendOrderConfirmationEmail = async () => null;

/* =========================================================
   PAYMENT CONFIRMATION + ATTACHED PDF INVOICE
========================================================= */

export const sendPaymentConfirmationEmail = async (order) => {
  const email = getCustomerEmail(order);
  if (!email) return null;

  const name = getCustomerName(order);
  const orderNumber = order?.orderNumber || "N/A";
  const trackingNumber = order?.trackingNumber || "Will be generated shortly";

  const paymentId =
    order?.payment?.razorpayPaymentId || order?.razorpayPaymentId || "N/A";

  const paymentMethod = String(
    order?.paymentMethod || order?.payment?.method || "",
  ).toUpperCase();

  const isCOD = paymentMethod.includes("COD");

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
    Number(
      order?.pricing?.grandTotal ??
        order?.pricing?.total ??
        order?.totalAmount ??
        order?.total ??
        0,
    ) || 0;

  const codCharge =
    Number(order?.pricing?.codCharge ?? order?.codCharge ?? 0) || 0;

  const remainingCodAmount = isCOD ? Math.max(0, orderTotal - amountPaid) : 0;

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

  const dashboardUrl = "https://tapreview-rho.vercel.app/signup";

  const invoicePdf = await generateInvoicePdf(order, {
    name,
    email,
    orderNumber,
    trackingNumber,
    trackingUrl,
    paymentId,
    paymentMethod: isCOD ? "COD + Online COD Charge" : "Razorpay",
    paymentDate,
    amountPaid,
    orderTotal,
    codCharge,
    remainingCodAmount,
  });

  const html = emailLayout({
    title: "Payment Successful",
    preheader: `Payment confirmed for order ${orderNumber}. Your PDF invoice is attached.`,
    content: `
      <div style="text-align:center;padding:8px 0 18px;">
        <div style="display:inline-block;width:48px;height:48px;line-height:48px;border-radius:50%;background:#e8f5e9;color:#188038;font-size:30px;font-weight:bold;">
          ✓
        </div>
        <h1 style="margin:12px 0 7px;font-size:25px;color:#188038;">
          Payment Successful!
        </h1>
        <p style="margin:0;color:#555;font-size:14px;line-height:1.7;">
          Hello ${escapeHtml(name)}, your Glyrus order has been confirmed.
        </p>
      </div>

      <div style="margin:20px 0;padding:18px;background:#fff9df;border:1px solid #f5c518;border-radius:12px;">
        <div style="font-size:11px;color:#777;letter-spacing:1px;">
          ORDER NUMBER
        </div>
        <div style="margin-top:5px;font-size:17px;font-weight:800;color:#171717;overflow-wrap:anywhere;">
          ${escapeHtml(orderNumber)}
        </div>

        <div style="margin-top:15px;font-size:11px;color:#777;letter-spacing:1px;">
          TRACKING NUMBER
        </div>
        <div style="margin-top:5px;font-size:14px;font-weight:700;overflow-wrap:anywhere;">
          ${
            trackingUrl
              ? `<a href="${escapeHtml(trackingUrl)}" style="color:#2457c5;text-decoration:underline;">${escapeHtml(trackingNumber)}</a>`
              : escapeHtml(trackingNumber)
          }
        </div>
      </div>

      ${
        trackingUrl
          ? `
            <div style="text-align:center;margin:24px 0;">
              <a href="${escapeHtml(trackingUrl)}"
                 style="display:inline-block;padding:14px 26px;background:#f5c518;color:#171717;text-decoration:none;border-radius:8px;font-size:14px;font-weight:800;border:1px solid #dfb000;">
                TRACK MY ORDER &rarr;
              </a>
            </div>
          `
          : ""
      }

      <div style="margin:28px 0;padding:24px 16px;background:#fff9df;border:2px solid #f5c518;border-radius:12px;text-align:center;">
        <div style="font-size:20px;font-weight:800;color:#171717;margin-bottom:7px;">
          Explore Your Business Dashboard
        </div>

        <p style="margin:0 0 18px;color:#555;font-size:13px;line-height:1.7;">
          Register now to access your dashboard and explore Glyrus business tools.
        </p>

        <a href="${dashboardUrl}"
           style="display:inline-block;padding:15px 24px;background:#111111;color:#f5c518;text-decoration:none;border-radius:8px;font-size:14px;font-weight:800;border:2px solid #f5c518;box-shadow:0 4px 0 #d4a900;">
          REGISTER &amp; ACCESS DASHBOARD &rarr;
        </a>

        <div style="margin-top:13px;font-size:11px;color:#777;">
          Click above to get started
        </div>
      </div>

      <div style="margin-top:26px;padding-top:18px;border-top:1px solid #eeeeee;">
        <p style="margin:0;color:#555;font-size:13px;line-height:1.8;">
          Thank you for choosing Glyrus. We appreciate your business.
          <br/>
          Regards,
          <br/>
          <strong style="color:#171717;">Team Glyrus</strong>
        </p>
      </div>
    `,
  });

  const text = `
Glyrus — Payment Successful

Hello ${name}, your order ${orderNumber} is confirmed.
Tracking Number: ${trackingNumber}
${trackingUrl ? `Track your order: ${trackingUrl}\n` : ""}
Your detailed PDF invoice is attached.
Business Dashboard: ${dashboardUrl}

Thank you for choosing Glyrus.
Regards,
Team Glyrus
  `.trim();

  return sendEmail({
    to: email,
    subject: `Payment Confirmed - Glyrus ${orderNumber}`,
    html,
    text,
    attachments: [
      {
        filename: `Glyrus-Invoice-${String(orderNumber).replace(/[^a-zA-Z0-9_-]/g, "-")}.pdf`,
        content: invoicePdf,
        contentType: "application/pdf",
      },
    ],
  });
};

/* =========================================================
   ORDER STATUS EMAIL
========================================================= */

export const sendOrderStatusEmail = async (order, status, options = {}) => {
  const email = getCustomerEmail(order);
  if (!email) return null;

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
      <div style="margin:22px 0;padding:16px;background:#fff9df;border-radius:10px;">
        <strong>Tracking Number:</strong><br/>
        ${
          trackingUrl
            ? `<a href="${escapeHtml(trackingUrl)}" style="color:#2457c5;">${escapeHtml(trackingNumber)}</a>`
            : escapeHtml(trackingNumber)
        }
        ${
          trackingUrl
            ? `<div style="margin-top:12px;"><a href="${escapeHtml(trackingUrl)}" style="display:inline-block;padding:10px 16px;background:#f5c518;color:#111;text-decoration:none;border-radius:7px;font-weight:bold;">Track Order</a></div>`
            : ""
        }
      </div>
    `
    : "";

  const html = emailLayout({
    title: `Order ${status}`,
    preheader: `Glyrus order ${orderNumber} is now ${status}.`,
    content: `
      <h1 style="margin:0 0 12px;font-size:23px;">Order Update</h1>
      <p>Hello ${escapeHtml(getCustomerName(order))},</p>
      <p>${escapeHtml(message)}</p>
      <div style="margin:22px 0;padding:16px;border-left:4px solid #f5c518;background:#f8f8f8;">
        <strong>Current Status:</strong> ${escapeHtml(status)}<br/>
        <strong>Order Number:</strong> ${escapeHtml(orderNumber)}
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

/* =========================================================
   CANCELLATION / REFUND
========================================================= */

export const sendCancellationEmail = async (order) =>
  sendOrderStatusEmail(order, "Cancelled");

export const sendRefundEmail = async (order) =>
  sendOrderStatusEmail(order, "Refunded");

export const sendCancellationRefundEmail = async (order, status) => {
  const normalizedStatus = status === "Refunded" ? "Refunded" : "Cancelled";
  return sendOrderStatusEmail(order, normalizedStatus);
};

/* =========================================================
   SUPPORT EMAIL
========================================================= */

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
      <h1 style="margin:0 0 20px;font-size:24px;">New Support Request</h1>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      ${mobile ? `<p><strong>Mobile:</strong> ${escapeHtml(mobile)}</p>` : ""}
      <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <div style="margin-top:20px;padding:18px;background:#f7f7f7;border-radius:10px;">
        <strong>Message</strong>
        <p style="margin-bottom:0;white-space:pre-wrap;">${escapeHtml(message)}</p>
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

/* =========================================================
   NFC REQUEST NOTIFICATION
========================================================= */

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
      <h1 style="margin:0 0 20px;font-size:24px;">New NFC Product Request</h1>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Mobile:</strong> ${escapeHtml(mobile)}</p>
      <div style="margin-top:20px;padding:18px;background:#fff9df;border-radius:10px;">
        <strong>Requirement</strong>
        <p style="margin-bottom:0;white-space:pre-wrap;">${escapeHtml(requirement)}</p>
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

/* =========================================================
   SMTP CONNECTION TEST
========================================================= */

export const verifyEmailConnection = async () => {
  return ensureTransporter().verify();
};

/* =========================================================
   ADMIN LOGIN OTP
========================================================= */

export const sendAdminLoginOtpEmail = async (email, otp) => {
  const html = emailLayout({
    title: "Admin Login Verification",
    preheader: "Your Glyrus admin login verification code.",
    content: `
      <h2 style="margin:0 0 16px;">Verify Your Login</h2>
      <p>Your one-time password (OTP) for Glyrus Admin is:</p>
      <div style="margin:24px 0;padding:20px;background:#fff9df;border-radius:10px;text-align:center;">
        <strong style="font-size:32px;letter-spacing:8px;">${escapeHtml(otp)}</strong>
      </div>
      <p>This code expires in 5 minutes. Do not share this code with anyone.</p>
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

/* =========================================================
   DEFAULT EXPORT
========================================================= */

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
