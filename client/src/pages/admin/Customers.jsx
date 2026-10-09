// Glyrus — Customers.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  InputAdornment,
  Stack,
  Table,
  Divider,
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
  SearchRounded,
  ShoppingBagRounded,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import api from "../../services/api";
import formatCurrency from "../../utils/formatCurrency";

const MotionCard = motion(Card);

const getCustomersData = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.customers)) return data.customers;
  if (Array.isArray(data?.data?.customers)) {
    return data.data.customers;
  }
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
      0
  );

const getTotalSpent = (customer) =>
  Number(
    customer?.totalSpent ??
      customer?.totalAmount ??
      customer?.totalOrdersValue ??
      customer?.spent ??
      0
  );

const getInitials = (name) => {
  const words = String(name || "G")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "G";

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
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

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCustomers = async () => {
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
          "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return customers;

    return customers.filter((customer) => {
      const name = getCustomerName(customer).toLowerCase();
      const email = getCustomerEmail(customer).toLowerCase();
      const mobile = String(
        getCustomerMobile(customer)
      ).toLowerCase();

      return (
        name.includes(query) ||
        email.includes(query) ||
        mobile.includes(query)
      );
    });
  }, [customers, search]);

  const totalOrders = useMemo(
    () =>
      customers.reduce(
        (total, customer) =>
          total + getOrderCount(customer),
        0
      ),
    [customers]
  );

  const totalRevenue = useMemo(
    () =>
      customers.reduce(
        (total, customer) =>
          total + getTotalSpent(customer),
        0
      ),
    [customers]
  );

  return (
    <Box
      sx={{
        width: "100%",
        pb: { xs: 3, md: 5 },
      }}
    >
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
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: {
                xs: "1.5rem",
                sm: "1.9rem",
                md: "2.2rem",
              },
              fontWeight: 950,
              letterSpacing: "-0.04em",
              color: "#111",
            }}
          >
            Customers
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              color: "#888",
              fontSize: {
                xs: "0.76rem",
                sm: "0.82rem",
              },
            }}
          >
            View guest customers and their order activity.
          </Typography>
        </Box>

        <Chip
          icon={<PeopleAltRounded />}
          label={`${customers.length} Customer${
            customers.length === 1 ? "" : "s"
          }`}
          sx={{
            height: 38,
            borderRadius: 2.5,
            bgcolor: "#FFF7D2",
            color: "#806200",
            fontWeight: 900,
            "& .MuiChip-icon": {
              color: "#A17B00",
            },
          }}
        />
      </Stack>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{
            mb: 2.5,
            borderRadius: 3,
          }}
        >
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 2,
          mb: 2.5,
        }}
      >
        <MotionCard
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
            duration: 0.35,
          }}
          sx={{
            borderRadius: 3.5,
          }}
        >
          <CardContent
            sx={{
              p: 2.3,
              "&:last-child": {
                pb: 2.3,
              },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "#FFF7D2",
                  color: "#A17B00",
                }}
              >
                <PeopleAltRounded />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    color: "#999",
                    fontWeight: 800,
                  }}
                >
                  TOTAL CUSTOMERS
                </Typography>

                <Typography
                  sx={{
                    mt: 0.2,
                    fontSize: "1.35rem",
                    fontWeight: 950,
                    color: "#111",
                  }}
                >
                  {customers.length}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </MotionCard>

        <MotionCard
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
            duration: 0.35,
            delay: 0.05,
          }}
          sx={{
            borderRadius: 3.5,
          }}
        >
          <CardContent
            sx={{
              p: 2.3,
              "&:last-child": {
                pb: 2.3,
              },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "#F3F3F3",
                  color: "#555",
                }}
              >
                <ShoppingBagRounded />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    color: "#999",
                    fontWeight: 800,
                  }}
                >
                  TOTAL ORDERS
                </Typography>

                <Typography
                  sx={{
                    mt: 0.2,
                    fontSize: "1.35rem",
                    fontWeight: 950,
                    color: "#111",
                  }}
                >
                  {totalOrders}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </MotionCard>

        <MotionCard
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
            duration: 0.35,
            delay: 0.1,
          }}
          sx={{
            borderRadius: 3.5,
          }}
        >
          <CardContent
            sx={{
              p: 2.3,
              "&:last-child": {
                pb: 2.3,
              },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "#111",
                  color: "#F4C430",
                }}
              >
                ₹
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    color: "#999",
                    fontWeight: 800,
                  }}
                >
                  CUSTOMER VALUE
                </Typography>

                <Typography
                  sx={{
                    mt: 0.2,
                    fontSize: "1.25rem",
                    fontWeight: 950,
                    color: "#111",
                  }}
                >
                  {formatCurrency(totalRevenue)}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </MotionCard>
      </Box>

      <Card
        elevation={0}
        sx={{
          borderRadius: {
            xs: 3,
            md: 4,
          },
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 1.5,
              sm: 2,
              md: 2.5,
            },
            "&:last-child": {
              pb: {
                xs: 1.5,
                sm: 2,
                md: 2.5,
              },
            },
          }}
        >
          <TextField
            fullWidth
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by name, email or mobile..."
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded
                    sx={{
                      color: "#999",
                    }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 520,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
                bgcolor: "#FAFAFA",
              },
            }}
          />

          <Box
            sx={{
              mt: 2.5,
              display: {
                xs: "block",
                md: "none",
              },
            }}
          >
            {loading ? (
              <Box
                sx={{
                  py: 7,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <CircularProgress
                  size={32}
                  sx={{
                    color: "#F4C430",
                  }}
                />
              </Box>
            ) : filteredCustomers.length === 0 ? (
              <Box
                sx={{
                  py: 7,
                  textAlign: "center",
                }}
              >
                <PeopleAltRounded
                  sx={{
                    fontSize: 42,
                    color: "#CCC",
                  }}
                />

                <Typography
                  sx={{
                    mt: 1,
                    fontWeight: 900,
                    color: "#555",
                  }}
                >
                  No customers found
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    color: "#999",
                    fontSize: "0.75rem",
                  }}
                >
                  Try changing your search.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {filteredCustomers.map(
                  (customer, index) => {
                    const name =
                      getCustomerName(
                        customer
                      );
                    const email =
                      getCustomerEmail(
                        customer
                      );
                    const mobile =
                      getCustomerMobile(
                        customer
                      );
                    const orders =
                      getOrderCount(
                        customer
                      );
                    const spent =
                      getTotalSpent(
                        customer
                      );

                    return (
                      <MotionCard
                        key={
                          customer?._id ||
                          customer?.id ||
                          email ||
                          index
                        }
                        elevation={0}
                        initial={{
                          opacity: 0,
                          y: 8,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          duration: 0.25,
                          delay:
                            index * 0.03,
                        }}
                        sx={{
                          border:
                            "1px solid #EEEEEE",
                          borderRadius: 3,
                          boxShadow:
                            "none",
                        }}
                      >
                        <CardContent
                          sx={{
                            p: 1.7,
                            "&:last-child": {
                              pb: 1.7,
                            },
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1.4}
                            alignItems="flex-start"
                          >
                            <Avatar
                              sx={{
                                width: 42,
                                height: 42,
                                bgcolor:
                                  "#111",
                                color:
                                  "#F4C430",
                                fontWeight:
                                  900,
                                fontSize:
                                  "0.8rem",
                              }}
                            >
                              {getInitials(
                                name
                              )}
                            </Avatar>

                            <Box
                              sx={{
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight:
                                    900,
                                  fontSize:
                                    "0.9rem",
                                  color:
                                    "#222",
                                }}
                              >
                                {name}
                              </Typography>

                              <Stack
                                spacing={
                                  0.55
                                }
                                sx={{
                                  mt: 0.7,
                                }}
                              >
                                <Stack
                                  direction="row"
                                  spacing={
                                    0.7
                                  }
                                  alignItems="center"
                                >
                                  <EmailRounded
                                    sx={{
                                      fontSize:
                                        14,
                                      color:
                                        "#999",
                                    }}
                                  />

                                  <Typography
                                    sx={{
                                      fontSize:
                                        "0.7rem",
                                      color:
                                        "#777",
                                      wordBreak:
                                        "break-word",
                                    }}
                                  >
                                    {email}
                                  </Typography>
                                </Stack>

                                <Stack
                                  direction="row"
                                  spacing={
                                    0.7
                                  }
                                  alignItems="center"
                                >
                                  <PhoneRounded
                                    sx={{
                                      fontSize:
                                        14,
                                      color:
                                        "#999",
                                    }}
                                  />

                                  <Typography
                                    sx={{
                                      fontSize:
                                        "0.7rem",
                                      color:
                                        "#777",
                                    }}
                                  >
                                    {mobile}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Box>
                          </Stack>

                          <Divider
                            sx={{
                              my: 1.5,
                            }}
                          />

                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Box>
                              <Typography
                                sx={{
                                  fontSize:
                                    "0.62rem",
                                  color:
                                    "#999",
                                  fontWeight:
                                    800,
                                }}
                              >
                                ORDERS
                              </Typography>

                              <Typography
                                sx={{
                                  mt: 0.2,
                                  fontSize:
                                    "0.82rem",
                                  fontWeight:
                                    900,
                                }}
                              >
                                {orders}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                textAlign:
                                  "right",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize:
                                    "0.62rem",
                                  color:
                                    "#999",
                                  fontWeight:
                                    800,
                                }}
                              >
                                TOTAL SPENT
                              </Typography>

                              <Typography
                                sx={{
                                  mt: 0.2,
                                  fontSize:
                                    "0.82rem",
                                  fontWeight:
                                    900,
                                }}
                              >
                                {formatCurrency(
                                  spent
                                )}
                              </Typography>
                            </Box>
                          </Stack>

                          {customer?.createdAt && (
                            <Typography
                              sx={{
                                mt: 1.2,
                                fontSize:
                                  "0.64rem",
                                color:
                                  "#AAA",
                              }}
                            >
                              Customer since{" "}
                              {formatDate(
                                customer.createdAt
                              )}
                            </Typography>
                          )}
                        </CardContent>
                      </MotionCard>
                    );
                  }
                )}
              </Stack>
            )}
          </Box>

          <TableContainer
            sx={{
              mt: 2.5,
              display: {
                xs: "none",
                md: "block",
              },
              border:
                "1px solid #EEEEEE",
              borderRadius: 3,
              overflowX: "auto",
            }}
          >
            <Table
              sx={{
                minWidth: 760,
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: "#FAFAFA",
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: 900,
                      fontSize: "0.72rem",
                      color: "#777",
                    }}
                  >
                    CUSTOMER
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 900,
                      fontSize: "0.72rem",
                      color: "#777",
                    }}
                  >
                    CONTACT
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 900,
                      fontSize: "0.72rem",
                      color: "#777",
                    }}
                  >
                    ORDERS
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 900,
                      fontSize: "0.72rem",
                      color: "#777",
                    }}
                  >
                    TOTAL SPENT
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 900,
                      fontSize: "0.72rem",
                      color: "#777",
                    }}
                  >
                    CUSTOMER SINCE
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{
                        py: 8,
                      }}
                    >
                      <CircularProgress
                        size={32}
                        sx={{
                          color: "#F4C430",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length ===
                  0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{
                        py: 8,
                      }}
                    >
                      <PeopleAltRounded
                        sx={{
                          fontSize: 42,
                          color: "#CCC",
                        }}
                      />

                      <Typography
                        sx={{
                          mt: 1,
                          fontWeight: 900,
                          color: "#555",
                        }}
                      >
                        No customers found
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          color: "#999",
                          fontSize: "0.75rem",
                        }}
                      >
                        Try changing your search.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map(
                    (customer, index) => {
                      const name =
                        getCustomerName(
                          customer
                        );
                      const email =
                        getCustomerEmail(
                          customer
                        );
                      const mobile =
                        getCustomerMobile(
                          customer
                        );
                      const orders =
                        getOrderCount(
                          customer
                        );
                      const spent =
                        getTotalSpent(
                          customer
                        );

                      return (
                        <TableRow
                          key={
                            customer?._id ||
                            customer?.id ||
                            email ||
                            index
                          }
                          hover
                          sx={{
                            transition:
                              "background-color 180ms ease",
                            "&:last-child td": {
                              borderBottom: 0,
                            },
                          }}
                        >
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={1.4}
                              alignItems="center"
                            >
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor:
                                    "#111",
                                  color:
                                    "#F4C430",
                                  fontWeight:
                                    900,
                                  fontSize:
                                    "0.75rem",
                                }}
                              >
                                {getInitials(
                                  name
                                )}
                              </Avatar>

                              <Box
                                sx={{
                                  minWidth: 0,
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontWeight:
                                      900,
                                    fontSize:
                                      "0.82rem",
                                    color:
                                      "#222",
                                  }}
                                >
                                  {name}
                                </Typography>

                                <Typography
                                  sx={{
                                    mt: 0.2,
                                    color:
                                      "#999",
                                    fontSize:
                                      "0.65rem",
                                  }}
                                >
                                  Guest customer
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Stack
                              spacing={0.55}
                            >
                              <Stack
                                direction="row"
                                spacing={0.6}
                                alignItems="center"
                              >
                                <EmailRounded
                                  sx={{
                                    fontSize:
                                      14,
                                    color:
                                      "#999",
                                  }}
                                />

                                <Typography
                                  sx={{
                                    fontSize:
                                      "0.72rem",
                                    color:
                                      "#555",
                                    wordBreak:
                                      "break-word",
                                  }}
                                >
                                  {email}
                                </Typography>
                              </Stack>

                              <Stack
                                direction="row"
                                spacing={0.6}
                                alignItems="center"
                              >
                                <PhoneRounded
                                  sx={{
                                    fontSize:
                                      14,
                                    color:
                                      "#999",
                                  }}
                                />

                                <Typography
                                  sx={{
                                    fontSize:
                                      "0.72rem",
                                    color:
                                      "#555",
                                  }}
                                >
                                  {mobile}
                                </Typography>
                              </Stack>
                            </Stack>
                          </TableCell>

                          <TableCell align="center">
                            <Chip
                              label={orders}
                              size="small"
                              sx={{
                                minWidth: 42,
                                height: 28,
                                bgcolor:
                                  "#F3F3F3",
                                color:
                                  "#333",
                                fontWeight:
                                  900,
                              }}
                            />
                          </TableCell>

                          <TableCell align="right">
                            <Typography
                              sx={{
                                fontWeight:
                                  900,
                                fontSize:
                                  "0.8rem",
                                color:
                                  "#222",
                              }}
                            >
                              {formatCurrency(
                                spent
                              )}
                            </Typography>
                          </TableCell>

                          <TableCell align="right">
                            <Typography
                              sx={{
                                fontSize:
                                  "0.72rem",
                                color:
                                  "#777",
                              }}
                            >
                              {formatDate(
                                customer?.createdAt
                              )}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Customers;