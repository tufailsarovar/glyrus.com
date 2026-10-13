import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  AddRounded,
  ArrowForwardRounded,
  Inventory2Rounded,
  LocalShippingRounded,
  PeopleAltRounded,
  PendingActionsRounded,
  RefreshRounded,
  SettingsRounded,
  ShoppingBagRounded,
  TrendingUpRounded,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const COLORS = {
  primary: "#FFD000",
  ink: "#171717",
  muted: "#858585",
  background: "#F7F7F5",
  border: "#EAEAE6",
};

const formatNumber = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return number.toLocaleString("en-IN");
};

const formatCurrency = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "₹0";
  return `₹${Math.round(number).toLocaleString("en-IN")}`;
};

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

const getStatusStyle = (status) => {
  const value = String(status || "Pending").toLowerCase();

  if (value === "delivered") {
    return { color: "#16803C", bgcolor: "#EAF8EF" };
  }

  if (value === "shipped" || value === "out for delivery") {
    return { color: "#1769AA", bgcolor: "#EAF3FC" };
  }

  if (value === "cancelled" || value === "refunded" || value === "returned") {
    return { color: "#B42318", bgcolor: "#FDECEC" };
  }

  if (
    value === "confirmed" ||
    value === "customization" ||
    value === "production" ||
    value === "packed"
  ) {
    return { color: "#8A6900", bgcolor: "#FFF7D6" };
  }

  return { color: "#666", bgcolor: "#F2F2F2" };
};

const SectionTitle = ({ title, subtitle, action }) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    spacing={1}
    sx={{ minWidth: 0 }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: { xs: "0.88rem", sm: "1rem" },
          fontWeight: 850,
          letterSpacing: "-0.025em",
          color: COLORS.ink,
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          sx={{
            mt: 0.25,
            fontSize: { xs: "0.64rem", sm: "0.7rem" },
            color: COLORS.muted,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
    {action}
  </Stack>
);

const panelSx = {
  borderRadius: "10px",
  border: `1px solid ${COLORS.border}`,
  boxShadow: "0 3px 14px rgba(0,0,0,0.025)",
  bgcolor: "#fff",
  minWidth: 0,
};

const StatCard = ({ title, value, subtitle, icon, onClick, delay = 0 }) => (
  <MotionCard
    elevation={0}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
    whileHover={{ y: -3 }}
    whileTap={onClick ? { scale: 0.985 } : undefined}
    onClick={onClick}
    sx={{
      height: "100%",
      minWidth: 0,
      cursor: onClick ? "pointer" : "default",
      position: "relative",
      overflow: "hidden",
      borderRadius: "9px",
      border: `1px solid ${COLORS.border}`,
      boxShadow: "0 2px 10px rgba(0,0,0,0.025)",
      transition: "border-color .2s, box-shadow .2s",
      "&:hover": {
        borderColor: "#E5CD55",
        boxShadow: "0 7px 20px rgba(0,0,0,0.06)",
      },
    }}
  >
    <CardContent
      sx={{
        p: { xs: 1.15, sm: 1.7, md: 1.9 },
        "&:last-child": {
          pb: { xs: 1.15, sm: 1.7, md: 1.9 },
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={0.7}
      >
        <Typography
          sx={{
            minWidth: 0,
            fontSize: { xs: "0.61rem", sm: "0.7rem" },
            color: COLORS.muted,
            fontWeight: 750,
            lineHeight: 1.35,
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            flexShrink: 0,
            width: { xs: 29, sm: 36 },
            height: { xs: 29, sm: 36 },
            display: "grid",
            placeItems: "center",
            bgcolor: "#FFF6CD",
            color: "#7E6600",
            borderRadius: "7px",
            "& svg": { fontSize: { xs: 17, sm: 20 } },
          }}
        >
          {icon}
        </Box>
      </Stack>

      <Typography
        sx={{
          mt: { xs: 0.8, sm: 1.1 },
          fontSize: { xs: "1.2rem", sm: "1.65rem", md: "1.85rem" },
          fontWeight: 900,
          lineHeight: 1.12,
          letterSpacing: "-0.055em",
          color: COLORS.ink,
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </Typography>

      <Typography
        sx={{
          mt: { xs: 0.45, sm: 0.75 },
          fontSize: { xs: "0.57rem", sm: "0.66rem" },
          color: "#969696",
          lineHeight: 1.35,
        }}
      >
        {subtitle}
      </Typography>
    </CardContent>
  </MotionCard>
);

const MiniStat = ({ title, value, subtitle, color, background }) => (
  <Box
    sx={{
      minWidth: 0,
      p: { xs: 1.1, sm: 1.5 },
      borderRadius: "8px",
      bgcolor: background,
      border: "1px solid transparent",
    }}
  >
    <Typography
      sx={{
        fontSize: { xs: "0.59rem", sm: "0.67rem" },
        fontWeight: 800,
        color,
        textTransform: "uppercase",
        letterSpacing: ".025em",
      }}
    >
      {title}
    </Typography>
    <Typography
      sx={{
        mt: 0.5,
        fontSize: { xs: "1.15rem", sm: "1.4rem" },
        fontWeight: 900,
        lineHeight: 1.2,
        color: COLORS.ink,
        letterSpacing: "-.04em",
      }}
    >
      {value}
    </Typography>
    {subtitle && (
      <Typography
        sx={{
          mt: 0.3,
          fontSize: { xs: "0.57rem", sm: "0.64rem" },
          color: "#858585",
        }}
      >
        {subtitle}
      </Typography>
    )}
  </Box>
);

const QuickAction = ({ icon, title, description, onClick }) => (
  <MotionBox
    whileHover={{ x: 2 }}
    whileTap={{ scale: 0.985 }}
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick();
      }
    }}
    sx={{
      cursor: "pointer",
      minWidth: 0,
      p: { xs: 1, sm: 1.15 },
      borderRadius: "8px",
      transition: "background .2s",
      "&:hover": { bgcolor: "#FFFBE9" },
      "&:focus-visible": { outline: "2px solid #D5AF00" },
    }}
  >
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box
        sx={{
          flexShrink: 0,
          width: { xs: 32, sm: 36 },
          height: { xs: 32, sm: 36 },
          borderRadius: "7px",
          bgcolor: "#FFF6D2",
          color: "#826800",
          display: "grid",
          placeItems: "center",
          "& svg": { fontSize: { xs: 18, sm: 20 } },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: { xs: "0.7rem", sm: "0.76rem" },
            fontWeight: 800,
            color: COLORS.ink,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            mt: 0.15,
            fontSize: { xs: "0.6rem", sm: "0.65rem" },
            color: COLORS.muted,
          }}
        >
          {description}
        </Typography>
      </Box>
      <ArrowForwardRounded
        sx={{ fontSize: 17, color: "#A5A5A5", flexShrink: 0 }}
      />
    </Stack>
  </MotionBox>
);

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = async (initial = false) => {
    try {
      if (initial) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await api.get("/api/admin/dashboard");
      const data = response?.data;

      setStats(data?.stats || {});
      setRecentOrders(
        Array.isArray(data?.recentOrders) ? data.recentOrders : [],
      );
    } catch (error) {
      setError(error?.response?.data?.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard(true);
  }, []);

  const deliveryPercentage = useMemo(() => {
    const total = Number(stats?.totalOrders || 0);
    const delivered = Number(stats?.deliveredOrders || 0);

    if (!total) return 0;

    return Math.min(100, Math.round((delivered / total) * 100));
  }, [stats]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "55vh",
          display: "grid",
          placeItems: "center",
          bgcolor: COLORS.background,
        }}
      >
        <Stack alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "10px",
              display: "grid",
              placeItems: "center",
              bgcolor: "#FFF5C8",
            }}
          >
            <CircularProgress size={23} sx={{ color: "#B99700" }} />
          </Box>
          <Typography sx={{ fontSize: "0.76rem", color: COLORS.muted }}>
            Loading dashboard...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        pb: { xs: 2, sm: 3 },
        bgcolor: COLORS.background,
        color: COLORS.ink,
        overflowX: "clip",
      }}
    >
      {/* HEADER */}
      <MotionBox
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        sx={{
          mb: { xs: 1.5, sm: 2 },
          p: { xs: 1.6, sm: 2.2, md: 2.7 },
          borderRadius: "10px",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(120deg,#171717 0%,#202018 70%,#39300A 100%)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: { xs: 115, sm: 180 },
            height: { xs: 115, sm: 180 },
            borderRadius: "50%",
            right: { xs: -45, sm: -55 },
            top: { xs: -60, sm: -100 },
            bgcolor: "rgba(255,208,0,.10)",
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
            <Typography
              sx={{
                color: COLORS.primary,
                fontSize: { xs: "0.57rem", sm: "0.65rem" },
                fontWeight: 850,
                letterSpacing: "1.1px",
                mb: 0.6,
              }}
            >
              GLYRUS ADMIN
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: "1.35rem", sm: "1.9rem", md: "2.15rem" },
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: "-.055em",
              }}
            >
              Dashboard
            </Typography>

            <Typography
              sx={{
                mt: 0.6,
                fontSize: { xs: "0.65rem", sm: "0.76rem" },
                color: "#B9B9B9",
                lineHeight: 1.5,
              }}
            >
              Your store at a glance.
            </Typography>
          </Box>

          <Button
            onClick={() => fetchDashboard(false)}
            disabled={refreshing}
            startIcon={
              refreshing ? (
                <CircularProgress size={14} sx={{ color: "#171717" }} />
              ) : (
                <RefreshRounded />
              )
            }
            sx={{
              flexShrink: 0,
              minWidth: 0,
              minHeight: { xs: 34, sm: 39 },
              px: { xs: 1.1, sm: 1.7 },
              borderRadius: "7px",
              bgcolor: COLORS.primary,
              color: COLORS.ink,
              fontSize: { xs: "0.67rem", sm: "0.77rem" },
              fontWeight: 850,
              textTransform: "none",
              "& .MuiButton-startIcon": {
                mr: { xs: 0.45, sm: 0.8 },
                "& svg": { fontSize: { xs: 17, sm: 19 } },
              },
              "&:hover": { bgcolor: "#F1C600" },
              "&.Mui-disabled": {
                bgcolor: "#E7D77D",
                color: "#555",
              },
            }}
          >
            Refresh
          </Button>
        </Stack>
      </MotionBox>

      {/* ERROR */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 1.5,
            borderRadius: "8px",
            py: 0,
            fontSize: "0.78rem",
            "& .MuiAlert-message": { py: 1 },
          }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => fetchDashboard(true)}
              sx={{ fontSize: "0.7rem", textTransform: "none" }}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* PRIMARY STATS */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2,minmax(0,1fr))",
            sm: "repeat(2,minmax(0,1fr))",
            lg: "repeat(4,minmax(0,1fr))",
          },
          gap: { xs: 0.9, sm: 1.2, md: 1.5 },
        }}
      >
        <StatCard
          title="Total Orders"
          value={formatNumber(stats?.totalOrders)}
          subtitle="All customer orders"
          icon={<ShoppingBagRounded />}
          delay={0}
          onClick={() => navigate("/admin/orders")}
        />

        <StatCard
          title="Revenue"
          value={formatCurrency(stats?.totalRevenue)}
          subtitle="Paid order revenue"
          icon={<TrendingUpRounded />}
          delay={0.05}
        />

        <StatCard
          title="Customers"
          value={formatNumber(stats?.totalCustomers)}
          subtitle="Unique customers"
          icon={<PeopleAltRounded />}
          delay={0.1}
          onClick={() => navigate("/admin/customers")}
        />

        <StatCard
          title="Products"
          value={formatNumber(stats?.totalProducts)}
          subtitle={`${formatNumber(stats?.activeProducts)} active products`}
          icon={<Inventory2Rounded />}
          delay={0.15}
          onClick={() => navigate("/admin/products")}
        />
      </Box>

      {/* SECONDARY STATS */}
      <MotionBox
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.35 }}
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2,minmax(0,1fr))",
            sm: "repeat(4,minmax(0,1fr))",
          },
          gap: { xs: 0.9, sm: 1.2, md: 1.5 },
          mt: { xs: 1, sm: 1.3 },
        }}
      >
        <MiniStat
          title="Pending Orders"
          value={formatNumber(stats?.pendingOrders)}
          color="#8B6B00"
          background="#FFF8DD"
        />

        <MiniStat
          title="Delivered"
          value={formatNumber(stats?.deliveredOrders)}
          color="#287747"
          background="#EDF8F0"
        />

        <MiniStat
          title="Requests"
          value={formatNumber(stats?.totalRequests)}
          subtitle={`${formatNumber(stats?.pendingRequests)} pending`}
          color="#696969"
          background="#F0F0ED"
        />

        <MiniStat
          title="Messages"
          value={formatNumber(stats?.totalMessages)}
          subtitle={`${formatNumber(stats?.unreadMessages)} unread`}
          color="#696969"
          background="#F0F0ED"
        />
      </MotionBox>

      {/* PERFORMANCE + QUICK ACTIONS */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0,1fr)",
            lg: "minmax(0,1.35fr) minmax(260px,.65fr)",
          },
          gap: { xs: 1.2, sm: 1.5 },
          mt: { xs: 1.5, sm: 2 },
          alignItems: "start",
        }}
      >
        {/* PERFORMANCE */}
        <Card elevation={0} sx={panelSx}>
          <CardContent
            sx={{
              p: { xs: 1.4, sm: 2 },
              "&:last-child": { pb: { xs: 1.4, sm: 2 } },
            }}
          >
            <SectionTitle
              title="Store Performance"
              subtitle="Order fulfillment overview"
              action={
                <Box
                  sx={{
                    flexShrink: 0,
                    width: 34,
                    height: 34,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "#FFF6D2",
                    color: "#8C7000",
                    borderRadius: "7px",
                  }}
                >
                  <TrendingUpRounded sx={{ fontSize: 19 }} />
                </Box>
              }
            />

            <Box
              sx={{
                mt: 1.6,
                p: { xs: 1.4, sm: 1.8 },
                borderRadius: "8px",
                bgcolor: "#191919",
                color: "#fff",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  right: -40,
                  bottom: -65,
                  bgcolor: "rgba(255,208,0,.08)",
                }}
              />

              <Typography
                sx={{
                  position: "relative",
                  color: "#A8A8A8",
                  fontSize: { xs: "0.62rem", sm: "0.68rem" },
                  fontWeight: 700,
                }}
              >
                TOTAL REVENUE
              </Typography>

              <Typography
                sx={{
                  position: "relative",
                  mt: 0.4,
                  fontSize: { xs: "1.75rem", sm: "2.25rem" },
                  fontWeight: 900,
                  letterSpacing: "-.06em",
                  lineHeight: 1.2,
                  overflowWrap: "anywhere",
                }}
              >
                {formatCurrency(stats?.totalRevenue)}
              </Typography>

              <Typography
                sx={{
                  position: "relative",
                  mt: 0.5,
                  fontSize: { xs: "0.59rem", sm: "0.65rem" },
                  color: "#A4A4A4",
                }}
              >
                Revenue from paid, non-cancelled orders
              </Typography>
            </Box>

            <Box sx={{ mt: 1.8 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 0.7 }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: "0.69rem", sm: "0.74rem" },
                    fontWeight: 750,
                  }}
                >
                  Delivery completion
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "0.72rem", sm: "0.78rem" },
                    fontWeight: 900,
                  }}
                >
                  {deliveryPercentage}%
                </Typography>
              </Stack>

              <Box
                sx={{
                  height: 7,
                  borderRadius: 10,
                  bgcolor: "#EEEEEB",
                  overflow: "hidden",
                }}
              >
                <MotionBox
                  initial={{ width: 0 }}
                  animate={{ width: `${deliveryPercentage}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  sx={{
                    height: "100%",
                    bgcolor: COLORS.primary,
                    borderRadius: 10,
                  }}
                />
              </Box>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                gap: { xs: 0.9, sm: 1.1 },
                mt: 1.6,
              }}
            >
              <Box
                sx={{
                  p: { xs: 1.1, sm: 1.4 },
                  borderRadius: "8px",
                  bgcolor: "#EFF8F1",
                }}
              >
                <LocalShippingRounded sx={{ fontSize: 19, color: "#28894C" }} />
                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: { xs: "1.2rem", sm: "1.4rem" },
                    fontWeight: 900,
                  }}
                >
                  {formatNumber(stats?.deliveredOrders)}
                </Typography>
                <Typography sx={{ fontSize: "0.62rem", color: "#698273" }}>
                  Delivered orders
                </Typography>
              </Box>

              <Box
                sx={{
                  p: { xs: 1.1, sm: 1.4 },
                  borderRadius: "8px",
                  bgcolor: "#FFF8DD",
                }}
              >
                <PendingActionsRounded
                  sx={{ fontSize: 19, color: "#947700" }}
                />
                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: { xs: "1.2rem", sm: "1.4rem" },
                    fontWeight: 900,
                  }}
                >
                  {formatNumber(stats?.pendingOrders)}
                </Typography>
                <Typography sx={{ fontSize: "0.62rem", color: "#91854E" }}>
                  Pending orders
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* QUICK ACTIONS */}
        <Card elevation={0} sx={panelSx}>
          <CardContent
            sx={{
              p: { xs: 1.4, sm: 2 },
              "&:last-child": { pb: { xs: 1.4, sm: 2 } },
            }}
          >
            <SectionTitle title="Quick Actions" subtitle="Manage your store" />

            <Stack
              spacing={0.25}
              divider={<Divider sx={{ borderColor: "#F1F1EE" }} />}
              sx={{ mt: 1.2 }}
            >
              <QuickAction
                icon={<AddRounded />}
                title="Add Product"
                description="Create a new product"
                onClick={() => navigate("/admin/products/add")}
              />

              <QuickAction
                icon={<ShoppingBagRounded />}
                title="Orders"
                description="Manage customer orders"
                onClick={() => navigate("/admin/orders")}
              />

              <QuickAction
                icon={<PeopleAltRounded />}
                title="Customers"
                description="View customer data"
                onClick={() => navigate("/admin/customers")}
              />

              <QuickAction
                icon={<SettingsRounded />}
                title="Settings"
                description="Store configuration"
                onClick={() => navigate("/admin/settings")}
              />
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* RECENT ORDERS */}
      <Card
        elevation={0}
        sx={{
          ...panelSx,
          mt: { xs: 1.5, sm: 2 },
          overflow: "hidden",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 1.4, sm: 2 },
            "&:last-child": { pb: { xs: 1.4, sm: 2 } },
          }}
        >
          <SectionTitle
            title="Recent Orders"
            subtitle="Latest customer activity"
            action={
              <Button
                endIcon={<ArrowForwardRounded />}
                onClick={() => navigate("/admin/orders")}
                sx={{
                  minWidth: 0,
                  px: { xs: 0.9, sm: 1.3 },
                  py: 0.6,
                  borderRadius: "7px",
                  bgcolor: "#F4F4F1",
                  color: COLORS.ink,
                  fontSize: { xs: "0.64rem", sm: "0.72rem" },
                  fontWeight: 800,
                  textTransform: "none",
                  "& .MuiButton-endIcon": {
                    ml: 0.4,
                    "& svg": { fontSize: 16 },
                  },
                  "&:hover": { bgcolor: "#FFF5C8" },
                }}
              >
                View All
              </Button>
            }
          />

          {recentOrders.length === 0 ? (
            <Box
              sx={{
                mt: 1.5,
                py: { xs: 3, sm: 4 },
                textAlign: "center",
                borderRadius: "8px",
                bgcolor: "#FAFAF8",
              }}
            >
              <ShoppingBagRounded sx={{ fontSize: 30, color: "#C5C5BF" }} />
              <Typography
                sx={{
                  mt: 0.7,
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  color: "#555",
                }}
              >
                No recent orders
              </Typography>
              <Typography sx={{ mt: 0.3, fontSize: "0.66rem", color: "#999" }}>
                New orders will appear here.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={0.6} sx={{ mt: 1.3 }}>
              {recentOrders.map((order, index) => {
                const status = order?.orderStatus || "Pending";
                const statusStyle = getStatusStyle(status);
                const customer = order?.customer?.name || "Guest Customer";
                const amount =
                  order?.pricing?.grandTotal ?? order?.pricing?.total ?? 0;

                return (
                  <MotionBox
                    key={order?._id || index}
                    initial={{ opacity: 0, y: 7 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.25,
                      delay: Math.min(index * 0.035, 0.3),
                    }}
                    onClick={() =>
                      order?._id && navigate(`/admin/orders/${order._id}`)
                    }
                    sx={{
                      cursor: order?._id ? "pointer" : "default",
                      p: { xs: 0.9, sm: 1.2 },
                      borderRadius: "8px",
                      transition: "background .18s",
                      "&:hover": { bgcolor: "#FFFBEA" },
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={{ xs: 0.8, sm: 1.2 }}
                    >
                      <Box
                        sx={{
                          flexShrink: 0,
                          width: { xs: 32, sm: 38 },
                          height: { xs: 32, sm: 38 },
                          borderRadius: "7px",
                          display: "grid",
                          placeItems: "center",
                          bgcolor: "#F3F3F0",
                          color: "#555",
                        }}
                      >
                        <LocalShippingRounded
                          sx={{ fontSize: { xs: 17, sm: 20 } }}
                        />
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: { xs: "0.68rem", sm: "0.76rem" },
                            fontWeight: 850,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {order?.orderNumber || "Order"}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.2,
                            fontSize: { xs: "0.59rem", sm: "0.65rem" },
                            color: COLORS.muted,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {customer}
                        </Typography>

                        <Typography
                          sx={{
                            display: { xs: "block", sm: "none" },
                            mt: 0.25,
                            fontSize: "0.63rem",
                            fontWeight: 800,
                          }}
                        >
                          {formatCurrency(amount)}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: { xs: "none", sm: "block" },
                          textAlign: "right",
                          flexShrink: 0,
                        }}
                      >
                        <Typography
                          sx={{ fontSize: "0.74rem", fontWeight: 850 }}
                        >
                          {formatCurrency(amount)}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.2,
                            fontSize: "0.6rem",
                            color: "#999",
                          }}
                        >
                          {formatDate(order?.createdAt)}
                        </Typography>
                      </Box>

                      <Chip
                        label={status}
                        size="small"
                        sx={{
                          flexShrink: 0,
                          maxWidth: { xs: 90, sm: 130 },
                          height: { xs: 22, sm: 25 },
                          color: statusStyle.color,
                          bgcolor: statusStyle.bgcolor,
                          borderRadius: "5px",
                          fontWeight: 800,
                          fontSize: { xs: "0.53rem", sm: "0.61rem" },
                          "& .MuiChip-label": {
                            px: { xs: 0.7, sm: 1 },
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          },
                        }}
                      />

                      <ArrowForwardRounded
                        sx={{
                          flexShrink: 0,
                          fontSize: 16,
                          color: "#AAA",
                          display: { xs: "none", sm: "block" },
                        }}
                      />
                    </Stack>
                  </MotionBox>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
