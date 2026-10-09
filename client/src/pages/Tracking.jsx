// Glyrus — Tracking.jsx

import React, { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  CheckCircle,
  CheckCircleOutline,
  Inventory2Outlined,
  LocalShippingOutlined,
  LocationOnOutlined,
  SearchOutlined,
  ScheduleOutlined,
  ShoppingBagOutlined,
} from "@mui/icons-material";

import { motion } from "framer-motion";

import api from "../services/api.js";

const MotionBox = motion(Box);

const STATUS_FLOW = [
  "Pending",
  "Confirmed",
  "Customization",
  "Production",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const Tracking = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (event) => {
    event?.preventDefault();

    const value = trackingNumber.trim().toUpperCase();

    if (!value) {
      setError("Please enter your tracking number.");
      setOrder(null);
      setSearched(true);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setOrder(null);
      setSearched(true);

      const response = await api.get(
        `/api/tracking/${encodeURIComponent(value)}`,
      );

      const data = response?.data;

      const orderData = data?.tracking || data?.order || data?.data || data;

      if (!orderData || typeof orderData !== "object") {
        throw new Error("Tracking information not found.");
      }

      setOrder(orderData);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No order was found with this tracking number.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTrackingNumber("");
    setOrder(null);
    setError("");
    setSearched(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #fff 0%, #fffdf7 48%, #fff 100%)",
        pb: { xs: 5, sm: 8, md: 11 },
      }}
    >
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          pt: { xs: 3.5, sm: 5.5, md: 7 },
          pb: { xs: 3.5, sm: 5, md: 6.5 },
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: { xs: 190, md: 360 },
            height: { xs: 190, md: 360 },
            borderRadius: "50%",
            top: -120,
            right: { xs: -90, md: 30 },
            background:
              "radial-gradient(circle, rgba(255,193,7,0.20), rgba(255,193,7,0))",
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            width: { xs: 150, md: 280 },
            height: { xs: 150, md: 280 },
            borderRadius: "50%",
            bottom: -140,
            left: { xs: -90, md: 40 },
            background:
              "radial-gradient(circle, rgba(255,193,7,0.12), rgba(255,193,7,0))",
            pointerEvents: "none",
          }}
        />

        <Container maxWidth="md" sx={{ position: "relative" }}>
          <MotionBox
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Stack alignItems="center" textAlign="center" spacing={1.1}>
              <Box
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#fff4c2",
                  color: "#bd8800",
                }}
              >
                <LocalShippingOutlined sx={{ fontSize: { xs: 25, sm: 30 } }} />
              </Box>

              <Typography
                component="h1"
                sx={{
                  fontSize: {
                    xs: "1.85rem",
                    sm: "2.65rem",
                    md: "3.2rem",
                  },
                  lineHeight: 1.08,
                  fontWeight: 900,
                  letterSpacing: "-0.045em",
                  color: "#111",
                }}
              >
                Track Your{" "}
                <Box component="span" sx={{ color: "#d69d00" }}>
                  Order
                </Box>
              </Typography>

              <Typography
                sx={{
                  maxWidth: 610,
                  color: "#6b6b6b",
                  fontSize: { xs: "0.84rem", sm: "0.96rem" },
                  lineHeight: 1.7,
                  px: { xs: 1, sm: 0 },
                }}
              >
                Enter your Glyrus tracking number to see your order status,
                payment details and shipping information.
              </Typography>
            </Stack>

            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{ mt: { xs: 2.5, sm: 3.5 } }}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                  fullWidth
                  value={trackingNumber}
                  onChange={(event) => {
                    setTrackingNumber(event.target.value.toUpperCase());
                    if (error) setError("");
                  }}
                  placeholder="Enter tracking number"
                  autoComplete="off"
                  error={Boolean(error && !order)}
                  InputProps={{
                    startAdornment: (
                      <SearchOutlined
                        sx={{ mr: 1, color: "#777", fontSize: 21 }}
                      />
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      minHeight: { xs: 50, sm: 54 },
                      borderRadius: 3,
                      backgroundColor: "#fff",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.045)",
                      "& fieldset": {
                        borderColor: "rgba(0,0,0,0.09)",
                      },
                      "&:hover fieldset": {
                        borderColor: "#d8a000",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#d8a000",
                        borderWidth: 1,
                      },
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress
                        size={15}
                        thickness={4}
                        sx={{ color: "#fff" }}
                      />
                    ) : (
                      <SearchOutlined sx={{ fontSize: 19 }} />
                    )
                  }
                  sx={{
                    minHeight: 48,
                    width: { xs: "100%", sm: 150 },
                    minWidth: { xs: "100%", sm: 150 },
                    px: 2.5,

                    borderRadius: 2.5,
                    textTransform: "none",
                    whiteSpace: "nowrap",

                    fontWeight: 800,
                    fontSize: "0.9rem",
                    lineHeight: 1,

                    color: "#fff",
                    backgroundColor: "#111",
                    cursor: loading ? "not-allowed" : "pointer",

                    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                    transition: "all 0.2s ease",

                    "& .MuiButton-startIcon": {
                      color: "#fff",
                      marginRight: 0.7,
                      transition: "transform 0.2s ease",
                    },

                    "&:hover": {
                      backgroundColor: "#222",
                      color: "#fff",
                      transform: "translateY(-1px)",
                      boxShadow: "0 7px 18px rgba(0,0,0,0.18)",
                    },

                    "&:hover .MuiButton-startIcon": {
                      transform: "translateX(2px)",
                    },

                    "&:active": {
                      transform: "scale(0.98)",
                    },

                    "&:disabled": {
                      backgroundColor: "#111",
                      color: "#fff",
                      opacity: 0.6,
                      cursor: "not-allowed",
                      boxShadow: "none",
                      transform: "none",
                    },
                  }}
                >
                  {loading ? "Tracking..." : "Track Order"}
                </Button>
              </Stack>
            </Box>
          </MotionBox>
        </Container>
      </Box>

      <Container
        maxWidth="lg"
        sx={{
          mt: { xs: 2.5, sm: 4, md: 5 },
          px: { xs: 1.5, sm: 3 },
        }}
      >
        {searched && error && !loading && (
          <MotionBox
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{ maxWidth: 720, mx: "auto", mb: 3 }}
          >
            <Alert severity="error" sx={{ borderRadius: 2.5 }}>
              {error}
            </Alert>
          </MotionBox>
        )}

        {!searched && !loading && (
          <MotionBox
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {location.state?.paymentConfirmed && (
              <MotionBox
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4 }}
                sx={{
                  mb: 2,
                  p: { xs: 1.8, sm: 2.2 },
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg, #f1fff5 0%, #ffffff 100%)",
                  border: "1px solid rgba(46, 125, 50, 0.16)",
                  boxShadow: "0 10px 30px rgba(46,125,50,0.06)",
                }}
              >
                <Stack direction="row" spacing={1.3} alignItems="flex-start">
                  <CheckCircleRounded
                    sx={{
                      color: "#2e7d32",
                      fontSize: { xs: 30, sm: 34 },
                      mt: 0.1,
                    }}
                  />

                  <Box>
                    <Typography
                      sx={{
                        fontSize: { xs: "1rem", sm: "1.15rem" },
                        fontWeight: 900,
                        color: "#216e27",
                      }}
                    >
                      Payment Confirmed Successfully
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.35,
                        fontSize: { xs: "0.76rem", sm: "0.84rem" },
                        color: "#4d5f4f",
                        lineHeight: 1.6,
                      }}
                    >
                      Your order has been confirmed and is now being processed.
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.7,
                        fontSize: { xs: "0.72rem", sm: "0.8rem" },
                        color: "#667366",
                        lineHeight: 1.55,
                      }}
                    >
                      📧 Your order confirmation, tracking ID and payment
                      details have been sent to your email. Please check your
                      <strong> Spam/Junk folder</strong> if you don't see the
                      email.
                    </Typography>
                  </Box>
                </Stack>
              </MotionBox>
            )}
            <Paper
              elevation={0}
              sx={{
                maxWidth: 700,
                mx: "auto",
                p: { xs: 2.5, sm: 4 },
                borderRadius: { xs: 3, md: 4 },
                border: "1px solid rgba(0,0,0,0.07)",
                background: "#fff",
                textAlign: "center",
                boxShadow: "0 12px 40px rgba(0,0,0,0.04)",
              }}
            >
              <Box
                sx={{
                  width: 66,
                  height: 66,
                  mx: "auto",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#fff6cf",
                  color: "#bd8800",
                }}
              >
                <Inventory2Outlined sx={{ fontSize: 32 }} />
              </Box>

              <Typography
                sx={{
                  mt: 1.8,
                  fontSize: { xs: "1.1rem", sm: "1.35rem" },
                  fontWeight: 900,
                  color: "#111",
                }}
              >
                Ready to track your order?
              </Typography>

              <Typography
                sx={{
                  mt: 0.6,
                  color: "#777",
                  fontSize: "0.86rem",
                  lineHeight: 1.65,
                }}
              >
                Your unique tracking number is included in your Glyrus order
                email.
              </Typography>
            </Paper>
          </MotionBox>
        )}

        {order && !loading && (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Stack spacing={{ xs: 1.5, sm: 2.5 }}>
              <SummaryCard order={order} />

              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.6, sm: 2.5, md: 3 },
                  borderRadius: { xs: 3, md: 4 },
                  border: "1px solid rgba(0,0,0,0.07)",
                  background: "#fff",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.04)",
                  overflow: "hidden",
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: "1rem", sm: "1.3rem" },
                    fontWeight: 900,
                    color: "#111",
                    mb: { xs: 1.5, sm: 2.5 },
                  }}
                >
                  Order Status
                </Typography>

                <StatusTimeline order={order} />
              </Paper>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "1fr 1fr",
                  },
                  gap: { xs: 1.5, md: 2.5 },
                }}
              >
                <InfoCard
                  icon={<LocalShippingOutlined />}
                  title="Shipping Information"
                >
                  <InfoRow
                    label="Courier"
                    value={
                      order?.shippingInformation?.courier || "Not updated yet"
                    }
                  />

                  <InfoRow
                    label="Tracking ID"
                    value={
                      order?.shippingInformation?.trackingId ||
                      "Not updated yet"
                    }
                  />

                  <InfoRow
                    label="Estimated Delivery"
                    value={formatDate(
                      order?.shippingInformation?.estimatedDelivery,
                    )}
                  />

                  {order?.shippingInformation?.trackingUrl && (
                    <Button
                      component="a"
                      href={order.shippingInformation.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outlined"
                      fullWidth
                      sx={{
                        mt: 1.2,
                        minHeight: 42,
                        borderRadius: 2.2,
                        textTransform: "none",
                        fontWeight: 800,
                        color: "#222",
                        borderColor: "rgba(0,0,0,0.14)",
                        "&:hover": {
                          borderColor: "#d8a000",
                          background: "#fffaf0",
                        },
                      }}
                    >
                      Track on Courier Website
                    </Button>
                  )}
                </InfoCard>

                <InfoCard
                  icon={<ShoppingBagOutlined />}
                  title="Order Information"
                >
                  <InfoRow
                    label="Customer"
                    value={order?.customer?.name || "—"}
                  />

                  <InfoRow
                    label="Order Date"
                    value={formatDate(order?.createdAt)}
                  />

                  <InfoRow
                    label="Payment"
                    value={formatPaymentMethod(
                      order?.payment?.method || order?.paymentMethod,
                    )}
                  />

                  <InfoRow
                    label="Payment Status"
                    value={formatPaymentStatus(order?.payment?.status)}
                  />
                </InfoCard>
              </Box>

              <PaymentSummary order={order} />

              {getOrderItems(order).length > 0 && (
                <InfoCard icon={<Inventory2Outlined />} title="Order Items">
                  <Stack spacing={1}>
                    {getOrderItems(order).map((item, index) => (
                      <OrderItem
                        key={item?._id || item?.productId || index}
                        item={item}
                      />
                    ))}
                  </Stack>
                </InfoCard>
              )}

              {order?.address && (
                <InfoCard
                  icon={<LocationOnOutlined />}
                  title="Delivery Address"
                >
                  <Typography
                    sx={{
                      color: "#555",
                      fontSize: {
                        xs: "0.82rem",
                        sm: "0.88rem",
                      },
                      lineHeight: 1.75,
                    }}
                  >
                    {formatAddress(order.address)}
                  </Typography>
                </InfoCard>
              )}

              {order?.shippingInformation?.notes && (
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 1.8, sm: 2.5 },
                    borderRadius: 3,
                    background: "#fff9e5",
                    border: "1px solid rgba(216,166,0,0.14)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.82rem",
                      fontWeight: 900,
                      color: "#3b2e00",
                    }}
                  >
                    Shipping Note
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: "0.8rem",
                      color: "#76652e",
                      lineHeight: 1.65,
                    }}
                  >
                    {order.shippingInformation.notes}
                  </Typography>
                </Paper>
              )}

              <Button
                onClick={handleClear}
                variant="outlined"
                sx={{
                  alignSelf: "center",
                  minHeight: 44,
                  px: 3,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 800,
                  color: "#222",
                  borderColor: "rgba(0,0,0,0.14)",
                  "&:hover": {
                    borderColor: "#d8a000",
                    background: "#fffaf0",
                  },
                }}
              >
                Track Another Order
              </Button>
            </Stack>
          </MotionBox>
        )}
      </Container>
    </Box>
  );
};

const SummaryCard = ({ order }) => {
  const status = getStatus(order);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.8, sm: 2.5, md: 3 },
        borderRadius: { xs: 3, md: 4 },
        border: "1px solid rgba(0,0,0,0.07)",
        background: "#fff",
        boxShadow: "0 12px 40px rgba(0,0,0,0.04)",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1.2, sm: 2 }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              color: "#888",
              fontSize: "0.7rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Tracking Number
          </Typography>

          <Typography
            sx={{
              mt: 0.3,
              fontSize: {
                xs: "1.05rem",
                sm: "1.35rem",
              },
              fontWeight: 900,
              color: "#111",
              letterSpacing: "0.025em",
              overflowWrap: "anywhere",
            }}
          >
            {getTrackingNumber(order)}
          </Typography>

          {order?.orderNumber && (
            <Typography
              sx={{
                mt: 0.25,
                color: "#777",
                fontSize: "0.76rem",
              }}
            >
              Order #{order.orderNumber}
            </Typography>
          )}
        </Box>

        <StatusChip status={status} />
      </Stack>
    </Paper>
  );
};

const StatusTimeline = ({ order }) => {
  const currentStatus = normalizeStatus(getStatus(order));

  if (["Cancelled", "Returned", "Refunded"].includes(currentStatus)) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.4, sm: 2 },
          borderRadius: 2.5,
          background: "#fff6f6",
          border: "1px solid rgba(183,28,28,0.10)",
        }}
      >
        <Typography
          sx={{
            fontSize: {
              xs: "0.84rem",
              sm: "0.9rem",
            },
            fontWeight: 900,
            color: "#b71c1c",
          }}
        >
          Order {formatStatus(currentStatus)}
        </Typography>

        <Typography
          sx={{
            mt: 0.35,
            fontSize: "0.76rem",
            color: "#777",
          }}
        >
          The current order status is {formatStatus(currentStatus)}.
        </Typography>
      </Paper>
    );
  }

  const currentIndex = getStatusIndex(currentStatus);

  return (
    <Box
      sx={{
        width: "100%",
        overflowX: "auto",
        overflowY: "hidden",
        pb: { xs: 0.8, sm: 1 },
        px: { xs: 0.2, sm: 0 },
        scrollbarWidth: "thin",
        "&::-webkit-scrollbar": {
          height: 4,
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#ddd",
          borderRadius: 10,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          minWidth: {
            xs: 690,
            sm: "100%",
          },
          width: "max-content",
          px: { xs: 0.4, sm: 0 },
        }}
      >
        {STATUS_FLOW.map((status, index) => {
          const completed = index < currentIndex;
          const active = index === currentIndex;
          const last = index === STATUS_FLOW.length - 1;

          return (
            <React.Fragment key={status}>
              <StatusStep
                status={status}
                completed={completed}
                active={active}
              />

              {!last && (
                <Box
                  sx={{
                    flex: 1,
                    minWidth: {
                      xs: 20,
                      sm: 25,
                    },
                    height: 2,
                    mt: 17,
                    background: index < currentIndex ? "#d8a000" : "#e7e7e7",
                    transition: "background 0.45s ease",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
};

const StatusStep = ({ status, completed, active }) => (
  <MotionBox
    initial={{
      opacity: 0.45,
      scale: 0.94,
    }}
    animate={{
      opacity: completed || active ? 1 : 0.55,
      scale: active ? 1.04 : 1,
    }}
    transition={{ duration: 0.35 }}
    sx={{
      width: {
        xs: 72,
        sm: 82,
      },
      flexShrink: 0,
      textAlign: "center",
    }}
  >
    <Box
      sx={{
        position: "relative",
        width: 34,
        height: 34,
        mx: "auto",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: completed || active ? "#111" : "#f1f1f1",
        color: completed || active ? "#ffd54f" : "#aaa",
        border: active ? "2px solid #d8a000" : "none",
        boxSizing: "border-box",
        transition: "background 0.35s ease, color 0.35s ease",
      }}
    >
      {active && (
        <MotionBox
          animate={{
            scale: [1, 1.35, 1],
            opacity: [0.55, 0, 0.55],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          sx={{
            position: "absolute",
            inset: -5,
            borderRadius: "50%",
            border: "1px solid #d8a000",
          }}
        />
      )}

      {completed ? (
        <CheckCircle sx={{ fontSize: 19 }} />
      ) : (
        <TimelineIcon status={status} active={active} />
      )}
    </Box>

    <Typography
      sx={{
        mt: 0.8,
        fontSize: {
          xs: "0.63rem",
          sm: "0.68rem",
        },
        lineHeight: 1.2,
        fontWeight: active || completed ? 800 : 600,
        color: active ? "#111" : completed ? "#333" : "#999",
        whiteSpace: "normal",
      }}
    >
      {status}
    </Typography>

    {active && (
      <Chip
        label="Current"
        size="small"
        sx={{
          mt: 0.55,
          height: 19,
          borderRadius: 1.5,
          background: "#fff3c2",
          color: "#896200",
          fontSize: "0.57rem",
          fontWeight: 900,
          "& .MuiChip-label": {
            px: 0.7,
          },
        }}
      />
    )}
  </MotionBox>
);

const TimelineIcon = ({ status, active }) => {
  const iconProps = {
    sx: {
      fontSize: active ? 17 : 16,
    },
  };

  switch (normalizeStatus(status)) {
    case "Confirmed":
      return <CheckCircleOutline {...iconProps} />;

    case "Customization":
      return <ScheduleOutlined {...iconProps} />;

    case "Production":
      return <Inventory2Outlined {...iconProps} />;

    case "Packed":
      return <Inventory2Outlined {...iconProps} />;

    case "Shipped":
      return <LocalShippingOutlined {...iconProps} />;

    case "Out for Delivery":
      return <LocationOnOutlined {...iconProps} />;

    case "Delivered":
      return <CheckCircle {...iconProps} />;

    default:
      return <ShoppingBagOutlined {...iconProps} />;
  }
};

const StatusChip = ({ status }) => {
  const normalized = normalizeStatus(status);

  const special = ["Cancelled", "Returned", "Refunded"].includes(normalized);

  const delivered = normalized === "Delivered";

  return (
    <Chip
      label={formatStatus(status)}
      icon={delivered ? <CheckCircle /> : <LocalShippingOutlined />}
      sx={{
        height: 32,
        borderRadius: 2,
        background: special ? "#fff0f0" : delivered ? "#edf8ef" : "#fff6d1",
        color: special ? "#b71c1c" : delivered ? "#2e7d32" : "#8a6500",
        fontWeight: 900,
        "& .MuiChip-icon": {
          color: "inherit",
          fontSize: 17,
        },
      }}
    />
  );
};

const PaymentSummary = ({ order }) => {
  const summary = order?.paymentSummary || {};

  const total = Number(summary?.orderTotal ?? order?.pricing?.total ?? 0) || 0;

  const paid =
    Number(
      summary?.amountPaid ??
        (order?.payment?.status === "Captured" ? order?.payment?.amount : 0),
    ) || 0;

  const remaining = Math.max(
    0,
    Number(summary?.remainingAmount ?? total - paid) || 0,
  );

  const fullyPaid = summary?.fullyPaid ?? (total > 0 && remaining <= 0.01);

  const partiallyPaid =
    summary?.partiallyPaid ?? (paid > 0 && remaining > 0.01);

  const paymentMethod = String(
    summary?.paymentMethod ||
      order?.paymentMethod ||
      order?.payment?.method ||
      "",
  ).toUpperCase();

  const isCOD = paymentMethod === "COD";

  let statusText = "Payment Pending";
  let statusColor = "#8a6500";
  let statusBg = "#fff6d1";

  if (fullyPaid) {
    statusText = "Fully Paid";
    statusColor = "#26733a";
    statusBg = "#edf8ef";
  } else if (partiallyPaid) {
    statusText = "Partially Paid";
    statusColor = "#8a6500";
    statusBg = "#fff6d1";
  } else if (isCOD) {
    statusText = "Due on Delivery";
    statusColor = "#8a6500";
    statusBg = "#fff6d1";
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: {
          xs: 1.7,
          sm: 2.5,
          md: 3,
        },
        borderRadius: {
          xs: 3,
          md: 4,
        },
        border: "1px solid rgba(0,0,0,0.07)",
        background: "#fff",
        boxShadow: "0 12px 40px rgba(0,0,0,0.04)",
      }}
    >
      {/* HEADER */}

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        sx={{
          mb: {
            xs: 1.5,
            sm: 2,
          },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: {
                xs: "1rem",
                sm: "1.15rem",
              },
              fontWeight: 900,
              color: "#111",
            }}
          >
            Payment Summary
          </Typography>

          <Typography
            sx={{
              mt: 0.25,
              color: "#888",
              fontSize: {
                xs: "0.66rem",
                sm: "0.74rem",
              },
            }}
          >
            {isCOD ? "COD payment breakdown" : "Order payment breakdown"}
          </Typography>
        </Box>

        <Chip
          label={statusText}
          size="small"
          sx={{
            height: {
              xs: 25,
              sm: 28,
            },
            borderRadius: 1.7,
            background: statusBg,
            color: statusColor,
            fontSize: {
              xs: "0.58rem",
              sm: "0.65rem",
            },
            fontWeight: 900,
            "& .MuiChip-label": {
              px: 1,
            },
          }}
        />
      </Stack>

      {/* MAIN PAYMENT STATUS */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, 1fr)",
          },
          gap: 1,
        }}
      >
        {/* TOTAL */}

        <Box
          sx={{
            p: {
              xs: 1.4,
              sm: 1.7,
            },
            borderRadius: 2.5,
            background: "#111",
          }}
        >
          <Typography
            sx={{
              color: "#aaa",
              fontSize: {
                xs: "0.62rem",
                sm: "0.68rem",
              },
              fontWeight: 700,
            }}
          >
            ORDER TOTAL
          </Typography>

          <Typography
            sx={{
              mt: 0.35,
              color: "#ffd54f",
              fontSize: {
                xs: "1.1rem",
                sm: "1.35rem",
              },
              fontWeight: 950,
            }}
          >
            {formatCurrency(total)}
          </Typography>
        </Box>

        {/* PAID */}

        <Box
          sx={{
            p: {
              xs: 1.4,
              sm: 1.7,
            },
            borderRadius: 2.5,
            background: "#edf8ef",
            border: "1px solid rgba(46,125,50,0.10)",
          }}
        >
          <Typography
            sx={{
              color: "#6d8d73",
              fontSize: {
                xs: "0.62rem",
                sm: "0.68rem",
              },
              fontWeight: 700,
            }}
          >
            AMOUNT PAID
          </Typography>

          <Typography
            sx={{
              mt: 0.35,
              color: "#26733a",
              fontSize: {
                xs: "1.1rem",
                sm: "1.35rem",
              },
              fontWeight: 950,
            }}
          >
            {formatCurrency(paid)}
          </Typography>
        </Box>

        {/* REMAINING */}

        <Box
          sx={{
            p: {
              xs: 1.4,
              sm: 1.7,
            },
            borderRadius: 2.5,
            background: remaining > 0 ? "#fff8e4" : "#edf8ef",
            border:
              remaining > 0
                ? "1px solid rgba(216,166,0,0.12)"
                : "1px solid rgba(46,125,50,0.10)",
          }}
        >
          <Typography
            sx={{
              color: remaining > 0 ? "#9b7b24" : "#6d8d73",
              fontSize: {
                xs: "0.62rem",
                sm: "0.68rem",
              },
              fontWeight: 700,
            }}
          >
            {isCOD && remaining > 0 ? "DUE ON DELIVERY" : "REMAINING"}
          </Typography>

          <Typography
            sx={{
              mt: 0.35,
              color: remaining > 0 ? "#8a6500" : "#26733a",
              fontSize: {
                xs: "1.1rem",
                sm: "1.35rem",
              },
              fontWeight: 950,
            }}
          >
            {formatCurrency(remaining)}
          </Typography>
        </Box>
      </Box>

      {/* PAYMENT MESSAGE */}

      <Box
        sx={{
          mt: 1.2,
          px: 1.4,
          py: 1.1,
          borderRadius: 2,
          background: statusBg,
        }}
      >
        <Typography
          sx={{
            color: statusColor,
            fontSize: {
              xs: "0.72rem",
              sm: "0.78rem",
            },
            fontWeight: 800,
            lineHeight: 1.5,
          }}
        >
          {fullyPaid
            ? "✓ Your order has been fully paid."
            : isCOD && remaining > 0
              ? `₹${formatNumber(remaining)} is payable on delivery.`
              : paid > 0
                ? `₹${formatNumber(remaining)} remaining to be paid.`
                : "Payment is still pending."}
        </Typography>
      </Box>

      <Divider
        sx={{
          my: {
            xs: 1.5,
            sm: 2,
          },
        }}
      />

      {/* BREAKDOWN */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr 1fr",
            sm: "repeat(4, 1fr)",
          },
          gap: 1,
        }}
      >
        <MiniPaymentRow
          label="Subtotal"
          value={formatCurrency(order?.pricing?.subtotal)}
        />

        <MiniPaymentRow
          label="Shipping"
          value={formatCurrency(order?.pricing?.shipping)}
        />

        <MiniPaymentRow
          label="COD Charge"
          value={formatCurrency(order?.pricing?.codCharge)}
        />

        <MiniPaymentRow
          label="Payment Method"
          value={formatPaymentMethod(paymentMethod)}
        />
      </Box>
    </Paper>
  );
};

const AmountBox = ({
  label,
  value,
  primary = false,
  positive = false,
  warning = false,
}) => (
  <Box
    sx={{
      p: {
        xs: 1,
        sm: 1.4,
      },
      minWidth: 0,
      borderRadius: 2.2,
      background: primary ? "#111" : warning ? "#fff8e4" : "#f7f7f7",
      border: warning
        ? "1px solid rgba(216,166,0,0.15)"
        : "1px solid rgba(0,0,0,0.045)",
    }}
  >
    <Typography
      sx={{
        fontSize: {
          xs: "0.58rem",
          sm: "0.66rem",
        },
        fontWeight: 700,
        color: primary ? "#aaa" : "#888",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        mt: 0.3,
        fontSize: {
          xs: "0.82rem",
          sm: "1rem",
        },
        fontWeight: 950,
        color: primary
          ? "#ffd54f"
          : positive
            ? "#26733a"
            : warning
              ? "#8a6500"
              : "#222",
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </Typography>
  </Box>
);

const MiniPaymentRow = ({ label, value }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography
      sx={{
        color: "#999",
        fontSize: "0.62rem",
        fontWeight: 700,
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        mt: 0.2,
        color: "#333",
        fontSize: {
          xs: "0.7rem",
          sm: "0.76rem",
        },
        fontWeight: 800,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </Typography>
  </Box>
);

const InfoCard = ({ icon, title, children }) => (
  <Paper
    elevation={0}
    sx={{
      p: {
        xs: 1.7,
        sm: 2.5,
        md: 3,
      },
      borderRadius: {
        xs: 3,
        md: 4,
      },
      border: "1px solid rgba(0,0,0,0.07)",
      background: "#fff",
      boxShadow: "0 12px 40px rgba(0,0,0,0.04)",
    }}
  >
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        mb: {
          xs: 1.3,
          sm: 1.8,
        },
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff6cf",
          color: "#bd8800",
          flexShrink: 0,
          "& svg": {
            fontSize: 20,
          },
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          fontSize: {
            xs: "0.96rem",
            sm: "1.08rem",
          },
          fontWeight: 900,
          color: "#111",
        }}
      >
        {title}
      </Typography>
    </Stack>

    {children}
  </Paper>
);

const InfoRow = ({ label, value }) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    spacing={1}
    sx={{
      py: {
        xs: 0.85,
        sm: 1,
      },
      borderBottom: "1px solid rgba(0,0,0,0.055)",
      "&:last-child": {
        borderBottom: "none",
        pb: 0,
      },
    }}
  >
    <Typography
      sx={{
        color: "#999",
        fontSize: {
          xs: "0.7rem",
          sm: "0.76rem",
        },
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        color: "#333",
        fontSize: {
          xs: "0.73rem",
          sm: "0.8rem",
        },
        fontWeight: 800,
        textAlign: "right",
        overflowWrap: "anywhere",
        maxWidth: "62%",
      }}
    >
      {value || "—"}
    </Typography>
  </Stack>
);

const OrderItem = ({ item }) => {
  const image =
    item?.image ||
    item?.imageUrl ||
    item?.productImage ||
    item?.product?.image ||
    item?.product?.imageUrl;

  const name =
    item?.name ||
    item?.title ||
    item?.productName ||
    item?.product?.title ||
    item?.product?.name ||
    "Product";

  const quantity = Number(item?.quantity) || 1;

  const price =
    Number(item?.price ?? item?.unitPrice ?? item?.product?.price ?? 0) || 0;

  const itemTotal = Number(item?.total) || price * quantity;

  return (
    <Box
      sx={{
        p: {
          xs: 1,
          sm: 1.2,
        },
        borderRadius: 2.5,
        background: "#fafafa",
        border: "1px solid rgba(0,0,0,0.035)",
      }}
    >
      <Stack
        direction="row"
        spacing={{
          xs: 1,
          sm: 1.5,
        }}
        alignItems="center"
      >
        <Box
          sx={{
            width: {
              xs: 52,
              sm: 68,
            },
            height: {
              xs: 52,
              sm: 68,
            },
            borderRadius: 2,
            overflow: "hidden",
            background: "#f1f1f1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {image ? (
            <Box
              component="img"
              src={image}
              alt={name}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <ShoppingBagOutlined
              sx={{
                color: "#aaa",
                fontSize: 25,
              }}
            />
          )}
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: {
                xs: "0.76rem",
                sm: "0.88rem",
              },
              fontWeight: 850,
              color: "#222",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </Typography>

          <Typography
            sx={{
              mt: 0.3,
              color: "#888",
              fontSize: {
                xs: "0.66rem",
                sm: "0.74rem",
              },
            }}
          >
            Qty: {quantity}
            {price > 0 ? ` × ${formatCurrency(price)}` : ""}
          </Typography>
        </Box>

        <Typography
          sx={{
            fontSize: {
              xs: "0.76rem",
              sm: "0.88rem",
            },
            fontWeight: 950,
            color: "#222",
            flexShrink: 0,
          }}
        >
          {formatCurrency(itemTotal)}
        </Typography>
      </Stack>
    </Box>
  );
};

const getStatus = (order) =>
  order?.orderStatus || order?.status || order?.currentStatus || "Pending";

const normalizeStatus = (status) => {
  const value = String(status || "")
    .trim()
    .toLowerCase();

  const map = {
    pending: "Pending",
    confirmed: "Confirmed",
    customization: "Customization",
    production: "Production",
    packed: "Packed",
    shipped: "Shipped",
    "out for delivery": "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    canceled: "Cancelled",
    returned: "Returned",
    refunded: "Refunded",
  };

  return map[value] || normalizeRawStatus(status);
};

const normalizeRawStatus = (status) => {
  const value = String(status || "Pending")
    .replace(/[-_]/g, " ")
    .trim();

  return value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatStatus = (status) => normalizeRawStatus(status);

const getStatusIndex = (status) => {
  const normalized = normalizeStatus(status);

  const index = STATUS_FLOW.findIndex((item) => item === normalized);

  return index === -1 ? 0 : index;
};

const getTrackingNumber = (order) =>
  order?.trackingNumber ||
  order?.tracking?.trackingNumber ||
  order?.shippingInformation?.trackingNumber ||
  "Not available";

const getOrderItems = (order) => {
  if (Array.isArray(order?.items)) {
    return order.items;
  }

  if (Array.isArray(order?.products)) {
    return order.products;
  }

  if (Array.isArray(order?.orderItems)) {
    return order.orderItems;
  }

  return [];
};

const getOrderTotal = (order) =>
  Number(order?.pricing?.total ?? order?.totalAmount ?? order?.total ?? 0) || 0;

const getAmountPaid = (order) =>
  Number(
    order?.payment?.amount ??
      (order?.payment?.status === "Captured" ? order?.payment?.amount : 0) ??
      0,
  ) || 0;

const formatPaymentMethod = (method) => {
  if (!method) return "—";

  const value = String(method).toLowerCase().trim();

  if (value === "cod") {
    return "Cash on Delivery";
  }

  if (value === "razorpay") {
    return "Razorpay";
  }

  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatPaymentStatus = (status) => {
  if (!status) return "Not updated";

  const value = String(status).trim();

  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (value) => {
  if (!value) return "Not updated yet";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatCurrency = (value) => {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};

const formatAddress = (address) => {
  if (!address) return "—";

  if (typeof address === "string") {
    return address;
  }

  const parts = [
    address.houseFlat,
    address.house,
    address.flat,
    address.street,
    address.area,
    address.city,
    address.state,
    address.pincode,
    address.zipCode,
  ].filter(Boolean);

  return parts.join(", ") || "—";
};

export default Tracking;
