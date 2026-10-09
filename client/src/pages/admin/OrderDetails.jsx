// Glyrus — OrderDetails.jsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowBackRounded,
  CheckCircleRounded,
  ContentCopyRounded,
  LocalShippingRounded,
  LocationOnRounded,
  PaymentRounded,
  PersonRounded,
  PhoneRounded,
  RefreshRounded,
  ShoppingBagRounded,
  SyncRounded,
  TimelineRounded,
  Inventory2Rounded,
  EventRounded,
  CreditCardRounded,
  ReceiptLongRounded,
  OpenInNewRounded,
} from "@mui/icons-material";

import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";
import formatCurrency from "../../utils/formatCurrency";

const MotionCard = motion(Card);

/* =========================================================
   CONSTANTS
========================================================= */

const GOLD = "#F4C430";
const GOLD_DARK = "#9B7600";
const GOLD_LIGHT = "#FFF8D9";

const DARK = "#151515";
const TEXT = "#262626";
const MUTED = "#8B8B8B";
const BORDER = "#ECECEC";
const BG = "#F7F7F7";

const ORDER_STATUSES = [
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
];

const STATUS_STEPS = [
  "Pending",
  "Confirmed",
  "Customization",
  "Production",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

/* =========================================================
   HELPERS
========================================================= */

const getOrderData = (data) =>
  data?.order ||
  data?.data?.order ||
  data?.data ||
  data;

const normalizeStatus = (status) =>
  String(status || "Pending")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

const formatStatus = (status) => {
  if (!status) return "Pending";

  return String(status)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const getStatusStyles = (status) => {
  const normalized = normalizeStatus(status);

  if (normalized === "delivered") {
    return {
      color: "#23763B",
      bgcolor: "#EAF8EF",
      border: "#CBEAD4",
    };
  }

  if (
    normalized === "shipped" ||
    normalized === "out for delivery"
  ) {
    return {
      color: "#1C5F9F",
      bgcolor: "#EAF4FC",
      border: "#CFE4F5",
    };
  }

  if (
    normalized === "cancelled" ||
    normalized === "returned" ||
    normalized === "refunded"
  ) {
    return {
      color: "#B3261E",
      bgcolor: "#FDEDEC",
      border: "#F5C9C6",
    };
  }

  if (
    normalized === "confirmed" ||
    normalized === "customization" ||
    normalized === "production" ||
    normalized === "packed"
  ) {
    return {
      color: "#876600",
      bgcolor: GOLD_LIGHT,
      border: "#F0DEA0",
    };
  }

  return {
    color: "#666",
    bgcolor: "#F2F2F2",
    border: "#E2E2E2",
  };
};

const getCustomer = (order) =>
  order?.customer ||
  order?.guestCustomer ||
  {};

const getAddress = (order) =>
  order?.address ||
  order?.shippingAddress ||
  {};

const getPaymentMethod = (order) =>
  order?.payment?.method ||
  order?.paymentMethod ||
  order?.payment?.mode ||
  "—";

const getPaymentStatus = (order) =>
  order?.payment?.status ||
  order?.paymentStatus ||
  "Pending";

const getItemPrice = (item) =>
  Number(
    item?.price ??
      item?.finalPrice ??
      item?.unitPrice ??
      0
  ) || 0;

const getItemQuantity = (item) =>
  Math.max(
    1,
    Number(
      item?.quantity ??
        item?.qty ??
        1
    ) || 1
  );

const getItemName = (item) =>
  item?.name ||
  item?.title ||
  item?.product?.name ||
  "Glyrus Product";

const getItemImage = (item) =>
  item?.image ||
  item?.imageUrl ||
  item?.thumbnail ||
  item?.product?.image ||
  item?.product?.images?.[0]?.url ||
  item?.product?.images?.[0] ||
  "";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatAddress = (address) => {
  const parts = [
    address?.addressLine1,
    address?.addressLine2,
    address?.street,
    address?.area,
    address?.locality,
    address?.city,
    address?.state,
    address?.pincode ||
      address?.postalCode ||
      address?.zipCode,
  ].filter(Boolean);

  if (parts.length) {
    return parts;
  }

  if (typeof address === "string") {
    return address
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const getOrderTotal = (
  order,
  items,
  subtotal,
  shipping,
  codCharge
) => {
  return (
    Number(
      order?.pricing?.total ??
        order?.pricing?.grandTotal ??
        order?.totalAmount ??
        order?.total
    ) ||
    Number(subtotal + shipping + codCharge) ||
    0
  );
};

const getPaymentSummary = (
  order,
  total,
  codCharge
) => {
  const paymentMethod = String(
    getPaymentMethod(order)
  )
    .trim()
    .toUpperCase();

  const paymentStatus = String(
    getPaymentStatus(order)
  )
    .trim()
    .toLowerCase();

  const rawPaidAmount =
    paymentStatus === "captured"
      ? Number(order?.payment?.amount) || 0
      : 0;

  const amountPaid = Math.min(
    Math.max(rawPaidAmount, 0),
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

  let displayStatus = "Payment Pending";

  if (fullyPaid) {
    displayStatus = "Fully Paid";
  } else if (partiallyPaid) {
    displayStatus = "Partially Paid";
  } else if (
    paymentMethod === "COD"
  ) {
    displayStatus = "Due on Delivery";
  }

  return {
    paymentMethod,
    paymentStatus,
    amountPaid,
    remainingAmount,
    fullyPaid,
    partiallyPaid,
    displayStatus,
    codCharge,
    dueOnDelivery:
      paymentMethod === "COD"
        ? remainingAmount
        : 0,
  };
};

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

const SectionTitle = ({
  icon,
  title,
  subtitle,
  action,
}) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    spacing={1}
    sx={{ mb: 1.8 }}
  >
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.1}
      sx={{ minWidth: 0 }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          bgcolor: GOLD_LIGHT,
          color: GOLD_DARK,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: {
              xs: "0.98rem",
              sm: "1.05rem",
            },
            color: DARK,
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            sx={{
              mt: 0.25,
              fontSize: "0.72rem",
              color: MUTED,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>

    {action}
  </Stack>
);

const InfoRow = ({
  label,
  value,
  copy,
  onCopy,
  icon,
}) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    spacing={1}
    sx={{
      py: 0.75,
      minWidth: 0,
    }}
  >
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.7}
      sx={{ minWidth: 0 }}
    >
      {icon && (
        <Box
          sx={{
            color: "#A0A0A0",
            display: "flex",
          }}
        >
          {icon}
        </Box>
      )}

      <Typography
        sx={{
          color: MUTED,
          fontSize: "0.73rem",
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Typography>
    </Stack>

    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      sx={{
        minWidth: 0,
        maxWidth: "68%",
      }}
    >
      <Typography
        sx={{
          color: TEXT,
          fontSize: "0.76rem",
          fontWeight: 850,
          textAlign: "right",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value || "—"}
      </Typography>

      {copy && value && (
        <Button
          onClick={() => onCopy(value, label)}
          sx={{
            minWidth: 25,
            width: 25,
            height: 25,
            p: 0,
            color: "#8A8A8A",
          }}
        >
          <ContentCopyRounded
            sx={{ fontSize: 15 }}
          />
        </Button>
      )}
    </Stack>
  </Stack>
);

const SummaryRow = ({
  label,
  value,
  strong = false,
  highlight = false,
}) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    spacing={2}
    sx={{ py: 0.7 }}
  >
    <Typography
      sx={{
        color: highlight
          ? DARK
          : MUTED,
        fontSize: "0.76rem",
        fontWeight: strong ? 800 : 650,
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        color: highlight
          ? GOLD_DARK
          : TEXT,
        fontSize: strong
          ? "1rem"
          : "0.78rem",
        fontWeight: strong ? 950 : 800,
      }}
    >
      {value}
    </Typography>
  </Stack>
);

const ProductImage = ({ src }) => (
  <Box
    sx={{
      width: {
        xs: 58,
        sm: 68,
      },
      height: {
        xs: 58,
        sm: 68,
      },
      borderRadius: 2.5,
      overflow: "hidden",
      flexShrink: 0,
      bgcolor: "#F4F4F4",
      border: `1px solid ${BORDER}`,
      display: "grid",
      placeItems: "center",
    }}
  >
    {src ? (
      <Box
        component="img"
        src={src}
        alt=""
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    ) : (
      <ShoppingBagRounded
        sx={{
          color: "#B5B5B5",
        }}
      />
    )}
  </Box>
);

/* =========================================================
   STATUS ROW
========================================================= */

const StatusRow = ({
  currentStatus,
}) => {
  const normalizedCurrent =
    normalizeStatus(currentStatus);

  const isSpecial =
    normalizedCurrent ===
      "cancelled" ||
    normalizedCurrent ===
      "returned" ||
    normalizedCurrent ===
      "refunded";

  if (isSpecial) {
    const styles =
      getStatusStyles(currentStatus);

    return (
      <Paper
        elevation={0}
        sx={{
          px: 1.5,
          py: 1.2,
          borderRadius: 2.5,
          bgcolor: styles.bgcolor,
          border: `1px solid ${styles.border}`,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
        >
          <CheckCircleRounded
            sx={{
              color: styles.color,
              fontSize: 20,
            }}
          />

          <Box>
            <Typography
              sx={{
                fontSize: "0.78rem",
                fontWeight: 900,
                color: styles.color,
              }}
            >
              Order {formatStatus(currentStatus)}
            </Typography>

            <Typography
              sx={{
                fontSize: "0.68rem",
                color: "#777",
              }}
            >
              Current order status
            </Typography>
          </Box>
        </Stack>
      </Paper>
    );
  }

  const currentIndex =
    STATUS_STEPS.findIndex(
      (step) =>
        normalizeStatus(step) ===
        normalizedCurrent
    );

  return (
    <Box
      sx={{
        overflowX: "auto",
        overflowY: "hidden",
        pb: 0.5,
        mx: {
          xs: -0.5,
          sm: 0,
        },

        "&::-webkit-scrollbar": {
          height: 4,
        },

        "&::-webkit-scrollbar-thumb": {
          background: "#D8D8D8",
          borderRadius: 10,
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        sx={{
          minWidth: {
            xs: 690,
            sm: "100%",
          },
          px: 0.5,
        }}
      >
        {STATUS_STEPS.map(
          (step, index) => {
            const completed =
              currentIndex >= 0 &&
              index < currentIndex;

            const active =
              index === currentIndex;

            return (
              <React.Fragment
                key={step}
              >
                <Box
                  sx={{
                    flex: {
                      xs: "0 0 78px",
                      sm: 1,
                    },
                    textAlign: "center",
                    minWidth: {
                      xs: 78,
                      sm: 0,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      mx: "auto",
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      bgcolor:
                        completed ||
                        active
                          ? GOLD
                          : "#EFEFEF",
                      color:
                        completed ||
                        active
                          ? DARK
                          : "#A5A5A5",
                      border: active
                        ? `3px solid ${GOLD_LIGHT}`
                        : "none",
                      boxSizing:
                        "border-box",
                      transition:
                        "all .25s ease",
                    }}
                  >
                    {completed ? (
                      <CheckCircleRounded
                        sx={{
                          fontSize: 17,
                        }}
                      />
                    ) : (
                      <Typography
                        sx={{
                          fontSize:
                            "0.66rem",
                          fontWeight: 900,
                        }}
                      >
                        {index + 1}
                      </Typography>
                    )}
                  </Box>

                  <Typography
                    sx={{
                      mt: 0.7,
                      fontSize: {
                        xs: "0.61rem",
                        sm: "0.65rem",
                      },
                      fontWeight:
                        active ||
                        completed
                          ? 850
                          : 650,
                      color:
                        active
                          ? DARK
                          : completed
                          ? "#555"
                          : "#999",
                      lineHeight: 1.2,
                    }}
                  >
                    {step}
                  </Typography>
                </Box>

                {index <
                  STATUS_STEPS.length -
                    1 && (
                  <Box
                    sx={{
                      height: 3,
                      flex: {
                        xs: "0 0 18px",
                        sm: 1,
                      },
                      minWidth: {
                        xs: 18,
                        sm: 10,
                      },
                      mt: "13px",
                      borderRadius: 99,
                      bgcolor:
                        currentIndex >
                        index
                          ? GOLD
                          : "#E9E9E9",
                    }}
                  />
                )}
              </React.Fragment>
            );
          }
        )}
      </Stack>
    </Box>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const OrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] =
    useState(null);

  const [status, setStatus] =
    useState("Pending");

  const [courier, setCourier] =
    useState("");

  const [trackingId, setTrackingId] =
    useState("");

  const [trackingUrl, setTrackingUrl] =
    useState("");

  const [
    estimatedDelivery,
    setEstimatedDelivery,
  ] = useState("");

  const [
    shippingNotes,
    setShippingNotes,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* =======================================================
     FETCH
  ======================================================= */

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/api/admin/orders/${id}`
      );

      const data = getOrderData(
        response?.data
      );

      if (!data) {
        throw new Error(
          "Order not found."
        );
      }

      setOrder(data);

      setStatus(
        data?.orderStatus ||
          data?.status ||
          "Pending"
      );

      setCourier(
        data?.shippingInformation
          ?.courier ||
          data?.shipping?.courier ||
          ""
      );

      setTrackingId(
        data?.shippingInformation
          ?.trackingId ||
          data?.shipping?.trackingId ||
          data?.trackingId ||
          ""
      );

      setTrackingUrl(
        data?.shippingInformation
          ?.trackingUrl ||
          data?.shipping?.trackingUrl ||
          ""
      );

      setEstimatedDelivery(
        data?.shippingInformation
          ?.estimatedDelivery ||
          data?.shipping
            ?.estimatedDelivery ||
          ""
      );

      setShippingNotes(
        data?.shippingInformation
          ?.notes ||
          data?.shipping?.notes ||
          ""
      );
    } catch (err) {
      setError(
        err?.response?.data
          ?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load order."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const customer = useMemo(
    () => getCustomer(order),
    [order]
  );

  const address = useMemo(
    () => getAddress(order),
    [order]
  );

  const addressLines = useMemo(
    () => formatAddress(address),
    [address]
  );

  const items = useMemo(
    () =>
      Array.isArray(order?.items)
        ? order.items
        : [],
    [order]
  );

  const pricing =
    order?.pricing || {};

  const subtotal = Number(
    pricing?.subtotal ??
      order?.subtotal ??
      items.reduce(
        (sum, item) =>
          sum +
          getItemPrice(item) *
            getItemQuantity(item),
        0
      )
  ) || 0;

  const discount =
    Number(
      pricing?.discount ??
        pricing?.discountAmount ??
        order?.discount ??
        0
    ) || 0;

  const shipping =
    Number(
      pricing?.shipping ??
        pricing?.shippingCharge ??
        order?.shippingCharge ??
        0
    ) || 0;

  const codCharge =
    Number(
      pricing?.codCharge ??
        order?.codCharge ??
        0
    ) || 0;

  const total = getOrderTotal(
    order,
    items,
    subtotal,
    shipping,
    codCharge
  );

  const paymentSummary =
    getPaymentSummary(
      order,
      total,
      codCharge
    );

  const currentStatus =
    order?.orderStatus ||
    order?.status ||
    "Pending";

  const statusStyle =
    getStatusStyles(
      currentStatus
    );

  const orderNumber =
    order?.orderNumber ||
    order?.orderId ||
    order?._id ||
    id;

  const trackingNumber =
    order?.trackingNumber ||
    order?.shippingInformation
      ?.trackingNumber ||
    order?.shippingInformation
      ?.trackingId ||
    trackingId ||
    "";

  /* =======================================================
     SAVE
  ======================================================= */

 const handleSave = async () => {
  if (!id) return;

  setSaving(true);
  setError("");
  setSuccess("");

  try {
    // 1. Update order status
    await api.patch(`/api/admin/orders/${id}/status`, {
      status,
      notes: shippingNotes.trim(),
    });

    // 2. Update shipping information
    await api.patch(`/api/admin/orders/${id}/shipping`, {
      courier: courier.trim(),
      trackingId: trackingId.trim(),
      trackingUrl: trackingUrl.trim(),
      estimatedDelivery: estimatedDelivery || null,
      notes: shippingNotes.trim(),
    });

    // 3. Refresh order details
    const response = await api.get(`/api/admin/orders/${id}`);

    const updatedOrder =
      response?.data?.order ||
      response?.data?.data ||
      response?.data;

    setOrder(updatedOrder);

    setStatus(updatedOrder?.orderStatus || "Pending");

    setCourier(
      updatedOrder?.shippingInformation?.courier || ""
    );

    setTrackingId(
      updatedOrder?.shippingInformation?.trackingId || ""
    );

    setTrackingUrl(
      updatedOrder?.shippingInformation?.trackingUrl || ""
    );

    setEstimatedDelivery(
      updatedOrder?.shippingInformation?.estimatedDelivery
        ? new Date(
            updatedOrder.shippingInformation.estimatedDelivery
          )
            .toISOString()
            .split("T")[0]
        : ""
    );

    setShippingNotes(
      updatedOrder?.shippingInformation?.notes || ""
    );

    setSuccess("Order updated successfully.");
  } catch (error) {
    console.error("Order update failed:", error);

    setError(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to update order."
    );
  } finally {
    setSaving(false);
  }
};

  /* =======================================================
     COPY
  ======================================================= */

  const copyText = async (
    text,
    label
  ) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(
        String(text)
      );

      setSuccess(
        `${label} copied.`
      );
    } catch {
      setError(
        `Unable to copy ${String(
          label
        ).toLowerCase()}.`
      );
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "45vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <CircularProgress
          size={32}
          thickness={4}
          sx={{
            color: GOLD,
          }}
        />
      </Box>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (!order) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: 3,
          }}
        >
          {error ||
            "Order not found."}
        </Alert>

        <Button
          startIcon={
            <ArrowBackRounded />
          }
          onClick={() =>
            navigate(
              "/admin/orders"
            )
          }
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1500,
        mx: "auto",
        px: {
          xs: 1,
          sm: 2,
          md: 2.5,
        },
        pb: {
          xs: 2,
          md: 4,
        },
      }}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <MotionCard
        elevation={0}
        initial={{
          opacity: 0,
          y: -8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        sx={{
          mb: {
            xs: 1.5,
            md: 2,
          },
          borderRadius: {
            xs: 2.5,
            md: 3.5,
          },
          border: `1px solid ${BORDER}`,
          boxShadow:
            "0 8px 30px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 1.5,
              sm: 2,
              md: 2.2,
            },
            "&:last-child": {
              pb: {
                xs: 1.5,
                sm: 2,
                md: 2.2,
              },
            },
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            alignItems={{
              xs: "stretch",
              sm: "center",
            }}
            justifyContent="space-between"
            spacing={{
              xs: 1.3,
              sm: 2,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                minWidth: 0,
              }}
            >
              <Button
                variant="outlined"
                onClick={() =>
                  navigate(
                    "/admin/orders"
                  )
                }
                disabled={saving}
                sx={{
                  minWidth: {
                    xs: 38,
                    sm: 86,
                  },
                  width: {
                    xs: 38,
                    sm: "auto",
                  },
                  height: 38,
                  px: {
                    xs: 0,
                    sm: 1.5,
                  },
                  borderRadius: 2,
                  color: TEXT,
                  borderColor:
                    BORDER,
                  flexShrink: 0,
                }}
              >
                <ArrowBackRounded
                  sx={{
                    fontSize: 19,
                  }}
                />

                <Box
                  component="span"
                  sx={{
                    display: {
                      xs: "none",
                      sm: "inline",
                    },
                    ml: 0.7,
                  }}
                >
                  Back
                </Box>
              </Button>

              <Box
                sx={{
                  minWidth: 0,
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.8}
                >
                  <Typography
                    sx={{
                      fontWeight: 950,
                      fontSize: {
                        xs: "1rem",
                        sm: "1.3rem",
                        md: "1.45rem",
                      },
                      color: DARK,
                      letterSpacing:
                        "-0.03em",
                      overflow: "hidden",
                      textOverflow:
                        "ellipsis",
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    {orderNumber}
                  </Typography>

                  <Chip
                    label={
                      formatStatus(
                        currentStatus
                      )
                    }
                    size="small"
                    sx={{
                      height: 24,
                      fontSize:
                        "0.62rem",
                      fontWeight: 900,
                      color:
                        statusStyle.color,
                      bgcolor:
                        statusStyle.bgcolor,
                      border: `1px solid ${statusStyle.border}`,
                    }}
                  />
                </Stack>

                <Typography
                  sx={{
                    mt: 0.25,
                    color: MUTED,
                    fontSize:
                      "0.68rem",
                  }}
                >
                  Created{" "}
                  {formatDateTime(
                    order?.createdAt
                  )}
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction="row"
              spacing={0.8}
            >
              <Button
                variant="outlined"
                startIcon={
                  <RefreshRounded />
                }
                onClick={fetchOrder}
                disabled={loading || saving}
                sx={{
                  minHeight: 38,
                  px: {
                    xs: 1,
                    sm: 1.5,
                  },
                  borderRadius: 2,
                  borderColor:
                    BORDER,
                  color: TEXT,
                  fontSize:
                    "0.72rem",
                  fontWeight: 800,
                  "& .MuiButton-startIcon":
                    {
                      mr: {
                        xs: 0,
                        sm: 0.6,
                      },
                    },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    display: {
                      xs: "none",
                      sm: "inline",
                    },
                  }}
                >
                  Refresh
                </Box>
              </Button>

              <Button
                variant="contained"
                startIcon={
                  saving ? (
                    <CircularProgress
                      size={16}
                      sx={{
                        color: DARK,
                      }}
                    />
                  ) : (
                    <SyncRounded />
                  )
                }
                onClick={handleSave}
                disabled={saving}
                sx={{
                  minHeight: 38,
                  px: {
                    xs: 1.3,
                    sm: 2,
                  },
                  borderRadius: 2,
                  bgcolor: GOLD,
                  color: DARK,
                  fontSize:
                    "0.72rem",
                  fontWeight: 950,
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor:
                      "#E5B500",
                    boxShadow: "none",
                  },
                }}
              >
                {saving
                  ? "Updating"
                  : "Update Order"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </MotionCard>

      {/* ===================================================
          ALERTS
      =================================================== */}

      {(error || success) && (
        <Alert
          severity={
            error
              ? "error"
              : "success"
          }
          onClose={() => {
            setError("");
            setSuccess("");
          }}
          sx={{
            mb: 1.5,
            py: 0.3,
            borderRadius: 2.5,
            fontSize: "0.78rem",
          }}
        >
          {error || success}
        </Alert>
      )}

      {/* ===================================================
          STATUS — ALWAYS VISIBLE
      =================================================== */}

      <MotionCard
        elevation={0}
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        sx={{
          mb: {
            xs: 1.5,
            md: 2,
          },
          borderRadius: {
            xs: 2.5,
            md: 3.5,
          },
          border: `1px solid ${BORDER}`,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 1.5,
              sm: 2,
              md: 2.2,
            },
            "&:last-child": {
              pb: {
                xs: 1.5,
                sm: 2,
                md: 2.2,
              },
            },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              mb: 1.5,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.8,
                bgcolor: GOLD_LIGHT,
                color: GOLD_DARK,
                display: "grid",
                placeItems: "center",
              }}
            >
              <TimelineRounded
                sx={{
                  fontSize: 18,
                }}
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize:
                    "0.9rem",
                  color: DARK,
                }}
              >
                Order Tracking
              </Typography>

              <Typography
                sx={{
                  color: MUTED,
                  fontSize:
                    "0.65rem",
                }}
              >
                Current fulfilment
                progress
              </Typography>
            </Box>
          </Stack>

          <StatusRow
            currentStatus={
              currentStatus
            }
          />
        </CardContent>
      </MotionCard>

      {/* ===================================================
          MAIN GRID
      =================================================== */}

      <Grid
        container
        columnSpacing={{
          xs: 0,
          md: 2,
        }}
        rowSpacing={{
          xs: 1.5,
          md: 2,
        }}
        alignItems="start"
      >
        {/* =================================================
            LEFT / MAIN
        ================================================= */}

        <Grid item xs={12} md={8}>
          <Stack
            spacing={{
              xs: 1.5,
              md: 2,
            }}
          >
            {/* PRODUCTS */}

            <MotionCard
              elevation={0}
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              sx={{
                borderRadius: {
                  xs: 2.5,
                  md: 3.5,
                },
                border: `1px solid ${BORDER}`,
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 1.5,
                    sm: 2,
                    md: 2.2,
                  },
                  "&:last-child": {
                    pb: {
                      xs: 1.5,
                      sm: 2,
                      md: 2.2,
                    },
                  },
                }}
              >
                <SectionTitle
                  icon={
                    <Inventory2Rounded
                      sx={{
                        fontSize: 20,
                      }}
                    />
                  }
                  title="Products"
                  subtitle={`${items.length} ${
                    items.length === 1
                      ? "item"
                      : "items"
                  } in this order`}
                />

                <Stack
                  spacing={1}
                >
                  {items.map(
                    (item, index) => {
                      const quantity =
                        getItemQuantity(
                          item
                        );

                      const price =
                        getItemPrice(
                          item
                        );

                      return (
                        <Paper
                          key={
                            item?._id ||
                            item?.productId ||
                            index
                          }
                          elevation={0}
                          sx={{
                            p: {
                              xs: 1,
                              sm: 1.2,
                            },
                            borderRadius: 2.5,
                            bgcolor:
                              "#FAFAFA",
                            border: `1px solid ${BORDER}`,
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.2}
                          >
                            <ProductImage
                              src={getItemImage(
                                item
                              )}
                            />

                            <Box
                              sx={{
                                minWidth: 0,
                                flex: 1,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 900,
                                  fontSize:
                                    "0.8rem",
                                  color: TEXT,
                                  overflow:
                                    "hidden",
                                  textOverflow:
                                    "ellipsis",
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {getItemName(
                                  item
                                )}
                              </Typography>

                              <Typography
                                sx={{
                                  mt: 0.25,
                                  fontSize:
                                    "0.67rem",
                                  color:
                                    MUTED,
                                }}
                              >
                                Qty{" "}
                                {quantity}{" "}
                                ×{" "}
                                {formatCurrency(
                                  price
                                )}
                              </Typography>
                            </Box>

                            <Typography
                              sx={{
                                fontWeight: 950,
                                fontSize:
                                  "0.82rem",
                                color: DARK,
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {formatCurrency(
                                price *
                                  quantity
                              )}
                            </Typography>
                          </Stack>
                        </Paper>
                      );
                    }
                  )}
                </Stack>
              </CardContent>
            </MotionCard>

            {/* PAYMENT */}

            <MotionCard
              elevation={0}
              sx={{
                borderRadius: {
                  xs: 2.5,
                  md: 3.5,
                },
                border: `1px solid ${BORDER}`,
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 1.5,
                    sm: 2,
                    md: 2.2,
                  },
                  "&:last-child": {
                    pb: {
                      xs: 1.5,
                      sm: 2,
                      md: 2.2,
                    },
                  },
                }}
              >
                <SectionTitle
                  icon={
                    <PaymentRounded
                      sx={{
                        fontSize: 20,
                      }}
                    />
                  }
                  title="Payment Summary"
                  subtitle="Order amount and payment status"
                />

                <Grid
                  container
                  spacing={1.2}
                >
                  <Grid
                    item
                    xs={6}
                    sm={3}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.2,
                        borderRadius: 2.2,
                        bgcolor:
                          "#F8F8F8",
                        border: `1px solid ${BORDER}`,
                      }}
                    >
                      <Typography
                        sx={{
                          color:
                            MUTED,
                          fontSize:
                            "0.64rem",
                          fontWeight: 700,
                        }}
                      >
                        Order Total
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.35,
                          fontWeight: 950,
                          fontSize:
                            "0.9rem",
                        }}
                      >
                        {formatCurrency(
                          total
                        )}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid
                    item
                    xs={6}
                    sm={3}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.2,
                        borderRadius: 2.2,
                        bgcolor:
                          "#F2FAF5",
                        border: "1px solid #D7EDDF",
                      }}
                    >
                      <Typography
                        sx={{
                          color:
                            "#5A8B68",
                          fontSize:
                            "0.64rem",
                          fontWeight: 700,
                        }}
                      >
                        Amount Paid
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.35,
                          fontWeight: 950,
                          fontSize:
                            "0.9rem",
                          color:
                            "#23763B",
                        }}
                      >
                        {formatCurrency(
                          paymentSummary.amountPaid
                        )}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid
                    item
                    xs={6}
                    sm={3}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.2,
                        borderRadius: 2.2,
                        bgcolor:
                          paymentSummary.remainingAmount >
                          0
                            ? "#FFF8EC"
                            : "#F8F8F8",
                        border: `1px solid ${
                          paymentSummary.remainingAmount >
                          0
                            ? "#F2DFC0"
                            : BORDER
                        }`,
                      }}
                    >
                      <Typography
                        sx={{
                          color:
                            MUTED,
                          fontSize:
                            "0.64rem",
                          fontWeight: 700,
                        }}
                      >
                        {paymentSummary.paymentMethod ===
                        "COD"
                          ? "Due on Delivery"
                          : "Remaining"}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.35,
                          fontWeight: 950,
                          fontSize:
                            "0.9rem",
                          color:
                            paymentSummary.remainingAmount >
                            0
                              ? "#9A6B00"
                              : "#23763B",
                        }}
                      >
                        {formatCurrency(
                          paymentSummary.remainingAmount
                        )}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid
                    item
                    xs={6}
                    sm={3}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.2,
                        borderRadius: 2.2,
                        bgcolor:
                          statusStyle.bgcolor,
                        border: `1px solid ${statusStyle.border}`,
                      }}
                    >
                      <Typography
                        sx={{
                          color:
                            MUTED,
                          fontSize:
                            "0.64rem",
                          fontWeight: 700,
                        }}
                      >
                        Payment Status
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.35,
                          fontWeight: 900,
                          fontSize:
                            "0.75rem",
                          color:
                            statusStyle.color,
                        }}
                      >
                        {
                          paymentSummary.displayStatus
                        }
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Divider
                  sx={{
                    my: 1.5,
                  }}
                />

                <Stack spacing={0.2}>
                  <SummaryRow
                    label="Subtotal"
                    value={formatCurrency(
                      subtotal
                    )}
                  />

                  {discount > 0 && (
                    <SummaryRow
                      label="Discount"
                      value={`-${formatCurrency(
                        discount
                      )}`}
                    />
                  )}

                  <SummaryRow
                    label="Shipping"
                    value={formatCurrency(
                      shipping
                    )}
                  />

                  {codCharge > 0 && (
                    <SummaryRow
                      label="COD Charge"
                      value={formatCurrency(
                        codCharge
                      )}
                    />
                  )}

                  <Divider
                    sx={{
                      my: 0.5,
                    }}
                  />

                  <SummaryRow
                    label="Total"
                    value={formatCurrency(
                      total
                    )}
                    strong
                    highlight
                  />
                </Stack>

                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={{
                    xs: 0.6,
                    sm: 2,
                  }}
                  sx={{
                    mt: 1.2,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize:
                        "0.68rem",
                      color: MUTED,
                    }}
                  >
                    Method:{" "}
                    <strong
                      style={{
                        color: TEXT,
                      }}
                    >
                      {getPaymentMethod(
                        order
                      )}
                    </strong>
                  </Typography>

                  {order?.payment
                    ?.razorpayPaymentId && (
                    <Typography
                      sx={{
                        fontSize:
                          "0.68rem",
                        color:
                          MUTED,
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      Payment ID:{" "}
                      <strong
                        style={{
                          color: TEXT,
                        }}
                      >
                        {
                          order.payment
                            .razorpayPaymentId
                        }
                      </strong>
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </MotionCard>

            {/* SHIPPING UPDATE */}

            <MotionCard
              elevation={0}
              sx={{
                borderRadius: {
                  xs: 2.5,
                  md: 3.5,
                },
                border: `1px solid ${BORDER}`,
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 1.5,
                    sm: 2,
                    md: 2.2,
                  },
                  "&:last-child": {
                    pb: {
                      xs: 1.5,
                      sm: 2,
                      md: 2.2,
                    },
                  },
                }}
              >
                <SectionTitle
                  icon={
                    <LocalShippingRounded
                      sx={{
                        fontSize: 20,
                      }}
                    />
                  }
                  title="Shipping & Tracking"
                  subtitle="Update fulfilment and delivery information"
                />

                <Grid
                  container
                  spacing={1.2}
                >
                  <Grid
                    item
                    xs={12}
                    sm={6}
                  >
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Order Status"
                      value={status}
                      onChange={(event) =>
                        setStatus(
                          event.target
                            .value
                        )
                      }
                    >
                      {ORDER_STATUSES.map(
                        (item) => (
                          <MenuItem
                            key={item}
                            value={item}
                          >
                            {item}
                          </MenuItem>
                        )
                      )}
                    </TextField>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={6}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      label="Courier"
                      value={courier}
                      onChange={(event) =>
                        setCourier(
                          event.target
                            .value
                        )
                      }
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={6}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      label="Tracking Number"
                      value={trackingId}
                      onChange={(event) =>
                        setTrackingId(
                          event.target
                            .value
                        )
                      }
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={6}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      label="Tracking URL"
                      value={trackingUrl}
                      onChange={(event) =>
                        setTrackingUrl(
                          event.target
                            .value
                        )
                      }
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={6}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      label="Estimated Delivery"
                      value={
                        estimatedDelivery
                      }
                      onChange={(event) =>
                        setEstimatedDelivery(
                          event.target
                            .value
                        )
                      }
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={6}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      minRows={1}
                      maxRows={3}
                      label="Shipping Notes"
                      value={
                        shippingNotes
                      }
                      onChange={(event) =>
                        setShippingNotes(
                          event.target
                            .value
                        )
                      }
                    />
                  </Grid>
                </Grid>

                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  justifyContent="flex-end"
                  sx={{
                    mt: 1.5,
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                    startIcon={
                      saving ? (
                        <CircularProgress
                          size={16}
                          sx={{
                            color:
                              DARK,
                          }}
                        />
                      ) : (
                        <SyncRounded />
                      )
                    }
                    sx={{
                      minHeight: 40,
                      px: 2,
                      borderRadius: 2,
                      bgcolor: GOLD,
                      color: DARK,
                      fontWeight: 900,
                      boxShadow: "none",
                      "&:hover": {
                        bgcolor:
                          "#E5B500",
                        boxShadow:
                          "none",
                      },
                    }}
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </Button>
                </Stack>
              </CardContent>
            </MotionCard>
          </Stack>
        </Grid>

        {/* =================================================
            RIGHT / SIDEBAR
        ================================================= */}

        <Grid item xs={12} md={4}>
          <Stack
            spacing={{
              xs: 1.5,
              md: 2,
            }}
          >
            {/* CUSTOMER */}

            <MotionCard
              elevation={0}
              sx={{
                borderRadius: {
                  xs: 2.5,
                  md: 3.5,
                },
                border: `1px solid ${BORDER}`,
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 1.5,
                    sm: 2,
                  },
                  "&:last-child": {
                    pb: {
                      xs: 1.5,
                      sm: 2,
                    },
                  },
                }}
              >
                <SectionTitle
                  icon={
                    <PersonRounded
                      sx={{
                        fontSize: 20,
                      }}
                    />
                  }
                  title="Customer"
                  subtitle="Customer information"
                />

                <InfoRow
                  label="Name"
                  value={
                    customer?.name
                  }
                />

                <InfoRow
                  label="Email"
                  value={
                    customer?.email
                  }
                  copy
                  onCopy={copyText}
                />

                <InfoRow
                  label="Mobile"
                  value={
                    customer?.mobile ||
                    customer?.phone
                  }
                  copy
                  onCopy={copyText}
                  icon={
                    <PhoneRounded
                      sx={{
                        fontSize: 14,
                      }}
                    />
                  }
                />
              </CardContent>
            </MotionCard>

            {/* ADDRESS */}

            <MotionCard
              elevation={0}
              sx={{
                borderRadius: {
                  xs: 2.5,
                  md: 3.5,
                },
                border: `1px solid ${BORDER}`,
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 1.5,
                    sm: 2,
                  },
                  "&:last-child": {
                    pb: {
                      xs: 1.5,
                      sm: 2,
                    },
                  },
                }}
              >
                <SectionTitle
                  icon={
                    <LocationOnRounded
                      sx={{
                        fontSize: 20,
                      }}
                    />
                  }
                  title="Delivery Address"
                  subtitle="Shipping destination"
                />

                <Paper
                  elevation={0}
                  sx={{
                    p: 1.3,
                    borderRadius: 2.5,
                    bgcolor: "#FAFAFA",
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  {addressLines.length ? (
                    <Stack spacing={0.25}>
                      {addressLines.map(
                        (line, index) => (
                          <Typography
                            key={index}
                            sx={{
                              fontSize:
                                "0.76rem",
                              color: TEXT,
                              lineHeight:
                                1.4,
                              fontWeight:
                                index ===
                                0
                                  ? 700
                                  : 500,
                            }}
                          >
                            {line}
                          </Typography>
                        )
                      )}
                    </Stack>
                  ) : (
                    <Typography
                      sx={{
                        color: MUTED,
                        fontSize:
                          "0.75rem",
                      }}
                    >
                      No address
                      available.
                    </Typography>
                  )}
                </Paper>
              </CardContent>
            </MotionCard>

            {/* ORDER INFO */}

            <MotionCard
              elevation={0}
              sx={{
                borderRadius: {
                  xs: 2.5,
                  md: 3.5,
                },
                border: `1px solid ${BORDER}`,
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 1.5,
                    sm: 2,
                  },
                  "&:last-child": {
                    pb: {
                      xs: 1.5,
                      sm: 2,
                    },
                  },
                }}
              >
                <SectionTitle
                  icon={
                    <ShoppingBagRounded
                      sx={{
                        fontSize: 20,
                      }}
                    />
                  }
                  title="Order Information"
                  subtitle="Order references"
                />

                <InfoRow
                  label="Order Number"
                  value={
                    orderNumber
                  }
                  copy
                  onCopy={copyText}
                />

                <InfoRow
                  label="Created"
                  value={formatDateTime(
                    order?.createdAt
                  )}
                  icon={
                    <EventRounded
                      sx={{
                        fontSize: 14,
                      }}
                    />
                  }
                />

                <InfoRow
                  label="Updated"
                  value={formatDateTime(
                    order?.updatedAt
                  )}
                />

                <InfoRow
                  label="Items"
                  value={`${items.length} ${
                    items.length === 1
                      ? "item"
                      : "items"
                  }`}
                />
              </CardContent>
            </MotionCard>

            {/* PUBLIC TRACKING */}

            <MotionCard
              elevation={0}
              sx={{
                borderRadius: {
                  xs: 2.5,
                  md: 3.5,
                },
                bgcolor: DARK,
                color: "#fff",
                overflow: "hidden",
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 1.5,
                    sm: 2,
                  },
                  "&:last-child": {
                    pb: {
                      xs: 1.5,
                      sm: 2,
                    },
                  },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    mb: 1.2,
                  }}
                >
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 2,
                      bgcolor:
                        "rgba(244,196,48,0.12)",
                      color: GOLD,
                      display: "grid",
                      placeItems:
                        "center",
                    }}
                  >
                    <LocalShippingRounded
                      sx={{
                        fontSize: 20,
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize:
                          "0.92rem",
                        color: "#fff",
                      }}
                    >
                      Public Tracking
                    </Typography>

                    <Typography
                      sx={{
                        color:
                          "rgba(255,255,255,0.55)",
                        fontSize:
                          "0.65rem",
                      }}
                    >
                      Customer-facing
                      tracking page
                    </Typography>
                  </Box>
                </Stack>

                {trackingNumber ? (
                  <>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.1,
                        mb: 1,
                        borderRadius: 2.3,
                        bgcolor:
                          "rgba(255,255,255,0.05)",
                        border:
                          "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize:
                            "0.58rem",
                          color:
                            "rgba(255,255,255,0.45)",
                          fontWeight: 800,
                          textTransform:
                            "uppercase",
                          letterSpacing:
                            "0.05em",
                        }}
                      >
                        Tracking Number
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.3,
                          fontSize:
                            "0.78rem",
                          fontWeight: 950,
                          color: "#fff",
                          wordBreak:
                            "break-all",
                        }}
                      >
                        {trackingNumber}
                      </Typography>
                    </Paper>

                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={
                        <OpenInNewRounded />
                      }
                      onClick={() =>
                        navigate(
                          `/tracking?trackingNumber=${encodeURIComponent(
                            trackingNumber
                          )}`
                        )
                      }
                      sx={{
                        minHeight: 40,
                        borderRadius: 2,
                        bgcolor: GOLD,
                        color: DARK,
                        fontWeight: 950,
                        fontSize:
                          "0.72rem",
                        boxShadow: "none",
                        "&:hover": {
                          bgcolor:
                            "#E5B500",
                          boxShadow:
                            "none",
                        },
                      }}
                    >
                      View Public Tracking
                    </Button>
                  </>
                ) : (
                  <Typography
                    sx={{
                      py: 1,
                      color:
                        "rgba(255,255,255,0.55)",
                      fontSize:
                        "0.72rem",
                    }}
                  >
                    Tracking number has
                    not been assigned yet.
                  </Typography>
                )}
              </CardContent>
            </MotionCard>

            {/* PAYMENT MINI CARD */}

            <Paper
              elevation={0}
              sx={{
                p: {
                  xs: 1.5,
                  sm: 2,
                },
                borderRadius: {
                  xs: 2.5,
                  md: 3.5,
                },
                bgcolor: "#FFFDF4",
                border:
                  "1px solid #F1E6B8",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  mb: 0.8,
                }}
              >
                <CreditCardRounded
                  sx={{
                    fontSize: 19,
                    color: GOLD_DARK,
                  }}
                />

                <Typography
                  sx={{
                    fontSize:
                      "0.78rem",
                    fontWeight: 900,
                    color: DARK,
                  }}
                >
                  Payment
                </Typography>
              </Stack>

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
              >
                <Typography
                  sx={{
                    fontSize:
                      "0.68rem",
                    color: MUTED,
                  }}
                >
                  {getPaymentMethod(
                    order
                  )}
                </Typography>

                <Chip
                  label={
                    paymentSummary.displayStatus
                  }
                  size="small"
                  sx={{
                    height: 24,
                    fontSize:
                      "0.58rem",
                    fontWeight: 900,
                    color:
                      statusStyle.color,
                    bgcolor:
                      statusStyle.bgcolor,
                  }}
                />
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderDetails;