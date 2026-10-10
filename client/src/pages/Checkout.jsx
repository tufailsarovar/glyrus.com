// Checkout.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Container,
  Divider,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowBackRounded,
  ArrowForwardRounded,
  CheckCircleRounded,
  LocalShippingRounded,
  LockRounded,
  LocationOnOutlined,
  PaymentRounded,
  PersonOutlineRounded,
  ReceiptLongRounded,
  SecurityRounded,
  ShoppingBagRounded,
  AddRounded,
  RemoveRounded,
} from "@mui/icons-material";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import formatCurrency from "../utils/formatCurrency";
import { useCart } from "../context/CartContext";
import PaymentSection from "../components/checkout/PaymentSection";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);


const steps = ["Cart", "Checkout", "Confirmation"];

const initialAddress = {
  name: "",
  email: "",
  mobile: "",
  houseFlat: "",
  street: "",
  area: "",
  city: "",
  state: "",
  pincode: "",
};

/* =========================================================
   HELPERS
========================================================= */

const getCartItems = (cart) => {
  if (Array.isArray(cart)) return cart;

  if (Array.isArray(cart?.items)) {
    return cart.items;
  }

  if (Array.isArray(cart?.cartItems)) {
    return cart.cartItems;
  }

  return [];
};

const getItemPrice = (item) =>
  Number(
    item?.finalPrice ??
      item?.salePrice ??
      item?.discountPrice ??
      item?.price ??
      0,
  );

const getItemQuantity = (item) =>
  Math.max(1, Number(item?.quantity ?? item?.qty ?? 1));

const getItemName = (item) =>
  item?.name || item?.title || item?.product?.name || "Glyrus Product";



const getImageUrl = (value) => {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (value && typeof value === "object") {
    return (
      value.url ||
      value.secure_url ||
      value.src ||
      value.imageUrl ||
      ""
    );
  }

  return "";
};

const getItemImage = (item) =>
  [
    item?.image,
    item?.imageUrl,
    item?.thumbnail,
    item?.coverUrl,
    item?.coverImage,
    item?.images?.[0],
    item?.product?.image,
    item?.product?.imageUrl,
    item?.product?.thumbnail,
    item?.product?.images?.[0],
  ]
    .map(getImageUrl)
    .find(Boolean) || "";




const getItemId = (item) =>
  item?.productId ||
  item?._id ||
  item?.id ||
  item?.product?._id ||
  item?.product?.id;

/* =========================================================
   INPUT STYLE
========================================================= */

const inputSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: {
      xs: 42,
      sm: 45,
      md: 47,
    },

    borderRadius: {
      xs: "10px",
      sm: "11px",
    },

    background: "#fff",

    fontSize: {
      xs: ".7rem",
      sm: ".75rem",
      md: ".78rem",
    },

    "& fieldset": {
      borderColor: "#E5E5E5",
    },

    "&:hover fieldset": {
      borderColor: "#D4B342",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#D0A100",
      borderWidth: "1px",
    },
  },

  "& .MuiInputLabel-root": {
    fontSize: {
      xs: ".64rem",
      sm: ".69rem",
    },

    color: "#7D7D7D",
  },

  "& .MuiInputLabel-root.Mui-focused": {
    color: "#A97800",
  },

  "& .MuiFormHelperText-root": {
    marginLeft: 1,
    marginTop: ".2rem",

    fontSize: {
      xs: ".49rem",
      sm: ".55rem",
    },
  },
};

/* =========================================================
   CHECKOUT
========================================================= */

const Checkout = () => {
  const navigate = useNavigate();
  const cartContext = useCart();

  const items = useMemo(() => getCartItems(cartContext), [cartContext]);

  const [address, setAddress] = useState(initialAddress);

  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const orderCompletedRef = useRef(false);

  const [settings, setSettings] = useState({
    shippingCharge: 79,
    codCharge: 49,
    freeShippingThreshold: 999,
    codEnabled: true,
    razorpayEnabled: true,
  });

  /* =====================================================
     PRICE CALCULATION
  ===================================================== */

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) => total + getItemPrice(item) * getItemQuantity(item),
      0,
    );
  }, [items]);

  const shippingCharge = Math.max(0, Number(settings.shippingCharge ?? 0));

  const freeShippingThreshold = Math.max(
    0,
    Number(settings.freeShippingThreshold ?? 0),
  );

  const shipping =
    freeShippingThreshold > 0 && subtotal >= freeShippingThreshold
      ? 0
      : shippingCharge;

  const codCharge =
    paymentMethod === "cod" ? Math.max(0, Number(settings.codCharge ?? 0)) : 0;

  const total = subtotal + shipping + codCharge;

  const payableNow = paymentMethod === "cod" ? codCharge : total;

  /* =====================================================
     SETTINGS
  ===================================================== */

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get("/api/settings");

        const data = response?.data?.settings || response?.data || {};

        setSettings({
          shippingCharge: Number(data.shippingCharge ?? 79),

          codCharge: Number(data.codCharge ?? 49),

          freeShippingThreshold: Number(data.freeShippingThreshold ?? 999),

          codEnabled: data.codEnabled !== false,

          razorpayEnabled: data.razorpayEnabled !== false,
        });
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    fetchSettings();
  }, []);

  /* =====================================================
     REDIRECT IF CART EMPTY
  ===================================================== */

  useEffect(() => {
    if (!items.length && !orderCompletedRef.current) {
      navigate("/cart", {
        replace: true,
      });
    }
  }, [items.length, navigate]);

  /* =====================================================
     ADDRESS
  ===================================================== */

  const handleAddressChange = (event) => {
    const { name, value } = event.target;

    setAddress((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }

    if (submitError) {
      setSubmitError("");
    }
  };

  /* =====================================================
     VALIDATION
  ===================================================== */

  const validate = () => {
    const nextErrors = {};

    if (!address.name.trim()) {
      nextErrors.name = "Name is required";
    }

    if (!address.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim())) {
      nextErrors.email = "Enter a valid email";
    }

    if (!address.mobile.trim()) {
      nextErrors.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(address.mobile.trim())) {
      nextErrors.mobile = "Enter valid 10-digit number";
    }

    if (!address.houseFlat.trim()) {
      nextErrors.houseFlat = "Required";
    }

    if (!address.street.trim()) {
      nextErrors.street = "Required";
    }

    if (!address.area.trim()) {
      nextErrors.area = "Required";
    }

    if (!address.city.trim()) {
      nextErrors.city = "Required";
    }

    if (!address.state.trim()) {
      nextErrors.state = "Required";
    }

    if (!address.pincode.trim()) {
      nextErrors.pincode = "Required";
    } else if (!/^\d{6}$/.test(address.pincode.trim())) {
      nextErrors.pincode = "Enter valid pincode";
    }

    if (!paymentMethod) {
      nextErrors.payment = "Select payment method";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  /* =====================================================
     ORDER PAYLOAD
  ===================================================== */

  const buildOrderPayload = () => ({
    customer: {
      name: address.name.trim(),
      email: address.email.trim().toLowerCase(),
      mobile: address.mobile.trim(),
    },

    guestCustomer: {
      name: address.name.trim(),
      email: address.email.trim().toLowerCase(),
      mobile: address.mobile.trim(),
    },

    address: {
      name: address.name.trim(),
      email: address.email.trim().toLowerCase(),
      mobile: address.mobile.trim(),
      houseFlat: address.houseFlat.trim(),
      street: address.street.trim(),
      area: address.area.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      pincode: address.pincode.trim(),
    },

    items: items.map((item) => ({
      product:
        item?.productId ||
        item?.product?._id ||
        item?.product?.id ||
        item?._id ||
        item?.id,

      productId:
        item?.productId ||
        item?.product?._id ||
        item?.product?.id ||
        item?._id ||
        item?.id,

      name: getItemName(item),

      quantity: getItemQuantity(item),

      customization:
        item?.customization ||
        item?.customisation ||
        item?.customizationData ||
        null,
    })),

    paymentMethod,
  });

  /* =====================================================
     COD
  ===================================================== */

  const createCodOrder = async () => {
    const response = await api.post("/api/orders", buildOrderPayload());

    return response?.data;
  };

  /* =====================================================
     RAZORPAY
  ===================================================== */

  const createRazorpayOrder = async () => {
    const orderResponse = await api.post("/api/orders", buildOrderPayload());

    const orderData = orderResponse?.data;

    const orderId =
      orderData?.order?.id || orderData?.order?._id || orderData?.id;

    if (!orderId) {
      throw new Error("Unable to create order.");
    }

    const response = await api.post("/api/payments/create-order", {
      orderId,
    });

    return response?.data;
  };

  /* =====================================================
     CLEAR CART
  ===================================================== */

  const clearCart = () => {
    const methods = ["clearCart", "emptyCart", "clear", "removeAll"];

    for (const method of methods) {
      if (typeof cartContext?.[method] === "function") {
        cartContext[method]();
        return;
      }
    }
  };

  const handleIncreaseQuantity = (item) => {
    const productId = getItemId(item);
    if (!productId) return;

    const quantity = getItemQuantity(item);

    cartContext.updateQuantity(productId, quantity + 1);
  };

  const handleDecreaseQuantity = (item) => {
  const productId = getItemId(item);
  if (!productId) return;

  const quantity = getItemQuantity(item);

  // Never allow quantity to become 0
  if (quantity <= 1) return;

  cartContext.updateQuantity(productId, quantity - 1);
};

  /* =====================================================
     COMPLETE ORDER
  ===================================================== */

  const completeOrder = (orderData, paymentConfirmed = false) => {
    orderCompletedRef.current = true;

    clearCart();

    const order = orderData?.order || orderData?.data || orderData;

    const orderNumber = order?.orderNumber || orderData?.orderNumber || "";

    const trackingNumber =
      order?.trackingNumber || orderData?.trackingNumber || "";

    navigate("/tracking", {
      state: {
        orderNumber,
        trackingNumber,
        order,
        paymentConfirmed,
        confirmationMessage: paymentConfirmed
          ? "Payment confirmed successfully. Your order has been placed."
          : "Your order has been placed successfully.",
      },
    });
  };

  /* =====================================================
     COD ORDER
  ===================================================== */

  const handleCodOrder = async () => {
    try {
      setLoading(true);
      setSubmitError("");

      const data = await createCodOrder();

      if (data?.success === false || data?.error || data?.status === "failed") {
        throw new Error(
          data?.message || data?.error || "Unable to place order.",
        );
      }

      completeOrder(data);
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to place your order.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     RAZORPAY ORDER
  ===================================================== */

  const handleRazorpayOrder = async () => {
    try {
      setLoading(true);
      setSubmitError("");

      const data = await createRazorpayOrder();

      const razorpayOrder = {
        id:
          data?.razorpayOrderId ||
          data?.order?.id ||
          data?.order?._id ||
          data?.razorpayOrder?.id ||
          data?.data?.id,

        amount:
          data?.amount || data?.order?.amount || data?.razorpayOrder?.amount,

        currency:
          data?.currency ||
          data?.order?.currency ||
          data?.razorpayOrder?.currency ||
          "INR",
      };

      const razorpayKey =
        data?.keyId || data?.key || import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        throw new Error("Razorpay key is not configured.");
      }

      if (!razorpayOrder.id) {
        throw new Error("Unable to create Razorpay order.");
      }

      if (typeof window === "undefined" || !window.Razorpay) {
        throw new Error("Razorpay checkout is unavailable.");
      }

      const options = {
        key: razorpayKey,

        amount: razorpayOrder.amount,

        currency: razorpayOrder.currency || "INR",

        name: "Glyrus",

        description: "Glyrus NFC Product Order",

        order_id: razorpayOrder.id,

        prefill: {
          name: address.name.trim(),

          email: address.email.trim().toLowerCase(),

          contact: address.mobile.trim(),
        },

        notes: {
          customerEmail: address.email.trim().toLowerCase(),

          customerMobile: address.mobile.trim(),
        },

        theme: {
          color: "#F4C430",
        },

        handler: async (paymentResponse) => {
          try {
            setLoading(true);
            setSubmitError("");

            const verifyResponse = await api.post("/api/payments/verify", {
              ...paymentResponse,

              razorpayOrderId:
                paymentResponse?.razorpay_order_id || razorpayOrder.id,

              orderId:
                data?.orderId ||
                data?.order?._id ||
                data?.order?.id ||
                data?.data?._id ||
                data?.data?.id,

              customer: {
                name: address.name.trim(),

                email: address.email.trim().toLowerCase(),

                mobile: address.mobile.trim(),
              },

              address: {
                name: address.name.trim(),

                email: address.email.trim().toLowerCase(),

                mobile: address.mobile.trim(),

                houseFlat: address.houseFlat.trim(),

                street: address.street.trim(),

                area: address.area.trim(),

                city: address.city.trim(),

                state: address.state.trim(),

                pincode: address.pincode.trim(),
              },
            });

            if (
              verifyResponse?.data?.success === false ||
              verifyResponse?.data?.status === "failed"
            ) {
              throw new Error(
                verifyResponse?.data?.message || "Payment verification failed.",
              );
            }

            completeOrder(verifyResponse?.data, true);
          } catch (error) {
            setSubmitError(
              error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Payment verification failed.",
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        setSubmitError(response?.error?.description || "Payment failed.");

        setLoading(false);
      });

      razorpay.open();
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to start payment.",
      );

      setLoading(false);
    }
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate() || !items.length) {
      return;
    }

    await handleRazorpayOrder();
  };

  if (!items.length) {
    return null;
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <Box
      sx={{
        minHeight: "100vh",

        background:
          "radial-gradient(circle at 75% 0%, rgba(244,196,48,.10), transparent 30%), linear-gradient(180deg,#FFFFFF 0%,#FAF9F5 100%)",

        py: {
          xs: 1,
          sm: 2,
          md: 3,
        },

        pb: {
          xs: 2,
          sm: 3,
          md: 4,
        },

        overflow: "hidden",
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          px: {
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
          },

          maxWidth: {
            xl: "1220px",
          },
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <MotionBox
          initial={{
            opacity: 0,
            y: -12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              mb: {
                xs: 1,
                sm: 1.6,
                md: 2,
              },
            }}
          >
            <Box>
              <Typography
                component="h1"
                sx={{
                  fontSize: {
                    xs: "1.15rem",
                    sm: "1.55rem",
                    md: "1.9rem",
                  },

                  fontWeight: 950,
                  lineHeight: 1,
                  letterSpacing: "-.055em",
                  color: "#111",
                }}
              >
                Complete Your{" "}
                <Box
                  component="span"
                  sx={{
                    color: "#D39B00",
                  }}
                >
                  Order
                </Box>
              </Typography>

              <Typography
                sx={{
                  mt: 0.45,

                  fontSize: {
                    xs: ".53rem",
                    sm: ".63rem",
                    md: ".7rem",
                  },

                  color: "#888",
                }}
              >
                Secure checkout for your Glyrus order.
              </Typography>
            </Box>

            <Chip
              icon={
                <LockRounded
                  sx={{
                    fontSize: {
                      xs: 11,
                      sm: 14,
                    },
                  }}
                />
              }
              label="Secure"
              sx={{
                height: {
                  xs: 23,
                  sm: 27,
                },

                bgcolor: "#FFF8DA",
                color: "#856500",
                border: "1px solid #EEDB8D",

                fontSize: {
                  xs: ".5rem",
                  sm: ".6rem",
                },

                fontWeight: 850,

                "& .MuiChip-icon": {
                  color: "#A87B00",
                },
              }}
            />
          </Stack>

          {/* STEPPER */}

          <Stepper
            activeStep={1}
            alternativeLabel
            sx={{
              mb: {
                xs: 1.4,
                sm: 2,
              },

              px: {
                xs: 0,
                sm: 2,
                md: 5,
              },

              "& .MuiStepConnector-line": {
                borderColor: "#E6E0CB",
              },

              "& .MuiStepIcon-root": {
                fontSize: {
                  xs: 16,
                  sm: 20,
                },

                color: "#E3E3E3",
              },

              "& .MuiStepIcon-root.Mui-active": {
                color: "#F4C430",
              },

              "& .MuiStepIcon-root.Mui-completed": {
                color: "#F4C430",
              },

              "& .MuiStepLabel-label": {
                mt: 0.2,

                fontSize: {
                  xs: ".46rem",
                  sm: ".58rem",
                },

                fontWeight: 800,
                color: "#999",
              },

              "& .MuiStepLabel-label.Mui-active": {
                color: "#222",
              },
            }}
          >
            {steps.map((step) => (
              <Step key={step}>
                <StepLabel>{step}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </MotionBox>

        {/* ERROR */}

        {submitError && (
          <MotionBox
            initial={{
              opacity: 0,
              y: -7,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            sx={{
              mb: 1,
            }}
          >
            <Alert
              severity="error"
              onClose={() => setSubmitError("")}
              sx={{
                py: 0.1,
                borderRadius: 1.7,

                fontSize: {
                  xs: ".56rem",
                  sm: ".65rem",
                },
              }}
            >
              {submitError}
            </Alert>
          </MotionBox>
        )}

        {/* =================================================
            MAIN CHECKOUT
        ================================================= */}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "grid",

            /*
             * DESKTOP:
             * Address = left
             * Payment = right
             */
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(0,1.28fr) minmax(350px,.72fr)",
              lg: "minmax(0,1.3fr) minmax(375px,.7fr)",
            },

            gap: {
              xs: 1.2,
              sm: 1.8,
              md: 2,
              lg: 2.4,
            },

            alignItems: "start",
          }}
        >
          {/* =================================================
              LEFT — DELIVERY ADDRESS
          ================================================= */}

          <MotionPaper
            initial={{
              opacity: 0,
              x: -18,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.45,
            }}
            elevation={0}
            sx={{
              p: {
                xs: 1.2,
                sm: 1.8,
                md: 2.1,
              },

              borderRadius: {
                xs: "16px",
                sm: "20px",
                md: "24px",
              },

              bgcolor: "#fff",

              border: "1px solid rgba(17,17,17,.07)",

              boxShadow: "0 14px 45px rgba(0,0,0,.045)",

              overflow: "hidden",
            }}
          >
            {/* HEADER */}

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.9}
              sx={{
                mb: {
                  xs: 1.1,
                  sm: 1.4,
                },
              }}
            >
              <Box
                sx={{
                  width: {
                    xs: 34,
                    sm: 40,
                  },

                  height: {
                    xs: 34,
                    sm: 40,
                  },

                  display: "grid",
                  placeItems: "center",

                  flexShrink: 0,

                  borderRadius: {
                    xs: "10px",
                    sm: "12px",
                  },

                  background: "linear-gradient(135deg,#FFF0A8,#FFD75C)",

                  color: "#9D7300",
                }}
              >
                <LocalShippingRounded
                  sx={{
                    fontSize: {
                      xs: 18,
                      sm: 21,
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: {
                      xs: ".85rem",
                      sm: ".98rem",
                      md: "1.05rem",
                    },

                    fontWeight: 950,
                    color: "#111",
                    letterSpacing: "-.025em",
                  }}
                >
                  Delivery Address
                </Typography>

                <Typography
                  sx={{
                    mt: 0.15,

                    fontSize: {
                      xs: ".5rem",
                      sm: ".59rem",
                    },

                    color: "#8A8A8A",
                  }}
                >
                  Enter your details for delivery
                </Typography>
              </Box>
            </Stack>

            <Divider />

            {/* CONTACT */}

            <Box
              sx={{
                mt: {
                  xs: 1.1,
                  sm: 1.5,
                },
              }}
            >
              <SectionTitle
                icon={<PersonOutlineRounded />}
                title="Contact Information"
              />

              <Box
                sx={{
                  display: "grid",

                  /*
                   * 3 columns on desktop keeps
                   * the card compact and balanced.
                   */
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2,minmax(0,1fr))",
                    md: "repeat(3,minmax(0,1fr))",
                  },

                  gap: {
                    xs: 0.8,
                    sm: 0.9,
                    md: 1,
                  },

                  mt: 0.8,
                }}
              >
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={address.name}
                  onChange={handleAddressChange}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                  autoComplete="name"
                  sx={inputSx}
                />

                <TextField
                  fullWidth
                  label="Mobile Number"
                  name="mobile"
                  value={address.mobile}
                  onChange={handleAddressChange}
                  error={Boolean(errors.mobile)}
                  helperText={errors.mobile}
                  inputProps={{
                    maxLength: 10,
                    inputMode: "numeric",
                  }}
                  autoComplete="tel"
                  sx={inputSx}
                />

                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={address.email}
                  onChange={handleAddressChange}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  autoComplete="email"
                  sx={inputSx}
                />
              </Box>
            </Box>

            {/* ADDRESS */}

            <Box
              sx={{
                mt: {
                  xs: 1.4,
                  sm: 1.7,
                },
              }}
            >
              <SectionTitle
                icon={<LocationOnOutlined />}
                title="Delivery Details"
              />

              <Box
                sx={{
                  display: "grid",

                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2,minmax(0,1fr))",
                    md: "repeat(3,minmax(0,1fr))",
                  },

                  gap: {
                    xs: 0.8,
                    sm: 0.9,
                    md: 1,
                  },

                  mt: 0.8,
                }}
              >
                <TextField
                  fullWidth
                  label="House / Flat / Building"
                  name="houseFlat"
                  value={address.houseFlat}
                  onChange={handleAddressChange}
                  error={Boolean(errors.houseFlat)}
                  helperText={errors.houseFlat}
                  autoComplete="address-line1"
                  sx={inputSx}
                />

                <TextField
                  fullWidth
                  label="Street / Road"
                  name="street"
                  value={address.street}
                  onChange={handleAddressChange}
                  error={Boolean(errors.street)}
                  helperText={errors.street}
                  autoComplete="address-line2"
                  sx={inputSx}
                />

                <TextField
                  fullWidth
                  label="Area / Locality"
                  name="area"
                  value={address.area}
                  onChange={handleAddressChange}
                  error={Boolean(errors.area)}
                  helperText={errors.area}
                  autoComplete="address-level3"
                  sx={inputSx}
                />

                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  error={Boolean(errors.city)}
                  helperText={errors.city}
                  autoComplete="address-level2"
                  sx={inputSx}
                />

                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={address.state}
                  onChange={handleAddressChange}
                  error={Boolean(errors.state)}
                  helperText={errors.state}
                  autoComplete="address-level1"
                  sx={inputSx}
                />

                <TextField
                  fullWidth
                  label="Pincode"
                  name="pincode"
                  value={address.pincode}
                  onChange={handleAddressChange}
                  error={Boolean(errors.pincode)}
                  helperText={errors.pincode}
                  inputProps={{
                    maxLength: 6,
                    inputMode: "numeric",
                  }}
                  autoComplete="postal-code"
                  sx={inputSx}
                />
              </Box>
            </Box>

            {/* BENEFITS */}

            <Box
              sx={{
                mt: {
                  xs: 1.2,
                  sm: 1.5,
                },

                display: "grid",

                gridTemplateColumns: {
                  xs: "repeat(3,minmax(0,1fr))",
                  sm: "repeat(3,1fr)",
                },

                gap: 0.7,
              }}
            >
              <Benefit icon={<LocalShippingRounded />} title="Safe Delivery" />

              <Benefit icon={<LockRounded />} title="Secure Data" />

              <Benefit icon={<CheckCircleRounded />} title="Order Tracking" />
            </Box>

            {/* PRIVACY */}

            <Box
              sx={{
                mt: 0.8,

                px: {
                  xs: 0.75,
                  sm: 1,
                },

                py: {
                  xs: 0.6,
                  sm: 0.75,
                },

                borderRadius: 1.7,

                bgcolor: "#FFFCF0",

                border: "1px solid #F0E3AF",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <LockRounded
                  sx={{
                    fontSize: {
                      xs: 12,
                      sm: 14,
                    },

                    color: "#B18400",
                  }}
                />

                <Typography
                  sx={{
                    fontSize: {
                      xs: ".47rem",
                      sm: ".55rem",
                    },

                    color: "#79682E",
                    lineHeight: 1.4,
                  }}
                >
                  Your information is securely used only for order processing
                  and delivery.
                </Typography>
              </Stack>
            </Box>
          </MotionPaper>

          {/* =================================================
              RIGHT — PAYMENT + SUMMARY
          ================================================= */}

          <MotionBox
            initial={{
              opacity: 0,
              x: 18,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.45,
              delay: 0.06,
            }}
            sx={{
              position: {
                xs: "static",
                md: "sticky",
              },

              top: {
                md: 72,
              },

              minWidth: 0,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                overflow: "hidden",

                borderRadius: {
                  xs: "16px",
                  sm: "20px",
                  md: "24px",
                },

                border: "1px solid rgba(17,17,17,.07)",

                bgcolor: "#fff",

                boxShadow: "0 18px 50px rgba(0,0,0,.06)",
              }}
            >
              {/* PAYMENT HEADER */}

              <Box
                sx={{
                  px: {
                    xs: 1.2,
                    sm: 1.5,
                    md: 1.7,
                  },

                  py: {
                    xs: 1,
                    sm: 1.2,
                  },

                  background: "linear-gradient(135deg,#FFFDF2,#FFF6D3)",

                  borderBottom: "1px solid #F0E3B6",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack direction="row" alignItems="center" spacing={0.7}>
                    <Box
                      sx={{
                        width: {
                          xs: 32,
                          sm: 36,
                        },

                        height: {
                          xs: 32,
                          sm: 36,
                        },

                        display: "grid",
                        placeItems: "center",

                        borderRadius: "10px",

                        bgcolor: "#F4C430",
                        color: "#111",
                      }}
                    >
                      <PaymentRounded
                        sx={{
                          fontSize: {
                            xs: 17,
                            sm: 20,
                          },
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontSize: {
                            xs: ".78rem",
                            sm: ".9rem",
                          },

                          fontWeight: 950,
                          color: "#111",
                        }}
                      >
                        Payment
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: {
                            xs: ".48rem",
                            sm: ".55rem",
                          },

                          color: "#887638",
                        }}
                      >
                        Choose your payment method
                      </Typography>
                    </Box>
                  </Stack>

                  <Chip
                    icon={
                      <CheckCircleRounded
                        sx={{
                          fontSize: 12,
                        }}
                      />
                    }
                    label="Secure"
                    size="small"
                    sx={{
                      height: 22,

                      bgcolor: "#fff",

                      color: "#39734B",

                      border: "1px solid #D9E8DC",

                      fontSize: ".5rem",

                      fontWeight: 800,

                      "& .MuiChip-icon": {
                        color: "#39734B",
                      },
                    }}
                  />
                </Stack>
              </Box>

              {/* PAYMENT METHOD */}

              <Box
                sx={{
                  p: {
                    xs: 0.9,
                    sm: 1.2,
                  },

                  /*
                   * Removes the heavy nested-card feeling
                   * from the payment section.
                   */
                  "& > div": {
                    boxShadow: "none !important",
                    border: "0 !important",
                    background: "transparent !important",
                    borderRadius: "0 !important",
                    padding: "0 !important",
                  },
                }}
              >
                <PaymentSection
                  value={paymentMethod}
                  paymentMethod={paymentMethod}
                  selectedMethod={paymentMethod}
                  onChange={(value) => {
                    setPaymentMethod(value);

                    if (errors.payment) {
                      setErrors((previous) => ({
                        ...previous,
                        payment: "",
                      }));
                    }
                  }}
                  onPaymentMethodChange={(value) => {
                    setPaymentMethod(value);

                    if (errors.payment) {
                      setErrors((previous) => ({
                        ...previous,
                        payment: "",
                      }));
                    }
                  }}
                  error={errors.payment}
                  disabled={loading}
                />
              </Box>

              <Divider />

              {/* =================================================
                  ORDER SUMMARY
              ================================================= */}

              <Box
                sx={{
                  p: {
                    xs: 1.15,
                    sm: 1.4,
                    md: 1.55,
                  },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.6}
                  sx={{
                    mb: {
                      xs: 0.8,
                      sm: 1,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: {
                        xs: 27,
                        sm: 30,
                      },

                      height: {
                        xs: 27,
                        sm: 30,
                      },

                      display: "grid",
                      placeItems: "center",

                      borderRadius: "8px",

                      bgcolor: "#FFF5CA",
                      color: "#AD8000",
                    }}
                  >
                    <ReceiptLongRounded
                      sx={{
                        fontSize: {
                          xs: 15,
                          sm: 17,
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize: {
                          xs: ".72rem",
                          sm: ".82rem",
                        },

                        fontWeight: 950,
                        color: "#111",
                      }}
                    >
                      Order Summary
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: {
                          xs: ".46rem",
                          sm: ".53rem",
                        },

                        color: "#999",
                      }}
                    >
                      {items.length} {items.length === 1 ? "item" : "items"} in
                      your order
                    </Typography>
                  </Box>
                </Stack>

                {/* PRODUCTS */}

                <Stack
                  spacing={{
                    xs: 0.45,
                    sm: 0.6,
                  }}
                >
                  {items.map((item, index) => {
                    const quantity = getItemQuantity(item);

                    const price = getItemPrice(item);

                    const image = getItemImage(item);

                    return (
                      <MotionBox
                        key={
                          item?._id ||
                          item?.id ||
                          item?.productId ||
                          `${getItemName(item)}-${index}`
                        }
                        initial={{
                          opacity: 0,
                          y: 5,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          duration: 0.25,
                          delay: index * 0.035,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",

                            gap: 0.65,

                            p: {
                              xs: 0.5,
                              sm: 0.65,
                            },

                            borderRadius: 1.6,

                            bgcolor: "#FAFAFA",

                            border: "1px solid #F0F0F0",
                          }}
                        >
                          <Box
                            sx={{
                              width: {
                                xs: 38,
                                sm: 43,
                              },

                              height: {
                                xs: 38,
                                sm: 43,
                              },

                              flexShrink: 0,

                              borderRadius: "8px",

                              overflow: "hidden",

                              bgcolor: "#fff",

                              border: "1px solid #E7E7E7",

                              display: "grid",
                              placeItems: "center",
                            }}
                          >
                            {image ? (
                              <Box
                                component="img"
                                src={image}
                                alt={getItemName(item)}
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <ShoppingBagRounded
                                sx={{
                                  fontSize: 18,
                                  color: "#C7C7C7",
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
                                  xs: ".56rem",
                                  sm: ".65rem",
                                },

                                fontWeight: 900,
                                color: "#222",

                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {getItemName(item)}
                            </Typography>

                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={0.35}
                              sx={{ mt: 0.35 }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleDecreaseQuantity(item)}
                                disabled={loading}
                                sx={{
                                  width: { xs: 20, sm: 23 },
                                  height: { xs: 20, sm: 23 },
                                  border: "1px solid #E2E2E2",
                                  bgcolor: "#fff",
                                  color: "#555",
                                  p: 0,
                                  "&:hover": {
                                    bgcolor: "#FFF8DA",
                                    borderColor: "#E0B600",
                                  },
                                }}
                              >
                                <RemoveRounded
                                  sx={{
                                    fontSize: {
                                      xs: 11,
                                      sm: 13,
                                    },
                                  }}
                                />
                              </IconButton>

                              <Typography
                                sx={{
                                  minWidth: { xs: 20, sm: 24 },
                                  textAlign: "center",
                                  fontSize: {
                                    xs: ".55rem",
                                    sm: ".63rem",
                                  },
                                  fontWeight: 900,
                                  color: "#111",
                                }}
                              >
                                {quantity}
                              </Typography>

                              <IconButton
                                size="small"
                                onClick={() => handleIncreaseQuantity(item)}
                                disabled={loading}
                                sx={{
                                  width: { xs: 20, sm: 23 },
                                  height: { xs: 20, sm: 23 },
                                  border: "1px solid #E2E2E2",
                                  bgcolor: "#fff",
                                  color: "#555",
                                  p: 0,
                                  "&:hover": {
                                    bgcolor: "#FFF8DA",
                                    borderColor: "#E0B600",
                                  },
                                }}
                              >
                                <AddRounded
                                  sx={{
                                    fontSize: {
                                      xs: 11,
                                      sm: 13,
                                    },
                                  }}
                                />
                              </IconButton>
                            </Stack>
                          </Box>

                          <Typography
                            sx={{
                              fontSize: {
                                xs: ".59rem",
                                sm: ".68rem",
                              },

                              fontWeight: 950,
                              color: "#111",
                              whiteSpace: "nowrap",
                            }}
                          >
                            ₹{(price * quantity).toLocaleString("en-IN")}
                          </Typography>
                        </Box>
                      </MotionBox>
                    );
                  })}
                </Stack>

                <Divider
                  sx={{
                    my: {
                      xs: 0.85,
                      sm: 1.1,
                    },
                  }}
                />

                {/* PRICE */}

                <Stack
                  spacing={{
                    xs: 0.45,
                    sm: 0.6,
                  }}
                >
                  <PriceRow
                    label="Subtotal"
                    value={`₹${subtotal.toLocaleString("en-IN")}`}
                  />

                  <PriceRow
                    label="Shipping"
                    value={shipping === 0 ? "FREE" : formatCurrency(shipping)}
                    valueColor={shipping === 0 ? "#2e7d32" : undefined}
                  />

                  {freeShippingThreshold > 0 && (
                    <Typography
                      sx={{
                        color: shipping === 0 ? "#2e7d32" : "#a87500",
                        fontSize: {
                          xs: ".56rem",
                          sm: ".7rem",
                        },
                        fontWeight: 700,
                        mt: -0.4,
                      }}
                    >
                      {shipping === 0
                        ? "✓ Free shipping applied"
                        : `Add ${formatCurrency(
                            Math.max(0, freeShippingThreshold - subtotal),
                          )} more to get FREE shipping`}
                    </Typography>
                  )}

                  {paymentMethod === "cod" && codCharge > 0 && (
                    <PriceRow
                      label="COD charge"
                      value={`₹${codCharge.toLocaleString("en-IN")}`}
                      valueColor="#A17B00"
                    />
                  )}
                </Stack>

                <Divider
                  sx={{
                    my: {
                      xs: 0.85,
                      sm: 1.1,
                    },
                  }}
                />

                {/* TOTAL */}

                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: {
                          xs: ".72rem",
                          sm: ".82rem",
                        },

                        fontWeight: 950,
                        color: "#111",
                      }}
                    >
                      Total
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: {
                          xs: ".45rem",
                          sm: ".52rem",
                        },

                        color: "#999",
                      }}
                    >
                      Final order value
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      fontSize: {
                        xs: "1.25rem",
                        sm: "1.4rem",
                      },

                      fontWeight: 950,

                      letterSpacing: "-.045em",

                      color: "#111",
                    }}
                  >
                    ₹{total.toLocaleString("en-IN")}
                  </Typography>
                </Stack>

                {/* PAYMENT STATUS */}

                <MotionBox
                  key={paymentMethod}
                  initial={{
                    opacity: 0,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                  sx={{
                    mt: {
                      xs: 0.8,
                      sm: 1,
                    },
                  }}
                >
                  <Box
                    sx={{
                      p: {
                        xs: 0.7,
                        sm: 0.85,
                      },

                      borderRadius: 1.6,

                      bgcolor: paymentMethod === "cod" ? "#FFF9E7" : "#F7F8F9",

                      border:
                        paymentMethod === "cod"
                          ? "1px solid #F0DD91"
                          : "1px solid #E6E6E6",
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.55}>
                      <Box
                        sx={{
                          width: {
                            xs: 25,
                            sm: 29,
                          },

                          height: {
                            xs: 25,
                            sm: 29,
                          },

                          display: "grid",
                          placeItems: "center",

                          flexShrink: 0,

                          borderRadius: "7px",

                          bgcolor:
                            paymentMethod === "cod" ? "#F4C430" : "#EAEAEA",
                        }}
                      >
                        {paymentMethod === "cod" ? (
                          <LocalShippingRounded
                            sx={{
                              fontSize: 14,
                            }}
                          />
                        ) : (
                          <PaymentRounded
                            sx={{
                              fontSize: 14,
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
                              xs: ".53rem",
                              sm: ".62rem",
                            },

                            fontWeight: 900,
                            color: "#222",
                          }}
                        >
                          {paymentMethod === "cod"
                            ? "Cash on Delivery"
                            : "Online Payment"}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: {
                              xs: ".44rem",
                              sm: ".51rem",
                            },

                            color: "#888",
                            mt: 0.1,
                          }}
                        >
                          {paymentMethod === "cod"
                            ? `₹${payableNow.toLocaleString(
                                "en-IN",
                              )} payable now`
                            : `₹${payableNow.toLocaleString(
                                "en-IN",
                              )} paid securely online`}
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          fontSize: {
                            xs: ".6rem",
                            sm: ".68rem",
                          },

                          fontWeight: 950,
                          color: "#111",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ₹{payableNow.toLocaleString("en-IN")}
                      </Typography>
                    </Stack>
                  </Box>
                </MotionBox>

                {/* CHECKOUT BUTTON */}

                <Button
                  type="submit"
                  fullWidth
                  disabled={loading}
                  variant="contained"
                  endIcon={
                    !loading && (
                      <ArrowForwardRounded
                        sx={{
                          fontSize: {
                            xs: 15,
                            sm: 17,
                          },
                        }}
                      />
                    )
                  }
                  sx={{
                    mt: {
                      xs: 0.95,
                      sm: 1.15,
                    },

                    minHeight: {
                      xs: 43,
                      sm: 47,
                    },

                    borderRadius: {
                      xs: "12px",
                      sm: "14px",
                    },

                    bgcolor: "#111",

                    color: "#fff",

                    fontWeight: 950,

                    fontSize: {
                      xs: ".62rem",
                      sm: ".72rem",
                    },

                    textTransform: "none",

                    boxShadow: "0 9px 25px rgba(0,0,0,.14)",

                    transition: "all .2s ease",

                    "& .MuiButton-endIcon": {
                      color: "#fff",
                    },

                    "&:hover": {
                      bgcolor: "#252525",

                      color: "#fff",

                      transform: "translateY(-2px)",

                      boxShadow: "0 13px 30px rgba(0,0,0,.18)",
                    },

                    "&:active": {
                      transform: "scale(.98)",
                    },

                    "&:disabled": {
                      bgcolor: "#E9E9E9",
                      color: "#999",
                      boxShadow: "none",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress
                      size={17}
                      sx={{
                        color: "#777",
                      }}
                    />
                  ) : paymentMethod === "cod" ? (
                    `Pay ₹${payableNow.toLocaleString("en-IN")} COD Charge`
                  ) : (
                    `Pay ₹${payableNow.toLocaleString("en-IN")} Online`
                  )}
                </Button>

                {/* BACK */}

                <Button
                  type="button"
                  fullWidth
                  disabled={loading}
                  startIcon={
                    <ArrowBackRounded
                      sx={{
                        fontSize: {
                          xs: 12,
                          sm: 14,
                        },
                      }}
                    />
                  }
                  onClick={() => navigate("/cart")}
                  sx={{
                    mt: 0.05,

                    minHeight: {
                      xs: 29,
                      sm: 32,
                    },

                    color: "#777",

                    fontSize: {
                      xs: ".52rem",
                      sm: ".6rem",
                    },

                    fontWeight: 800,

                    textTransform: "none",

                    "&:hover": {
                      bgcolor: "#FAFAFA",
                      color: "#111",
                    },
                  }}
                >
                  Back to Cart
                </Button>

                {/* SECURITY */}

                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  spacing={0.35}
                  sx={{
                    mt: 0.2,
                  }}
                >
                  <SecurityRounded
                    sx={{
                      fontSize: {
                        xs: 10,
                        sm: 12,
                      },

                      color: "#A2A2A2",
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: {
                        xs: ".43rem",
                        sm: ".51rem",
                      },

                      color: "#999",
                      textAlign: "center",
                    }}
                  >
                    Secure checkout • Protected payment
                  </Typography>
                </Stack>
              </Box>
            </Paper>
          </MotionBox>
        </Box>
      </Container>
    </Box>
  );
};

/* =========================================================
   SECTION TITLE
========================================================= */

const SectionTitle = ({ icon, title }) => (
  <Stack direction="row" alignItems="center" spacing={0.45}>
    {React.cloneElement(icon, {
      sx: {
        fontSize: {
          xs: 14,
          sm: 16,
        },

        color: "#B18300",
      },
    })}

    <Typography
      sx={{
        fontSize: {
          xs: ".59rem",
          sm: ".67rem",
        },

        fontWeight: 900,
        color: "#333",
      }}
    >
      {title}
    </Typography>
  </Stack>
);

/* =========================================================
   BENEFIT
========================================================= */

const Benefit = ({ icon, title }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",

      justifyContent: {
        xs: "center",
        sm: "flex-start",
      },

      gap: 0.4,

      p: {
        xs: 0.6,
        sm: 0.75,
      },

      borderRadius: 1.5,

      bgcolor: "#FAFAFA",

      border: "1px solid #EEEEEE",

      minWidth: 0,
    }}
  >
    {React.cloneElement(icon, {
      sx: {
        fontSize: {
          xs: 13,
          sm: 15,
        },

        color: "#B08400",
        flexShrink: 0,
      },
    })}

    <Typography
      sx={{
        fontSize: {
          xs: ".43rem",
          sm: ".54rem",
        },

        fontWeight: 800,

        color: "#666",

        whiteSpace: {
          xs: "normal",
          sm: "nowrap",
        },

        textAlign: {
          xs: "center",
          sm: "left",
        },
      }}
    >
      {title}
    </Typography>
  </Box>
);

/* =========================================================
   PRICE ROW
========================================================= */

const PriceRow = ({ label, value, valueColor = "#222" }) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between">
    <Typography
      sx={{
        fontSize: {
          xs: ".55rem",
          sm: ".64rem",
        },

        color: "#777",
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        fontSize: {
          xs: ".58rem",
          sm: ".67rem",
        },

        fontWeight: 850,

        color: valueColor,
      }}
    >
      {value}
    </Typography>
  </Stack>
);

export default Checkout;
