// Glyrus — Dashboard.jsx

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
  IconButton,
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

/* ============================================================
   HELPERS
   ============================================================ */

const formatNumber = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("en-IN");
};

const formatCurrency = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "₹0";
  }

  return `₹${Math.round(
    number
  ).toLocaleString("en-IN")}`;
};

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

const getStatusStyle = (status) => {
  const value = String(
    status || "Pending"
  ).toLowerCase();

  if (value === "delivered") {
    return {
      color: "#16803C",
      bgcolor: "#EAF8EF",
    };
  }

  if (
    value === "shipped" ||
    value === "out for delivery"
  ) {
    return {
      color: "#1769AA",
      bgcolor: "#EAF3FC",
    };
  }

  if (
    value === "cancelled" ||
    value === "refunded" ||
    value === "returned"
  ) {
    return {
      color: "#B42318",
      bgcolor: "#FDECEC",
    };
  }

  if (
    value === "confirmed" ||
    value === "customization" ||
    value === "production" ||
    value === "packed"
  ) {
    return {
      color: "#8A6900",
      bgcolor: "#FFF7D6",
    };
  }

  return {
    color: "#666",
    bgcolor: "#F2F2F2",
  };
};

/* ============================================================
   KPI CARD
   ============================================================ */

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  onClick,
  delay = 0,
}) => {
  return (
    <MotionCard
      elevation={0}
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
        delay,
      }}
      whileHover={{
        y: -5,
      }}
      onClick={onClick}
      sx={{
        height: "100%",
        cursor: onClick
          ? "pointer"
          : "default",
        borderRadius: 4,
        border:
          "1px solid #EAEAEA",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(145deg,#fff,#fafafa)",
        boxShadow:
          "0 10px 30px rgba(0,0,0,.045)",
        transition:
          "box-shadow .2s ease,border-color .2s ease",
        "&:hover": {
          borderColor: "#E4C64E",
          boxShadow:
            "0 18px 40px rgba(0,0,0,.08)",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 45,
          height: 3,
          bgcolor: "#FFD000",
        }}
      />

      <CardContent
        sx={{
          p: 2.25,
          "&:last-child": {
            pb: 2.25,
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography
              sx={{
                color: "#858585",
                fontSize: "0.67rem",
                fontWeight: 850,
                textTransform:
                  "uppercase",
                letterSpacing:
                  ".7px",
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                mt: 0.8,
                fontSize: {
                  xs: "1.55rem",
                  sm: "1.9rem",
                },
                fontWeight: 950,
                lineHeight: 1,
                letterSpacing:
                  "-.055em",
                color: "#111",
              }}
            >
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.8,
              display: "grid",
              placeItems: "center",
              bgcolor: "#FFD000",
              color: "#111",
            }}
          >
            {icon}
          </Box>
        </Stack>

        <Typography
          sx={{
            mt: 1.6,
            color: "#999",
            fontSize: ".68rem",
          }}
        >
          {subtitle}
        </Typography>
      </CardContent>
    </MotionCard>
  );
};

/* ============================================================
   QUICK ACTION
   ============================================================ */

const QuickAction = ({
  icon,
  title,
  description,
  onClick,
}) => {
  return (
    <MotionBox
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      sx={{
        cursor: "pointer",
        p: 1.35,
        borderRadius: 3,
        border:
          "1px solid #ECECEC",
        bgcolor: "#fff",
        transition:
          "all .18s ease",
        "&:hover": {
          borderColor: "#E3C650",
          bgcolor: "#FFFDF2",
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.2}
      >
        <Box
          sx={{
            width: 39,
            height: 39,
            borderRadius: 2.4,
            bgcolor: "#FFF7D7",
            display: "grid",
            placeItems: "center",
            color: "#8A6D00",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: ".76rem",
              fontWeight: 850,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              mt: .2,
              fontSize: ".64rem",
              color: "#999",
            }}
          >
            {description}
          </Typography>
        </Box>

        <ArrowForwardRounded
          sx={{
            fontSize: 17,
            color: "#B5B5B5",
          }}
        />
      </Stack>
    </MotionBox>
  );
};

/* ============================================================
   DASHBOARD
   ============================================================ */

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] =
    useState(null);

  const [recentOrders, setRecentOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ==========================================================
     FETCH DASHBOARD
     ========================================================== */

  const fetchDashboard = async (
    initial = false
  ) => {
    try {
      if (initial) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await api.get(
        "/api/admin/dashboard"
      );

      const data = response?.data;

      setStats(
        data?.stats || {}
      );

      setRecentOrders(
        Array.isArray(
          data?.recentOrders
        )
          ? data.recentOrders
          : []
      );
    } catch (error) {
      setError(
        error?.response?.data
          ?.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard(true);
  }, []);

  /* ==========================================================
     PERFORMANCE
     ========================================================== */

  const deliveryPercentage =
    useMemo(() => {
      const total = Number(
        stats?.totalOrders || 0
      );

      const delivered = Number(
        stats?.deliveredOrders || 0
      );

      if (!total) return 0;

      return Math.min(
        100,
        Math.round(
          (delivered / total) * 100
        )
      );
    }, [stats]);

  /* ==========================================================
     LOADING
     ========================================================== */

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "65vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Box
          sx={{
            width: 62,
            height: 62,
            borderRadius: 4,
            display: "grid",
            placeItems: "center",
            bgcolor: "#FFF8D9",
            border:
              "1px solid #F0D66A",
          }}
        >
          <CircularProgress
            size={27}
            thickness={4}
            sx={{
              color: "#D5A900",
            }}
          />
        </Box>
      </Box>
    );
  }

  /* ==========================================================
     UI
     ========================================================== */

  return (
    <Box
      sx={{
        width: "100%",
        pb: 4,
      }}
    >
      {/* ======================================================
          HEADER
         ====================================================== */}

      <MotionBox
        initial={{
          opacity: 0,
          y: -12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        sx={{
          mb: 3,
          p: {
            xs: 2,
            sm: 2.5,
            md: 3,
          },
          borderRadius: 4,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg,#111 0%,#181818 65%,#29240D 100%)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 190,
            height: 190,
            borderRadius: "50%",
            right: -80,
            top: -110,
            bgcolor:
              "rgba(255,208,0,.1)",
          }}
        />

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          alignItems={{
            xs: "flex-start",
            sm: "center",
          }}
          justifyContent="space-between"
          spacing={2}
          sx={{
            position: "relative",
          }}
        >
          <Box>
            <Typography
              sx={{
                color: "#FFD000",
                fontSize: ".66rem",
                fontWeight: 850,
                letterSpacing: "1px",
                textTransform:
                  "uppercase",
                mb: .7,
              }}
            >
              GLYRUS ADMIN
            </Typography>

            <Typography
              sx={{
                fontSize: {
                  xs: "1.7rem",
                  md: "2.25rem",
                },
                fontWeight: 950,
                letterSpacing:
                  "-.055em",
                lineHeight: 1,
              }}
            >
              Dashboard
            </Typography>

            <Typography
              sx={{
                mt: .8,
                color: "#A8A8A8",
                fontSize: ".77rem",
              }}
            >
              Overview of your store
              performance and activity.
            </Typography>
          </Box>

          <Button
            onClick={() =>
              fetchDashboard(false)
            }
            disabled={refreshing}
            startIcon={
              refreshing ? (
                <CircularProgress
                  size={16}
                  sx={{
                    color: "#111",
                  }}
                />
              ) : (
                <RefreshRounded />
              )
            }
            sx={{
              minHeight: 42,
              px: 2,
              borderRadius: 2.5,
              bgcolor: "#FFD000",
              color: "#111",
              fontWeight: 850,
              textTransform:
                "none",
              "&:hover": {
                bgcolor: "#F2C600",
              },
            }}
          >
            Refresh
          </Button>
        </Stack>
      </MotionBox>

      {/* ======================================================
          ERROR
         ====================================================== */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2.5,
            borderRadius: 3,
          }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() =>
                fetchDashboard(true)
              }
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* ======================================================
          STATS
         ====================================================== */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2,1fr)",
            md: "repeat(4,1fr)",
          },
          gap: {
            xs: 1.2,
            sm: 1.7,
            md: 2,
          },
        }}
      >
        <StatCard
          title="Total Orders"
          value={formatNumber(
            stats?.totalOrders
          )}
          subtitle="All customer orders"
          icon={
            <ShoppingBagRounded />
          }
          delay={0}
          onClick={() =>
            navigate("/admin/orders")
          }
        />

        <StatCard
          title="Revenue"
          value={formatCurrency(
            stats?.totalRevenue
          )}
          subtitle="Paid order revenue"
          icon={
            <TrendingUpRounded />
          }
          delay={0.06}
        />

        <StatCard
          title="Customers"
          value={formatNumber(
            stats?.totalCustomers
          )}
          subtitle="Unique customers"
          icon={
            <PeopleAltRounded />
          }
          delay={0.12}
          onClick={() =>
            navigate(
              "/admin/customers"
            )
          }
        />

        <StatCard
          title="Products"
          value={formatNumber(
            stats?.totalProducts
          )}
          subtitle={`${formatNumber(
            stats?.activeProducts
          )} active products`}
          icon={
            <Inventory2Rounded />
          }
          delay={0.18}
          onClick={() =>
            navigate(
              "/admin/products"
            )
          }
        />
      </Box>

      {/* ======================================================
          SECONDARY STATS
         ====================================================== */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2,1fr)",
            md: "repeat(4,1fr)",
          },
          gap: {
            xs: 1.2,
            sm: 1.7,
            md: 2,
          },
          mt: 2,
        }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: 3.5,
            bgcolor: "#FFFBEA",
            border:
              "1px solid #F1E3A5",
          }}
        >
          <Typography
            sx={{
              fontSize: ".66rem",
              color: "#8B7825",
              fontWeight: 800,
              textTransform:
                "uppercase",
            }}
          >
            Pending Orders
          </Typography>

          <Typography
            sx={{
              mt: .5,
              fontSize: "1.45rem",
              fontWeight: 950,
            }}
          >
            {formatNumber(
              stats?.pendingOrders
            )}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: 3.5,
            bgcolor: "#EEF9F1",
            border:
              "1px solid #D5EBDD",
          }}
        >
          <Typography
            sx={{
              fontSize: ".66rem",
              color: "#4D795C",
              fontWeight: 800,
              textTransform:
                "uppercase",
            }}
          >
            Delivered
          </Typography>

          <Typography
            sx={{
              mt: .5,
              fontSize: "1.45rem",
              fontWeight: 950,
            }}
          >
            {formatNumber(
              stats?.deliveredOrders
            )}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: 3.5,
            bgcolor: "#F8F8F8",
            border:
              "1px solid #EAEAEA",
          }}
        >
          <Typography
            sx={{
              fontSize: ".66rem",
              color: "#777",
              fontWeight: 800,
              textTransform:
                "uppercase",
            }}
          >
            Requests
          </Typography>

          <Typography
            sx={{
              mt: .5,
              fontSize: "1.45rem",
              fontWeight: 950,
            }}
          >
            {formatNumber(
              stats?.totalRequests
            )}
          </Typography>

          <Typography
            sx={{
              fontSize: ".62rem",
              color: "#999",
            }}
          >
            {formatNumber(
              stats?.pendingRequests
            )} pending
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: 3.5,
            bgcolor: "#F8F8F8",
            border:
              "1px solid #EAEAEA",
          }}
        >
          <Typography
            sx={{
              fontSize: ".66rem",
              color: "#777",
              fontWeight: 800,
              textTransform:
                "uppercase",
            }}
          >
            Messages
          </Typography>

          <Typography
            sx={{
              mt: .5,
              fontSize: "1.45rem",
              fontWeight: 950,
            }}
          >
            {formatNumber(
              stats?.totalMessages
            )}
          </Typography>

          <Typography
            sx={{
              fontSize: ".62rem",
              color: "#999",
            }}
          >
            {formatNumber(
              stats?.unreadMessages
            )} unread
          </Typography>
        </Box>
      </Box>

      {/* ======================================================
          PERFORMANCE + QUICK ACTIONS
         ====================================================== */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "1.35fr .65fr",
          },
          gap: 2.5,
          mt: 2.5,
        }}
      >
        {/* PERFORMANCE */}

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border:
              "1px solid #EAEAEA",
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: "1.05rem",
                  }}
                >
                  Store Performance
                </Typography>

                <Typography
                  sx={{
                    color: "#999",
                    fontSize: ".7rem",
                    mt: .3,
                  }}
                >
                  Order fulfillment
                  overview
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
                  bgcolor:
                    "#FFF7D6",
                  display: "grid",
                  placeItems: "center",
                  color: "#927300",
                }}
              >
                <TrendingUpRounded />
              </Box>
            </Stack>

            <Box
              sx={{
                mt: 2.5,
                p: 2.2,
                borderRadius: 3.5,
                bgcolor: "#111",
                color: "#fff",
              }}
            >
              <Typography
                sx={{
                  color: "#999",
                  fontSize: ".67rem",
                  textTransform:
                    "uppercase",
                  fontWeight: 750,
                }}
              >
                Total Revenue
              </Typography>

              <Typography
                sx={{
                  mt: .5,
                  fontSize: {
                    xs: "2rem",
                    sm: "2.4rem",
                  },
                  fontWeight: 950,
                  letterSpacing:
                    "-.06em",
                }}
              >
                {formatCurrency(
                  stats?.totalRevenue
                )}
              </Typography>

              <Typography
                sx={{
                  mt: .7,
                  color: "#777",
                  fontSize: ".65rem",
                }}
              >
                Revenue from paid,
                non-cancelled orders
              </Typography>
            </Box>

            <Box sx={{ mt: 2.5 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mb: .8 }}
              >
                <Typography
                  sx={{
                    fontSize: ".73rem",
                    fontWeight: 800,
                  }}
                >
                  Delivery completion
                </Typography>

                <Typography
                  sx={{
                    fontSize: ".73rem",
                    fontWeight: 900,
                  }}
                >
                  {deliveryPercentage}%
                </Typography>
              </Stack>

              <Box
                sx={{
                  height: 9,
                  borderRadius: 99,
                  bgcolor: "#EEEEEE",
                  overflow: "hidden",
                }}
              >
                <MotionBox
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${deliveryPercentage}%`,
                  }}
                  transition={{
                    duration: 1,
                  }}
                  sx={{
                    height: "100%",
                    bgcolor:
                      "#FFD000",
                    borderRadius: 99,
                  }}
                />
              </Box>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2,1fr)",
                gap: 1.5,
                mt: 2,
              }}
            >
              <Box
                sx={{
                  p: 1.7,
                  borderRadius: 3,
                  bgcolor:
                    "#F1FAF4",
                  border:
                    "1px solid #DDEEE2",
                }}
              >
                <LocalShippingRounded
                  sx={{
                    fontSize: 19,
                    color: "#28894C",
                  }}
                />

                <Typography
                  sx={{
                    mt: .7,
                    fontSize:
                      "1.25rem",
                    fontWeight: 950,
                  }}
                >
                  {formatNumber(
                    stats?.deliveredOrders
                  )}
                </Typography>

                <Typography
                  sx={{
                    fontSize: ".63rem",
                    color: "#799080",
                  }}
                >
                  Delivered orders
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 1.7,
                  borderRadius: 3,
                  bgcolor:
                    "#FFFBEA",
                  border:
                    "1px solid #F1E5AC",
                }}
              >
                <PendingActionsRounded
                  sx={{
                    fontSize: 19,
                    color: "#947700",
                  }}
                />

                <Typography
                  sx={{
                    mt: .7,
                    fontSize:
                      "1.25rem",
                    fontWeight: 950,
                  }}
                >
                  {formatNumber(
                    stats?.pendingOrders
                  )}
                </Typography>

                <Typography
                  sx={{
                    fontSize: ".63rem",
                    color: "#91854E",
                  }}
                >
                  Pending orders
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* QUICK ACTIONS */}

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border:
              "1px solid #EAEAEA",
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: "1.05rem",
              }}
            >
              Quick Actions
            </Typography>

            <Typography
              sx={{
                color: "#999",
                fontSize: ".7rem",
                mt: .3,
              }}
            >
              Manage your store
              quickly
            </Typography>

            <Stack
              spacing={1.1}
              sx={{ mt: 2 }}
            >
              <QuickAction
                icon={<AddRounded />}
                title="Add Product"
                description="Create new product"
                onClick={() =>
                  navigate(
                    "/admin/products/add"
                  )
                }
              />

              <QuickAction
                icon={
                  <ShoppingBagRounded />
                }
                title="Orders"
                description="Manage customer orders"
                onClick={() =>
                  navigate(
                    "/admin/orders"
                  )
                }
              />

              <QuickAction
                icon={
                  <PeopleAltRounded />
                }
                title="Customers"
                description="View customer data"
                onClick={() =>
                  navigate(
                    "/admin/customers"
                  )
                }
              />

              <QuickAction
                icon={
                  <SettingsRounded />
                }
                title="Settings"
                description="Store configuration"
                onClick={() =>
                  navigate(
                    "/admin/settings"
                  )
                }
              />
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* ======================================================
          RECENT ORDERS
         ====================================================== */}

      <Card
        elevation={0}
        sx={{
          mt: 2.5,
          borderRadius: 4,
          border:
            "1px solid #EAEAEA",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: "1.05rem",
                }}
              >
                Recent Orders
              </Typography>

              <Typography
                sx={{
                  color: "#999",
                  fontSize: ".7rem",
                  mt: .3,
                }}
              >
                Latest customer activity
              </Typography>
            </Box>

            <Button
              endIcon={
                <ArrowForwardRounded />
              }
              onClick={() =>
                navigate(
                  "/admin/orders"
                )
              }
              sx={{
                textTransform:
                  "none",
                fontWeight: 800,
                color: "#333",
                bgcolor: "#F7F7F7",
                borderRadius: 2.5,
                "&:hover": {
                  bgcolor: "#FFF7D7",
                },
              }}
            >
              View All
            </Button>
          </Stack>

          {recentOrders.length ===
          0 ? (
            <Box
              sx={{
                mt: 2,
                py: 6,
                textAlign: "center",
                border:
                  "1px dashed #D8D8D8",
                borderRadius: 3.5,
                bgcolor: "#FCFCFC",
              }}
            >
              <ShoppingBagRounded
                sx={{
                  fontSize: 38,
                  color: "#C7C7C7",
                }}
              />

              <Typography
                sx={{
                  mt: 1,
                  fontWeight: 850,
                  color: "#555",
                }}
              >
                No recent orders
              </Typography>

              <Typography
                sx={{
                  mt: .4,
                  fontSize: ".7rem",
                  color: "#999",
                }}
              >
                New orders will appear
                here.
              </Typography>
            </Box>
          ) : (
            <Stack
              spacing={1}
              sx={{ mt: 2 }}
            >
              {recentOrders.map(
                (order, index) => {
                  const status =
                    order?.orderStatus ||
                    "Pending";

                  const statusStyle =
                    getStatusStyle(
                      status
                    );

                  const customer =
                    order?.customer
                      ?.name ||
                    "Guest Customer";

                  const amount =
                    order?.pricing
                      ?.grandTotal ??
                    order?.pricing
                      ?.total ??
                    0;

                  return (
                    <MotionBox
                      key={
                        order?._id ||
                        index
                      }
                      initial={{
                        opacity: 0,
                        x: -10,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay:
                          index * .05,
                      }}
                      onClick={() =>
                        order?._id &&
                        navigate(
                          `/admin/orders/${order._id}`
                        )
                      }
                      sx={{
                        cursor:
                          order?._id
                            ? "pointer"
                            : "default",
                        p: 1.35,
                        borderRadius: 3,
                        border:
                          "1px solid #EEEEEE",
                        "&:hover": {
                          bgcolor:
                            "#FFFEF7",
                          borderColor:
                            "#E5CA55",
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1.4}
                      >
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 2.5,
                            display: "grid",
                            placeItems:
                              "center",
                            bgcolor:
                              "#F7F7F7",
                            flexShrink: 0,
                          }}
                        >
                          <LocalShippingRounded
                            sx={{
                              fontSize: 20,
                            }}
                          />
                        </Box>

                        <Box
                          sx={{
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize:
                                ".76rem",
                              fontWeight: 900,
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {order?.orderNumber ||
                              "Order"}
                          </Typography>

                          <Typography
                            sx={{
                              mt: .25,
                              fontSize:
                                ".65rem",
                              color: "#999",
                            }}
                          >
                            {customer}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: {
                              xs: "none",
                              sm: "block",
                            },
                            textAlign:
                              "right",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize:
                                ".75rem",
                              fontWeight: 900,
                            }}
                          >
                            {formatCurrency(
                              amount
                            )}
                          </Typography>

                          <Typography
                            sx={{
                              mt: .2,
                              fontSize:
                                ".6rem",
                              color: "#999",
                            }}
                          >
                            {formatDate(
                              order?.createdAt
                            )}
                          </Typography>
                        </Box>

                        <Chip
                          label={status}
                          size="small"
                          sx={{
                            height: 27,
                            color:
                              statusStyle.color,
                            bgcolor:
                              statusStyle.bgcolor,
                            fontWeight: 800,
                            fontSize:
                              ".6rem",
                          }}
                        />

                        <ArrowForwardRounded
                          sx={{
                            fontSize: 18,
                            color: "#AAA",
                          }}
                        />
                      </Stack>
                    </MotionBox>
                  );
                }
              )}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;