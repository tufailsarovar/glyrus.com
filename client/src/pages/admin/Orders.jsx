import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  AccessTimeRounded,
  CheckCircleRounded,
  ExpandMoreRounded,
  LocalShippingRounded,
  PersonRounded,
  ProductionQuantityLimitsRounded,
  RefreshRounded,
  SearchRounded,
  ShoppingBagRounded,
  VisibilityRounded,
  DeleteOutlineRounded,
  DeleteSweepRounded,
  CloseRounded,
  ReceiptLongRounded,
  PaymentsRounded,
  CalendarMonthRounded,
  Inventory2Rounded,
  ArrowForwardRounded,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import formatCurrency from "../../utils/formatCurrency";

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const GOLD = "#FFD000";
const GOLD_DARK = "#896B00";
const DARK = "#171717";
const MUTED = "#858585";

const ORDER_STATUSES = [
  "All",
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

const QUICK_STATUSES = [
  { label: "All", icon: <ShoppingBagRounded /> },
  { label: "Pending", icon: <AccessTimeRounded /> },
  { label: "Confirmed", icon: <CheckCircleRounded /> },
  { label: "Production", icon: <ProductionQuantityLimitsRounded /> },
  { label: "Shipped", icon: <LocalShippingRounded /> },
  { label: "Delivered", icon: <CheckCircleRounded /> },
];

const DATE_FILTERS = [
  { value: "all", label: "All Dates" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "This Week" },
  { value: "lastMonth", label: "Last Month" },
];

const getOrdersFromResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.orders)) return data.data.orders;
  return [];
};

const getOrderId = (order) =>
  order?._id || order?.id || order?.orderId || order?.orderNumber || null;

const getOrderNumber = (order, fallback = "Order") =>
  order?.orderNumber || order?.orderId || order?._id || fallback;

const getOrderStatus = (order) =>
  order?.orderStatus || order?.status || "Pending";

const normalizeStatus = (status) =>
  String(status || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const getStatusStyles = (status) => {
  const normalized = normalizeStatus(status);

  if (normalized === "delivered") {
    return {
      color: "#237A3B",
      bgcolor: "#EAF7EE",
      border: "#C9EBD3",
    };
  }

  if (normalized === "shipped" || normalized === "outfordelivery") {
    return {
      color: "#1766A5",
      bgcolor: "#EAF4FC",
      border: "#C9E3F7",
    };
  }

  if (
    normalized === "cancelled" ||
    normalized === "refunded" ||
    normalized === "returned"
  ) {
    return {
      color: "#B3261E",
      bgcolor: "#FDEDEC",
      border: "#F4C9C6",
    };
  }

  if (normalized === "pending") {
    return {
      color: "#946C00",
      bgcolor: "#FFF7D7",
      border: "#F0DB83",
    };
  }

  if (
    normalized === "confirmed" ||
    normalized === "customization" ||
    normalized === "production" ||
    normalized === "packed"
  ) {
    return {
      color: "#765B00",
      bgcolor: "#FFF9E5",
      border: "#EBD88C",
    };
  }

  return {
    color: "#666",
    bgcolor: "#F4F4F4",
    border: "#E4E4E4",
  };
};

const getCustomer = (order) => order?.customer || order?.guestCustomer || {};

const getCustomerName = (order) => {
  const customer = getCustomer(order);
  return (
    customer?.name || order?.customerName || order?.name || "Guest Customer"
  );
};

const getCustomerEmail = (order) => {
  const customer = getCustomer(order);
  return customer?.email || order?.customerEmail || order?.email || "—";
};

const getCustomerMobile = (order) => {
  const customer = getCustomer(order);
  return (
    customer?.mobile ||
    customer?.phone ||
    order?.customerMobile ||
    order?.mobile ||
    "—"
  );
};

const getOrderAmount = (order) =>
  Number(
    order?.pricing?.total ??
      order?.totalAmount ??
      order?.total ??
      order?.amount ??
      order?.pricing?.grandTotal ??
      0,
  ) || 0;

const getItemCount = (order) => {
  if (Array.isArray(order?.items)) {
    return order.items.reduce((total, item) => {
      const quantity = Number(item?.quantity ?? item?.qty ?? 1);
      return total + Math.max(1, quantity || 1);
    }, 0);
  }

  return Number(order?.itemCount ?? order?.quantity ?? 0);
};

const getPaymentMethod = (order) =>
  String(order?.paymentMethod || order?.payment?.method || "")
    .trim()
    .toUpperCase();

const getPaymentStatus = (order) =>
  String(order?.payment?.status || order?.paymentStatus || "Pending");

const getTrackingNumber = (order) =>
  order?.trackingNumber ||
  order?.shippingInformation?.trackingId ||
  "Not assigned";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getDateRange = (filter) => {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  if (filter === "today") {
    return {
      from: startOfToday.toISOString(),
      to: startOfTomorrow.toISOString(),
    };
  }

  if (filter === "yesterday") {
    const start = new Date(startOfToday);
    start.setDate(start.getDate() - 1);

    return {
      from: start.toISOString(),
      to: startOfToday.toISOString(),
    };
  }

  if (filter === "week") {
    const start = new Date(startOfToday);
    const day = start.getDay();
    const mondayOffset = day === 0 ? 6 : day - 1;

    start.setDate(start.getDate() - mondayOffset);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    return {
      from: start.toISOString(),
      to: end.toISOString(),
    };
  }

  if (filter === "lastMonth") {
    const start = new Date(
      startOfToday.getFullYear(),
      startOfToday.getMonth() - 1,
      1,
    );

    const end = new Date(
      startOfToday.getFullYear(),
      startOfToday.getMonth(),
      1,
    );

    return {
      from: start.toISOString(),
      to: end.toISOString(),
    };
  }

  return { from: "", to: "" };
};

const getPaymentStyles = (order) => {
  const status = getPaymentStatus(order).toLowerCase();

  if (status === "captured") {
    return {
      color: "#26753A",
      bgcolor: "#EAF7EE",
      label: "Paid",
    };
  }

  if (status === "failed" || status === "refunded") {
    return {
      color: "#B3261E",
      bgcolor: "#FDEDEC",
      label: status === "refunded" ? "Refunded" : "Failed",
    };
  }

  return {
    color: "#866400",
    bgcolor: "#FFF7D7",
    label: getPaymentMethod(order) === "COD" ? "COD" : "Pending",
  };
};

const surfaceSx = {
  borderRadius: "9px",
  border: "1px solid #EAEAE5",
  bgcolor: "#FFFFFF",
  boxShadow: "0 2px 10px rgba(0,0,0,.025)",
};

const smallButtonSx = {
  minHeight: { xs: 32, sm: 36 },
  borderRadius: "6px",
  textTransform: "none",
  fontWeight: 800,
  fontSize: { xs: "0.65rem", sm: "0.72rem" },
};

const StatCard = ({ label, value, icon, active, onClick }) => (
  <MotionCard
    elevation={0}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.985 }}
    onClick={onClick}
    sx={{
      ...surfaceSx,
      minWidth: 0,
      cursor: onClick ? "pointer" : "default",
      borderColor: active ? "#D5B500" : "#EAEAE5",
      bgcolor: active ? "#FFFBE8" : "#FFFFFF",
      transition: "border-color .2s, background-color .2s",
    }}
  >
    <CardContent
      sx={{
        p: { xs: 1, sm: 1.45 },
        "&:last-child": { pb: { xs: 1, sm: 1.45 } },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={{ xs: 0.65, sm: 1 }}>
        <Box
          sx={{
            width: { xs: 28, sm: 34 },
            height: { xs: 28, sm: 34 },
            flexShrink: 0,
            borderRadius: "7px",
            display: "grid",
            placeItems: "center",
            bgcolor: active ? GOLD : "#F4F4F0",
            color: active ? DARK : "#777",
            "& svg": { fontSize: { xs: 16, sm: 19 } },
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              color: MUTED,
              fontSize: { xs: "0.58rem", sm: "0.67rem" },
              fontWeight: 750,
              lineHeight: 1.25,
            }}
          >
            {label}
          </Typography>

          <Typography
            sx={{
              mt: 0.3,
              color: DARK,
              fontSize: { xs: "1rem", sm: "1.2rem" },
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: "-.04em",
            }}
          >
            {value}
          </Typography>
        </Box>
      </Stack>
    </CardContent>
  </MotionCard>
);

const SummaryMetric = ({ label, value }) => (
  <Box sx={{ minWidth: 0, flex: 1 }}>
    <Typography
      sx={{
        color: "#999",
        fontSize: { xs: "0.58rem", sm: "0.65rem" },
        fontWeight: 750,
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        mt: 0.25,
        color: DARK,
        fontSize: { xs: "0.75rem", sm: "0.9rem" },
        fontWeight: 900,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </Typography>
  </Box>
);

const InfoBox = ({ label, value, chip }) => (
  <Box
    sx={{
      minWidth: 0,
      p: { xs: 0.8, sm: 1 },
      borderRadius: "6px",
      bgcolor: "#F8F8F5",
    }}
  >
    <Typography
      sx={{
        color: "#999",
        fontSize: "0.58rem",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: ".035em",
      }}
    >
      {label}
    </Typography>

    <Typography
      title={String(value || "—")}
      sx={{
        mt: 0.3,
        color: "#333",
        fontSize: { xs: "0.65rem", sm: "0.72rem" },
        fontWeight: 750,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {value || "—"}
    </Typography>

    {chip}
  </Box>
);

const OrderCard = ({ order, index, onOpen, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const id = getOrderId(order);
  const orderNumber = getOrderNumber(order, `Order ${index + 1}`);
  const status = getOrderStatus(order);
  const statusStyle = getStatusStyles(status);
  const customerName = getCustomerName(order);
  const customerEmail = getCustomerEmail(order);
  const customerMobile = getCustomerMobile(order);
  const amount = getOrderAmount(order);
  const itemCount = getItemCount(order);
  const trackingNumber = getTrackingNumber(order);
  const paymentStyle = getPaymentStyles(order);
  const createdAt = order?.createdAt || order?.createdOn || order?.date;

  return (
    <MotionCard
      layout
      elevation={0}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5, scale: 0.99 }}
      transition={{
        duration: 0.23,
        delay: Math.min(index * 0.025, 0.18),
        layout: { duration: 0.2 },
      }}
      onClick={() => setExpanded((value) => !value)}
      sx={{
        ...surfaceSx,
        overflow: "hidden",
        cursor: "pointer",
        transition: "border-color .2s, box-shadow .2s",
        "&:hover": {
          borderColor: "#DCC65B",
          boxShadow: "0 7px 22px rgba(0,0,0,.045)",
        },
      }}
    >
      <CardContent
        sx={{
          p: { xs: 1, sm: 1.45, md: 1.65 },
          "&:last-child": {
            pb: { xs: 1, sm: 1.45, md: 1.65 },
          },
        }}
      >
        {/* MAIN ORDER ROW */}
        <Stack
          direction="row"
          spacing={{ xs: 0.7, sm: 1.2 }}
          alignItems="center"
        >
          <Box
            sx={{
              width: { xs: 33, sm: 42 },
              height: { xs: 33, sm: 42 },
              flexShrink: 0,
              borderRadius: "7px",
              display: "grid",
              placeItems: "center",
              bgcolor: "#FFF7D5",
              color: GOLD_DARK,
            }}
          >
            <ShoppingBagRounded sx={{ fontSize: { xs: 18, sm: 23 } }} />
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack
              direction="row"
              spacing={0.6}
              alignItems="center"
              sx={{ minWidth: 0, mb: 0.35 }}
            >
              <Typography
                title={String(orderNumber)}
                sx={{
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: DARK,
                  fontSize: { xs: "0.7rem", sm: "0.85rem" },
                  fontWeight: 900,
                }}
              >
                {orderNumber}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={0.45}
              alignItems="center"
              sx={{ minWidth: 0 }}
            >
              <PersonRounded
                sx={{
                  fontSize: 13,
                  color: "#999",
                  flexShrink: 0,
                }}
              />

              <Typography
                title={customerName}
                sx={{
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: "#666",
                  fontSize: { xs: "0.63rem", sm: "0.73rem" },
                  fontWeight: 650,
                }}
              >
                {customerName}
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ flexShrink: 0, textAlign: "right" }}>
            <Typography
              sx={{
                color: "#999",
                fontSize: { xs: "0.5rem", sm: "0.58rem" },
                fontWeight: 800,
                letterSpacing: ".04em",
              }}
            >
              TOTAL
            </Typography>

            <Typography
              sx={{
                mt: 0.2,
                color: DARK,
                fontSize: { xs: "0.75rem", sm: "0.93rem" },
                fontWeight: 900,
                letterSpacing: "-.025em",
              }}
            >
              {formatCurrency(amount)}
            </Typography>
          </Box>

          <IconButton
            size="small"
            aria-label={expanded ? "Collapse order" : "Expand order"}
            onClick={(event) => {
              event.stopPropagation();
              setExpanded((value) => !value);
            }}
            sx={{
              width: { xs: 25, sm: 31 },
              height: { xs: 25, sm: 31 },
              flexShrink: 0,
              borderRadius: "6px",
              bgcolor: expanded ? "#FFF4BF" : "#F5F5F2",
              color: "#666",
            }}
          >
            <ExpandMoreRounded
              sx={{
                fontSize: 20,
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform .22s ease",
              }}
            />
          </IconButton>
        </Stack>

        {/* STATUS AND ORDER META */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.6}
          sx={{
            mt: 1,
            minWidth: 0,
            flexWrap: "wrap",
            rowGap: 0.6,
          }}
        >
          <Chip
            label={status}
            size="small"
            sx={{
              maxWidth: "100%",
              height: { xs: 21, sm: 23 },
              borderRadius: "5px",
              fontSize: { xs: "0.55rem", sm: "0.62rem" },
              fontWeight: 850,
              color: statusStyle.color,
              bgcolor: statusStyle.bgcolor,
              border: `1px solid ${statusStyle.border}`,
              "& .MuiChip-label": {
                px: 0.8,
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />

          <Typography
            sx={{
              color: "#858585",
              fontSize: { xs: "0.58rem", sm: "0.65rem" },
              whiteSpace: "nowrap",
            }}
          >
            {itemCount || 0} {itemCount === 1 ? "item" : "items"}
          </Typography>

          <Box
            sx={{
              width: 3,
              height: 3,
              borderRadius: "50%",
              bgcolor: "#C9C9C9",
              flexShrink: 0,
            }}
          />

          <Typography
            sx={{
              minWidth: 0,
              color: "#858585",
              fontSize: { xs: "0.58rem", sm: "0.65rem" },
              whiteSpace: "nowrap",
            }}
          >
            {formatDate(createdAt)}
          </Typography>
        </Stack>

        <Collapse in={expanded} timeout={230} unmountOnExit>
          <Box
            sx={{
              mt: 1.3,
              pt: 1.3,
              borderTop: "1px solid #EEEEEA",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2,minmax(0,1fr))",
                  sm: "repeat(4,minmax(0,1fr))",
                },
                gap: 0.8,
              }}
            >
              <InfoBox label="Customer" value={customerName} />
              <InfoBox label="Mobile" value={customerMobile} />
              <InfoBox label="Email" value={customerEmail} />

              <InfoBox
                label="Payment"
                value={getPaymentMethod(order) || "—"}
                chip={
                  <Chip
                    size="small"
                    label={paymentStyle.label}
                    sx={{
                      mt: 0.5,
                      height: 20,
                      borderRadius: "4px",
                      fontSize: "0.57rem",
                      fontWeight: 850,
                      color: paymentStyle.color,
                      bgcolor: paymentStyle.bgcolor,
                    }}
                  />
                }
              />

              <InfoBox label="Order date" value={formatDateTime(createdAt)} />

              <InfoBox label="Tracking ID" value={trackingNumber} />

              <InfoBox
                label="Quantity"
                value={`${itemCount || 0} ${
                  itemCount === 1 ? "item" : "items"
                }`}
              />

              <InfoBox label="Order total" value={formatCurrency(amount)} />
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={0.7}
              sx={{ mt: 1.1 }}
            >
              <Button
                fullWidth
                size="small"
                variant="contained"
                startIcon={<VisibilityRounded />}
                disabled={!id}
                onClick={(event) => {
                  event.stopPropagation();
                  if (id) onOpen(id);
                }}
                sx={{
                  ...smallButtonSx,
                  bgcolor: GOLD,
                  color: DARK,
                  "&:hover": { bgcolor: "#F0C400" },
                  "& .MuiButton-startIcon svg": { fontSize: 16 },
                }}
              >
                View Order
              </Button>

              {trackingNumber !== "Not assigned" && (
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  startIcon={<LocalShippingRounded />}
                  onClick={(event) => {
                    event.stopPropagation();
                    window.open(
                      `/tracking/${encodeURIComponent(trackingNumber)}`,
                      "_blank",
                    );
                  }}
                  sx={{
                    ...smallButtonSx,
                    borderColor: "#E4E4DE",
                    color: "#444",
                    "&:hover": {
                      borderColor: GOLD,
                      bgcolor: "#FFFBEA",
                    },
                    "& .MuiButton-startIcon svg": { fontSize: 16 },
                  }}
                >
                  Tracking
                </Button>
              )}

              <Button
                fullWidth
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlineRounded />}
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete({ id, orderNumber });
                }}
                sx={{
                  ...smallButtonSx,
                  borderColor: "#F0C8C5",
                  color: "#B3261E",
                  "&:hover": {
                    borderColor: "#B3261E",
                    bgcolor: "#FDEDEC",
                  },
                  "& .MuiButton-startIcon svg": { fontSize: 16 },
                }}
              >
                Delete Order
              </Button>
            </Stack>
          </Box>
        </Collapse>
      </CardContent>
    </MotionCard>
  );
};

const Orders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const params = { limit: 100 };
      const range = getDateRange(dateFilter);

      if (range.from) params.dateFrom = range.from;
      if (range.to) params.dateTo = range.to;

      if (statusFilter && statusFilter !== "All") {
        params.status = statusFilter;
      }

      const response = await api.get("/api/admin/orders", { params });
      setOrders(getOrdersFromResponse(response?.data));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load orders.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteTarget?.id) return;

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await api.delete(`/api/admin/orders/${deleteTarget.id}`);

      setOrders((currentOrders) =>
        currentOrders.filter((order) => getOrderId(order) !== deleteTarget.id),
      );

      setSuccess(`${deleteTarget.orderNumber} deleted successfully.`);
      setDeleteTarget(null);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to delete order.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAllOrders = async () => {
    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      const response = await api.delete("/api/admin/orders");
      const deletedCount = response?.data?.deletedCount || 0;

      setOrders([]);
      setSuccess(
        `${deletedCount} order${deletedCount === 1 ? "" : "s"} deleted successfully.`,
      );
      setDeleteAllOpen(false);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to delete orders.",
      );
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [dateFilter, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = {};

    ORDER_STATUSES.forEach((status) => {
      counts[status] = 0;
    });

    orders.forEach((order) => {
      const status = getOrderStatus(order);

      const matched = ORDER_STATUSES.find(
        (item) => item.toLowerCase() === String(status).toLowerCase(),
      );

      if (matched) counts[matched] += 1;
    });

    counts.All = orders.length;
    return counts;
  }, [orders]);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + getOrderAmount(order), 0),
    [orders],
  );

  const paidOrders = useMemo(
    () =>
      orders.filter(
        (order) => getPaymentStatus(order).toLowerCase() === "captured",
      ).length,
    [orders],
  );

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const status = getOrderStatus(order);

      if (
        statusFilter !== "All" &&
        status.toLowerCase() !== statusFilter.toLowerCase()
      ) {
        return false;
      }

      if (!query) return true;

      const customerName = getCustomerName(order).toLowerCase();
      const customerEmail = getCustomerEmail(order).toLowerCase();
      const customerMobile = getCustomerMobile(order).toLowerCase();

      const orderNumber = String(
        order?.orderNumber || order?.orderId || order?._id || "",
      ).toLowerCase();

      const trackingNumber = String(getTrackingNumber(order)).toLowerCase();

      return (
        customerName.includes(query) ||
        customerEmail.includes(query) ||
        customerMobile.includes(query) ||
        orderNumber.includes(query) ||
        trackingNumber.includes(query)
      );
    });
  }, [orders, search, statusFilter]);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        pb: { xs: 2, sm: 3, md: 4 },
        overflowX: "clip",
        color: DARK,
      }}
    >
      {/* HEADER */}
      <MotionBox
        initial={{ opacity: 0, y: -9 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        sx={{
          position: "relative",
          overflow: "hidden",
          mb: { xs: 1.3, sm: 1.8 },
          p: { xs: 1.4, sm: 2, md: 2.5 },
          borderRadius: "9px",
          color: "#FFFFFF",
          background:
            "linear-gradient(125deg,#171717 0%,#25251F 75%,#40340B 100%)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: { xs: 115, sm: 180 },
            height: { xs: 115, sm: 180 },
            borderRadius: "50%",
            right: { xs: -45, sm: -55 },
            top: { xs: -55, sm: -95 },
            bgcolor: "rgba(255,208,0,.09)",
            pointerEvents: "none",
          }}
        />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.6}
              sx={{ mb: 0.5 }}
            >
              <ReceiptLongRounded
                sx={{ color: GOLD, fontSize: { xs: 15, sm: 18 } }}
              />
              <Typography
                sx={{
                  color: GOLD,
                  fontSize: { xs: "0.56rem", sm: "0.65rem" },
                  fontWeight: 850,
                  letterSpacing: "1px",
                }}
              >
                GLYRUS ADMIN
              </Typography>
            </Stack>

            <Typography
              sx={{
                fontSize: { xs: "1.35rem", sm: "1.85rem", md: "2.1rem" },
                fontWeight: 950,
                letterSpacing: "-.055em",
                lineHeight: 1.1,
              }}
            >
              Orders
            </Typography>

            <Typography
              sx={{
                mt: 0.6,
                color: "#BEBEB7",
                fontSize: { xs: "0.63rem", sm: "0.77rem" },
                lineHeight: 1.5,
              }}
            >
              Manage orders, customers, payments and shipments.
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="small"
            startIcon={
              refreshing ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <RefreshRounded />
              )
            }
            disabled={refreshing}
            onClick={() => fetchOrders(false)}
            sx={{
              flexShrink: 0,
              minWidth: 0,
              minHeight: { xs: 33, sm: 38 },
              px: { xs: 0.9, sm: 1.4 },
              borderRadius: "6px",
              bgcolor: GOLD,
              color: DARK,
              fontSize: { xs: "0.63rem", sm: "0.73rem" },
              fontWeight: 850,
              textTransform: "none",
              "& .MuiButton-startIcon": {
                mr: { xs: 0.4, sm: 0.7 },
                "& svg": { fontSize: { xs: 16, sm: 18 } },
              },
              "&:hover": { bgcolor: "#F0C400" },
            }}
          >
            Refresh
          </Button>
        </Stack>
      </MotionBox>

      {/* NOTIFICATIONS */}
      <AnimatePresence>
        {error && (
          <MotionBox
            key="error"
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            sx={{ overflow: "hidden" }}
          >
            <Alert
              severity="error"
              onClose={() => setError("")}
              sx={{
                mb: 1.2,
                borderRadius: "7px",
                fontSize: "0.73rem",
                "& .MuiAlert-message": { py: 0.4 },
              }}
            >
              {error}
            </Alert>
          </MotionBox>
        )}

        {success && (
          <MotionBox
            key="success"
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            sx={{ overflow: "hidden" }}
          >
            <Alert
              severity="success"
              onClose={() => setSuccess("")}
              sx={{
                mb: 1.2,
                borderRadius: "7px",
                fontSize: "0.73rem",
                "& .MuiAlert-message": { py: 0.4 },
              }}
            >
              {success}
            </Alert>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* OVERVIEW STATS */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2,minmax(0,1fr))",
            sm: "repeat(4,minmax(0,1fr))",
          },
          gap: { xs: 0.7, sm: 1 },
          mb: 1.2,
        }}
      >
        <StatCard
          label="All Orders"
          value={statusCounts.All}
          icon={<ShoppingBagRounded />}
          active={statusFilter === "All"}
          onClick={() => setStatusFilter("All")}
        />

        <StatCard
          label="Pending"
          value={statusCounts.Pending}
          icon={<AccessTimeRounded />}
          active={statusFilter === "Pending"}
          onClick={() => setStatusFilter("Pending")}
        />

        <StatCard
          label="Shipped"
          value={statusCounts.Shipped}
          icon={<LocalShippingRounded />}
          active={statusFilter === "Shipped"}
          onClick={() => setStatusFilter("Shipped")}
        />

        <StatCard
          label="Delivered"
          value={statusCounts.Delivered}
          icon={<CheckCircleRounded />}
          active={statusFilter === "Delivered"}
          onClick={() => setStatusFilter("Delivered")}
        />
      </Box>

      {/* BUSINESS SUMMARY */}
      <Card
        elevation={0}
        sx={{
          ...surfaceSx,
          mb: 1.2,
        }}
      >
        <CardContent
          sx={{
            p: { xs: 1, sm: 1.4 },
            "&:last-child": { pb: { xs: 1, sm: 1.4 } },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={{ xs: 1.2, sm: 2.5 }}
            divider={<Divider orientation="vertical" flexItem />}
          >
            <SummaryMetric
              label="Revenue"
              value={formatCurrency(totalRevenue)}
            />
            <SummaryMetric label="Paid Orders" value={paidOrders} />
            <SummaryMetric label="Showing" value={filteredOrders.length} />
          </Stack>
        </CardContent>
      </Card>

      {/* QUICK STATUS FILTERS */}
      <Box
        sx={{
          display: "flex",
          gap: 0.65,
          overflowX: "auto",
          pb: 0.5,
          mb: 1.2,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {QUICK_STATUSES.map((item) => {
          const selected = statusFilter === item.label;

          return (
            <Button
              key={item.label}
              size="small"
              startIcon={React.cloneElement(item.icon, {
                sx: { fontSize: 15 },
              })}
              onClick={() => setStatusFilter(item.label)}
              sx={{
                flexShrink: 0,
                minWidth: "auto",
                minHeight: 31,
                px: { xs: 0.85, sm: 1.1 },
                borderRadius: "6px",
                border: `1px solid ${selected ? "#D8BB25" : "#E8E8E2"}`,
                bgcolor: selected ? "#FFF8D8" : "#FFFFFF",
                color: selected ? "#765B00" : "#666",
                fontSize: { xs: "0.62rem", sm: "0.69rem" },
                fontWeight: 800,
                textTransform: "none",
                "& .MuiButton-startIcon": {
                  mr: 0.45,
                },
                "&:hover": {
                  bgcolor: "#FFF8D8",
                  borderColor: "#D8BB25",
                },
              }}
            >
              {item.label}
              <Box
                component="span"
                sx={{
                  ml: 0.55,
                  color: selected ? GOLD_DARK : "#999",
                }}
              >
                {statusCounts[item.label] || 0}
              </Box>
            </Button>
          );
        })}
      </Box>

      {/* SEARCH / FILTER */}
      <Card
        elevation={0}
        sx={{
          ...surfaceSx,
          mb: 1.3,
        }}
      >
        <CardContent
          sx={{
            p: { xs: 0.9, sm: 1.3 },
            "&:last-child": { pb: { xs: 0.9, sm: 1.3 } },
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={0.8}
            alignItems="stretch"
          >
            <TextField
              fullWidth
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, customer or tracking..."
              inputProps={{ "aria-label": "Search orders" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded sx={{ color: "#999", fontSize: 19 }} />
                  </InputAdornment>
                ),
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      aria-label="Clear search"
                      onClick={() => setSearch("")}
                    >
                      <CloseRounded sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: 1,
                minWidth: 0,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "6px",
                  minHeight: 37,
                  bgcolor: "#FAFAF8",
                  fontSize: { xs: "0.69rem", sm: "0.75rem" },
                  "& fieldset": { borderColor: "#E9E9E3" },
                  "&:hover fieldset": { borderColor: "#D5BE52" },
                  "&.Mui-focused fieldset": { borderColor: "#D5B500" },
                },
                "& .MuiInputBase-input": { py: 1 },
              }}
            />

            <Stack
              direction="row"
              spacing={0.7}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              <TextField
                select
                size="small"
                label="Status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  width: { sm: 150 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "6px",
                    minHeight: 37,
                    fontSize: "0.7rem",
                  },
                  "& .MuiInputLabel-root": { fontSize: "0.75rem" },
                }}
              >
                {ORDER_STATUSES.map((status) => (
                  <MenuItem
                    key={status}
                    value={status}
                    sx={{ fontSize: "0.75rem" }}
                  >
                    {status} (
                    {status === "All"
                      ? orders.length
                      : statusCounts[status] || 0}
                    )
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                size="small"
                label="Date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  width: { sm: 135 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "6px",
                    minHeight: 37,
                    fontSize: "0.7rem",
                  },
                  "& .MuiInputLabel-root": { fontSize: "0.75rem" },
                }}
              >
                {DATE_FILTERS.map((item) => (
                  <MenuItem
                    key={item.value}
                    value={item.value}
                    sx={{ fontSize: "0.75rem" }}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteSweepRounded />}
                disabled={deleting || orders.length === 0}
                onClick={() => setDeleteAllOpen(true)}
                sx={{
                  flexShrink: 0,
                  minWidth: 0,
                  minHeight: 37,
                  px: { xs: 0.75, sm: 1.1 },
                  borderRadius: "6px",
                  borderColor: "#F0C8C5",
                  color: "#B3261E",
                  fontSize: { xs: "0.58rem", sm: "0.65rem" },
                  fontWeight: 800,
                  textTransform: "none",
                  "& .MuiButton-startIcon": {
                    mr: 0.4,
                    "& svg": { fontSize: 17 },
                  },
                  "&:hover": {
                    borderColor: "#B3261E",
                    bgcolor: "#FDEDEC",
                  },
                }}
              >
                Delete All
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* ORDER RESULTS */}
      {loading ? (
        <Box
          sx={{
            minHeight: 230,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack alignItems="center" spacing={1}>
            <CircularProgress size={29} thickness={4} sx={{ color: GOLD }} />
            <Typography sx={{ color: "#999", fontSize: "0.7rem" }}>
              Loading orders...
            </Typography>
          </Stack>
        </Box>
      ) : filteredOrders.length === 0 ? (
        <MotionCard
          elevation={0}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          sx={surfaceSx}
        >
          <CardContent
            sx={{
              minHeight: 220,
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              px: 2,
            }}
          >
            <Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  mx: "auto",
                  mb: 1.2,
                  borderRadius: "9px",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "#FFF6D2",
                  color: GOLD_DARK,
                }}
              >
                <Inventory2Rounded sx={{ fontSize: 25 }} />
              </Box>

              <Typography
                sx={{
                  color: DARK,
                  fontWeight: 900,
                  fontSize: "0.88rem",
                }}
              >
                No orders found
              </Typography>

              <Typography
                sx={{
                  mt: 0.45,
                  color: "#999",
                  fontSize: "0.68rem",
                }}
              >
                Try changing your search or status filter.
              </Typography>

              {(search || statusFilter !== "All") && (
                <Button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                  }}
                  sx={{
                    mt: 0.8,
                    color: GOLD_DARK,
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    textTransform: "none",
                  }}
                >
                  Clear filters
                </Button>
              )}
            </Box>
          </CardContent>
        </MotionCard>
      ) : (
        <Stack spacing={{ xs: 0.75, sm: 0.95 }}>
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order, index) => (
              <OrderCard
                key={getOrderId(order) || index}
                order={order}
                index={index}
                onOpen={(id) => navigate(`/admin/orders/${id}`)}
                onDelete={(orderToDelete) => setDeleteTarget(orderToDelete)}
              />
            ))}
          </AnimatePresence>
        </Stack>
      )}

      {/* DELETE SINGLE ORDER */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "10px",
            m: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 900,
            fontSize: "1rem",
            pb: 1,
          }}
        >
          Delete Order?
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ fontSize: "0.8rem", color: "#666" }}>
            Are you sure you want to permanently delete{" "}
            <Box component="span" sx={{ fontWeight: 900, color: DARK }}>
              {deleteTarget?.orderNumber}
            </Box>
            ? This action cannot be undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 2, pb: 2, gap: 0.5 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
            sx={{
              textTransform: "none",
              fontWeight: 800,
              color: "#666",
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleDeleteOrder}
            disabled={deleting}
            variant="contained"
            color="error"
            startIcon={
              deleting ? (
                <CircularProgress size={15} color="inherit" />
              ) : (
                <DeleteOutlineRounded fontSize="small" />
              )
            }
            sx={{
              textTransform: "none",
              fontWeight: 850,
              borderRadius: "6px",
              boxShadow: "none",
            }}
          >
            {deleting ? "Deleting..." : "Delete Order"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE ALL ORDERS */}
      <Dialog
        open={deleteAllOpen}
        onClose={() => {
          if (!deleting) setDeleteAllOpen(false);
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "10px",
            m: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 900,
            fontSize: "1rem",
            color: "#B3261E",
            pb: 1,
          }}
        >
          Delete All Orders?
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            sx={{
              fontSize: "0.8rem",
              color: "#666",
              lineHeight: 1.7,
            }}
          >
            This will permanently delete{" "}
            <Box component="span" sx={{ fontWeight: 900, color: DARK }}>
              all orders
            </Box>{" "}
            from the database.
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 2, pb: 2, gap: 0.5 }}>
          <Button
            onClick={() => setDeleteAllOpen(false)}
            disabled={deleting}
            sx={{
              textTransform: "none",
              fontWeight: 800,
              color: "#666",
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleDeleteAllOrders}
            disabled={deleting}
            variant="contained"
            color="error"
            startIcon={
              deleting ? (
                <CircularProgress size={15} color="inherit" />
              ) : (
                <DeleteSweepRounded fontSize="small" />
              )
            }
            sx={{
              textTransform: "none",
              fontWeight: 850,
              borderRadius: "6px",
              boxShadow: "none",
            }}
          >
            {deleting ? "Deleting..." : "Delete All"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders;
