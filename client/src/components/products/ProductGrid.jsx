// Glyrus — ProductGrid.jsx
import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import ProductCard from "./ProductCard";

const ProductGrid = ({
  products = [],
  loading = false,
  error = "",
  onAddToCart,
}) => {
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 260,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <CircularProgress
          size={34}
          thickness={4}
          sx={{
            color: "#EFB000",
          }}
        />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 2,
        }}
      >
        <Typography
          sx={{
            color: "#777777",
            fontSize: {
              xs: 13,
              sm: 14,
            },
          }}
        >
          {error}
        </Typography>
      </Box>
    );
  }

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <Box
        sx={{
          minHeight: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 2,
          borderRadius: {
            xs: "16px",
            sm: "20px",
          },
          border: "1px dashed rgba(17,17,17,0.12)",
          backgroundColor: "#FCFCFC",
        }}
      >
        <Box>
          <Typography
            sx={{
              color: "#222222",
              fontSize: {
                xs: 15,
                sm: 17,
              },
              fontWeight: 800,
            }}
          >
            No products found
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              color: "#888888",
              fontSize: {
                xs: 11.5,
                sm: 12.5,
              },
            }}
          >
            Try another category or check back later.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, minmax(0, 1fr))",
          sm: "repeat(2, minmax(0, 1fr))",
          md: "repeat(3, minmax(0, 1fr))",
          lg: "repeat(4, minmax(0, 1fr))",
        },
        gap: {
          xs: 1.25,
          sm: 2,
          md: 2.5,
          lg: 3,
        },
        alignItems: "stretch",
      }}
    >
      {products.map((product, index) => (
        <ProductCard
          key={
            product?._id ||
            product?.id ||
            `product-${index}`
          }
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </Box>
  );
};

export default ProductGrid;