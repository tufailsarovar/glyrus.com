// TufTap — ProductCard.jsx

import React from "react";
import { motion } from "framer-motion";
import {
  AddRounded,
  AddShoppingCartRounded,
  ArrowForwardRounded,
  LocalOfferRounded,
  RemoveRounded,
  ShoppingBagRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";

const MotionBox = motion(Box);

const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();

  const {
    addToCart,
    getCartItem,
    updateQuantity,
    removeFromCart,
  } = useCart();

  if (!product) return null;

  const productId = product?._id || product?.id;

  const cartItem = getCartItem(productId);
  const cartQuantity = Number(cartItem?.quantity) || 0;

  /* =====================================================
     PRODUCT IMAGE
  ===================================================== */

  const image =
    product?.images?.[0]?.url ||
    product?.images?.[0]?.secure_url ||
    product?.images?.[0] ||
    product?.image ||
    product?.thumbnail ||
    "/placeholder-product.png";

  /* =====================================================
     PRICE
  ===================================================== */

  const originalPrice = Number(product?.price) || 0;

  const discountPrice = Number(product?.discountPrice) || 0;

  const price =
    discountPrice > 0 &&
    discountPrice < originalPrice
      ? discountPrice
      : originalPrice;

  const hasDiscount =
    originalPrice > price && price > 0;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((originalPrice - price) / originalPrice) * 100
      )
    : 0;

  const savings = hasDiscount
    ? originalPrice - price
    : 0;

  /* =====================================================
     PRODUCT INFO
  ===================================================== */

  const category =
    product?.category ||
    product?.productCategory ||
    "NFC Product";

  const title =
    product?.title ||
    product?.name ||
    "TufTap NFC Product";

  const description =
    product?.shortDescription ||
    product?.description ||
    "Premium NFC product designed for modern businesses.";

  const isAvailable =
    product?.stock !== undefined
      ? Number(product.stock) > 0
      : product?.isAvailable !== false;

  /* =====================================================
     CART ACTIONS
  ===================================================== */

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAvailable) return;

    if (typeof onAddToCart === "function") {
      onAddToCart(product);
    } else {
      addToCart(product, 1);
    }
  };

  const handleIncrease = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAvailable) return;

    updateQuantity(productId, cartQuantity + 1);
  };

  const handleDecrease = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (cartQuantity <= 1) {
      removeFromCart(productId);
      return;
    }

    updateQuantity(productId, cartQuantity - 1);
  };

  const handleBuyNow = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAvailable) return;

    /*
     * Add only if product is not already in cart.
     * This prevents duplicate quantity when Buy Now
     * is clicked more than once.
     */
    if (cartQuantity <= 0) {
      addToCart(product, 1);
    }

    navigate("/checkout");
  };

  return (
    <MotionBox
      initial={{
        opacity: 0,
        y: 25,
        scale: 0.96,
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
          height: "100%",
          minWidth: 0,
          overflow: "hidden",
          borderRadius: {
            xs: "17px",
            sm: "20px",
            md: "23px",
          },
          border: "1px solid rgba(17,17,17,.07)",
          bgcolor: "#fff",
          boxShadow:
            "0 8px 28px rgba(17,17,17,.055)",
          transition:
            "box-shadow .35s ease, border-color .35s ease",
          "&:hover": {
            borderColor:
              "rgba(218,160,0,.35)",
            boxShadow:
              "0 22px 50px rgba(17,17,17,.12)",
          },
        }}
      >
        {/* =================================================
            IMAGE
        ================================================= */}

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
            background:
              "linear-gradient(135deg,#FAFAFA,#F1F1F1)",
            textDecoration: "none",
          }}
        >
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
              objectFit: "cover",
              display: "block",
              transition:
                "transform .7s cubic-bezier(.2,.7,.2,1)",
              transform: "scale(1)",
              "&:hover": {
                transform: {
                  xs: "scale(1)",
                  md: "scale(1.08)",
                },
              },
            }}
          />

          {/* IMAGE GRADIENT */}

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg,rgba(0,0,0,.10) 0%,transparent 45%,rgba(0,0,0,.12) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* =================================================
              CATEGORY
          ================================================= */}

          <Chip
            icon={
              <LocalOfferRounded
                sx={{
                  fontSize:
                    "12px !important",
                }}
              />
            }
            label={category}
            size="small"
            sx={{
              position: "absolute",
              top: {
                xs: 8,
                sm: 10,
              },
              left: {
                xs: 8,
                sm: 10,
              },
              maxWidth: "55%",
              height: {
                xs: 23,
                sm: 26,
              },
              borderRadius: "999px",
              bgcolor:
                "rgba(255,255,255,.93)",
              backdropFilter: "blur(12px)",
              color: "#222",
              fontSize: {
                xs: 8,
                sm: 9.5,
              },
              fontWeight: 850,
              boxShadow:
                "0 4px 15px rgba(0,0,0,.10)",
              "& .MuiChip-icon": {
                color: "#D39B00",
                ml: 0.5,
              },
              "& .MuiChip-label": {
                px: {
                  xs: 0.7,
                  sm: 0.9,
                },
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              },
            }}
          />

          {/* =================================================
              DISCOUNT RIBBON
          ================================================= */}

          {hasDiscount && (
            <MotionBox
              initial={{
                opacity: 0,
                x: 18,
                rotate: 4,
              }}
              animate={{
                opacity: 1,
                x: 0,
                rotate: 0,
              }}
              transition={{
                delay: 0.15,
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              sx={{
                position: "absolute",
                top: {
                  xs: 9,
                  sm: 11,
                },
                right: -1,
                zIndex: 3,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  px: {
                    xs: 1.1,
                    sm: 1.35,
                  },
                  py: {
                    xs: 0.55,
                    sm: 0.65,
                  },
                  pr: {
                    xs: 1.5,
                    sm: 1.8,
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
                  boxShadow:
                    "0 5px 16px rgba(0,0,0,.22)",
                  clipPath:
                    "polygon(10% 0,100% 0,100% 100%,10% 100%,0 50%)",
                }}
              >
                {discountPercentage}% OFF
              </Box>
            </MotionBox>
          )}

          {/* =================================================
              OUT OF STOCK
          ================================================= */}

          {!isAvailable && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor:
                  "rgba(255,255,255,.68)",
                backdropFilter: "blur(4px)",
                zIndex: 5,
              }}
            >
              <Box
                sx={{
                  px: 1.8,
                  py: 0.7,
                  borderRadius: "999px",
                  bgcolor: "#111",
                  color: "#fff",
                  fontSize: {
                    xs: 9,
                    sm: 10.5,
                  },
                  fontWeight: 900,
                  letterSpacing: ".02em",
                }}
              >
                Out of Stock
              </Box>
            </Box>
          )}
        </Box>

        {/* =================================================
            CONTENT
        ================================================= */}

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
              transition:
                "color .2s ease",
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

          {/* =================================================
              PRICE
          ================================================= */}

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
                  xs: 22,
                  sm: 25,
                  md: 27,
                },
                lineHeight: 1,
                fontWeight: 950,
                letterSpacing: "-.8px",
              }}
            >
              ₹{price.toLocaleString("en-IN")}
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
                  textDecoration:
                    "line-through",
                  fontWeight: 600,
                }}
              >
                ₹
                {originalPrice.toLocaleString(
                  "en-IN"
                )}
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
                Save ₹
                {savings.toLocaleString(
                  "en-IN"
                )}
              </Typography>
            )}
          </Stack>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <Stack
            direction="row"
            spacing={{
              xs: 0.65,
              sm: 0.75,
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
                    fontSize:
                      "14px !important",
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
                border:
                  "1px solid rgba(17,17,17,.10)",
                color: "#111",
                bgcolor: "#fff",
                textTransform: "none",
                fontSize: {
                  xs: 9,
                  sm: 10.5,
                },
                fontWeight: 850,
                whiteSpace: "nowrap",
                transition:
                  "all .22s ease",
                "&:hover": {
                  bgcolor: "#111",
                  color: "#fff",
                  borderColor: "#111",
                  transform:
                    "translateY(-2px)",
                },
              }}
            >
              Details
            </Button>

            {/* BUY NOW */}

            <Button
              fullWidth
              onClick={handleBuyNow}
              disabled={!isAvailable}
              startIcon={
                <ShoppingBagRounded
                  sx={{
                    fontSize:
                      "14px !important",
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
                bgcolor: isAvailable
                  ? "#FFD000"
                  : "#E8E8E8",
                color: isAvailable
                  ? "#111"
                  : "#999",
                textTransform: "none",
                fontSize: {
                  xs: 9,
                  sm: 10.5,
                },
                fontWeight: 950,
                boxShadow: isAvailable
                  ? "0 6px 18px rgba(255,208,0,.24)"
                  : "none",
                transition:
                  "all .22s ease",
                "&:hover": isAvailable
                  ? {
                      bgcolor: "#F2B800",
                      transform:
                        "translateY(-2px)",
                      boxShadow:
                        "0 10px 24px rgba(242,184,0,.32)",
                    }
                  : {},
              }}
            >
              Buy Now
            </Button>

            {/* CART */}

            {cartQuantity > 0 ? (
              <Box
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                sx={{
                  flexShrink: 0,
                  height: {
                    xs: 35,
                    sm: 39,
                  },
                  display: "flex",
                  alignItems: "center",
                  borderRadius: {
                    xs: "10px",
                    sm: "11px",
                  },
                  overflow: "hidden",
                  background:
                    "linear-gradient(135deg,#FFD900,#F2AC00)",
                  boxShadow:
                    "0 6px 17px rgba(242,172,0,.22)",
                }}
              >
                <IconButton
                  aria-label="Decrease quantity"
                  onClick={handleDecrease}
                  sx={{
                    width: {
                      xs: 27,
                      sm: 31,
                    },
                    height: "100%",
                    borderRadius: 0,
                    color: "#111",
                    "&:hover": {
                      bgcolor:
                        "rgba(255,255,255,.18)",
                    },
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
                      xs: 19,
                      sm: 22,
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
                  onClick={handleIncrease}
                  disabled={!isAvailable}
                  sx={{
                    width: {
                      xs: 27,
                      sm: 31,
                    },
                    height: "100%",
                    borderRadius: 0,
                    color: "#111",
                    "&:hover": {
                      bgcolor:
                        "rgba(255,255,255,.18)",
                    },
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
                  scale: 1.06,
                  rotate: 1,
                }}
                whileTap={{
                  scale: 0.92,
                }}
              >
                <IconButton
                  aria-label="Add product to cart"
                  disabled={!isAvailable}
                  onClick={handleAddToCart}
                  sx={{
                    flexShrink: 0,
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
                    color: isAvailable
                      ? "#111"
                      : "#999",
                    background:
                      isAvailable
                        ? "linear-gradient(135deg,#FFD900,#F2AC00)"
                        : "#EEEEEE",
                    boxShadow:
                      isAvailable
                        ? "0 6px 17px rgba(242,172,0,.22)"
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
          </Stack>
        </Box>
      </Box>
    </MotionBox>
  );
};

export default ProductCard;