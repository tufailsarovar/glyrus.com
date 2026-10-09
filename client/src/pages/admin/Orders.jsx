// client/src/components/admin/Orders.jsx

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
  ArrowForwardIosRounded,
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
} from "@mui/icons-material";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import formatCurrency from "../../utils/formatCurrency";

const MotionCard = motion(Card);

const GOLD = "#F4C430";
const GOLD_DARK = "#9A7600";
const DARK = "#151515";
const MUTED = "#777";

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
  {
    label: "All",
    icon: <ShoppingBagRounded />,
  },
  {
    label: "Pending",
    icon: <AccessTimeRounded />,
  },
  {
    label: "Confirmed",
    icon: <CheckCircleRounded />,
  },
  {
    label: "Production",
    icon: <ProductionQuantityLimitsRounded />,
  },
  {
    label: "Shipped",
    icon: <LocalShippingRounded />,
  },
  {
    label: "Delivered",
    icon: <CheckCircleRounded />,
  },
];

const DATE_FILTERS = [
  {
    value: "all",
    label: "All Dates",
  },
  {
    value: "today",
    label: "Today",
  },
  {
    value: "yesterday",
    label: "Yesterday",
  },
  {
    value: "week",
    label: "This Week",
  },
  {
    value: "lastMonth",
    label: "Last Month",
  },
];

const getOrdersFromResponse = (data) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.orders)) {
    return data.orders;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.orders)) {
    return data.data.orders;
  }

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

  return {
    from: "",
    to: "",
  };
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

const StatCard = ({ label, value, icon, active, onClick }) => {
  return (
    <MotionCard
      elevation={0}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      sx={{
        borderRadius: 3,
        cursor: onClick ? "pointer" : "default",
        border: active ? `1.5px solid ${GOLD}` : "1px solid #ECECEC",
        bgcolor: active ? "#FFFBEA" : "#FFF",
        transition: "border-color .2s ease, background-color .2s ease",
        minWidth: 0,
      }}
    >
      <CardContent
        sx={{
          p: { xs: 1.25, sm: 1.6 },
          "&:last-child": {
            pb: { xs: 1.25, sm: 1.6 },
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: { xs: 32, sm: 36 },
              height: { xs: 32, sm: 36 },
              flexShrink: 0,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: active ? GOLD : "#F6F6F6",
              color: active ? DARK : "#666",
            }}
          >
            {React.cloneElement(icon, {
              sx: {
                fontSize: {
                  xs: 17,
                  sm: 19,
                },
              },
            })}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                color: "#929292",
                fontSize: {
                  xs: "0.62rem",
                  sm: "0.68rem",
                },
                fontWeight: 700,
                lineHeight: 1.1,
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </Typography>

            <Typography
              sx={{
                mt: 0.25,
                color: DARK,
                fontSize: {
                  xs: "0.95rem",
                  sm: "1.05rem",
                },
                lineHeight: 1,
                fontWeight: 900,
              }}
            >
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </MotionCard>
  );
};

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
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.25,
        delay: Math.min(index * 0.035, 0.22),
      }}
      onClick={() => {
        setExpanded((value) => !value);
      }}
      sx={{
        cursor: "pointer",
        overflow: "hidden",
        borderRadius: {
          xs: 2.5,
          sm: 3,
        },
        border: "1px solid #EAEAEA",
        bgcolor: "#FFF",
        transition:
          "box-shadow .2s ease, border-color .2s ease, transform .2s ease",
        "&:hover": {
          borderColor: "#E4CD6E",
          boxShadow: "0 12px 32px rgba(0,0,0,.06)",
        },
      }}
    >
      <CardContent
        sx={{
          p: {
            xs: 1.25,
            sm: 1.6,
            md: 1.8,
          },
          "&:last-child": {
            pb: {
              xs: 1.25,
              sm: 1.6,
              md: 1.8,
            },
          },
        }}
      >
        {/* MAIN ORDER ROW */}
        <Stack
          direction="row"
          spacing={{
            xs: 1,
            sm: 1.5,
          }}
          alignItems="center"
        >
          {/* Icon */}
          <Box
            sx={{
              width: {
                xs: 40,
                sm: 46,
              },
              height: {
                xs: 40,
                sm: 46,
              },
              flexShrink: 0,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              bgcolor: "#FFF8D9",
              color: GOLD_DARK,
            }}
          >
            <ShoppingBagRounded
              sx={{
                fontSize: {
                  xs: 21,
                  sm: 24,
                },
              }}
            />
          </Box>

          {/* Order/customer */}
          <Box
            sx={{
              minWidth: 0,
              flex: 1,
            }}
          >
            <Stack
              direction="row"
              spacing={0.7}
              alignItems="center"
              sx={{
                minWidth: 0,
                mb: 0.3,
              }}
            >
              <Typography
                sx={{
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: DARK,
                  fontSize: {
                    xs: "0.78rem",
                    sm: "0.9rem",
                  },
                  fontWeight: 900,
                }}
              >
                {orderNumber}
              </Typography>

              <Chip
                label={status}
                size="small"
                sx={{
                  flexShrink: 0,
                  height: {
                    xs: 21,
                    sm: 24,
                  },
                  borderRadius: 1.5,
                  fontSize: {
                    xs: "0.56rem",
                    sm: "0.62rem",
                  },
                  fontWeight: 900,
                  color: statusStyle.color,
                  bgcolor: statusStyle.bgcolor,
                  border: `1px solid ${statusStyle.border}`,
                  "& .MuiChip-label": {
                    px: {
                      xs: 0.7,
                      sm: 0.9,
                    },
                  },
                }}
              />
            </Stack>

            <Stack
              direction="row"
              spacing={0.55}
              alignItems="center"
              sx={{
                minWidth: 0,
              }}
            >
              <PersonRounded
                sx={{
                  fontSize: 14,
                  color: "#A0A0A0",
                  flexShrink: 0,
                }}
              />

              <Typography
                sx={{
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: "#666",
                  fontSize: {
                    xs: "0.68rem",
                    sm: "0.74rem",
                  },
                  fontWeight: 600,
                }}
              >
                {customerName}
              </Typography>
            </Stack>
          </Box>

          {/* Total */}
          <Box
            sx={{
              flexShrink: 0,
              textAlign: "right",
            }}
          >
            <Typography
              sx={{
                color: "#999",
                fontSize: {
                  xs: "0.57rem",
                  sm: "0.63rem",
                },
                fontWeight: 700,
              }}
            >
              TOTAL
            </Typography>

            <Typography
              sx={{
                mt: 0.15,
                color: DARK,
                fontSize: {
                  xs: "0.83rem",
                  sm: "0.95rem",
                },
                fontWeight: 900,
              }}
            >
              {formatCurrency(amount)}
            </Typography>
          </Box>

          {/* Expand */}
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              setExpanded((value) => !value);
            }}
            sx={{
              width: {
                xs: 30,
                sm: 34,
              },
              height: {
                xs: 30,
                sm: 34,
              },
              flexShrink: 0,
              bgcolor: "#F7F7F7",
              color: "#666",
              "&:hover": {
                bgcolor: "#FFF8D9",
                color: GOLD_DARK,
              },
            }}
          >
            <ExpandMoreRounded
              sx={{
                fontSize: 20,
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform .2s ease",
              }}
            />
          </IconButton>
        </Stack>

        {/* QUICK INFO */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={0}
          sx={{
            mt: {
              xs: 1,
              sm: 1.25,
            },
            ml: {
              xs: 5,
              sm: 6,
            },
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              color: "#858585",
              fontSize: {
                xs: "0.6rem",
                sm: "0.66rem",
              },
              whiteSpace: "nowrap",
            }}
          >
            {itemCount || 0} {itemCount === 1 ? "item" : "items"}
          </Typography>

          <Box
            sx={{
              mx: 0.8,
              width: 3,
              height: 3,
              borderRadius: "50%",
              bgcolor: "#C9C9C9",
            }}
          />

          <Typography
            sx={{
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: trackingNumber === "Not assigned" ? "#AAA" : "#777",
              fontSize: {
                xs: "0.6rem",
                sm: "0.66rem",
              },
            }}
          >
            {trackingNumber}
          </Typography>

          <Box
            sx={{
              mx: 0.8,
              width: 3,
              height: 3,
              borderRadius: "50%",
              bgcolor: "#C9C9C9",
            }}
          />

          <Typography
            sx={{
              color: "#858585",
              fontSize: {
                xs: "0.6rem",
                sm: "0.66rem",
              },
              whiteSpace: "nowrap",
            }}
          >
            {formatDate(createdAt)}
          </Typography>
        </Stack>

        {/* EXPANDED DETAILS */}
        <Collapse in={expanded} timeout={250} unmountOnExit>
          <Box
            sx={{
              mt: 1.5,
              pt: 1.5,
              borderTop: "1px solid #EEEEEE",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  sm: "repeat(4, minmax(0, 1fr))",
                },
                gap: {
                  xs: 1,
                  sm: 1.3,
                },
              }}
            >
              <InfoBox label="Customer" value={customerName} />

              <InfoBox label="Mobile" value={customerMobile} />

              <InfoBox
                label="Payment"
                value={getPaymentMethod(order) || "—"}
                chip={
                  <Chip
                    size="small"
                    label={paymentStyle.label}
                    sx={{
                      height: 20,
                      mt: 0.35,
                      fontSize: "0.58rem",
                      fontWeight: 800,
                      color: paymentStyle.color,
                      bgcolor: paymentStyle.bgcolor,
                    }}
                  />
                }
              />

              <InfoBox label="Ordered" value={formatDateTime(createdAt)} />
            </Box>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={0.8}
              sx={{
                mt: 1.25,
              }}
            >
              <Button
                fullWidth
                size="small"
                variant="outlined"
                startIcon={
                  <VisibilityRounded
                    sx={{
                      fontSize: 17,
                    }}
                  />
                }
                disabled={!id}
                onClick={(event) => {
                  event.stopPropagation();

                  if (id) {
                    onOpen(id);
                  }
                }}
                sx={{
                  minHeight: 36,
                  borderRadius: 2,
                  borderColor: "#E1E1E1",
                  color: "#333",
                  textTransform: "none",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  "&:hover": {
                    borderColor: GOLD,
                    bgcolor: "#FFFBEA",
                  },
                }}
              >
                View Order
              </Button>

              {trackingNumber !== "Not assigned" && (
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  startIcon={
                    <LocalShippingRounded
                      sx={{
                        fontSize: 17,
                      }}
                    />
                  }
                  onClick={(event) => {
                    event.stopPropagation();

                    window.open(
                      `/tracking/${encodeURIComponent(trackingNumber)}`,
                      "_blank",
                    );
                  }}
                  sx={{
                    minHeight: 36,
                    borderRadius: 2,
                    borderColor: "#E1E1E1",
                    color: "#333",
                    textTransform: "none",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    "&:hover": {
                      borderColor: GOLD,
                      bgcolor: "#FFFBEA",
                    },
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
                startIcon={
                  <DeleteOutlineRounded
                    sx={{
                      fontSize: 17,
                    }}
                  />
                }
                onClick={(event) => {
                  event.stopPropagation();

                  onDelete({
                    id,
                    orderNumber,
                  });
                }}
                sx={{
                  minHeight: 36,
                  borderRadius: 2,
                  borderColor: "#F0C8C5",
                  color: "#B3261E",
                  textTransform: "none",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  "&:hover": {
                    borderColor: "#B3261E",
                    bgcolor: "#FDEDEC",
                  },
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

const InfoBox = ({ label, value, chip }) => {
  return (
    <Box
      sx={{
        minWidth: 0,
        p: {
          xs: 0.9,
          sm: 1,
        },
        borderRadius: 2,
        bgcolor: "#FAFAFA",
        border: "1px solid #F0F0F0",
      }}
    >
      <Typography
        sx={{
          color: "#999",
          fontSize: "0.58rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: ".04em",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.3,
          color: "#333",
          fontSize: {
            xs: "0.66rem",
            sm: "0.7rem",
          },
          fontWeight: 800,
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

      const params = {
        limit: 100,
      };

      const range = getDateRange(dateFilter);

      if (range.from) {
        params.dateFrom = range.from;
      }

      if (range.to) {
        params.dateTo = range.to;
      }

      if (statusFilter && statusFilter !== "All") {
        params.status = statusFilter;
      }

      const response = await api.get("/api/admin/orders", {
        params,
      });

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
        `${deletedCount} order${
          deletedCount === 1 ? "" : "s"
        } deleted successfully.`,
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

      if (matched) {
        counts[matched] += 1;
      }
    });

    counts.All = orders.length;

    return counts;
  }, [orders]);

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, order) => sum + getOrderAmount(order), 0);
  }, [orders]);

  const paidOrders = useMemo(() => {
    return orders.filter(
      (order) => getPaymentStatus(order).toLowerCase() === "captured",
    ).length;
  }, [orders]);

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

      if (!query) {
        return true;
      }

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
        pb: {
          xs: 2,
          sm: 3,
          md: 5,
        },
      }}
    >
      {/* HEADER */}
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "stretch",
          sm: "center",
        }}
        spacing={1.5}
        sx={{
          mb: {
            xs: 1.5,
            sm: 2.5,
          },
        }}
      >
        <Box>
          <Typography
            sx={{
              color: DARK,
              fontWeight: 950,
              letterSpacing: "-.04em",
              fontSize: {
                xs: "1.45rem",
                sm: "1.85rem",
                md: "2.1rem",
              },
              lineHeight: 1,
            }}
          >
            Orders
          </Typography>

          <Typography
            sx={{
              mt: 0.55,
              color: MUTED,
              fontSize: {
                xs: "0.7rem",
                sm: "0.82rem",
              },
            }}
          >
            Manage orders, customers, payments and shipments.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={
            refreshing ? (
              <CircularProgress size={15} />
            ) : (
              <RefreshRounded
                sx={{
                  fontSize: 18,
                }}
              />
            )
          }
          disabled={refreshing}
          onClick={() => fetchOrders(false)}
          sx={{
            alignSelf: {
              xs: "flex-start",
              sm: "auto",
            },
            minHeight: 36,
            px: 1.5,
            borderRadius: 2,
            borderColor: "#E1E1E1",
            color: "#444",
            textTransform: "none",
            fontSize: "0.72rem",
            fontWeight: 800,
            "&:hover": {
              borderColor: GOLD,
              bgcolor: "#FFFBEA",
            },
          }}
        >
          Refresh
        </Button>
      </Stack>

      {/* ERROR */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{
            mb: 1.5,
            borderRadius: 2.5,
            fontSize: "0.75rem",
            py: 0.3,
          }}
        >
          {error}
        </Alert>
      )}

      {/* OVERVIEW STATS */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(4, minmax(0, 1fr))",
          },
          gap: {
            xs: 0.75,
            sm: 1,
          },
          mb: 1.5,
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
          mb: 1.5,
          borderRadius: 2.5,
          border: "1px solid #ECECEC",
          bgcolor: "#FFF",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 1.1,
              sm: 1.4,
            },
            "&:last-child": {
              pb: {
                xs: 1.1,
                sm: 1.4,
              },
            },
          }}
        >
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem />}
            spacing={{
              xs: 1.5,
              sm: 3,
            }}
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
          gap: 0.75,
          overflowX: "auto",
          pb: 0.5,
          mb: 1.5,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {QUICK_STATUSES.map((item) => {
          const selected = statusFilter === item.label;

          return (
            <Button
              key={item.label}
              size="small"
              startIcon={React.cloneElement(item.icon, {
                sx: {
                  fontSize: 16,
                },
              })}
              onClick={() => setStatusFilter(item.label)}
              sx={{
                flexShrink: 0,
                minWidth: "auto",
                minHeight: 32,
                px: 1.1,
                borderRadius: 2,
                border: selected ? `1px solid ${GOLD}` : "1px solid #E7E7E7",
                bgcolor: selected ? "#FFFBEA" : "#FFF",
                color: selected ? "#765B00" : "#666",
                textTransform: "none",
                fontSize: {
                  xs: "0.65rem",
                  sm: "0.7rem",
                },
                fontWeight: 800,
                "&:hover": {
                  bgcolor: "#FFFBEA",
                  borderColor: GOLD,
                },
              }}
            >
              {item.label}
              <Box
                component="span"
                sx={{
                  ml: 0.25,
                  color: selected ? "#9A7600" : "#999",
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
          mb: 1.5,
          borderRadius: 2.5,
          border: "1px solid #ECECEC",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 1,
              sm: 1.25,
            },
            "&:last-child": {
              pb: {
                xs: 1,
                sm: 1.25,
              },
            },
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={0.8}
          >
            <TextField
              fullWidth
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, customer or tracking..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded
                      sx={{
                        color: "#999",
                        fontSize: 19,
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  minHeight: 38,
                  fontSize: {
                    xs: "0.7rem",
                    sm: "0.75rem",
                  },
                  bgcolor: "#FAFAFA",
                },
              }}
            />

            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              sx={{
                width: {
                  xs: "100%",
                  sm: 190,
                },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  minHeight: 38,
                  fontSize: "0.72rem",
                },
              }}
            >
              {ORDER_STATUSES.map((status) => (
                <MenuItem
                  key={status}
                  value={status}
                  sx={{
                    fontSize: "0.75rem",
                  }}
                >
                  {status} (
                  {status === "All" ? orders.length : statusCounts[status] || 0}
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
                width: {
                  xs: "100%",
                  sm: 180,
                },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  minHeight: 38,
                  fontSize: "0.72rem",
                },
              }}
            >
              {DATE_FILTERS.map((item) => (
                <MenuItem
                  key={item.value}
                  value={item.value}
                  sx={{
                    fontSize: "0.75rem",
                  }}
                >
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={
                <DeleteSweepRounded
                  sx={{
                    fontSize: 18,
                  }}
                />
              }
              disabled={deleting || orders.length === 0}
              onClick={() => setDeleteAllOpen(true)}
              sx={{
                minHeight: 36,
                px: 1.5,
                borderRadius: 2,
                borderColor: "#F0C8C5",
                color: "#B3261E",
                textTransform: "none",
                fontSize: "0.62rem",
                fontWeight: 500,
                "&:hover": {
                  borderColor: "#B3261E",
                  bgcolor: "#FDEDEC",
                },
              }}
            >
              Delete All
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* LOADING */}
      {loading ? (
        <Box
          sx={{
            minHeight: 280,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack alignItems="center" spacing={1}>
            <CircularProgress
              size={30}
              thickness={4}
              sx={{
                color: GOLD,
              }}
            />

            <Typography
              sx={{
                color: "#999",
                fontSize: "0.7rem",
              }}
            >
              Loading orders...
            </Typography>
          </Stack>
        </Box>
      ) : filteredOrders.length === 0 ? (
        /* EMPTY */
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #ECECEC",
          }}
        >
          <CardContent
            sx={{
              minHeight: 260,
              display: "grid",
              placeItems: "center",
              textAlign: "center",
            }}
          >
            <Box>
              <Box
                sx={{
                  width: 54,
                  height: 54,
                  mx: "auto",
                  mb: 1.3,
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "#FFF8D9",
                  color: GOLD_DARK,
                }}
              >
                <ShoppingBagRounded
                  sx={{
                    fontSize: 27,
                  }}
                />
              </Box>

              <Typography
                sx={{
                  color: DARK,
                  fontWeight: 900,
                  fontSize: "0.9rem",
                }}
              >
                No orders found
              </Typography>

              <Typography
                sx={{
                  mt: 0.4,
                  color: "#999",
                  fontSize: "0.68rem",
                }}
              >
                Try changing your search or status filter.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        /* ORDERS */
        <Stack
          spacing={{
            xs: 0.8,
            sm: 1,
          }}
        >
          {filteredOrders.map((order, index) => (
            <OrderCard
              key={getOrderId(order) || index}
              order={order}
              index={index}
              onOpen={(id) => navigate(`/admin/orders/${id}`)}
              onDelete={(orderToDelete) => setDeleteTarget(orderToDelete)}
            />
          ))}
        </Stack>
      )}

      {/* DELETE SINGLE ORDER */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleting) {
            setDeleteTarget(null);
          }
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 900,
            fontSize: "1rem",
          }}
        >
          Delete Order?
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            sx={{
              fontSize: "0.8rem",
              color: "#666",
            }}
          >
            Are you sure you want to permanently delete{" "}
            <strong>{deleteTarget?.orderNumber}</strong>? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions
          sx={{
            px: 2,
            pb: 2,
          }}
        >
          <Button
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
            sx={{
              textTransform: "none",
              fontWeight: 800,
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
              fontWeight: 800,
              borderRadius: 2,
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
          if (!deleting) {
            setDeleteAllOpen(false);
          }
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 900,
            fontSize: "1rem",
            color: "#B3261E",
          }}
        >
          Delete All Orders?
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            sx={{
              fontSize: "0.8rem",
              color: "#666",
            }}
          >
            This will permanently delete <strong>all orders</strong> from the
            database.
            <br />
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions
          sx={{
            px: 2,
            pb: 2,
          }}
        >
          <Button
            onClick={() => setDeleteAllOpen(false)}
            disabled={deleting}
            sx={{
              textTransform: "none",
              fontWeight: 800,
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
              fontWeight: 500,
              borderRadius: 2,
            }}
          >
            {deleting ? "Deleting..." : "Delete All"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const SummaryMetric = ({ label, value }) => (
  <Box
    sx={{
      minWidth: 0,
      flex: 1,
    }}
  >
    <Typography
      sx={{
        color: "#999",
        fontSize: {
          xs: "0.57rem",
          sm: "0.62rem",
        },
        fontWeight: 700,
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        mt: 0.15,
        color: DARK,
        fontSize: {
          xs: "0.78rem",
          sm: "0.88rem",
        },
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

export default Orders;
