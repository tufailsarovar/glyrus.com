// Glyrus — Search.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowBack, CloseOutlined, SearchOutlined } from "@mui/icons-material";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import ProductGrid from "../components/products/ProductGrid";

const MotionBox = motion(Box);

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery =
    searchParams.get("q") ||
    searchParams.get("search") ||
    searchParams.get("query") ||
    "";

  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const urlQuery =
      searchParams.get("q") ||
      searchParams.get("search") ||
      searchParams.get("query") ||
      "";

    setQuery(urlQuery);
    setInputValue(urlQuery);
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/api/products");

        if (!mounted) return;

        const data = response?.data ?? response;

        let list = [];

        if (Array.isArray(data)) {
          list = data;
        } else if (Array.isArray(data?.products)) {
          list = data.products;
        } else if (Array.isArray(data?.data)) {
          list = Array.isArray(data.data)
            ? data.data
            : data.data?.products || [];
        } else if (Array.isArray(response?.products)) {
          list = response.products;
        }

        setProducts(list);
      } catch (err) {
        if (!mounted) return;

        console.error("Search products error:", err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load products. Please try again.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) {
      return [];
    }

    return products.filter((product) => {
      const searchableText = [
        product?.name,
        product?.title,
        product?.productName,
        product?.description,
        product?.category,
        product?.subcategory,
        ...(Array.isArray(product?.categories) ? product.categories : []),
        ...(Array.isArray(product?.tags) ? product.tags : []),
        ...(Array.isArray(product?.techStack) ? product.techStack : []),
        product?.sku,
      ]
        .filter(Boolean)
        .map(String)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(value);
    });
  }, [products, query]);

  const handleSearch = (event) => {
    event?.preventDefault();

    const value = inputValue.trim();

    if (!value) {
      setSearchParams({});
      return;
    }

    setSearchParams({
      q: value,
    });
  };

  const clearSearch = () => {
    setInputValue("");
    setQuery("");
    setSearchParams({});
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #fff 0%, #fffdf7 50%, #fff 100%)",
        pb: { xs: 7, sm: 9, md: 12 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          pt: { xs: 4.5, sm: 6, md: 8 },
          pb: { xs: 4, sm: 5, md: 6 },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: { xs: 190, md: 330 },
            height: { xs: 190, md: 330 },
            borderRadius: "50%",
            top: -120,
            right: { xs: -80, md: 30 },
            background:
              "radial-gradient(circle, rgba(255,193,7,0.20), rgba(255,193,7,0))",
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            width: { xs: 150, md: 260 },
            height: { xs: 150, md: 260 },
            borderRadius: "50%",
            bottom: -120,
            left: { xs: -80, md: 60 },
            background:
              "radial-gradient(circle, rgba(255,193,7,0.13), rgba(255,193,7,0))",
            pointerEvents: "none",
          }}
        />

        <Container
          maxWidth="md"
          sx={{
            position: "relative",
          }}
        >
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Stack alignItems="center" spacing={1.4} textAlign="center">
              <Chip
                icon={<SearchOutlined />}
                label="Glyrus Search"
                sx={{
                  height: 34,
                  borderRadius: 10,
                  px: 0.5,
                  backgroundColor: "#fff7d5",
                  color: "#8b6500",
                  border: "1px solid rgba(210,160,0,0.18)",
                  fontWeight: 800,
                  "& .MuiChip-icon": {
                    color: "#c28d00",
                  },
                }}
              />

              <Typography
                component="h1"
                sx={{
                  fontSize: {
                    xs: "2rem",
                    sm: "2.7rem",
                    md: "3.2rem",
                  },
                  lineHeight: 1.08,
                  fontWeight: 900,
                  letterSpacing: "-0.045em",
                  color: "#111",
                }}
              >
                Find Your{" "}
                <Box
                  component="span"
                  sx={{
                    color: "#d69e00",
                  }}
                >
                  NFC Product
                </Box>
              </Typography>

              <Typography
                sx={{
                  maxWidth: 610,
                  color: "#6d6d6d",
                  fontSize: {
                    xs: "0.9rem",
                    sm: "0.98rem",
                  },
                  lineHeight: 1.7,
                }}
              >
                Search through our collection of premium NFC products and find
                the right option for your business.
              </Typography>
            </Stack>
          </MotionBox>

          {/* Search Form */}
          <MotionBox
            component="form"
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.12,
            }}
            sx={{
              mt: { xs: 3, sm: 4 },
            }}
          >
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1.2}
            >
              <TextField
                fullWidth
                autoFocus
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Search NFC cards, tags, products..."
                aria-label="Search products"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined
                        sx={{
                          color: "#777",
                        }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: inputValue && (
                    <InputAdornment position="end">
                      <Button
                        onClick={clearSearch}
                        aria-label="Clear search"
                        sx={{
                          minWidth: 34,
                          width: 34,
                          height: 34,
                          p: 0,
                          borderRadius: "50%",
                          color: "#777",
                        }}
                      >
                        <CloseOutlined fontSize="small" />
                      </Button>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    minHeight: 54,
                    borderRadius: 3,
                    backgroundColor: "#fff",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.055)",
                    "& fieldset": {
                      borderColor: "rgba(0,0,0,0.09)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#d8a000",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#d8a000",
                      borderWidth: 1,
                    },
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                startIcon={<SearchOutlined />}
                sx={{
                  minHeight: {
                    xs: 50,
                    sm: 54,
                  },
                  minWidth: {
                    xs: "100%",
                    sm: 135,
                  },
                  px: 3,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 800,
                  backgroundColor: "#111",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "#292929",
                    boxShadow: "none",
                  },
                }}
              >
                Search
              </Button>
            </Stack>
          </MotionBox>
        </Container>
      </Box>

      <Container
        maxWidth="xl"
        sx={{
          mt: { xs: 3.5, sm: 4.5, md: 5 },
        }}
      >
        {/* Empty Search State */}
        {!query.trim() && !loading && !error && (
          <MotionBox
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
              minHeight: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              px: 2,
            }}
          >
            <Stack
              alignItems="center"
              spacing={1.5}
              sx={{
                maxWidth: 500,
              }}
            >
              <Box
                sx={{
                  width: 76,
                  height: 76,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#fff6cf",
                  color: "#bd8800",
                }}
              >
                <SearchOutlined
                  sx={{
                    fontSize: 38,
                  }}
                />
              </Box>

              <Typography
                sx={{
                  fontSize: {
                    xs: "1.25rem",
                    sm: "1.5rem",
                  },
                  fontWeight: 900,
                  color: "#111",
                }}
              >
                What are you looking for?
              </Typography>

              <Typography
                sx={{
                  color: "#777",
                  fontSize: "0.9rem",
                  lineHeight: 1.7,
                }}
              >
                Enter a product name, category, feature or keyword above to
                start searching.
              </Typography>
            </Stack>
          </MotionBox>
        )}

        {/* Loading */}
        {loading && (
          <Box
            sx={{
              minHeight: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Stack alignItems="center" spacing={1.5}>
              <CircularProgress
                size={40}
                thickness={4}
                sx={{
                  color: "#d8a000",
                }}
              />

              <Typography
                sx={{
                  color: "#666",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                }}
              >
                Loading products...
              </Typography>
            </Stack>
          </Box>
        )}

        {/* Error */}
        {!loading && error && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            sx={{
              minHeight: 260,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              px: 2,
            }}
          >
            <Stack spacing={1.5} alignItems="center">
              <Typography
                sx={{
                  color: "#c62828",
                  fontWeight: 700,
                }}
              >
                {error}
              </Typography>

              <Button
                onClick={() => window.location.reload()}
                variant="contained"
                sx={darkButtonSx}
              >
                Try Again
              </Button>
            </Stack>
          </MotionBox>
        )}

        {/* Results */}
        {!loading && !error && query.trim() && (
          <AnimatePresence mode="wait">
            {results.length > 0 ? (
              <MotionBox
                key={`results-${query}`}
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                transition={{
                  duration: 0.35,
                }}
              >
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  alignItems={{
                    xs: "flex-start",
                    sm: "center",
                  }}
                  justifyContent="space-between"
                  spacing={1}
                  sx={{
                    mb: 2.5,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "1.2rem",
                          sm: "1.4rem",
                        },
                        fontWeight: 900,
                        color: "#111",
                      }}
                    >
                      Search Results
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.4,
                        color: "#777",
                        fontSize: "0.86rem",
                      }}
                    >
                      Results for{" "}
                      <Box
                        component="span"
                        sx={{
                          color: "#a67400",
                          fontWeight: 800,
                        }}
                      >
                        "{query}"
                      </Box>
                    </Typography>
                  </Box>

                  <Chip
                    label={`${results.length} ${
                      results.length === 1 ? "product" : "products"
                    }`}
                    size="small"
                    sx={{
                      borderRadius: 2,
                      backgroundColor: "#111",
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  />
                </Stack>

                <ProductGrid products={results} />
              </MotionBox>
            ) : (
              <MotionBox
                key={`no-results-${query}`}
                initial={{
                  opacity: 0,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                sx={{
                  minHeight: 320,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  px: 2,
                }}
              >
                <Stack
                  alignItems="center"
                  spacing={1.5}
                  sx={{
                    maxWidth: 500,
                  }}
                >
                  <Box
                    sx={{
                      width: 76,
                      height: 76,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#fff6cf",
                      color: "#bd8800",
                    }}
                  >
                    <SearchOutlined
                      sx={{
                        fontSize: 38,
                      }}
                    />
                  </Box>

                  <Typography
                    sx={{
                      fontSize: {
                        xs: "1.25rem",
                        sm: "1.5rem",
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
                      fontSize: "0.9rem",
                      lineHeight: 1.7,
                    }}
                  >
                    We couldn't find any product matching "{query}". Try another
                    keyword or browse the complete collection.
                  </Typography>

                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    spacing={1}
                    sx={{
                      mt: 0.5,
                      width: {
                        xs: "100%",
                        sm: "auto",
                      },
                    }}
                  >
                    <Button
                      onClick={clearSearch}
                      variant="contained"
                      sx={{
                        ...darkButtonSx,
                        minWidth: {
                          xs: "100%",
                          sm: 150,
                        },
                      }}
                    >
                      Clear Search
                    </Button>

                    <Button
                      component={Link}
                      to="/products"
                      variant="outlined"
                      startIcon={<ArrowBack />}
                      sx={{
                        minHeight: 44,
                        minWidth: {
                          xs: "100%",
                          sm: 150,
                        },
                        borderRadius: 2.5,
                        borderColor: "rgba(0,0,0,0.15)",
                        color: "#222",
                        textTransform: "none",
                        fontWeight: 800,
                        "&:hover": {
                          borderColor: "#d8a000",
                          backgroundColor: "#fffaf0",
                        },
                      }}
                    >
                      All Products
                    </Button>
                  </Stack>
                </Stack>
              </MotionBox>
            )}
          </AnimatePresence>
        )}

        {/* Popular Search Suggestions */}
        {!loading && !error && !query.trim() && products.length > 0 && (
          <MotionBox
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.15,
            }}
            sx={{
              mt: 1,
              p: { xs: 2, sm: 3 },
              borderRadius: { xs: 3, md: 4 },
              backgroundColor: "#fff",
              border: "1px solid rgba(0,0,0,0.07)",
              boxShadow: "0 10px 35px rgba(0,0,0,0.045)",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.95rem",
                fontWeight: 800,
                color: "#222",
                mb: 1.5,
              }}
            >
              Quick Search
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {getSuggestedSearches(products).map((item) => (
                <Chip
                  key={item}
                  label={item}
                  onClick={() => {
                    setInputValue(item);
                    setSearchParams({
                      q: item,
                    });
                  }}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: "#fff8dc",
                    color: "#806000",
                    border: "1px solid rgba(215,165,0,0.15)",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "#ffefad",
                      transform: "translateY(-1px)",
                    },
                  }}
                />
              ))}
            </Stack>
          </MotionBox>
        )}
      </Container>
    </Box>
  );
};

const getSuggestedSearches = (products) => {
  const suggestions = [];

  products.forEach((product) => {
    if (product?.category) {
      suggestions.push(String(product.category));
    }

    if (Array.isArray(product?.categories)) {
      suggestions.push(...product.categories.map(String));
    }

    if (Array.isArray(product?.tags)) {
      suggestions.push(...product.tags.map(String));
    }
  });

  return [...new Set(suggestions)].filter(Boolean).slice(0, 8);
};

const darkButtonSx = {
  minHeight: 44,
  px: 2.5,
  borderRadius: 2.5,
  backgroundColor: "#111",
  color: "#fff",
  textTransform: "none",
  fontWeight: 800,
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#292929",
    boxShadow: "none",
  },
};

export default Search;
