// Glyrus — Products.jsx

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import {
  FilterAltOutlined,
  SearchOutlined,
  SortOutlined,
  TuneOutlined,
  CloseOutlined,
} from "@mui/icons-material";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import ProductGrid from "../components/products/ProductGrid";

const MotionBox = motion(Box);

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(
    searchParams.get("category") || "all",
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const getProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const apiUrl =
        import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
        "http://localhost:5000/api";

      const response = await axios.get(`${apiUrl}/products`);
      const data = response?.data;

      let productList = [];

      if (Array.isArray(data)) {
        productList = data;
      } else if (Array.isArray(data?.products)) {
        productList = data.products;
      } else if (Array.isArray(data?.data)) {
        productList = data.data;
      }

      setProducts(productList);

      const categorySet = new Set();

      productList.forEach((product) => {
        if (Array.isArray(product?.categories)) {
          product.categories.forEach((item) => {
            if (item) categorySet.add(String(item));
          });
        }

        if (product?.category) {
          categorySet.add(String(product.category));
        }
      });

      setCategories([...categorySet].sort());
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load products right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  useEffect(() => {
    const params = {};

    if (search.trim()) {
      params.search = search.trim();
    }

    if (category !== "all") {
      params.category = category;
    }

    if (sort !== "featured") {
      params.sort = sort;
    }

    setSearchParams(params, { replace: true });
  }, [search, category, sort, setSearchParams]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const searchValue = search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter((product) => {
        const title = String(product?.title || "").toLowerCase();
        const name = String(product?.name || "").toLowerCase();
        const description = String(product?.description || "").toLowerCase();
        const productCategory = String(product?.category || "").toLowerCase();

        const techStack = Array.isArray(product?.techStack)
          ? product.techStack.join(" ").toLowerCase()
          : "";

        return (
          title.includes(searchValue) ||
          name.includes(searchValue) ||
          description.includes(searchValue) ||
          productCategory.includes(searchValue) ||
          techStack.includes(searchValue)
        );
      });
    }

    if (category !== "all") {
      result = result.filter((product) => {
        const selectedCategory = category.toLowerCase();

        const productCategory = String(product?.category || "").toLowerCase();

        const productCategories = Array.isArray(product?.categories)
          ? product.categories.map((item) => String(item).toLowerCase())
          : [];

        return (
          productCategory === selectedCategory ||
          productCategories.includes(selectedCategory)
        );
      });
    }

    if (sort === "price-low") {
      result.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    }

    if (sort === "price-high") {
      result.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    }

    if (sort === "name-az") {
      result.sort((a, b) => getProductName(a).localeCompare(getProductName(b)));
    }

    if (sort === "name-za") {
      result.sort((a, b) => getProductName(b).localeCompare(getProductName(a)));
    }

    if (sort === "newest") {
      result.sort(
        (a, b) =>
          new Date(b?.createdAt || 0).getTime() -
          new Date(a?.createdAt || 0).getTime(),
      );
    }

    return result;
  }, [products, search, category, sort]);

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setSort("featured");
  };

  const activeFilters =
    Boolean(search) || category !== "all" || sort !== "featured";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #ffffff 0%, #fffdf6 48%, #ffffff 100%)",
        pb: { xs: 5, sm: 8, md: 11 },
        overflow: "hidden",
      }}
    >
      {/* ================= HERO ================= */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          pt: { xs: 3.5, sm: 6, md: 8 },
          pb: { xs: 3.2, sm: 5, md: 7 },
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: { xs: 170, md: 360 },
            height: { xs: 170, md: 360 },
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,193,7,.18), transparent 68%)",
            top: -90,
            right: { xs: -70, md: 30 },
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            width: { xs: 140, md: 300 },
            height: { xs: 140, md: 300 },
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,193,7,.10), transparent 70%)",
            bottom: -120,
            left: -70,
            pointerEvents: "none",
          }}
        />

        <Container
          maxWidth="xl"
          sx={{
            position: "relative",
            px: { xs: 1.6, sm: 3, md: 4 },
          }}
        >
          <MotionBox
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <Stack
              spacing={{ xs: 0.9, sm: 1.5 }}
              alignItems="center"
              textAlign="center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <Chip
                  label="Glyrus Collection"
                  icon={<FilterAltOutlined />}
                  sx={{
                    height: { xs: 27, sm: 34 },
                    px: { xs: 0.2, sm: 0.5 },
                    borderRadius: 8,
                    backgroundColor: "#fff8dc",
                    color: "#8a6500",
                    border: "1px solid rgba(218,165,0,.18)",
                    fontWeight: 800,
                    fontSize: { xs: "0.63rem", sm: "0.8rem" },
                    "& .MuiChip-icon": {
                      color: "#d49c00",
                      fontSize: { xs: 14, sm: 18 },
                    },
                  }}
                />
              </motion.div>

              <Typography
                component="h1"
                sx={{
                  fontSize: {
                    xs: "1.65rem",
                    sm: "2.7rem",
                    md: "3.5rem",
                  },
                  lineHeight: 1.05,
                  fontWeight: 950,
                  letterSpacing: "-0.055em",
                  color: "#111",
                }}
              >
                Explore Our{" "}
                <Box component="span" sx={{ color: "#d49b00" }}>
                  Products
                </Box>
              </Typography>

              <Typography
                sx={{
                  maxWidth: 680,
                  color: "#707070",
                  fontSize: {
                    xs: "0.72rem",
                    sm: "0.98rem",
                    md: "1.08rem",
                  },
                  lineHeight: 1.55,
                  px: { xs: 1, sm: 0 },
                }}
              >
                Premium NFC products designed for smarter, faster and more
                connected customer experiences.
              </Typography>
            </Stack>
          </MotionBox>
        </Container>
      </Box>

      {/* ================= CONTENT ================= */}
      <Container
        maxWidth="xl"
        sx={{
          mt: { xs: 1.6, sm: 3.5, md: 5 },
          px: { xs: 1.1, sm: 3, md: 4 },
        }}
      >
        {/* ================= MOBILE SEARCH ================= */}
        <MotionBox
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          sx={{
            display: { xs: "block", md: "none" },
            mb: 1.2,
          }}
        >
          <TextField
            fullWidth
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined
                    sx={{
                      fontSize: 18,
                      color: "#777",
                    }}
                  />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <CloseOutlined
                    onClick={() => setSearch("")}
                    sx={{
                      fontSize: 17,
                      color: "#999",
                      cursor: "pointer",
                    }}
                  />
                </InputAdornment>
              ) : null,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: 42,
                borderRadius: 2.5,
                background: "#fff",
                boxShadow: "0 6px 22px rgba(0,0,0,.045)",
                "& fieldset": {
                  borderColor: "rgba(0,0,0,.08)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#d8a000",
                },
              },
              "& input": {
                fontSize: "0.78rem",
              },
            }}
          />
        </MotionBox>

        {/* ================= MOBILE FILTER BUTTON ================= */}
        <MotionBox
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          sx={{
            display: { xs: "flex", md: "none" },
            gap: 0.8,
            mb: 1.4,
          }}
        >
          <Button
            fullWidth
            startIcon={<TuneOutlined sx={{ fontSize: 17 }} />}
            onClick={() => setShowFilters((prev) => !prev)}
            sx={{
              minHeight: 36,
              borderRadius: 2,
              border: "1px solid rgba(0,0,0,.08)",
              background: "#fff",
              color: "#222",
              fontSize: "0.72rem",
              fontWeight: 800,
              textTransform: "none",
              boxShadow: "0 5px 18px rgba(0,0,0,.04)",
            }}
          >
            Filters & Sort
          </Button>

          {activeFilters && (
            <Button
              onClick={clearFilters}
              sx={{
                minWidth: 72,
                minHeight: 36,
                borderRadius: 2,
                background: "#111",
                color: "#fff",
                fontSize: "0.68rem",
                fontWeight: 800,
                textTransform: "none",
              }}
            >
              Clear
            </Button>
          )}
        </MotionBox>

        {/* ================= FILTER PANEL ================= */}
        <AnimatePresence initial={false}>
          {(showFilters || window.innerWidth >= 900) && (
            <MotionBox
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              sx={{
                overflow: "hidden",
                mb: { xs: 1.5, sm: 3 },
              }}
            >
              <Box
                sx={{
                  p: { xs: 1.1, sm: 2, md: 2.4 },
                  borderRadius: { xs: 2.5, md: 3.5 },
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,.065)",
                  boxShadow: "0 10px 35px rgba(0,0,0,.045)",
                }}
              >
                <Grid
                  container
                  spacing={{ xs: 0.8, sm: 1.5 }}
                  alignItems="center"
                >
                  {/* Desktop Search */}
                  <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{ display: { xs: "none", md: "block" } }}
                  >
                    <TextField
                      fullWidth
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search products..."
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchOutlined
                              sx={{ color: "#777", fontSize: 19 }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    />
                  </Grid>

                  <Grid item xs={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={category}
                        label="Category"
                        onChange={(event) => setCategory(event.target.value)}
                        sx={selectSx}
                      >
                        <MenuItem value="all">All Categories</MenuItem>

                        {categories.map((item) => (
                          <MenuItem key={item} value={item}>
                            {formatCategory(item)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Sort By</InputLabel>
                      <Select
                        value={sort}
                        label="Sort By"
                        onChange={(event) => setSort(event.target.value)}
                        startAdornment={
                          <InputAdornment position="start">
                            <SortOutlined
                              sx={{
                                ml: 0.3,
                                color: "#777",
                                fontSize: 18,
                              }}
                            />
                          </InputAdornment>
                        }
                        sx={selectSx}
                      >
                        <MenuItem value="featured">Featured</MenuItem>
                        <MenuItem value="newest">Newest</MenuItem>
                        <MenuItem value="price-low">
                          Price: Low to High
                        </MenuItem>
                        <MenuItem value="price-high">
                          Price: High to Low
                        </MenuItem>
                        <MenuItem value="name-az">Name: A–Z</MenuItem>
                        <MenuItem value="name-za">Name: Z–A</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Active Filters */}
                {activeFilters && (
                  <Stack
                    direction="row"
                    spacing={0.6}
                    alignItems="center"
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ mt: 1 }}
                  >
                    {search && (
                      <Chip
                        size="small"
                        label={`Search: ${search}`}
                        onDelete={() => setSearch("")}
                        sx={chipSx}
                      />
                    )}

                    {category !== "all" && (
                      <Chip
                        size="small"
                        label={`Category: ${formatCategory(category)}`}
                        onDelete={() => setCategory("all")}
                        sx={chipSx}
                      />
                    )}

                    {sort !== "featured" && (
                      <Chip
                        size="small"
                        label={`Sort: ${getSortLabel(sort)}`}
                        onDelete={() => setSort("featured")}
                        sx={chipSx}
                      />
                    )}

                    <Button
                      size="small"
                      onClick={clearFilters}
                      sx={{
                        color: "#9b7200",
                        fontSize: { xs: "0.63rem", sm: "0.72rem" },
                        fontWeight: 800,
                        textTransform: "none",
                        minWidth: "auto",
                        px: 0.5,
                      }}
                    >
                      Clear all
                    </Button>
                  </Stack>
                )}
              </Box>
            </MotionBox>
          )}
        </AnimatePresence>

        {/* ================= RESULT HEADER ================= */}
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              mt: { xs: 0.5, sm: 2 },
              mb: { xs: 1.2, sm: 2.5 },
              px: { xs: 0.2, sm: 0 },
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: {
                    xs: "0.95rem",
                    sm: "1.35rem",
                    md: "1.5rem",
                  },
                  fontWeight: 900,
                  color: "#111",
                  letterSpacing: "-0.025em",
                }}
              >
                All Products
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  fontSize: {
                    xs: "0.62rem",
                    sm: "0.82rem",
                  },
                  color: "#888",
                }}
              >
                {loading
                  ? "Loading products..."
                  : `${filteredProducts.length} ${
                      filteredProducts.length === 1 ? "product" : "products"
                    } available`}
              </Typography>
            </Box>

            {!loading && products.length > 0 && (
              <Chip
                label={`${filteredProducts.length} results`}
                size="small"
                sx={{
                  height: { xs: 23, sm: 28 },
                  borderRadius: 1.7,
                  fontSize: { xs: "0.58rem", sm: "0.7rem" },
                  fontWeight: 800,
                  backgroundColor: "#111",
                  color: "#fff",
                  "& .MuiChip-label": {
                    px: { xs: 0.9, sm: 1.2 },
                  },
                }}
              />
            )}
          </Stack>
        </MotionBox>

        {/* ================= LOADING ================= */}
        {loading && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            sx={{
              minHeight: { xs: 220, sm: 340 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Stack spacing={1} alignItems="center" sx={{ color: "#555" }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <CircularProgress
                  size={30}
                  thickness={4}
                  sx={{ color: "#d8a000" }}
                />
              </motion.div>

              <Typography
                sx={{
                  fontSize: { xs: "0.68rem", sm: "0.85rem" },
                  fontWeight: 700,
                }}
              >
                Loading products...
              </Typography>
            </Stack>
          </MotionBox>
        )}

        {/* ================= ERROR ================= */}
        {!loading && error && (
          <MotionBox
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert
              severity="error"
              sx={{
                borderRadius: 2.5,
                mb: 2,
                fontSize: { xs: "0.7rem", sm: "0.85rem" },
              }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={getProducts}
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "0.62rem", sm: "0.75rem" },
                  }}
                >
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          </MotionBox>
        )}

        {/* ================= PRODUCTS ================= */}
        {!loading && !error && (
          <AnimatePresence mode="wait">
            {filteredProducts.length > 0 ? (
              <MotionBox
                key={`${category}-${sort}-${search}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                sx={{
                  width: "100%",

                  /* Helps compact ProductGrid layouts on mobile */
                  "& > *": {
                    width: "100%",
                  },

                  "& .MuiGrid-container": {
                    gap: {
                      xs: "8px !important",
                      sm: "16px !important",
                    },
                  },

                  "& .MuiGrid-item": {
                    minWidth: 0,
                  },

                  /* Force common card grids into 2 columns on phones */
                  "@media (max-width:599px)": {
                    "& .MuiGrid-container": {
                      width: "100% !important",
                      margin: "0 !important",
                      display: "grid !important",
                      gridTemplateColumns:
                        "repeat(2, minmax(0, 1fr)) !important",
                      gap: "9px !important",
                    },

                    "& .MuiGrid-item": {
                      width: "100% !important",
                      maxWidth: "100% !important",
                      flexBasis: "auto !important",
                      padding: "0 !important",
                      margin: "0 !important",
                    },

                    "& .MuiCard-root": {
                      width: "100%",
                      minWidth: 0,
                      borderRadius: "13px !important",
                    },

                    "& .MuiCardContent-root": {
                      padding: "9px !important",
                    },

                    "& .MuiTypography-root": {
                      maxWidth: "100%",
                    },
                  },
                }}
              >
                <ProductGrid products={filteredProducts} />
              </MotionBox>
            ) : (
              <MotionBox
                key="empty"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                sx={{
                  minHeight: { xs: 250, sm: 340 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  px: 2,
                }}
              >
                <Stack
                  spacing={{ xs: 0.8, sm: 1.4 }}
                  alignItems="center"
                  maxWidth={420}
                >
                  <motion.div
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: 52, sm: 72 },
                        height: { xs: 52, sm: 72 },
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(145deg,#fff8dc,#fff1b0)",
                        color: "#c28c00",
                        boxShadow: "0 10px 28px rgba(194,140,0,.12)",
                      }}
                    >
                      <SearchOutlined
                        sx={{
                          fontSize: { xs: 24, sm: 34 },
                        }}
                      />
                    </Box>
                  </motion.div>

                  <Typography
                    sx={{
                      fontSize: {
                        xs: "1rem",
                        sm: "1.4rem",
                      },
                      fontWeight: 900,
                      color: "#111",
                    }}
                  >
                    No products found
                  </Typography>

                  <Typography
                    sx={{
                      color: "#777",
                      fontSize: {
                        xs: "0.68rem",
                        sm: "0.9rem",
                      },
                      lineHeight: 1.55,
                    }}
                  >
                    We couldn't find any products matching your current search
                    or filters.
                  </Typography>

                  <Button
                    variant="contained"
                    onClick={clearFilters}
                    sx={{
                      mt: 0.4,
                      px: { xs: 2, sm: 3 },
                      minHeight: { xs: 34, sm: 42 },
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 800,
                      fontSize: { xs: "0.68rem", sm: "0.82rem" },
                      backgroundColor: "#111",
                      boxShadow: "none",
                      "&:hover": {
                        backgroundColor: "#252525",
                        boxShadow: "none",
                      },
                    }}
                  >
                    View All Products
                  </Button>
                </Stack>
              </MotionBox>
            )}
          </AnimatePresence>
        )}
      </Container>
    </Box>
  );
};

/* ================= STYLES ================= */

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 44,
    borderRadius: 2.3,
    backgroundColor: "#fafafa",
    "& fieldset": {
      borderColor: "rgba(0,0,0,.08)",
    },
    "&:hover fieldset": {
      borderColor: "#d8a000",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#d8a000",
    },
  },
  "& input": {
    fontSize: "0.8rem",
  },
};

const selectSx = {
  minHeight: { xs: 42, sm: 44 },
  borderRadius: 2.3,
  backgroundColor: "#fafafa",
  fontSize: { xs: "0.7rem", sm: "0.8rem" },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(0,0,0,.08)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#d8a000",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#d8a000",
  },
};

const chipSx = {
  height: { xs: 24, sm: 28 },
  borderRadius: 1.7,
  backgroundColor: "#fff7d6",
  fontWeight: 700,
  fontSize: { xs: "0.57rem", sm: "0.68rem" },
  "& .MuiChip-deleteIcon": {
    fontSize: { xs: 14, sm: 17 },
  },
};

const getProductPrice = (product) => {
  const candidates = [
    product?.price,
    product?.sellingPrice,
    product?.discountedPrice,
    product?.itemPrices?.single,
    product?.itemPrices?.price,
  ];

  for (const value of candidates) {
    const number = Number(value);

    if (Number.isFinite(number)) {
      return number;
    }
  }

  return 0;
};

const getProductName = (product) =>
  String(product?.title || product?.name || "");

const formatCategory = (value) => {
  return String(value || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getSortLabel = (value) => {
  const labels = {
    newest: "Newest",
    "price-low": "Price: Low to High",
    "price-high": "Price: High to Low",
    "name-az": "Name: A–Z",
    "name-za": "Name: Z–A",
  };

  return labels[value] || "Featured";
};

export default Products;
