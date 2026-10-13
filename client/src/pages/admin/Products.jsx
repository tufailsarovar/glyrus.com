import React, { useEffect, useMemo, useState } from "react";
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
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AddRounded,
  DeleteOutlineRounded,
  EditRounded,
  Inventory2Rounded,
  RefreshRounded,
  SearchRounded,
  ArrowForwardRounded,
  CloseRounded,
  ShoppingBagRounded,
  CheckCircleRounded,
  RemoveShoppingCartRounded,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import formatCurrency from "../../utils/formatCurrency";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const getProductsFromResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.products)) return data.data.products;
  return [];
};

const getProductPrice = (product) =>
  Number(
    product?.finalPrice ??
      product?.discountPrice ??
      product?.salePrice ??
      product?.price ??
      0,
  );

const getProductName = (product) =>
  product?.name || product?.title || "Untitled Product";

const getProductImage = (product) =>
  product?.images?.[0]?.url ||
  product?.images?.[0] ||
  product?.image ||
  product?.imageUrl ||
  product?.thumbnail ||
  "";

const getProductStock = (product) =>
  Number(product?.stock ?? product?.inventory ?? product?.quantity ?? 0);

const getProductCategory = (product) =>
  product?.category || product?.productCategory || "NFC";

const getActiveStatus = (product) => {
  if (typeof product?.isActive === "boolean") return product.isActive;
  if (typeof product?.active === "boolean") return product.active;
  if (typeof product?.status === "string") {
    return product.status.toLowerCase() === "active";
  }
  return true;
};

const getStockStyle = (stock) => {
  if (stock <= 0) {
    return { color: "#B42318", bgcolor: "#FDEDEC", label: "Out of stock" };
  }
  if (stock <= 5) {
    return { color: "#996000", bgcolor: "#FFF3D9", label: "Low stock" };
  }
  return { color: "#287A46", bgcolor: "#EAF7EE", label: "In stock" };
};

const Products = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProducts = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await api.get("/api/admin/products");
      setProducts(getProductsFromResponse(response?.data));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load products.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return products;

    return products.filter((product) => {
      const name = getProductName(product).toLowerCase();
      const category = getProductCategory(product).toLowerCase();
      const description = String(product?.description || "").toLowerCase();

      return (
        name.includes(query) ||
        category.includes(query) ||
        description.includes(query)
      );
    });
  }, [products, search]);

  const activeCount = useMemo(
    () => products.filter(getActiveStatus).length,
    [products],
  );

  const outOfStockCount = useMemo(
    () => products.filter((product) => getProductStock(product) <= 0).length,
    [products],
  );

  const handleDelete = async (product) => {
    const id = product?._id || product?.id;

    if (!id) {
      setError("Product ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Delete "${getProductName(product)}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      await api.delete(`/api/admin/products/${id}`);

      setProducts((previous) =>
        previous.filter((item) => String(item?._id || item?.id) !== String(id)),
      );

      setSuccess("Product deleted successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to delete the product.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (id) => {
    if (id) navigate(`/admin/products/edit/${id}`);
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        pb: { xs: 2, sm: 3 },
        overflowX: "clip",
        color: "#181818",
      }}
    >
      {/* HEADER */}
      <MotionBox
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        sx={{
          mb: { xs: 1.4, sm: 2 },
          p: { xs: 1.5, sm: 2.2, md: 2.7 },
          borderRadius: "10px",
          position: "relative",
          overflow: "hidden",
          color: "#fff",
          background:
            "linear-gradient(125deg,#171717 0%,#222218 72%,#3A3009 100%)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: { xs: 110, sm: 175 },
            height: { xs: 110, sm: 175 },
            borderRadius: "50%",
            right: { xs: -45, sm: -55 },
            top: { xs: -55, sm: -90 },
            bgcolor: "rgba(255,208,0,.10)",
            pointerEvents: "none",
          }}
        />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.7}
              sx={{ mb: 0.55 }}
            >
              <Inventory2Rounded
                sx={{ color: "#FFD000", fontSize: { xs: 15, sm: 18 } }}
              />
              <Typography
                sx={{
                  color: "#FFD000",
                  fontSize: { xs: "0.57rem", sm: "0.66rem" },
                  fontWeight: 850,
                  letterSpacing: "1px",
                }}
              >
                GLYRUS ADMIN
              </Typography>
            </Stack>

            <Typography
              sx={{
                fontSize: { xs: "1.35rem", sm: "1.9rem", md: "2.15rem" },
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: "-.055em",
              }}
            >
              Products
            </Typography>

            <Typography
              sx={{
                mt: 0.6,
                color: "#B9B9B9",
                fontSize: { xs: "0.64rem", sm: "0.77rem" },
                lineHeight: 1.5,
              }}
            >
              Manage your NFC product catalogue.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => navigate("/admin/products/add")}
            sx={{
              flexShrink: 0,
              minWidth: 0,
              minHeight: { xs: 35, sm: 42 },
              px: { xs: 1.05, sm: 1.8 },
              borderRadius: "7px",
              bgcolor: "#FFD000",
              color: "#171717",
              fontSize: { xs: "0.65rem", sm: "0.77rem" },
              fontWeight: 900,
              textTransform: "none",
              "& .MuiButton-startIcon": {
                mr: { xs: 0.4, sm: 0.8 },
                "& svg": { fontSize: { xs: 17, sm: 20 } },
              },
              "&:hover": { bgcolor: "#F0C400" },
            }}
          >
            Add Product
          </Button>
        </Stack>
      </MotionBox>

      {/* NOTIFICATIONS */}
      <AnimatePresence mode="wait">
        {error && (
          <MotionBox
            key="error"
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            sx={{ overflow: "hidden" }}
          >
            <Alert
              severity="error"
              onClose={() => setError("")}
              sx={{
                mb: 1.3,
                borderRadius: "8px",
                fontSize: "0.76rem",
                "& .MuiAlert-message": { py: 0.5 },
              }}
            >
              {error}
            </Alert>
          </MotionBox>
        )}

        {success && (
          <MotionBox
            key="success"
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            sx={{ overflow: "hidden" }}
          >
            <Alert
              severity="success"
              onClose={() => setSuccess("")}
              sx={{
                mb: 1.3,
                borderRadius: "8px",
                fontSize: "0.76rem",
                "& .MuiAlert-message": { py: 0.5 },
              }}
            >
              {success}
            </Alert>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* SUMMARY */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3,minmax(0,1fr))",
          gap: { xs: 0.7, sm: 1.1 },
          mb: { xs: 1.3, sm: 1.7 },
        }}
      >
        {[
          {
            label: "Total products",
            value: products.length,
            icon: <ShoppingBagRounded />,
            color: "#856900",
            bg: "#FFF7D8",
          },
          {
            label: "Active",
            value: activeCount,
            icon: <CheckCircleRounded />,
            color: "#287A46",
            bg: "#EAF7EE",
          },
          {
            label: "Out of stock",
            value: outOfStockCount,
            icon: <RemoveShoppingCartRounded />,
            color: "#B42318",
            bg: "#FDEDEC",
          },
        ].map((item, index) => (
          <MotionCard
            key={item.label}
            elevation={0}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
            sx={{
              minWidth: 0,
              borderRadius: "8px",
              border: "1px solid #EAEAE6",
              boxShadow: "0 2px 10px rgba(0,0,0,.025)",
            }}
          >
            <CardContent
              sx={{
                p: { xs: 0.9, sm: 1.5 },
                "&:last-child": { pb: { xs: 0.9, sm: 1.5 } },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={{ xs: 0.5, sm: 1 }}
              >
                <Box
                  sx={{
                    flexShrink: 0,
                    width: { xs: 25, sm: 33 },
                    height: { xs: 25, sm: 33 },
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "6px",
                    bgcolor: item.bg,
                    color: item.color,
                    "& svg": { fontSize: { xs: 14, sm: 18 } },
                  }}
                >
                  {item.icon}
                </Box>
                <Typography
                  sx={{
                    minWidth: 0,
                    fontSize: { xs: "0.55rem", sm: "0.68rem" },
                    color: "#777",
                    fontWeight: 750,
                    lineHeight: 1.3,
                  }}
                >
                  {item.label}
                </Typography>
              </Stack>

              <Typography
                sx={{
                  mt: { xs: 0.7, sm: 1 },
                  fontSize: { xs: "1.15rem", sm: "1.55rem" },
                  fontWeight: 900,
                  letterSpacing: "-.05em",
                  lineHeight: 1.1,
                }}
              >
                {item.value.toLocaleString("en-IN")}
              </Typography>
            </CardContent>
          </MotionCard>
        ))}
      </Box>

      {/* SEARCH AND REFRESH */}
      <Card
        elevation={0}
        sx={{
          mb: { xs: 1.3, sm: 1.7 },
          borderRadius: "9px",
          border: "1px solid #EAEAE6",
          boxShadow: "0 2px 10px rgba(0,0,0,.025)",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 1, sm: 1.5 },
            "&:last-child": { pb: { xs: 1, sm: 1.5 } },
          }}
        >
          <Stack direction="row" spacing={0.8} alignItems="center">
            <TextField
              fullWidth
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              inputProps={{ "aria-label": "Search products" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded sx={{ fontSize: 19, color: "#888" }} />
                  </InputAdornment>
                ),
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      aria-label="Clear search"
                      onClick={() => setSearch("")}
                    >
                      <CloseRounded sx={{ fontSize: 17 }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: 0,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "7px",
                  bgcolor: "#FAFAF8",
                  fontSize: { xs: "0.72rem", sm: "0.8rem" },
                  "& fieldset": { borderColor: "#E9E9E4" },
                  "&:hover fieldset": { borderColor: "#D5BE52" },
                  "&.Mui-focused fieldset": { borderColor: "#D3B000" },
                },
                "& .MuiInputBase-input": {
                  py: { xs: 1, sm: 1.15 },
                },
              }}
            />

            <Tooltip title="Refresh products">
              <span>
                <IconButton
                  aria-label="Refresh products"
                  disabled={refreshing}
                  onClick={() => fetchProducts(false)}
                  sx={{
                    flexShrink: 0,
                    width: { xs: 37, sm: 42 },
                    height: { xs: 37, sm: 42 },
                    borderRadius: "7px",
                    bgcolor: "#F5F5F1",
                    color: "#333",
                    "&:hover": { bgcolor: "#FFF4C5" },
                  }}
                >
                  {refreshing ? (
                    <CircularProgress size={18} sx={{ color: "#8C7000" }} />
                  ) : (
                    <RefreshRounded sx={{ fontSize: 20 }} />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            sx={{ mt: 1 }}
          >
            <Typography
              sx={{
                fontSize: { xs: "0.61rem", sm: "0.68rem" },
                color: "#858585",
              }}
            >
              {search
                ? `${filteredProducts.length} matching products`
                : "Your product collection"}
            </Typography>

            <Chip
              size="small"
              label={`${filteredProducts.length} items`}
              sx={{
                height: 22,
                borderRadius: "5px",
                bgcolor: "#FFF6D2",
                color: "#7E6600",
                fontSize: "0.62rem",
                fontWeight: 800,
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* PRODUCT LIST */}
      {loading ? (
        <Box
          sx={{
            minHeight: 240,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack alignItems="center" spacing={1.2}>
            <CircularProgress
              size={30}
              thickness={4}
              sx={{ color: "#D4AE00" }}
            />
            <Typography sx={{ fontSize: "0.73rem", color: "#888" }}>
              Loading products...
            </Typography>
          </Stack>
        </Box>
      ) : filteredProducts.length === 0 ? (
        <MotionCard
          elevation={0}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{
            borderRadius: "9px",
            border: "1px solid #EAEAE6",
          }}
        >
          <CardContent
            sx={{
              minHeight: 245,
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              px: 2,
            }}
          >
            <Box>
              <Box
                sx={{
                  width: 49,
                  height: 49,
                  borderRadius: "9px",
                  display: "grid",
                  placeItems: "center",
                  mx: "auto",
                  bgcolor: "#FFF6D2",
                  color: "#9A7800",
                  mb: 1.4,
                }}
              >
                <Inventory2Rounded sx={{ fontSize: 25 }} />
              </Box>

              <Typography
                sx={{
                  fontWeight: 850,
                  fontSize: "0.9rem",
                }}
              >
                {search ? "No products found" : "No products available"}
              </Typography>

              <Typography
                sx={{
                  mt: 0.6,
                  color: "#929292",
                  fontSize: "0.72rem",
                }}
              >
                {search
                  ? "Try another search term."
                  : "Add your first product to get started."}
              </Typography>

              {search ? (
                <Button
                  onClick={() => setSearch("")}
                  sx={{
                    mt: 1.2,
                    fontSize: "0.72rem",
                    color: "#7E6600",
                    textTransform: "none",
                  }}
                >
                  Clear search
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<AddRounded />}
                  onClick={() => navigate("/admin/products/add")}
                  sx={{
                    mt: 1.5,
                    bgcolor: "#FFD000",
                    color: "#171717",
                    borderRadius: "7px",
                    fontSize: "0.74rem",
                    fontWeight: 850,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#F0C400" },
                  }}
                >
                  Add Product
                </Button>
              )}
            </Box>
          </CardContent>
        </MotionCard>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2,minmax(0,1fr))",
              sm: "repeat(2,minmax(0,1fr))",
              md: "repeat(3,minmax(0,1fr))",
              xl: "repeat(4,minmax(0,1fr))",
            },
            gap: { xs: 0.9, sm: 1.3, md: 1.6 },
            alignItems: "stretch",
          }}
        >
          <AnimatePresence>
            {filteredProducts.map((product, index) => {
              const id = product?._id || product?.id;
              const image = getProductImage(product);
              const stock = getProductStock(product);
              const active = getActiveStatus(product);
              const stockStyle = getStockStyle(stock);

              return (
                <MotionCard
                  key={id || index}
                  layout
                  elevation={0}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{
                    duration: 0.25,
                    delay: Math.min(index * 0.025, 0.2),
                    layout: { duration: 0.2 },
                  }}
                  sx={{
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    borderRadius: "9px",
                    border: "1px solid #E9E9E5",
                    bgcolor: "#fff",
                    boxShadow: "0 2px 9px rgba(0,0,0,.025)",
                    transition:
                      "border-color .2s, box-shadow .2s, transform .2s",
                    "&:hover": {
                      borderColor: "#DCC85F",
                      boxShadow: "0 9px 24px rgba(0,0,0,.065)",
                    },
                  }}
                >
                  {/* PRODUCT IMAGE */}
                  <Box
                    sx={{
                      position: "relative",
                      aspectRatio: { xs: "1 / .82", sm: "1 / .78" },
                      bgcolor: "#F5F5F2",
                      overflow: "hidden",
                    }}
                  >
                    {image ? (
                      <Box
                        component="img"
                        src={image}
                        alt={getProductName(product)}
                        loading="lazy"
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          transition: "transform .4s ease",
                          ".MuiCard-root:hover &": {
                            transform: "scale(1.045)",
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
                          color: "#C5C5BE",
                        }}
                      >
                        <Inventory2Rounded
                          sx={{ fontSize: { xs: 31, sm: 43 } }}
                        />
                      </Box>
                    )}

                    <Chip
                      size="small"
                      label={active ? "Active" : "Inactive"}
                      sx={{
                        position: "absolute",
                        top: { xs: 6, sm: 9 },
                        left: { xs: 6, sm: 9 },
                        height: { xs: 20, sm: 23 },
                        bgcolor: active ? "#EAF7EE" : "#F0F0F0",
                        color: active ? "#287A3E" : "#777",
                        borderRadius: "5px",
                        fontSize: { xs: "0.52rem", sm: "0.61rem" },
                        fontWeight: 850,
                        "& .MuiChip-label": {
                          px: { xs: 0.65, sm: 0.85 },
                        },
                      }}
                    />

                    {stock <= 5 && (
                      <Chip
                        size="small"
                        label={stock <= 0 ? "Sold out" : "Low stock"}
                        sx={{
                          position: "absolute",
                          top: { xs: 6, sm: 9 },
                          right: { xs: 6, sm: 9 },
                          height: { xs: 20, sm: 23 },
                          bgcolor: stockStyle.bgcolor,
                          color: stockStyle.color,
                          borderRadius: "5px",
                          fontSize: { xs: "0.5rem", sm: "0.59rem" },
                          fontWeight: 850,
                          "& .MuiChip-label": {
                            px: { xs: 0.55, sm: 0.8 },
                          },
                        }}
                      />
                    )}
                  </Box>

                  {/* PRODUCT DETAILS */}
                  <CardContent
                    sx={{
                      p: { xs: 1, sm: 1.5 },
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      "&:last-child": {
                        pb: { xs: 1, sm: 1.5 },
                      },
                    }}
                  >
                    <Typography
                      noWrap
                      sx={{
                        fontSize: { xs: "0.55rem", sm: "0.62rem" },
                        color: "#977500",
                        fontWeight: 850,
                        textTransform: "uppercase",
                        letterSpacing: ".045em",
                      }}
                    >
                      {getProductCategory(product)}
                    </Typography>

                    <Typography
                      title={getProductName(product)}
                      sx={{
                        mt: 0.35,
                        fontSize: { xs: "0.76rem", sm: "0.91rem" },
                        fontWeight: 850,
                        color: "#191919",
                        lineHeight: 1.35,
                        minHeight: { xs: "2.05em", sm: "2.35em" },
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {getProductName(product)}
                    </Typography>

                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={0.5}
                      sx={{ mt: { xs: 0.8, sm: 1.1 }, minWidth: 0 }}
                    >
                      <Typography
                        sx={{
                          minWidth: 0,
                          fontSize: { xs: "0.82rem", sm: "1rem" },
                          fontWeight: 900,
                          color: "#171717",
                          letterSpacing: "-.035em",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {formatCurrency(getProductPrice(product))}
                      </Typography>

                      <Chip
                        size="small"
                        label={stock}
                        title={`${stockStyle.label}: ${stock}`}
                        sx={{
                          flexShrink: 0,
                          height: { xs: 20, sm: 23 },
                          borderRadius: "5px",
                          bgcolor: stockStyle.bgcolor,
                          color: stockStyle.color,
                          fontSize: { xs: "0.55rem", sm: "0.62rem" },
                          fontWeight: 850,
                          "& .MuiChip-label": {
                            px: { xs: 0.65, sm: 0.9 },
                          },
                        }}
                      />
                    </Stack>

                    <Divider
                      sx={{
                        my: { xs: 0.8, sm: 1.1 },
                        borderColor: "#F0F0EC",
                      }}
                    />

                    {/* ACTIONS */}
                    <Stack direction="row" spacing={0.7} sx={{ mt: "auto" }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<EditRounded />}
                        onClick={() => handleEdit(id)}
                        disabled={!id}
                        sx={{
                          minWidth: 0,
                          minHeight: { xs: 31, sm: 36 },
                          px: { xs: 0.5, sm: 1 },
                          borderRadius: "6px",
                          bgcolor: "#FFD000",
                          color: "#171717",
                          fontSize: { xs: "0.62rem", sm: "0.72rem" },
                          fontWeight: 850,
                          textTransform: "none",
                          "& .MuiButton-startIcon": {
                            mr: { xs: 0.35, sm: 0.65 },
                            "& svg": { fontSize: { xs: 14, sm: 17 } },
                          },
                          "&:hover": { bgcolor: "#F0C400" },
                          "&.Mui-disabled": {
                            bgcolor: "#F1F1ED",
                            color: "#999",
                          },
                        }}
                      >
                        Edit
                      </Button>

                      <Tooltip title="Delete product">
                        <span>
                          <IconButton
                            aria-label={`Delete ${getProductName(product)}`}
                            onClick={() => handleDelete(product)}
                            disabled={!id || deletingId === id}
                            sx={{
                              flexShrink: 0,
                              width: { xs: 31, sm: 36 },
                              height: { xs: 31, sm: 36 },
                              borderRadius: "6px",
                              bgcolor: "#F7F7F4",
                              color: "#777",
                              "& svg": {
                                fontSize: { xs: 17, sm: 19 },
                              },
                              "&:hover": {
                                bgcolor: "#FDEDEC",
                                color: "#B42318",
                              },
                            }}
                          >
                            {deletingId === id ? (
                              <CircularProgress
                                size={16}
                                sx={{ color: "#777" }}
                              />
                            ) : (
                              <DeleteOutlineRounded />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </CardContent>
                </MotionCard>
              );
            })}
          </AnimatePresence>
        </Box>
      )}
    </Box>
  );
};

export default Products;
