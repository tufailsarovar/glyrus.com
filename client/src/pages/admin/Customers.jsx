import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import {
  EmailRounded,
  PeopleAltRounded,
  PhoneRounded,
  RefreshRounded,
  SearchRounded,
  ShoppingBagRounded,
  TrendingUpRounded,
} from "@mui/icons-material";

import { motion } from "framer-motion";
import api from "../../services/api";
import formatCurrency from "../../utils/formatCurrency";

const MotionCard = motion(Card);

const C = {
  black: "#171717",
  gold: "#F4C430",
  goldDark: "#987300",
  goldLight: "#FFF8DB",
  border: "#EAEAEA",
  muted: "#858585",
  green: "#16845B",
  greenLight: "#E9F8F0",
  surface: "#FAFAFA",
};

const getCustomersData = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.customers)) return data.customers;
  if (Array.isArray(data?.data?.customers)) return data.data.customers;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getCustomerName = (customer) =>
  customer?.name ||
  customer?.customer?.name ||
  customer?.guestCustomer?.name ||
  "Guest Customer";

const getCustomerEmail = (customer) =>
  customer?.email ||
  customer?.customer?.email ||
  customer?.guestCustomer?.email ||
  "—";

const getCustomerMobile = (customer) =>
  customer?.mobile ||
  customer?.phone ||
  customer?.customer?.mobile ||
  customer?.customer?.phone ||
  customer?.guestCustomer?.mobile ||
  "—";

const getOrderCount = (customer) =>
  Number(
    customer?.orderCount ??
      customer?.totalOrders ??
      customer?.ordersCount ??
      customer?.orders?.length ??
      0,
  );

const getTotalSpent = (customer) =>
  Number(
    customer?.totalSpent ??
      customer?.totalAmount ??
      customer?.totalOrdersValue ??
      customer?.spent ??
      0,
  );

const getInitials = (name) =>
  String(name || "G")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("") || "G";

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

const baseCardSx = {
  border: `1px solid ${C.border}`,
  borderRadius: 2,
  bgcolor: "#fff",
  boxShadow: "none",
  transition: "border-color 180ms ease, background-color 180ms ease",
};

const SectionLabel = ({ children }) => (
  <Typography
    sx={{
      fontSize: "0.68rem",
      fontWeight: 850,
      color: C.muted,
      letterSpacing: "0.075em",
      textTransform: "uppercase",
    }}
  >
    {children}
  </Typography>
);

const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  iconColor,
  delay = 0,
}) => (
  <MotionCard
    elevation={0}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    sx={{
      ...baseCardSx,
      "&:hover": { borderColor: "#DCC66F" },
    }}
  >
    <CardContent
      sx={{
        p: { xs: 1.7, sm: 2.1 },
        "&:last-child": { pb: { xs: 1.7, sm: 2.1 } },
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={1.2}
      >
        <Box sx={{ minWidth: 0 }}>
          <SectionLabel>{title}</SectionLabel>

          <Typography
            sx={{
              mt: 1,
              fontSize: { xs: "1.4rem", sm: "1.65rem" },
              fontWeight: 950,
              color: C.black,
              letterSpacing: "-0.045em",
              lineHeight: 1.25,
              overflowWrap: "anywhere",
            }}
          >
            {value}
          </Typography>

          <Typography
            sx={{
              mt: 0.7,
              color: C.muted,
              fontSize: "0.7rem",
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 42,
            height: 42,
            flexShrink: 0,
            borderRadius: 1.5,
            display: "grid",
            placeItems: "center",
            bgcolor: iconBg,
            color: iconColor,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </CardContent>
  </MotionCard>
);

const CustomerIdentity = ({ name, email, compact = false }) => (
  <Stack direction="row" alignItems="center" spacing={1.2} sx={{ minWidth: 0 }}>
    <Avatar
      sx={{
        width: compact ? 38 : 42,
        height: compact ? 38 : 42,
        bgcolor: C.black,
        color: C.gold,
        fontSize: "0.78rem",
        fontWeight: 900,
        border: "1px solid #E6D58C",
      }}
    >
      {getInitials(name)}
    </Avatar>

    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography
        sx={{
          color: C.black,
          fontSize: compact ? "0.8rem" : "0.87rem",
          fontWeight: 850,
          lineHeight: 1.45,
          overflowWrap: "anywhere",
        }}
      >
        {name}
      </Typography>

      <Typography
        sx={{
          mt: 0.25,
          color: C.muted,
          fontSize: "0.69rem",
          overflowWrap: "anywhere",
        }}
      >
        {email}
      </Typography>
    </Box>
  </Stack>
);

const ContactDetails = ({ email, mobile }) => (
  <Stack spacing={0.8} sx={{ minWidth: 0 }}>
    <Stack direction="row" spacing={0.7} alignItems="flex-start">
      <EmailRounded
        sx={{ fontSize: 15, color: "#999", mt: "2px", flexShrink: 0 }}
      />
      <Typography
        sx={{
          fontSize: "0.72rem",
          color: "#555",
          overflowWrap: "anywhere",
        }}
      >
        {email}
      </Typography>
    </Stack>

    <Stack direction="row" spacing={0.7} alignItems="center">
      <PhoneRounded sx={{ fontSize: 15, color: "#999", flexShrink: 0 }} />
      <Typography
        sx={{
          fontSize: "0.72rem",
          color: "#555",
          overflowWrap: "anywhere",
        }}
      >
        {mobile}
      </Typography>
    </Stack>
  </Stack>
);

const CustomerMetrics = ({ orders, spent }) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    spacing={1}
  >
    <Box>
      <SectionLabel>Orders</SectionLabel>
      <Chip
        size="small"
        label={orders}
        sx={{
          mt: 0.6,
          height: 25,
          minWidth: 38,
          borderRadius: 1,
          bgcolor: orders > 0 ? C.goldLight : "#F2F2F2",
          color: orders > 0 ? C.goldDark : "#555",
          fontWeight: 900,
        }}
      />
    </Box>

    <Box sx={{ minWidth: 0, textAlign: "right" }}>
      <SectionLabel>Total spent</SectionLabel>
      <Typography
        sx={{
          mt: 0.6,
          color: C.black,
          fontSize: "0.83rem",
          fontWeight: 950,
          overflowWrap: "anywhere",
        }}
      >
        {formatCurrency(spent)}
      </Typography>
    </Box>
  </Stack>
);

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/admin/customers");
      setCustomers(getCustomersData(response?.data));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load customers.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return customers;

    return customers.filter((customer) => {
      const name = String(getCustomerName(customer)).toLowerCase();
      const email = String(getCustomerEmail(customer)).toLowerCase();
      const mobile = String(getCustomerMobile(customer)).toLowerCase();

      return (
        name.includes(query) || email.includes(query) || mobile.includes(query)
      );
    });
  }, [customers, search]);

  const totalOrders = useMemo(
    () =>
      customers.reduce((total, customer) => total + getOrderCount(customer), 0),
    [customers],
  );

  const totalRevenue = useMemo(
    () =>
      customers.reduce((total, customer) => total + getTotalSpent(customer), 0),
    [customers],
  );

  const averageSpent = customers.length ? totalRevenue / customers.length : 0;

  const renderEmptyState = () => (
    <Box sx={{ py: 7, px: 2, textAlign: "center" }}>
      <PeopleAltRounded sx={{ fontSize: 38, color: "#C5B36A" }} />

      <Typography
        sx={{ mt: 1.5, fontSize: "0.95rem", fontWeight: 900, color: C.black }}
      >
        {search ? "No matching customers" : "No customers yet"}
      </Typography>

      <Typography sx={{ mt: 0.6, color: C.muted, fontSize: "0.78rem" }}>
        {search
          ? "Try another name, email address or mobile number."
          : "Customer information will appear here when available."}
      </Typography>

      {search && (
        <Button
          onClick={() => setSearch("")}
          sx={{
            mt: 1,
            color: C.goldDark,
            fontWeight: 850,
            textTransform: "none",
          }}
        >
          Clear search
        </Button>
      )}
    </Box>
  );

  return (
    <Box sx={{ width: "100%", minWidth: 0, pb: { xs: 3, md: 4 } }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={1.8}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            sx={{
              mb: 0.7,
              color: C.goldDark,
              fontSize: "0.67rem",
              fontWeight: 900,
              letterSpacing: "0.13em",
            }}
          >
            GLYRUS / ADMINISTRATION
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: "1.7rem", sm: "2rem", md: "2.25rem" },
              color: C.black,
              fontWeight: 950,
              letterSpacing: "-0.055em",
              lineHeight: 1.15,
            }}
          >
            Customers<span style={{ color: C.goldDark }}>.</span>
          </Typography>

          <Typography sx={{ mt: 0.7, color: C.muted, fontSize: "0.8rem" }}>
            Customer directory, orders and spending activity.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            icon={<PeopleAltRounded />}
            label={`${customers.length} ${
              customers.length === 1 ? "Customer" : "Customers"
            }`}
            sx={{
              height: 35,
              borderRadius: 1.5,
              bgcolor: C.goldLight,
              color: C.goldDark,
              fontWeight: 850,
              "& .MuiChip-icon": { color: C.goldDark },
            }}
          />

          <Button
            variant="outlined"
            onClick={fetchCustomers}
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <RefreshRounded />
              )
            }
            sx={{
              height: 35,
              px: 1.4,
              borderRadius: 1.5,
              borderColor: "#DDDDDD",
              color: C.black,
              fontSize: "0.75rem",
              fontWeight: 850,
              textTransform: "none",
              "&:hover": {
                borderColor: C.goldDark,
                bgcolor: C.goldLight,
              },
            }}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={fetchCustomers}
              sx={{ fontWeight: 800 }}
            >
              Retry
            </Button>
          }
          sx={{ mb: 2.5, borderRadius: 1.5 }}
        >
          {error}
        </Alert>
      )}

      {/* Summary */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
          },
          gap: { xs: 1.3, sm: 1.8 },
          mb: 3,
        }}
      >
        <MetricCard
          title="Total customers"
          value={customers.length.toLocaleString("en-IN")}
          subtitle="Customers in your database"
          icon={<PeopleAltRounded sx={{ fontSize: 23 }} />}
          iconBg={C.goldLight}
          iconColor={C.goldDark}
        />

        <MetricCard
          title="Total orders"
          value={totalOrders.toLocaleString("en-IN")}
          subtitle="Combined customer order count"
          icon={<ShoppingBagRounded sx={{ fontSize: 23 }} />}
          iconBg="#F2F2F2"
          iconColor={C.black}
          delay={0.05}
        />

        <MetricCard
          title="Total customer value"
          value={formatCurrency(totalRevenue)}
          subtitle={`Average per customer: ${formatCurrency(averageSpent)}`}
          icon={<TrendingUpRounded sx={{ fontSize: 23 }} />}
          iconBg={C.greenLight}
          iconColor={C.green}
          delay={0.1}
        />
      </Box>

      {/* Directory */}
      <Card elevation={0} sx={baseCardSx}>
        <CardContent
          sx={{
            p: { xs: 1.5, sm: 2.2, md: 2.5 },
            "&:last-child": {
              pb: { xs: 1.5, sm: 2.2, md: 2.5 },
            },
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
            spacing={1.3}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography
                sx={{
                  color: C.black,
                  fontSize: "0.98rem",
                  fontWeight: 950,
                }}
              >
                Customer directory
              </Typography>

              <Typography
                sx={{ mt: 0.35, color: C.muted, fontSize: "0.72rem" }}
              >
                Search and review customer details.
              </Typography>
            </Box>

            <Chip
              size="small"
              label={`${filteredCustomers.length} results`}
              sx={{
                alignSelf: { xs: "flex-start", sm: "center" },
                borderRadius: 1,
                bgcolor: "#F4F4F4",
                color: "#555",
                fontWeight: 800,
                fontSize: "0.68rem",
              }}
            />
          </Stack>

          <TextField
            fullWidth
            size="small"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email or mobile..."
            inputProps={{ "aria-label": "Search customers" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded sx={{ color: "#999", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: { xs: "100%", md: 470 },
              "& .MuiOutlinedInput-root": {
                minHeight: 43,
                borderRadius: 1.5,
                bgcolor: C.surface,
                fontSize: "0.79rem",
                "& fieldset": { borderColor: C.border },
                "&:hover fieldset": { borderColor: "#D7C26D" },
                "&.Mui-focused fieldset": { borderColor: C.goldDark },
              },
            }}
          />

          <Divider sx={{ my: 2.2, borderColor: "#EEEEEE" }} />

          {loading ? (
            <Box
              sx={{
                minHeight: 230,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.3,
              }}
            >
              <CircularProgress
                size={30}
                thickness={4}
                sx={{ color: C.goldDark }}
              />
              <Typography sx={{ fontSize: "0.76rem", color: C.muted }}>
                Loading customers...
              </Typography>
            </Box>
          ) : filteredCustomers.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {/* Mobile layout */}
              <Box
                sx={{
                  display: { xs: "grid", md: "none" },
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 1.3,
                }}
              >
                {filteredCustomers.map((customer, index) => {
                  const name = getCustomerName(customer);
                  const email = getCustomerEmail(customer);
                  const mobile = getCustomerMobile(customer);

                  return (
                    <MotionCard
                      key={customer?._id || customer?.id || `${email}-${index}`}
                      elevation={0}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.22,
                        delay: Math.min(index * 0.02, 0.2),
                      }}
                      sx={{
                        border: `1px solid ${C.border}`,
                        borderRadius: 1.5,
                        boxShadow: "none",
                        "&:hover": { borderColor: "#DCC66F" },
                      }}
                    >
                      <CardContent
                        sx={{
                          p: 1.6,
                          "&:last-child": { pb: 1.6 },
                        }}
                      >
                        <CustomerIdentity name={name} email={email} />

                        <Divider sx={{ my: 1.4 }} />

                        <ContactDetails email={email} mobile={mobile} />

                        <Divider sx={{ my: 1.4 }} />

                        <CustomerMetrics
                          orders={getOrderCount(customer)}
                          spent={getTotalSpent(customer)}
                        />

                        {customer?.createdAt && (
                          <Typography
                            sx={{
                              mt: 1.3,
                              fontSize: "0.66rem",
                              color: "#999",
                            }}
                          >
                            Customer since {formatDate(customer.createdAt)}
                          </Typography>
                        )}
                      </CardContent>
                    </MotionCard>
                  );
                })}
              </Box>

              {/* Desktop table */}
              <TableContainer
                sx={{
                  display: { xs: "none", md: "block" },
                  border: `1px solid ${C.border}`,
                  borderRadius: 1.5,
                  overflowX: "auto",
                }}
              >
                <Table sx={{ minWidth: 760 }}>
                  <TableHead>
                    <TableRow
                      sx={{
                        bgcolor: "#F8F8F8",
                        "& th": {
                          py: 1.6,
                          borderBottom: `1px solid ${C.border}`,
                        },
                      }}
                    >
                      {[
                        ["Customer", "left"],
                        ["Contact details", "left"],
                        ["Orders", "center"],
                        ["Total spent", "right"],
                        ["Customer since", "right"],
                      ].map(([label, align]) => (
                        <TableCell
                          key={label}
                          align={align}
                          sx={{
                            fontSize: "0.66rem",
                            color: "#777",
                            fontWeight: 900,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filteredCustomers.map((customer, index) => {
                      const name = getCustomerName(customer);
                      const email = getCustomerEmail(customer);
                      const mobile = getCustomerMobile(customer);
                      const orders = getOrderCount(customer);
                      const spent = getTotalSpent(customer);

                      return (
                        <TableRow
                          key={
                            customer?._id || customer?.id || `${email}-${index}`
                          }
                          hover
                          sx={{
                            "& td": {
                              py: 1.6,
                              borderBottom: "1px solid #F0F0F0",
                            },
                            "&:hover": {
                              bgcolor: "#FFFCF1 !important",
                            },
                            "&:last-child td": { borderBottom: 0 },
                          }}
                        >
                          <TableCell sx={{ maxWidth: 260 }}>
                            <CustomerIdentity
                              name={name}
                              email={email}
                              compact
                            />
                          </TableCell>

                          <TableCell sx={{ maxWidth: 270 }}>
                            <ContactDetails email={email} mobile={mobile} />
                          </TableCell>

                          <TableCell align="center">
                            <Chip
                              size="small"
                              label={orders}
                              sx={{
                                minWidth: 38,
                                height: 26,
                                borderRadius: 1,
                                bgcolor: orders > 0 ? C.goldLight : "#F2F2F2",
                                color: orders > 0 ? C.goldDark : "#555",
                                fontWeight: 900,
                              }}
                            />
                          </TableCell>

                          <TableCell align="right">
                            <Typography
                              sx={{
                                color: C.black,
                                fontSize: "0.8rem",
                                fontWeight: 900,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {formatCurrency(spent)}
                            </Typography>
                          </TableCell>

                          <TableCell align="right">
                            <Typography
                              sx={{
                                color: "#777",
                                fontSize: "0.72rem",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {formatDate(customer?.createdAt)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {!loading && filteredCustomers.length > 0 && (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              spacing={0.7}
              sx={{ mt: 1.8 }}
            >
              <Typography sx={{ color: C.muted, fontSize: "0.69rem" }}>
                Showing {filteredCustomers.length} of {customers.length}{" "}
                customers
              </Typography>

              <Typography sx={{ color: "#AAA", fontSize: "0.66rem" }}>
                Glyrus customer management
              </Typography>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Customers;
