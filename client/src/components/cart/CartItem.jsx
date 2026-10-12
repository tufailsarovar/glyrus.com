// Glyrus — CartItem.jsx
import React from "react";
import {
  AddRounded,
  DeleteOutlineRounded,
  RemoveRounded,
} from "@mui/icons-material";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  if (!item) return null;

  const productId =
    item.productId ||
    item._id ||
    item.id ||
    item.product?._id ||
    item.product?.id;

  const title =
    item.title ||
    item.name ||
    item.product?.title ||
    item.product?.name ||
    "NFC Product";

  const getImageUrl = (value) => {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (value && typeof value === "object") {
      return value.url || value.secure_url || value.src || value.imageUrl || "";
    }

    return "";
  };

  const image =
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
      .find(Boolean) || "/placeholder-product.png";

  const price = Number(item.price) || Number(item.product?.price) || 0;

  const quantity = Math.max(1, Number(item.quantity) || 1);

  const customization = item.customization || {};

  const hasCustomization = Object.values(customization).some(
    (value) =>
      value !== undefined && value !== null && String(value).trim() !== "",
  );

  const subtotal = price * quantity;

  const handleIncrease = () => {
    if (typeof onQuantityChange === "function") {
      onQuantityChange(quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity <= 1) {
      if (typeof onRemove === "function") {
        onRemove();
      }
      return;
    }

    if (typeof onQuantityChange === "function") {
      onQuantityChange(quantity - 1);
    }
  };

  const handleRemove = () => {
    if (typeof onRemove === "function") {
      onRemove(productId, item);
    }
  };

  return (
    <MotionBox
      layout
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        x: -20,
        height: 0,
        marginBottom: 0,
      }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      sx={{
        width: "100%",
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          gap: {
            xs: 1.2,
            sm: 1.7,
            md: 2,
          },
          width: "100%",
          minWidth: 0,
          p: {
            xs: 1.2,
            sm: 1.5,
            md: 1.8,
          },
          borderRadius: {
            xs: "15px",
            sm: "18px",
            md: "20px",
          },
          border: "1px solid rgba(17,17,17,0.07)",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 7px 25px rgba(17,17,17,0.045)",
        }}
      >
        {/* Product Image */}
        <Box
          sx={{
            width: {
              xs: 72,
              sm: 90,
              md: 100,
            },
            height: {
              xs: 72,
              sm: 90,
              md: 100,
            },
            flexShrink: 0,
            overflow: "hidden",
            borderRadius: {
              xs: "11px",
              sm: "14px",
            },
            backgroundColor: "#F5F5F5",
            border: "1px solid rgba(17,17,17,0.06)",
          }}
        >
          <Box
            component="img"
            src={image}
            alt={title}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = "/placeholder-product.png";
            }}
            sx={{
              width: "100%",
              height: "100%",
              display: "block",
              objectFit: "cover",
            }}
          />
        </Box>

        {/* Product Information */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            pr: {
              xs: 3.5,
              sm: 4,
            },
          }}
        >
          <Typography
            sx={{
              color: "#171717",
              fontSize: {
                xs: 13,
                sm: 14.5,
                md: 15.5,
              },
              lineHeight: 1.3,
              fontWeight: 850,
              display: "-webkit-box",
              overflow: "hidden",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              color: "#777777",
              fontSize: {
                xs: 10,
                sm: 11,
                md: 12,
              },
            }}
          >
            ₹{price.toLocaleString("en-IN")} each
          </Typography>

          {/* Customization */}
          {hasCustomization && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{
                mt: 0.7,
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  width: 5,
                  height: 5,
                  flexShrink: 0,
                  borderRadius: "50%",
                  backgroundColor: "#E7AA00",
                }}
              />

              <Typography
                sx={{
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: "#9A7200",
                  fontSize: {
                    xs: 9.5,
                    sm: 10.5,
                  },
                  fontWeight: 700,
                }}
              >
                Customized product
              </Typography>
            </Stack>
          )}

          {/* Quantity + Price */}
          <Box
            sx={{
              mt: {
                xs: 1.05,
                sm: 1.25,
              },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              flexWrap: {
                xs: "wrap",
                sm: "nowrap",
              },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              sx={{
                border: "1px solid rgba(17,17,17,0.10)",
                borderRadius: {
                  xs: "9px",
                  sm: "10px",
                },
                overflow: "hidden",
                backgroundColor: "#FAFAFA",
              }}
            >
              <IconButton
                aria-label="Decrease quantity"
                onClick={handleDecrease}
                size="small"
                sx={quantityButtonStyles}
              >
                <RemoveRounded />
              </IconButton>

              <Typography
                sx={{
                  minWidth: {
                    xs: 27,
                    sm: 31,
                  },
                  px: 0.3,
                  textAlign: "center",
                  color: "#222222",
                  fontSize: {
                    xs: 11,
                    sm: 12,
                  },
                  fontWeight: 850,
                }}
              >
                {quantity}
              </Typography>

              <IconButton
                aria-label="Increase quantity"
                onClick={handleIncrease}
                size="small"
                sx={quantityButtonStyles}
              >
                <AddRounded />
              </IconButton>
            </Stack>

            <Typography
              sx={{
                color: "#111111",
                fontSize: {
                  xs: 13.5,
                  sm: 15,
                  md: 16,
                },
                fontWeight: 900,
                whiteSpace: "nowrap",
              }}
            >
              ₹{subtotal.toLocaleString("en-IN")}
            </Typography>
          </Box>
        </Box>

        {/* Remove */}
        <IconButton
          aria-label="Remove product from cart"
          onClick={handleRemove}
          sx={{
            position: "absolute",
            top: {
              xs: 8,
              sm: 11,
            },
            right: {
              xs: 8,
              sm: 11,
            },
            width: {
              xs: 30,
              sm: 34,
            },
            height: {
              xs: 30,
              sm: 34,
            },
            color: "#999999",
            borderRadius: "9px",
            "&:hover": {
              color: "#D32F2F",
              backgroundColor: "rgba(211,47,47,0.06)",
            },
          }}
        >
          <DeleteOutlineRounded
            sx={{
              fontSize: {
                xs: 18,
                sm: 20,
              },
            }}
          />
        </IconButton>
      </Box>
    </MotionBox>
  );
};

const quantityButtonStyles = {
  width: {
    xs: 27,
    sm: 31,
  },
  height: {
    xs: 29,
    sm: 33,
  },
  borderRadius: 0,
  color: "#222222",
  "&:hover": {
    backgroundColor: "rgba(255,208,0,0.12)",
  },
  "& svg": {
    fontSize: {
      xs: 15,
      sm: 17,
    },
  },
};

export default CartItem;
