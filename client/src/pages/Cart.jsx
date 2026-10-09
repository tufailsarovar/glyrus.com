// Glyrus — Cart.jsx

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  DeleteOutline,
  LocalShippingOutlined,
  LockOutlined,
  ShoppingBagOutlined,
  ShoppingCartOutlined,
  BoltOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import CartItem from "../components/cart/CartItem";
import { useCart } from "../hooks/useCart";
import api from "../services/api";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const Cart = () => {
  const navigate = useNavigate();
  const cart = useCart();

  const [settings, setSettings] = useState({
    shippingCharge: 0,
    freeShippingThreshold: 0,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get("/api/settings");

        const data = response?.data?.settings || response?.data || {};

        setSettings({
          shippingCharge: Math.max(0, Number(data.shippingCharge ?? 0)),
          freeShippingThreshold: Math.max(
            0,
            Number(data.freeShippingThreshold ?? 0),
          ),
        });
      } catch (error) {
        console.error("Failed to load store settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const items = Array.isArray(cart?.items)
    ? cart.items
    : Array.isArray(cart?.cart)
      ? cart.cart
      : Array.isArray(cart?.cartItems)
        ? cart.cartItems
        : [];

  const removeItem =
    cart?.removeFromCart || cart?.removeItem || cart?.deleteFromCart;

  const updateQuantity = cart?.updateQuantity || cart?.updateCartQuantity;

  const clearCart = cart?.clearCart || cart?.clearCartItems;

  const subtotal = useMemo(() => {
    if (typeof cart?.subtotal === "number") {
      return cart.subtotal;
    }

    return items.reduce(
      (total, item) => total + getItemPrice(item) * getItemQuantity(item),
      0,
    );
  }, [cart?.subtotal, items]);

  const shipping = useMemo(() => {
    if (subtotal <= 0) return 0;

    const shippingCharge = Math.max(0, Number(settings.shippingCharge ?? 0));

    const freeShippingThreshold = Math.max(
      0,
      Number(settings.freeShippingThreshold ?? 0),
    );

    if (freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) {
      return 0;
    }

    return shippingCharge;
  }, [subtotal, settings.shippingCharge, settings.freeShippingThreshold]);

  const total = useMemo(() => {
    if (typeof cart?.total === "number") {
      return cart.total;
    }

    return subtotal + shipping;
  }, [cart?.total, subtotal, shipping]);

  const itemCount = useMemo(() => {
    return items.reduce((total, item) => total + getItemQuantity(item), 0);
  }, [items]);

  const handleRemove = (item) => {
    if (!removeItem) return;

    const id = getItemId(item);

    try {
      removeItem(id);
    } catch {
      try {
        removeItem(item);
      } catch {
        // Keep UI stable.
      }
    }
  };

  const handleQuantityChange = (item, quantity) => {
    if (!updateQuantity) return;

    const id = getItemId(item);

    try {
      updateQuantity(id, quantity);
    } catch {
      try {
        updateQuantity(item, quantity);
      } catch {
        // Keep UI stable.
      }
    }
  };

  const handleClearCart = () => {
    if (!clearCart) return;
    clearCart();
  };

  /* =====================================================
     EMPTY CART
  ===================================================== */

  if (items.length === 0) {
    return (
      <Box
        sx={{
          height: "auto",
          minHeight: "auto",
          background: "linear-gradient(180deg,#fff 0%,#fffdf7 55%,#fff 100%)",
          pb: { xs: 1.5, sm: 4, md: 6 },
          overflow: "hidden",
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            pt: { xs: 2.5, sm: 6, md: 8 },
            px: { xs: 1.2, sm: 3 },
          }}
        >
          <MotionPaper
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{ duration: 0.45 }}
            elevation={0}
            sx={{
              p: {
                xs: 2.2,
                sm: 5,
                md: 6,
              },
              borderRadius: {
                xs: 2.8,
                md: 4,
              },
              textAlign: "center",
              background: "#fff",
              border: "1px solid rgba(0,0,0,.06)",
              boxShadow: "0 15px 45px rgba(0,0,0,.055)",
            }}
          >
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Box
                sx={{
                  width: {
                    xs: 58,
                    sm: 86,
                  },
                  height: {
                    xs: 58,
                    sm: 86,
                  },
                  mx: "auto",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(145deg,#fff8d9,#ffefad)",
                  color: "#b98100",
                }}
              >
                <ShoppingCartOutlined
                  sx={{
                    fontSize: {
                      xs: 28,
                      sm: 43,
                    },
                  }}
                />
              </Box>
            </motion.div>

            <Typography
              component="h1"
              sx={{
                mt: {
                  xs: 1.5,
                  sm: 2.8,
                },
                fontSize: {
                  xs: "1.25rem",
                  sm: "2rem",
                },
                fontWeight: 950,
                letterSpacing: "-.045em",
                color: "#111",
              }}
            >
              Your Cart Is Empty
            </Typography>

            <Typography
              sx={{
                mt: 0.6,
                maxWidth: 430,
                mx: "auto",
                color: "#777",
                fontSize: {
                  xs: ".68rem",
                  sm: ".92rem",
                },
                lineHeight: 1.55,
              }}
            >
              You haven't added any Glyrus products yet. Explore our collection
              and find something for your business.
            </Typography>

            <Button
              component={Link}
              to="/products"
              variant="contained"
              startIcon={
                <ShoppingBagOutlined
                  sx={{
                    fontSize: {
                      xs: 16,
                      sm: 20,
                    },
                  }}
                />
              }
              sx={{
                mt: {
                  xs: 1.7,
                  sm: 3,
                },
                minHeight: {
                  xs: 38,
                  sm: 48,
                },
                px: {
                  xs: 2,
                  sm: 3.5,
                },
                borderRadius: 2.2,
                textTransform: "none",
                fontWeight: 900,
                fontSize: {
                  xs: ".68rem",
                  sm: ".86rem",
                },
                color: "#fff",
                background: "#111",
                boxShadow: "none",
                "&:hover": {
                  background: "#292929",
                },
              }}
            >
              Explore Products
            </Button>
          </MotionPaper>
        </Container>
      </Box>
    );
  }

  /* =====================================================
     MAIN CART
  ===================================================== */

  return (
    <Box
      sx={{
        /*
         * IMPORTANT:
         * No 100vh / min-height here.
         * The Cart should only occupy the height
         * required by its actual content.
         */
        height: "auto",
        minHeight: "0",
        background:
          "radial-gradient(circle at 90% 0%,rgba(255,193,7,.08),transparent 28%),linear-gradient(180deg,#fff 0%,#fffdf7 52%,#fff 100%)",
        pb: {
          xs: 0.8,
          sm: 3,
          md: 5,
        },
        overflow: "hidden",
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          pt: {
            xs: 1.3,
            sm: 4,
            md: 5,
          },
          pb: 0,
          px: {
            xs: 0.8,
            sm: 3,
            md: 4,
          },
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <MotionBox
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
          }}
          sx={{
            mb: {
              xs: 0.8,
              sm: 3.5,
            },
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
          >
            <Box>
              <Typography
                component="h1"
                sx={{
                  fontSize: {
                    xs: "1.3rem",
                    sm: "2.2rem",
                    md: "2.7rem",
                  },
                  lineHeight: 1.05,
                  fontWeight: 950,
                  letterSpacing: "-.055em",
                  color: "#111",
                }}
              >
                Your{" "}
                <Box
                  component="span"
                  sx={{
                    color: "#d49b00",
                  }}
                >
                  Cart
                </Box>
              </Typography>

              <Typography
                sx={{
                  mt: {
                    xs: 0.25,
                    sm: 0.6,
                  },
                  color: "#777",
                  fontSize: {
                    xs: ".61rem",
                    sm: ".9rem",
                  },
                }}
              >
                Review your selected products before checkout.
              </Typography>
            </Box>

            <Chip
              icon={
                <ShoppingCartOutlined
                  sx={{
                    fontSize: {
                      xs: 13,
                      sm: 18,
                    },
                  }}
                />
              }
              label={`${itemCount} ${itemCount === 1 ? "item" : "items"}`}
              sx={{
                height: {
                  xs: 25,
                  sm: 34,
                },
                borderRadius: 2,
                background: "linear-gradient(135deg,#fff8d8,#fff2b8)",
                color: "#805c00",
                fontWeight: 850,
                fontSize: {
                  xs: ".58rem",
                  sm: ".76rem",
                },
                "& .MuiChip-icon": {
                  color: "#b98100",
                },
                "& .MuiChip-label": {
                  px: {
                    xs: 0.7,
                    sm: 1.1,
                  },
                },
              }}
            />
          </Stack>
        </MotionBox>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0,1fr) 370px",
            },

            gap: {
              xs: 0.8,
              sm: 3,
              md: 4,
            },

            alignItems: "start",
          }}
        >
          {/* =================================================
              CART ITEMS
          ================================================= */}

          <MotionBox
            initial={{
              opacity: 0,
              x: -15,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.45,
              delay: 0.04,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: {
                  xs: 0.75,
                  sm: 2,
                  md: 2.5,
                },

                borderRadius: {
                  xs: 2.2,
                  md: 4,
                },

                background: "#fff",
                border: "1px solid rgba(0,0,0,.06)",
                boxShadow: "0 10px 32px rgba(0,0,0,.04)",
              }}
            >
              {/* Items heading */}

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  px: {
                    xs: 0.25,
                    sm: 0.5,
                  },
                  pb: {
                    xs: 0.7,
                    sm: 1.7,
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={0.6}>
                  <Box
                    sx={{
                      width: {
                        xs: 25,
                        sm: 32,
                      },
                      height: {
                        xs: 25,
                        sm: 32,
                      },
                      borderRadius: 1.4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#fff7d3",
                      color: "#b98000",
                    }}
                  >
                    <ShoppingBagOutlined
                      sx={{
                        fontSize: {
                          xs: 13,
                          sm: 18,
                        },
                      }}
                    />
                  </Box>

                  <Typography
                    sx={{
                      fontSize: {
                        xs: ".76rem",
                        sm: "1.1rem",
                      },
                      fontWeight: 900,
                      color: "#111",
                    }}
                  >
                    Cart Items
                  </Typography>
                </Stack>

                {clearCart && (
                  <Button
                    onClick={handleClearCart}
                    startIcon={
                      <DeleteOutline
                        sx={{
                          fontSize: {
                            xs: 14,
                            sm: 18,
                          },
                        }}
                      />
                    }
                    sx={{
                      minWidth: "auto",
                      px: {
                        xs: 0.4,
                        sm: 1,
                      },
                      minHeight: {
                        xs: 27,
                        sm: 34,
                      },
                      color: "#b3261e",
                      textTransform: "none",
                      fontSize: {
                        xs: ".58rem",
                        sm: ".75rem",
                      },
                      fontWeight: 800,
                    }}
                  >
                    Clear
                  </Button>
                )}
              </Stack>

              <Divider />

              {/* Cart products */}

              <Stack
                spacing={{
                  xs: 0.55,
                  sm: 1.2,
                }}
                sx={{
                  pt: {
                    xs: 0.7,
                    sm: 1.5,
                  },

                  /* Keep CartItem compact on mobile */
                  "& > *": {
                    minWidth: 0,
                  },

                  "@media (max-width:599px)": {
                    "& .MuiCard-root": {
                      borderRadius: "10px !important",
                      boxShadow: "none !important",
                    },

                    "& .MuiCardContent-root": {
                      padding: "7px !important",
                    },

                    "& img": {
                      maxHeight: "78px",
                    },

                    "& .MuiTypography-root": {
                      lineHeight: 1.2,
                    },

                    "& .MuiIconButton-root": {
                      padding: "4px",
                    },

                    "& .MuiButton-root": {
                      minHeight: "27px",
                      minWidth: "27px",
                    },
                  },
                }}
              >
                {items.map((item, index) => (
                  <MotionBox
                    key={`${getItemId(item)}-${index}`}
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.28,
                      delay: index * 0.035,
                    }}
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <CartItem
                      item={item}
                      product={item?.product}
                      quantity={getItemQuantity(item)}
                      onRemove={() => handleRemove(item)}
                      onQuantityChange={(quantity) =>
                        handleQuantityChange(item, quantity)
                      }
                      onUpdateQuantity={(quantity) =>
                        handleQuantityChange(item, quantity)
                      }
                    />
                  </MotionBox>
                ))}
              </Stack>
            </Paper>

            {/* Continue */}

            <Button
              component={Link}
              to="/products"
              startIcon={
                <ArrowBack
                  sx={{
                    fontSize: {
                      xs: 14,
                      sm: 18,
                    },
                  }}
                />
              }
              sx={{
                mt: {
                  xs: 0.45,
                  sm: 1.7,
                },
                color: "#555",
                textTransform: "none",
                fontWeight: 800,
                fontSize: {
                  xs: ".62rem",
                  sm: ".78rem",
                },
                px: 0.3,
                minHeight: 28,
                "&:hover": {
                  background: "transparent",
                  color: "#a87500",
                },
              }}
            >
              Continue Shopping
            </Button>
          </MotionBox>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <MotionBox
            initial={{
              opacity: 0,
              x: 15,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.45,
              delay: 0.08,
            }}
            sx={{
              position: {
                xs: "static",
                lg: "sticky",
              },
              top: {
                lg: 90,
              },
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: {
                  xs: 1.35,
                  sm: 2.5,
                  md: 3,
                },
                borderRadius: {
                  xs: 2.5,
                  md: 4,
                },
                background: "#fff",
                border: "1px solid rgba(0,0,0,.065)",
                boxShadow: "0 10px 35px rgba(0,0,0,.045)",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.55}>
                <BoltOutlined
                  sx={{
                    color: "#d29a00",
                    fontSize: {
                      xs: 17,
                      sm: 21,
                    },
                  }}
                />

                <Typography
                  sx={{
                    fontSize: {
                      xs: ".84rem",
                      sm: "1.15rem",
                    },
                    fontWeight: 900,
                    color: "#111",
                  }}
                >
                  Order Summary
                </Typography>
              </Stack>

              <Stack
                spacing={{
                  xs: 0.9,
                  sm: 1.35,
                }}
                sx={{
                  mt: {
                    xs: 1.45,
                    sm: 2.5,
                  },
                }}
              >
                <SummaryRow
                  label={`Subtotal (${itemCount} ${
                    itemCount === 1 ? "item" : "items"
                  })`}
                  value={formatCurrency(subtotal)}
                />

                <SummaryRow
                  label="Shipping"
                  value={shipping === 0 ? "FREE" : formatCurrency(shipping)}
                  valueSx={
                    shipping === 0
                      ? {
                          color: "#2e7d32",
                        }
                      : {}
                  }
                />

                {settings.freeShippingThreshold > 0 && (
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
                          Math.max(
                            0,
                            settings.freeShippingThreshold - subtotal,
                          ),
                        )} more to get FREE shipping`}
                  </Typography>
                )}
              </Stack>

              <Divider
                sx={{
                  my: {
                    xs: 1.25,
                    sm: 2,
                  },
                }}
              />

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography
                  sx={{
                    fontSize: {
                      xs: ".76rem",
                      sm: ".95rem",
                    },
                    fontWeight: 900,
                    color: "#111",
                  }}
                >
                  Total
                </Typography>

                <Typography
                  sx={{
                    fontSize: {
                      xs: "1.15rem",
                      sm: "1.5rem",
                    },
                    fontWeight: 950,
                    color: "#111",
                    letterSpacing: "-.035em",
                  }}
                >
                  {formatCurrency(total)}
                </Typography>
              </Stack>

              {/* CHECKOUT BUTTON */}

              <Button
                fullWidth
                variant="contained"
                endIcon={
                  <ArrowForward
                    sx={{
                      fontSize: {
                        xs: 16,
                        sm: 19,
                      },
                    }}
                  />
                }
                onClick={() => navigate("/checkout")}
                sx={{
                  mt: {
                    xs: 1.35,
                    sm: 2.5,
                  },

                  minHeight: {
                    xs: 44,
                    sm: 51,
                  },

                  borderRadius: {
                    xs: 2.2,
                    sm: 2.7,
                  },

                  textTransform: "none",

                  fontWeight: 900,

                  fontSize: {
                    xs: ".71rem",
                    sm: ".9rem",
                  },

                  color: "#fff",

                  background: "linear-gradient(135deg,#111 0%,#242424 100%)",

                  boxShadow: "none",

                  "& .MuiButton-startIcon, & .MuiButton-endIcon": {
                    color: "#fff",
                  },

                  "& .MuiSvgIcon-root": {
                    color: "#fff",
                  },

                  "&:hover": {
                    color: "#fff",
                    background: "linear-gradient(135deg,#111 0%,#242424 100%)",
                    boxShadow: "0 9px 22px rgba(0,0,0,.14)",
                    transform: "translateY(-1px)",
                  },

                  "&:active": {
                    color: "#fff",
                    transform: "scale(.98)",
                  },
                }}
              >
                Proceed to Checkout
              </Button>

              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                justifyContent="center"
                sx={{
                  mt: {
                    xs: 1,
                    sm: 1.8,
                  },
                }}
              >
                <LockOutlined
                  sx={{
                    fontSize: {
                      xs: 13,
                      sm: 16,
                    },
                    color: "#aaa",
                  }}
                />

                <Typography
                  sx={{
                    color: "#999",
                    fontSize: {
                      xs: ".55rem",
                      sm: ".7rem",
                    },
                    fontWeight: 600,
                  }}
                >
                  Secure checkout
                </Typography>
              </Stack>
            </Paper>

            {/* =================================================
                DELIVERY
            ================================================= */}

            <MotionPaper
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.35,
                delay: 0.2,
              }}
              elevation={0}
              sx={{
                mt: {
                  xs: 0.75,
                  sm: 1.7,
                },
                p: {
                  xs: 1.1,
                  sm: 2,
                },
                borderRadius: {
                  xs: 2.2,
                  sm: 3,
                },
                background: "linear-gradient(135deg,#fffbea,#fff8df)",
                border: "1px solid rgba(216,166,0,.13)",
              }}
            >
              <Stack
                direction="row"
                spacing={{
                  xs: 0.7,
                  sm: 1.2,
                }}
                alignItems="flex-start"
              >
                <Box
                  sx={{
                    width: {
                      xs: 27,
                      sm: 34,
                    },
                    height: {
                      xs: 27,
                      sm: 34,
                    },
                    flexShrink: 0,
                    borderRadius: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#fff1b7",
                    color: "#ae7900",
                  }}
                >
                  <LocalShippingOutlined
                    sx={{
                      fontSize: {
                        xs: 15,
                        sm: 21,
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: {
                        xs: ".66rem",
                        sm: ".82rem",
                      },
                      fontWeight: 850,
                      color: "#3b2e00",
                    }}
                  >
                    Delivery & Tracking
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.2,
                      fontSize: {
                        xs: ".56rem",
                        sm: ".72rem",
                      },
                      color: "#76652e",
                      lineHeight: 1.45,
                    }}
                  >
                    Order confirmation and tracking details will be sent by
                    email.
                  </Typography>
                </Box>
              </Stack>
            </MotionPaper>

            {/* =================================================
                PAYMENT CHIPS
            ================================================= */}

            <Stack
              direction="row"
              spacing={0.45}
              justifyContent="center"
              flexWrap="wrap"
              useFlexGap
              sx={{
                mt: {
                  xs: 0.65,
                  sm: 1.5,
                },
                mb: 0,
              }}
            >
              <Chip label="Razorpay" size="small" sx={paymentChipSx} />

              <Chip label="COD" size="small" sx={paymentChipSx} />

              <Chip label="Secure" size="small" sx={paymentChipSx} />
            </Stack>
          </MotionBox>
        </Box>
      </Container>
    </Box>
  );
};

/* =========================================================
   HELPERS
========================================================= */

const getItemId = (item) => {
  return (
    item?._id ||
    item?.id ||
    item?.productId ||
    item?.product?._id ||
    item?.product?.id ||
    `${item?.name || item?.title || "item"}`
  );
};

const getItemQuantity = (item) => {
  const quantity = Number(item?.quantity ?? item?.qty ?? 1);

  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
};

const getItemPrice = (item) => {
  const values = [
    item?.price,
    item?.sellingPrice,
    item?.discountedPrice,
    item?.unitPrice,
    item?.product?.price,
    item?.product?.sellingPrice,
    item?.product?.discountedPrice,
  ];

  for (const value of values) {
    const number = Number(value);

    if (Number.isFinite(number) && number >= 0) {
      return number;
    }
  }

  return 0;
};

const SummaryRow = ({ label, value, valueSx = {} }) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    spacing={2}
  >
    <Typography
      sx={{
        color: "#777",
        fontSize: {
          xs: ".64rem",
          sm: ".8rem",
        },
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        color: "#333",
        fontSize: {
          xs: ".68rem",
          sm: ".82rem",
        },
        fontWeight: 800,
        textAlign: "right",
        ...valueSx,
      }}
    >
      {value}
    </Typography>
  </Stack>
);

const formatCurrency = (value) => {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const paymentChipSx = {
  height: {
    xs: 21,
    sm: 27,
  },
  borderRadius: 1.5,
  backgroundColor: "#f7f7f7",
  color: "#777",
  fontSize: {
    xs: ".5rem",
    sm: ".66rem",
  },
  fontWeight: 700,
  "& .MuiChip-label": {
    px: {
      xs: 0.65,
      sm: 1,
    },
  },
};

export default Cart;
