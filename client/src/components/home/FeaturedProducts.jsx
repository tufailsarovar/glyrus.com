// Glyrus — FeaturedProducts.jsx

import React, { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

import {
  AddRounded,
  AddShoppingCartRounded,
  ArrowForwardRounded,
  LocalOfferRounded,
  RemoveRounded,
  ShoppingBagOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import { getProducts } from "../../services/api";

import { useCart } from "../../hooks/useCart";

const MotionBox = motion(Box);

const FeaturedProducts = () => {
  const navigate = useNavigate();

  const { addToCart, getCartItem, updateQuantity, removeFromCart } = useCart();

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* =====================================================

     FETCH PRODUCTS

  ===================================================== */

  useEffect(() => {
    let mounted = true;

    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);

        setError("");

        const response = await getProducts({
          limit: 6,
        });

        const data = response?.data;

        let productList = [];

        if (Array.isArray(data)) {
          productList = data;
        } else if (Array.isArray(data?.products)) {
          productList = data.products;
        } else if (Array.isArray(data?.data)) {
          productList = data.data;
        }

        if (mounted) {
          setProducts(productList.slice(0, 6));
        }
      } catch (err) {
        if (mounted) {
          setError(
            err?.response?.data?.message ||
              "Unable to load featured products right now.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchFeaturedProducts();

    return () => {
      mounted = false;
    };
  }, []);

  /* =====================================================

     HELPERS

  ===================================================== */

  const getProductId = (product) =>
    product?._id || product?.id || product?.slug;

  const getProductImage = (product) => {
    if (Array.isArray(product?.images) && product.images.length > 0) {
      const firstImage = product.images[0];

      if (typeof firstImage === "string") {
        return firstImage;
      }

      return firstImage?.url || firstImage?.secure_url || firstImage?.src || "";
    }

    return product?.image || product?.imageUrl || product?.thumbnail || "";
  };

  const getProductPrice = (product) => {
    const originalPrice = Number(product?.price) || 0;

    const discountPrice = Number(product?.discountPrice) || 0;

    if (
      discountPrice > 0 &&
      originalPrice > 0 &&
      discountPrice < originalPrice
    ) {
      return discountPrice;
    }

    return originalPrice;
  };

  const getOriginalPrice = (product) => {
    const originalPrice = Number(product?.price) || 0;

    const discountPrice = Number(product?.discountPrice) || 0;

    if (
      discountPrice > 0 &&
      originalPrice > 0 &&
      discountPrice < originalPrice
    ) {
      return originalPrice;
    }

    return 0;
  };

  const getDiscount = (product) => {
    const price = getProductPrice(product);

    const originalPrice = getOriginalPrice(product);

    if (originalPrice > price && price > 0) {
      return Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    const discount = Number(product?.discount);

    return Number.isFinite(discount) && discount > 0 ? discount : 0;
  };

  const getCategory = (product) =>
    product?.category || product?.productCategory || "NFC Product";

  const getTitle = (product) =>
    product?.title || product?.name || "Glyrus NFC Product";

  const getDescription = (product) =>
    product?.shortDescription ||
    product?.description ||
    "Premium NFC product designed for modern businesses.";

  const isAvailable = (product) => {
    if (product?.stock !== undefined) {
      return Number(product.stock) > 0;
    }

    return product?.isAvailable !== false;
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",

      currency: "INR",

      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

  /* =====================================================

     CART ACTIONS

  ===================================================== */

  const handleAddToCart = (event, product) => {
    event.preventDefault();

    event.stopPropagation();

    if (!product || !isAvailable(product)) return;

    addToCart(product, 1);
  };

  const handleIncrease = (event, product) => {
    event.preventDefault();

    event.stopPropagation();

    const productId = getProductId(product);

    const cartItem = getCartItem(productId);

    if (!isAvailable(product)) return;

    updateQuantity(productId, (Number(cartItem?.quantity) || 0) + 1);
  };

  const handleDecrease = (event, product) => {
    event.preventDefault();

    event.stopPropagation();

    const productId = getProductId(product);

    const cartItem = getCartItem(productId);

    const quantity = Number(cartItem?.quantity) || 0;

    if (quantity <= 1) {
      removeFromCart(productId);

      return;
    }

    updateQuantity(productId, quantity - 1);
  };

  const handleBuyNow = (event, product) => {
    event.preventDefault();

    event.stopPropagation();

    if (!product || !isAvailable(product)) return;

    const productId = getProductId(product);

    const cartItem = getCartItem(productId);

    if (!(Number(cartItem?.quantity) > 0)) {
      addToCart(product, 1);
    }

    navigate("/checkout");
  };

  /* =====================================================

     LOADING

  ===================================================== */

  const renderLoading = () => (
    <Box
      sx={{
        minHeight: 260,

        display: "flex",

        alignItems: "center",

        justifyContent: "center",
      }}
    >
      <Stack alignItems="center" spacing={1.5}>
        <CircularProgress
          size={32}
          thickness={4}
          sx={{
            color: "#F2B000",
          }}
        />

        <Typography
          sx={{
            color: "#777",

            fontSize: 13,

            fontWeight: 600,
          }}
        >
          Loading products...
        </Typography>
      </Stack>
    </Box>
  );

  /* =====================================================

     EMPTY

  ===================================================== */

  const renderEmpty = () => (
    <Box
      sx={{
        py: 7,

        px: 2,

        textAlign: "center",

        borderRadius: {
          xs: "18px",

          md: "24px",
        },

        border: "1px dashed rgba(17,17,17,0.12)",

        backgroundColor: "#FCFCFC",
      }}
    >
      <ShoppingBagOutlined
        sx={{
          fontSize: 40,

          color: "#D3A900",

          mb: 1,
        }}
      />

      <Typography
        sx={{
          color: "#222",

          fontSize: {
            xs: 17,

            sm: 19,
          },

          fontWeight: 800,
        }}
      >
        Featured products coming soon
      </Typography>

      <Typography
        sx={{
          mt: 0.8,

          color: "#777",

          fontSize: 13,
        }}
      >
        Explore all available Glyrus products.
      </Typography>

      <Button
        component={Link}
        to="/products"
        endIcon={<ArrowForwardRounded />}
        sx={{
          mt: 2.2,

          minHeight: 42,

          px: 2.2,

          borderRadius: "12px",

          textTransform: "none",

          fontSize: 13,

          fontWeight: 800,

          color: "#111",

          backgroundColor: "#FFD000",

          "&:hover": {
            backgroundColor: "#FFDF32",
          },
        }}
      >
        View Products
      </Button>
    </Box>
  );

  /* =====================================================

     UI

  ===================================================== */

  return (
    <Box
      component="section"
      sx={{
        position: "relative",

        py: {
          xs: 6.5,

          sm: 8,

          md: 10,
        },

        backgroundColor: "#FFFFFF",

        overflow: "hidden",
      }}
    >
      <Container maxWidth="xl">
        {/* =================================================

            SECTION HEADER

        ================================================= */}

        <MotionBox
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          sx={{
            mb: { xs: 3.5, sm: 4.5, md: 5.5 },
            display: "flex",
            alignItems: { xs: "flex-end", sm: "flex-end" },
            justifyContent: "space-between",
            flexDirection: "row",
            gap: { xs: 1, sm: 2 },
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.9}
              sx={{ mb: 1.1 }}
            >
              <Box
                sx={{
                  width: 25,
                  height: 3,
                  flexShrink: 0,
                  borderRadius: "999px",
                  background: "linear-gradient(90deg,#FFD000,#F0A800)",
                }}
              />

              <Typography
                sx={{
                  color: "#B17B00",
                  fontSize: { xs: 10.5, sm: 11.5 },
                  fontWeight: 850,
                  letterSpacing: "1.1px",
                  textTransform: "uppercase",
                }}
              >
                Featured Collection
              </Typography>
            </Stack>

            <Typography
              component="h2"
              sx={{
                color: "#111",
                fontSize: {
                  xs: "1.8rem",
                  sm: "2.25rem",
                  md: "2.8rem",
                },
                lineHeight: 1.1,
                letterSpacing: {
                  xs: "-1px",
                  md: "-1.7px",
                },
                fontWeight: 900,
              }}
            >
              Products made to{" "}
              <Box
                component="span"
                sx={{
                  color: "#F1AE00",
                  ml: { xs: 0.6, sm: 0.8 },
                }}
              >
                connect.
              </Box>
            </Typography>

            <Typography
              sx={{
                mt: 1.1,
                maxWidth: 570,
                color: "#707070",
                fontSize: {
                  xs: 13,
                  sm: 14,
                  md: 15,
                },
                lineHeight: 1.7,
              }}
            >
              Explore premium physical NFC products designed to help businesses
              create simple, memorable customer interactions.
            </Typography>
          </Box>

          <Button
            component={Link}
            to="/products"
            endIcon={<ArrowForwardRounded />}
            sx={{
              flexShrink: 0,
              alignSelf: "flex-end",
              minHeight: { xs: 28, sm: 42 },
              px: { xs: 0.8, sm: 1.8 },
              borderRadius: "10px",
              textTransform: "none",
              color: "#222",
              fontSize: { xs: 9, sm: 13 },
              fontWeight: 800,
              whiteSpace: "nowrap",
              border: "1px solid rgba(17,17,17,0.10)",
              backgroundColor: "#FFF",
              "& .MuiButton-endIcon": {
                ml: { xs: 0.3, sm: 1 },
                "& svg": {
                  fontSize: { xs: 14, sm: 20 },
                },
              },
              "&:hover": {
                borderColor: "#F2B000",
                backgroundColor: "rgba(255,208,0,0.08)",
              },
            }}
          >
            View All
          </Button>
        </MotionBox>

        {loading && renderLoading()}

        {!loading && error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: "14px",
              fontSize: 13,
            }}
          >
            {error}
          </Alert>
        )}

        {!loading && !error && products.length === 0 && renderEmpty()}

        {/* =================================================

            PRODUCT GRID

        ================================================= */}

        {!loading && !error && products.length > 0 && (
          <>
            <Box
              sx={{
                display: "grid",

                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",

                  sm: "repeat(2, minmax(0, 1fr))",

                  md: "repeat(3, minmax(0, 1fr))",
                },

                gap: {
                  xs: 1.2,

                  sm: 2,

                  md: 2.5,

                  lg: 3,
                },
              }}
            >
              {products.map((product, index) => {
                const productId = getProductId(product);

                const image = getProductImage(product);

                const price = getProductPrice(product);

                const originalPrice = getOriginalPrice(product);

                const discount = getDiscount(product);

                const title = getTitle(product);

                const description = getDescription(product);

                const category = getCategory(product);

                const available = isAvailable(product);

                const cartItem = getCartItem(productId);

                const cartQuantity = Number(cartItem?.quantity) || 0;

                const hasDiscount = originalPrice > price && price > 0;

                const savings = hasDiscount ? originalPrice - price : 0;

                return (
                  <MotionBox
                    key={productId || index}
                    initial={{
                      opacity: 0,

                      y: 28,

                      scale: 0.95,
                    }}
                    whileInView={{
                      opacity: 1,

                      y: 0,

                      scale: 1,
                    }}
                    viewport={{
                      once: true,

                      amount: 0.08,
                    }}
                    transition={{
                      duration: 0.5,

                      delay: Math.min(index * 0.08, 0.4),

                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={{
                      y: -7,
                    }}
                    sx={{
                      width: "100%",

                      minWidth: 0,
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",

                        width: "100%",

                        height: "100%",

                        minWidth: 0,

                        overflow: "hidden",

                        borderRadius: {
                          xs: "17px",

                          sm: "20px",

                          md: "23px",
                        },

                        border: "1px solid rgba(17,17,17,.07)",

                        bgcolor: "#FFF",

                        boxShadow: "0 8px 28px rgba(17,17,17,.055)",

                        transition:
                          "box-shadow .35s ease,border-color .35s ease",

                        "&:hover": {
                          borderColor: "rgba(218,160,0,.35)",

                          boxShadow: "0 22px 50px rgba(17,17,17,.12)",
                        },
                      }}
                    >
                      {/* =================================

                          IMAGE

                      ================================= */}

                      <Box
                        component={Link}
                        to={`/products/${productId}`}
                        sx={{
                          position: "relative",

                          display: "block",

                          width: "100%",

                          aspectRatio: {
                            xs: "16 / 10",

                            sm: "16 / 9",

                            md: "16 / 9",
                          },

                          overflow: "hidden",

                          background: "#F7F7F7",

                          textDecoration: "none",
                        }}
                      >
                        {image ? (
                          <Box
                            component="img"
                            src={image}
                            alt={title}
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.src =
                                "/placeholder-product.png";
                            }}
                            sx={{
  width: "100%",
  height: "100%",
  objectFit: "contain",
  objectPosition: "center",
  display: "block",
  transition: "transform .75s cubic-bezier(.2,.7,.2,1)",
  transform: "scale(1)",
  "&:hover": {
    transform: {
      xs: "scale(1)",
      md: "scale(1.04)",
    },
  },
}}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: "100%",

                              height: "100%",

                              display: "grid",

                              placeItems: "center",
                            }}
                          >
                            <ShoppingBagOutlined
                              sx={{
                                fontSize: {
                                  xs: 38,

                                  sm: 46,
                                },

                                color: "#D7B200",
                              }}
                            />
                          </Box>
                        )}

                        {/* IMAGE OVERLAY */}

                        <Box
                          sx={{
                            position: "absolute",

                            inset: 0,

                            background:
                              "linear-gradient(180deg,rgba(0,0,0,.08),transparent 45%,rgba(0,0,0,.14))",

                            pointerEvents: "none",
                          }}
                        />

                        {/* CATEGORY RIBBON */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: { xs: 9, sm: 11 },
                            left: 0,
                            zIndex: 4,
                            maxWidth: "58%",
                            bgcolor: "#111",
                            color: "#FFD000",
                            fontSize: { xs: 8.5, sm: 10 },
                            fontWeight: 950,
                            letterSpacing: ".02em",
                            lineHeight: 1.2,
                            textTransform: "uppercase",
                            textAlign: "center",
                            boxShadow: "0 6px 18px rgba(0,0,0,.24)",
                            px: { xs: 1.4, sm: 1.8 },
                            py: { xs: 0.6, sm: 0.7 },
                            pr: { xs: 2.2, sm: 2.6 },
                            whiteSpace: "nowrap",
                            overflow: "visible",

                            "&::after": {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: "100%",
                              width: 0,
                              height: 0,
                              borderTop: {
                                xs: "13px solid transparent",
                                sm: "15px solid transparent",
                              },
                              borderBottom: {
                                xs: "13px solid transparent",
                                sm: "15px solid transparent",
                              },
                              borderLeft: "12px solid #111",
                              filter:
                                "drop-shadow(3px 3px 2px rgba(0,0,0,.12))",
                            },
                          }}
                        >
                          {category}
                        </Box>

                        {/* =================================

                            DISCOUNT RIBBON

                        ================================= */}

                        {discount > 0 && (
                          <MotionBox
                            initial={{
                              opacity: 0,

                              x: 20,

                              rotate: 5,
                            }}
                            animate={{
                              opacity: 1,

                              x: 0,

                              rotate: 0,
                            }}
                            transition={{
                              delay: 0.12 + index * 0.04,

                              duration: 0.42,

                              ease: [0.22, 1, 0.36, 1],
                            }}
                            sx={{
                              position: "absolute",

                              top: {
                                xs: 9,

                                sm: 11,
                              },

                              right: -1,

                              zIndex: 4,
                            }}
                          >
                            <Box
                              sx={{
                                position: "relative",

                                px: {
                                  xs: 1.05,

                                  sm: 1.35,
                                },

                                py: {
                                  xs: 0.55,

                                  sm: 0.65,
                                },

                                pr: {
                                  xs: 1.55,

                                  sm: 1.9,
                                },

                                bgcolor: "#111",

                                color: "#FFD000",

                                fontSize: {
                                  xs: 8.5,

                                  sm: 10,
                                },

                                fontWeight: 950,

                                letterSpacing: ".02em",

                                lineHeight: 1,

                                boxShadow: "0 6px 18px rgba(0,0,0,.24)",

                                clipPath:
                                  "polygon(10% 0,100% 0,100% 100%,10% 100%,0 50%)",
                              }}
                            >
                              {discount}% OFF
                            </Box>
                          </MotionBox>
                        )}

                        {/* =================================

                            CART CONTROL

                        ================================= */}

                        {cartQuantity > 0 ? (
                          <Box
                            onClick={(event) => {
                              event.preventDefault();

                              event.stopPropagation();
                            }}
                            sx={{
                              position: "absolute",

                              right: {
                                xs: 7,

                                sm: 9,
                              },

                              bottom: {
                                xs: 7,

                                sm: 9,
                              },

                              display: "flex",

                              alignItems: "center",

                              height: {
                                xs: 34,

                                sm: 38,
                              },

                              borderRadius: {
                                xs: "10px",

                                sm: "11px",
                              },

                              overflow: "hidden",

                              background:
                                "linear-gradient(135deg,#FFD900,#F2AC00)",

                              boxShadow: "0 7px 18px rgba(242,172,0,.28)",

                              zIndex: 5,
                            }}
                          >
                            <IconButton
                              aria-label="Decrease quantity"
                              onClick={(event) =>
                                handleDecrease(event, product)
                              }
                              sx={{
                                width: {
                                  xs: 28,

                                  sm: 32,
                                },

                                height: "100%",

                                borderRadius: 0,

                                color: "#111",
                              }}
                            >
                              <RemoveRounded
                                sx={{
                                  fontSize: {
                                    xs: 14,

                                    sm: 16,
                                  },
                                }}
                              />
                            </IconButton>

                            <Typography
                              sx={{
                                minWidth: {
                                  xs: 20,

                                  sm: 23,
                                },

                                textAlign: "center",

                                color: "#111",

                                fontSize: {
                                  xs: 11,

                                  sm: 12.5,
                                },

                                fontWeight: 950,
                              }}
                            >
                              {cartQuantity}
                            </Typography>

                            <IconButton
                              aria-label="Increase quantity"
                              disabled={!available}
                              onClick={(event) =>
                                handleIncrease(event, product)
                              }
                              sx={{
                                width: {
                                  xs: 28,

                                  sm: 32,
                                },

                                height: "100%",

                                borderRadius: 0,

                                color: "#111",
                              }}
                            >
                              <AddRounded
                                sx={{
                                  fontSize: {
                                    xs: 14,

                                    sm: 16,
                                  },
                                }}
                              />
                            </IconButton>
                          </Box>
                        ) : (
                          <MotionBox
                            whileHover={{
                              scale: 1.08,

                              rotate: 2,
                            }}
                            whileTap={{
                              scale: 0.9,
                            }}
                            sx={{
                              position: "absolute",

                              right: {
                                xs: 7,

                                sm: 9,
                              },

                              bottom: {
                                xs: 7,

                                sm: 9,
                              },

                              zIndex: 5,
                            }}
                          >
                            <IconButton
                              aria-label="Add product to cart"
                              disabled={!available}
                              onClick={(event) =>
                                handleAddToCart(event, product)
                              }
                              sx={{
                                width: {
                                  xs: 35,

                                  sm: 39,
                                },

                                height: {
                                  xs: 35,

                                  sm: 39,
                                },

                                borderRadius: {
                                  xs: "10px",

                                  sm: "11px",
                                },

                                color: "#111",

                                background: available
                                  ? "linear-gradient(135deg,#FFD900,#F2AC00)"
                                  : "#EEE",

                                boxShadow: available
                                  ? "0 7px 18px rgba(242,172,0,.28)"
                                  : "none",
                              }}
                            >
                              <AddShoppingCartRounded
                                sx={{
                                  fontSize: {
                                    xs: 16,

                                    sm: 19,
                                  },
                                }}
                              />
                            </IconButton>
                          </MotionBox>
                        )}

                        {/* OUT OF STOCK */}

                        {!available && (
                          <Box
                            sx={{
                              position: "absolute",

                              inset: 0,

                              display: "flex",

                              alignItems: "center",

                              justifyContent: "center",

                              bgcolor: "rgba(255,255,255,.66)",

                              backdropFilter: "blur(4px)",

                              zIndex: 8,
                            }}
                          >
                            <Box
                              sx={{
                                px: 1.6,

                                py: 0.65,

                                borderRadius: "999px",

                                bgcolor: "#111",

                                color: "#FFF",

                                fontSize: {
                                  xs: 8.5,

                                  sm: 10.5,
                                },

                                fontWeight: 900,
                              }}
                            >
                              Out of Stock
                            </Box>
                          </Box>
                        )}
                      </Box>

                      {/* =================================

                          PRODUCT CONTENT

                      ================================= */}

                      <Box
                        sx={{
                          p: {
                            xs: 1.15,

                            sm: 1.45,

                            md: 1.7,
                          },
                        }}
                      >
                        {/* TITLE */}

                        <Typography
                          component={Link}
                          to={`/products/${productId}`}
                          sx={{
                            display: "-webkit-box",

                            overflow: "hidden",

                            WebkitBoxOrient: "vertical",

                            WebkitLineClamp: 1,

                            color: "#111",

                            textDecoration: "none",

                            fontSize: {
                              xs: 12,

                              sm: 13.5,

                              md: 15,
                            },

                            lineHeight: 1.3,

                            fontWeight: 900,

                            letterSpacing: "-.25px",

                            transition: "color .2s ease",

                            "&:hover": {
                              color: "#C38A00",
                            },
                          }}
                        >
                          {title}
                        </Typography>

                        {/* DESCRIPTION */}

                        <Typography
                          sx={{
                            mt: {
                              xs: 0.35,

                              sm: 0.5,
                            },

                            minHeight: {
                              xs: 26,

                              sm: 31,
                            },

                            display: "-webkit-box",

                            overflow: "hidden",

                            WebkitBoxOrient: "vertical",

                            WebkitLineClamp: 2,

                            color: "#858585",

                            fontSize: {
                              xs: 8.5,

                              sm: 9.5,

                              md: 10.5,
                            },

                            lineHeight: 1.45,
                          }}
                        >
                          {description}
                        </Typography>

                        {/* PRICE */}

                        <Stack
                          direction="row"
                          alignItems="baseline"
                          spacing={{
                            xs: 0.8,

                            sm: 1,
                          }}
                          sx={{
                            mt: {
                              xs: 1,

                              sm: 1.15,
                            },

                            flexWrap: "wrap",
                          }}
                        >
                          {/* SELLING PRICE */}

                          <Typography
                            sx={{
                              color: "#111",

                              fontSize: {
                                xs: 20,

                                sm: 24,

                                md: 27,
                              },

                              lineHeight: 1.1,

                              fontWeight: 950,

                              letterSpacing: {
                                xs: "-0.5px",

                                sm: "-0.8px",
                              },

                              whiteSpace: "nowrap",

                              flexShrink: 0,
                            }}
                          >
                            {formatCurrency(price)}
                          </Typography>

                          {/* ORIGINAL PRICE */}

                          {hasDiscount && (
                            <Typography
                              sx={{
                                color: "#999",

                                fontSize: {
                                  xs: 11,

                                  sm: 12,

                                  md: 13,
                                },

                                lineHeight: 1,

                                textDecoration: "line-through",

                                fontWeight: 600,
                              }}
                            >
                              {formatCurrency(originalPrice)}
                            </Typography>
                          )}

                          {/* SAVINGS */}

                          {hasDiscount && (
                            <Typography
                              sx={{
                                color: "#159447",

                                fontSize: {
                                  xs: 10.5,

                                  sm: 12,

                                  md: 13,
                                },

                                lineHeight: 1,

                                fontWeight: 900,
                              }}
                            >
                              Save {formatCurrency(savings)}
                            </Typography>
                          )}
                        </Stack>

                        {/* =================================

                            BOTTOM ACTIONS

                        ================================= */}

                        <Stack
                          direction="row"
                          spacing={{
                            xs: 0.65,

                            sm: 0.8,
                          }}
                          sx={{
                            mt: {
                              xs: 1.05,

                              sm: 1.2,
                            },
                          }}
                        >
                          {/* DETAILS */}

                          <Button
                            component={Link}
                            to={`/products/${productId}`}
                            fullWidth
                            endIcon={
                              <ArrowForwardRounded
                                sx={{
                                  fontSize: "14px !important",
                                }}
                              />
                            }
                            sx={{
                              minWidth: 0,

                              minHeight: {
                                xs: 35,

                                sm: 39,
                              },

                              px: {
                                xs: 0.6,

                                sm: 1,
                              },

                              borderRadius: {
                                xs: "10px",

                                sm: "11px",
                              },

                              border: "1px solid rgba(17,17,17,.10)",

                              color: "#111",

                              bgcolor: "#FFF",

                              textTransform: "none",

                              fontSize: {
                                xs: 9,

                                sm: 10.5,
                              },

                              fontWeight: 850,

                              whiteSpace: "nowrap",

                              transition: "all .22s ease",

                              "&:hover": {
                                bgcolor: "#111",

                                color: "#FFF",

                                borderColor: "#111",

                                transform: "translateY(-2px)",
                              },
                            }}
                          >
                            Details
                          </Button>

                          {/* BUY NOW */}

                          <Button
                            fullWidth
                            disabled={!available}
                            onClick={(event) => handleBuyNow(event, product)}
                            startIcon={
                              <ShoppingBagOutlined
                                sx={{
                                  fontSize: "14px !important",
                                }}
                              />
                            }
                            sx={{
                              minWidth: 0,

                              minHeight: {
                                xs: 35,

                                sm: 39,
                              },

                              px: {
                                xs: 0.5,

                                sm: 1,
                              },

                              borderRadius: {
                                xs: "10px",

                                sm: "11px",
                              },

                              color: available ? "#111" : "#999",

                              background: available
                                ? "linear-gradient(135deg,#FFD900,#F2AC00)"
                                : "#EEE",

                              textTransform: "none",

                              fontSize: {
                                xs: 9,

                                sm: 10.5,
                              },

                              fontWeight: 950,

                              boxShadow: available
                                ? "0 7px 19px rgba(242,172,0,.25)"
                                : "none",

                              transition: "all .22s ease",

                              "&:hover": available
                                ? {
                                    background:
                                      "linear-gradient(135deg,#FFD900,#F2B800)",

                                    transform: "translateY(-2px)",

                                    boxShadow:
                                      "0 11px 25px rgba(242,172,0,.34)",
                                  }
                                : {},
                            }}
                          >
                            Buy Now
                          </Button>
                        </Stack>
                      </Box>
                    </Box>
                  </MotionBox>
                );
              })}
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: { xs: 2.5, sm: 3.5 },
              }}
            >
              <Button
                component={Link}
                to="/products"
                endIcon={<ArrowForwardRounded />}
                sx={{
                  flexShrink: 0,
                  minHeight: { xs: 34, sm: 42 },
                  px: { xs: 1.1, sm: 1.8 },
                  borderRadius: "12px",
                  textTransform: "none",
                  color: "#222",
                  fontSize: { xs: 11, sm: 13 },
                  fontWeight: 800,
                  border: "1px solid rgba(17,17,17,0.10)",
                  backgroundColor: "#FFF",
                  "&:hover": {
                    borderColor: "#F2B000",
                    backgroundColor: "rgba(255,208,0,0.08)",
                  },
                }}
              >
                View All Products
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default FeaturedProducts;
