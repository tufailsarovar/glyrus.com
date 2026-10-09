// Glyrus — Products.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import formatCurrency from "../../utils/formatCurrency";

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
      0
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
  Number(
    product?.stock ??
      product?.inventory ??
      product?.quantity ??
      0
  );

const getProductCategory = (product) =>
  product?.category || product?.productCategory || "NFC";

const getActiveStatus = (product) => {
  if (typeof product?.isActive === "boolean") {
    return product.isActive;
  }

  if (typeof product?.active === "boolean") {
    return product.active;
  }

  if (typeof product?.status === "string") {
    return product.status.toLowerCase() === "active";
  }

  return true;
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
          "Unable to load products."
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
      const description = String(
        product?.description || ""
      ).toLowerCase();

      return (
        name.includes(query) ||
        category.includes(query) ||
        description.includes(query)
      );
    });
  }, [products, search]);

  const handleDelete = async (product) => {
    const id = product?._id || product?.id;

    if (!id) {
      setError("Product ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Delete "${getProductName(product)}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      await api.delete(`/api/admin/products/${id}`);

      setProducts((previous) =>
        previous.filter(
          (item) =>
            String(item?._id || item?.id) !== String(id)
        )
      );

      setSuccess("Product deleted successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to delete the product."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box sx={{ width: "100%", pb: { xs: 3, md: 5 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: { xs: 2.5, md: 3.5 } }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: {
                xs: "1.55rem",
                sm: "1.9rem",
                md: "2.25rem",
              },
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#111",
            }}
          >
            Products
          </Typography>

          <Typography
            sx={{
              mt: 0.6,
              color: "#777",
              fontSize: {
                xs: "0.82rem",
                sm: "0.9rem",
              },
            }}
          >
            Manage your Glyrus NFC product catalogue.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => navigate("/admin/products/add")}
          sx={{
            minHeight: 44,
            borderRadius: 2.5,
            bgcolor: "#F4C430",
            color: "#111",
            fontWeight: 900,
            "&:hover": {
              bgcolor: "#E5B500",
            },
          }}
        >
          Add Product
        </Button>
      </Stack>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{ mb: 2.5, borderRadius: 3 }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess("")}
          sx={{ mb: 2.5, borderRadius: 3 }}
        >
          {success}
        </Alert>
      )}

      <Card
        elevation={0}
        sx={{
          mb: 2.5,
          borderRadius: { xs: 3, md: 4 },
        }}
      >
        <CardContent
          sx={{
            p: { xs: 1.5, sm: 2 },
            "&:last-child": {
              pb: { xs: 1.5, sm: 2 },
            },
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <TextField
              fullWidth
              size="small"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search products..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded
                      sx={{
                        color: "#999",
                        fontSize: 21,
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                maxWidth: {
                  sm: 460,
                },
              }}
            />

            <Button
              variant="outlined"
              startIcon={
                refreshing ? (
                  <CircularProgress size={17} />
                ) : (
                  <RefreshRounded />
                )
              }
              disabled={refreshing}
              onClick={() => fetchProducts(false)}
              sx={{
                minHeight: 40,
                borderRadius: 2.5,
                borderColor: "#DDDDDD",
                color: "#444",
                whiteSpace: "nowrap",
                "&:hover": {
                  borderColor: "#F4C430",
                  bgcolor: "#FFFBEA",
                },
              }}
            >
              Refresh
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <Box
          sx={{
            minHeight: 350,
            display: "grid",
            placeItems: "center",
          }}
        >
          <CircularProgress
            size={34}
            thickness={4}
            sx={{ color: "#F4C430" }}
          />
        </Box>
      ) : filteredProducts.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            borderRadius: { xs: 3, md: 4 },
          }}
        >
          <CardContent
            sx={{
              minHeight: 330,
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              px: 2,
            }}
          >
            <Box>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  display: "grid",
                  placeItems: "center",
                  mx: "auto",
                  bgcolor: "#FFF7D2",
                  color: "#A17B00",
                  mb: 2,
                }}
              >
                <Inventory2Rounded sx={{ fontSize: 32 }} />
              </Box>

              <Typography
                sx={{
                  fontWeight: 900,
                  color: "#222",
                  fontSize: "1rem",
                }}
              >
                {search
                  ? "No products found"
                  : "No products available"}
              </Typography>

              <Typography
                sx={{
                  mt: 0.7,
                  color: "#999",
                  fontSize: "0.8rem",
                }}
              >
                {search
                  ? "Try a different search term."
                  : "Add your first Glyrus product to get started."}
              </Typography>

              {!search && (
                <Button
                  variant="contained"
                  startIcon={<AddRounded />}
                  onClick={() =>
                    navigate("/admin/products/add")
                  }
                  sx={{
                    mt: 2,
                    bgcolor: "#F4C430",
                    color: "#111",
                    "&:hover": {
                      bgcolor: "#E5B500",
                    },
                  }}
                >
                  Add Product
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
              xl: "repeat(4, minmax(0, 1fr))",
            },
            gap: { xs: 1.5, sm: 2, lg: 2.5 },
          }}
        >
          {filteredProducts.map((product, index) => {
            const id = product?._id || product?.id;
            const image = getProductImage(product);
            const stock = getProductStock(product);
            const active = getActiveStatus(product);

            return (
              <MotionCard
                key={id || index}
                elevation={0}
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.3,
                  delay: Math.min(index * 0.04, 0.25),
                }}
                sx={{
                  borderRadius: { xs: 3, md: 3.5 },
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                  transition:
                    "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    borderColor: "#E5D27B",
                    boxShadow:
                      "0 16px 38px rgba(17,17,17,0.09)",
                  },
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    aspectRatio: "1 / 0.78",
                    bgcolor: "#F8F8F8",
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
                        transition:
                          "transform 400ms ease",
                        "&:hover": {
                          transform: "scale(1.04)",
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
                        color: "#C5C5C5",
                      }}
                    >
                      <Inventory2Rounded
                        sx={{ fontSize: 48 }}
                      />
                    </Box>
                  )}

                  <Chip
                    size="small"
                    label={active ? "Active" : "Inactive"}
                    sx={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      height: 27,
                      bgcolor: active
                        ? "#EAF7EE"
                        : "#F2F2F2",
                      color: active
                        ? "#287A3E"
                        : "#777",
                      fontSize: "0.67rem",
                      fontWeight: 900,
                    }}
                  />
                </Box>

                <CardContent
                  sx={{
                    p: { xs: 1.7, sm: 2 },
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    "&:last-child": {
                      pb: { xs: 1.7, sm: 2 },
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.72rem",
                      color: "#A17B00",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {getProductCategory(product)}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: {
                        xs: "0.95rem",
                        sm: "1rem",
                      },
                      fontWeight: 900,
                      color: "#181818",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {getProductName(product)}
                  </Typography>

                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ mt: 1.5 }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize: "1rem",
                        color: "#111",
                      }}
                    >
                      {formatCurrency(
                        getProductPrice(product)
                      )}
                    </Typography>

                    <Chip
                      size="small"
                      label={`Stock: ${stock}`}
                      sx={{
                        height: 25,
                        bgcolor:
                          stock <= 0
                            ? "#FDEDEC"
                            : stock <= 5
                            ? "#FFF4E5"
                            : "#F4F4F4",
                        color:
                          stock <= 0
                            ? "#B3261E"
                            : stock <= 5
                            ? "#9A5B00"
                            : "#666",
                        fontSize: "0.64rem",
                        fontWeight: 800,
                      }}
                    />
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 2 }}
                  >
                    <Tooltip title="Edit product">
                      <IconButton
                        onClick={() =>
                          navigate(
                            `/admin/products/edit/${id}`
                          )
                        }
                        disabled={!id}
                        sx={{
                          flex: 1,
                          borderRadius: 2,
                          border: "1px solid #E3E3E3",
                          color: "#555",
                          "&:hover": {
                            bgcolor: "#FFF9DF",
                            borderColor: "#E3C94C",
                            color: "#876600",
                          },
                        }}
                      >
                        <EditRounded sx={{ fontSize: 19 }} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete product">
                      <IconButton
                        onClick={() =>
                          handleDelete(product)
                        }
                        disabled={
                          !id || deletingId === id
                        }
                        sx={{
                          flex: 1,
                          borderRadius: 2,
                          border: "1px solid #E3E3E3",
                          color: "#777",
                          "&:hover": {
                            bgcolor: "#FDEDEC",
                            borderColor: "#E8B4B0",
                            color: "#B3261E",
                          },
                        }}
                      >
                        {deletingId === id ? (
                          <CircularProgress
                            size={19}
                            sx={{ color: "#777" }}
                          />
                        ) : (
                          <DeleteOutlineRounded
                            sx={{ fontSize: 20 }}
                          />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardContent>
              </MotionCard>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default Products;