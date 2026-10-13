import React from "react";
import { motion } from "framer-motion";
import {
  AddRounded,
  AddShoppingCartRounded,
  ArrowForwardRounded,
  RemoveRounded,
  ShoppingBagRounded,
} from "@mui/icons-material";
import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";

const MotionBox = motion(Box);

const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const { addToCart, getCartItem, updateQuantity, removeFromCart } = useCart();

  if (!product) return null;

  const productId = product?._id || product?.id;
  const cartItem = getCartItem(productId);
  const cartQuantity = Number(cartItem?.quantity) || 0;

  const image =
    product?.images?.[0]?.url ||
    product?.images?.[0]?.secure_url ||
    product?.images?.[0] ||
    product?.image ||
    product?.thumbnail ||
    "/placeholder-product.png";

  const originalPrice = Number(product?.price) || 0;
  const discountPrice = Number(product?.discountPrice) || 0;

  const price =
    discountPrice > 0 && discountPrice < originalPrice
      ? discountPrice
      : originalPrice;

  const hasDiscount = originalPrice > price && price > 0;
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  const savings = hasDiscount ? originalPrice - price : 0;

  const categoryValue =
    product?.category ?? product?.productCategory ?? product?.categories;

  const category = (
    Array.isArray(categoryValue)
      ? categoryValue.filter(Boolean).join(", ")
      : categoryValue || "NFC Products"
  )
    .toString()
    .trim();

  const title = product?.title || product?.name || "TufTap NFC Product";
  const description =
    product?.shortDescription ||
    product?.description ||
    "Premium NFC product designed for modern businesses.";

  const isAvailable =
    product?.stock !== undefined
      ? Number(product.stock) > 0
      : product?.isAvailable !== false;

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

    if (cartQuantity <= 0) {
      addToCart(product, 1);
    }

    navigate("/checkout");
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 25, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -7 }}
      sx={{ width: "100%", minWidth: 0, height: "100%" }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minWidth: 0,
          overflow: "hidden",
          borderRadius: { xs: "17px", sm: "20px", md: "23px" },
          border: "1px solid rgba(17,17,17,.07)",
          bgcolor: "#fff",
          boxShadow: "0 8px 28px rgba(17,17,17,.055)",
          transition: "box-shadow .35s ease, border-color .35s ease",
          "&:hover": {
            borderColor: "rgba(218,160,0,.35)",
            boxShadow: "0 22px 50px rgba(17,17,17,.12)",
          },
        }}
      >
        {/* PRODUCT IMAGE */}
        <Box
          component={Link}
          to={`/products/${productId}`}
          sx={{
            position: "relative",
            display: "block",
            width: "100%",
            overflow: "hidden",
            bgcolor: "#fff",
            textDecoration: "none",
            lineHeight: 0,
          }}
        >
          <Box
            component="img"
            src={image}
            alt={title}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/placeholder-product.png";
            }}
            sx={{
              display: "block",
              width: "100%",
              height: "auto",
              maxWidth: "100%",
              objectFit: "contain",
              objectPosition: "center",
              transition: "transform .45s ease",
              ".MuiBox-root:hover &": {
                transform: "scale(1.035)",
              },
            }}
          />

          {/* IMAGE GRADIENT */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg,rgba(0,0,0,.05) 0%,transparent 45%,rgba(0,0,0,.05) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* CATEGORY RIBBON */}
          <Box
            title={category}
            sx={{
              position: "absolute",
              top: { xs: 10, sm: 12 },
              left: 0,
              zIndex: 3,
              maxWidth: "72%",
              px: { xs: 1.2, sm: 1.5 },
              py: { xs: 0.7, sm: 0.85 },
              color: "#111",
              background: "linear-gradient(135deg,#FFE66D 0%,#FFD000 100%)",
              fontSize: { xs: 8, sm: 9.5 },
              fontWeight: 950,
              lineHeight: 1.2,
              letterSpacing: "0.25px",
              textTransform: "uppercase",
              borderRadius: "0 6px 6px 0",
              boxShadow: "0 4px 12px rgba(0,0,0,.12)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              "&::after": {
                content: '""',
                position: "absolute",
                right: 0,
                bottom: -4,
                width: 8,
                height: 8,
                bgcolor: "#B98A00",
                transform: "skewY(-35deg)",
                zIndex: -1,
              },
            }}
          >
            {category || "NFC Products"}
          </Box>

          {/* DISCOUNT BADGE */}
          {hasDiscount && (
            <Box
              sx={{
                position: "absolute",
                top: { xs: 9, sm: 11 },
                right: 0,
                zIndex: 2,
                px: 1.2,
                py: 0.7,
                bgcolor: "#111",
                color: "#FFD000",
                fontSize: { xs: 8.5, sm: 10 },
                fontWeight: 950,
                lineHeight: 1,
                borderRadius: "5px 0 0 5px",
                boxShadow: "0 4px 12px rgba(0,0,0,.12)",
              }}
            >
              {discountPercentage}% OFF
            </Box>
          )}

          {/* OUT OF STOCK */}
          {!isAvailable && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(255,255,255,.68)",
                zIndex: 5,
                lineHeight: 1,
              }}
            >
              <Box
                sx={{
                  px: 1.8,
                  py: 0.7,
                  borderRadius: "999px",
                  bgcolor: "#111",
                  color: "#fff",
                  fontSize: { xs: 9, sm: 10.5 },
                  fontWeight: 900,
                }}
              >
                Out of Stock
              </Box>
            </Box>
          )}
        </Box>

        {/* PRODUCT CONTENT */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            p: { xs: 1.15, sm: 1.45, md: 1.7 },
          }}
        >
          {/* TITLE */}
          <Typography
            component={Link}
            to={`/products/${productId}`}
            sx={{
              display: "-webkit-box",
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              color: "#111",
              textDecoration: "none",
              fontSize: { xs: 12, sm: 13.5, md: 15 },
              lineHeight: 1.35,
              fontWeight: 900,
              letterSpacing: "-.25px",
              transition: "color .2s ease",
              "&:hover": { color: "#C38A00" },
            }}
          >
            {title}
          </Typography>

          {/* DESCRIPTION */}
          <Typography
            sx={{
              mt: { xs: 0.45, sm: 0.6 },
              minHeight: { xs: 26, sm: 31 },
              display: "-webkit-box",
              overflow: "hidden",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              color: "#858585",
              fontSize: { xs: 8.5, sm: 9.5, md: 10.5 },
              lineHeight: 1.45,
            }}
          >
            {description}
          </Typography>

          {/* PRICING */}
          <Stack
            direction="row"
            alignItems="baseline"
            spacing={{ xs: 0.8, sm: 1 }}
            sx={{
              mt: { xs: 1, sm: 1.15 },
              flexWrap: "wrap",
              rowGap: 0.5,
            }}
          >
            <Typography
              sx={{
                color: "#111",
                fontSize: { xs: 18, sm: 23, md: 27 },
                lineHeight: 1.1,
                fontWeight: 950,
                letterSpacing: { xs: "-0.5px", sm: "-0.8px" },
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              ₹{price.toLocaleString("en-IN")}
            </Typography>

            {hasDiscount && (
              <Typography
                sx={{
                  color: "#999",
                  fontSize: { xs: 11, sm: 12, md: 13 },
                  lineHeight: 1,
                  textDecoration: "line-through",
                  fontWeight: 600,
                }}
              >
                ₹{originalPrice.toLocaleString("en-IN")}
              </Typography>
            )}

            {hasDiscount && (
              <Typography
                sx={{
                  color: "#159447",
                  fontSize: { xs: 10.5, sm: 12, md: 13 },
                  lineHeight: 1,
                  fontWeight: 900,
                }}
              >
                Save ₹{savings.toLocaleString("en-IN")}
              </Typography>
            )}
          </Stack>

          {/* ACTION BUTTONS */}
          <Stack
            direction="row"
            spacing={{ xs: 0.65, sm: 0.75 }}
            sx={{ mt: "auto", pt: { xs: 1.05, sm: 1.2 } }}
          >
            <Button
              component={Link}
              to={`/products/${productId}`}
              fullWidth
              endIcon={
                <ArrowForwardRounded sx={{ fontSize: "14px !important" }} />
              }
              sx={{
                minWidth: 0,
                minHeight: { xs: 35, sm: 39 },
                px: { xs: 0.6, sm: 1 },
                borderRadius: { xs: "10px", sm: "11px" },
                border: "1px solid rgba(17,17,17,.10)",
                color: "#111",
                bgcolor: "#fff",
                textTransform: "none",
                fontSize: { xs: 9, sm: 10.5 },
                fontWeight: 850,
                whiteSpace: "nowrap",
                transition: "all .22s ease",
                "&:hover": {
                  bgcolor: "#111",
                  color: "#fff",
                  borderColor: "#111",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Details
            </Button>

            <Button
              fullWidth
              onClick={handleBuyNow}
              disabled={!isAvailable}
              startIcon={
                <ShoppingBagRounded sx={{ fontSize: "14px !important" }} />
              }
              sx={{
                minWidth: 0,
                minHeight: { xs: 35, sm: 39 },
                px: { xs: 0.5, sm: 1 },
                borderRadius: { xs: "10px", sm: "11px" },
                bgcolor: isAvailable ? "#FFD000" : "#E8E8E8",
                color: isAvailable ? "#111" : "#999",
                textTransform: "none",
                fontSize: { xs: 9, sm: 10.5 },
                fontWeight: 950,
                whiteSpace: "nowrap",
                boxShadow: isAvailable
                  ? "0 6px 18px rgba(255,208,0,.24)"
                  : "none",
                transition: "all .22s ease",
                "&:hover": isAvailable
                  ? {
                      bgcolor: "#F2B800",
                      transform: "translateY(-2px)",
                      boxShadow: "0 10px 24px rgba(242,184,0,.32)",
                    }
                  : {},
              }}
            >
              Buy Now
            </Button>

            {/* CART QUANTITY OR ADD BUTTON */}
            {cartQuantity > 0 ? (
              <Box
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                sx={{
                  flexShrink: 0,
                  height: { xs: 35, sm: 39 },
                  display: "flex",
                  alignItems: "center",
                  borderRadius: { xs: "10px", sm: "11px" },
                  overflow: "hidden",
                  background: "linear-gradient(135deg,#FFD900,#F2AC00)",
                  boxShadow: "0 6px 17px rgba(242,172,0,.22)",
                }}
              >
                <IconButton
                  aria-label="Decrease quantity"
                  onClick={handleDecrease}
                  sx={{
                    width: { xs: 27, sm: 31 },
                    height: "100%",
                    borderRadius: 0,
                    color: "#111",
                    "&:hover": { bgcolor: "rgba(255,255,255,.18)" },
                  }}
                >
                  <RemoveRounded sx={{ fontSize: { xs: 14, sm: 16 } }} />
                </IconButton>

                <Typography
                  sx={{
                    minWidth: { xs: 19, sm: 22 },
                    textAlign: "center",
                    color: "#111",
                    fontSize: { xs: 11, sm: 12.5 },
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
                    width: { xs: 27, sm: 31 },
                    height: "100%",
                    borderRadius: 0,
                    color: "#111",
                    "&:hover": { bgcolor: "rgba(255,255,255,.18)" },
                  }}
                >
                  <AddRounded sx={{ fontSize: { xs: 14, sm: 16 } }} />
                </IconButton>
              </Box>
            ) : (
              <MotionBox
                whileHover={{ scale: 1.06, rotate: 1 }}
                whileTap={{ scale: 0.92 }}
                sx={{ flexShrink: 0 }}
              >
                <IconButton
                  aria-label="Add product to cart"
                  disabled={!isAvailable}
                  onClick={handleAddToCart}
                  sx={{
                    width: { xs: 35, sm: 39 },
                    height: { xs: 35, sm: 39 },
                    borderRadius: { xs: "10px", sm: "11px" },
                    color: isAvailable ? "#111" : "#999",
                    background: isAvailable
                      ? "linear-gradient(135deg,#FFD900,#F2AC00)"
                      : "#EEEEEE",
                    boxShadow: isAvailable
                      ? "0 6px 17px rgba(242,172,0,.22)"
                      : "none",
                  }}
                >
                  <AddShoppingCartRounded
                    sx={{ fontSize: { xs: 16, sm: 19 } }}
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
