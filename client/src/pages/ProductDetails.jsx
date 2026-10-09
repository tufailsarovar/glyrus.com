// Glyrus — ProductDetails.jsx

import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Link as MuiLink,
  Rating,
  Stack,
  Typography,
} from "@mui/material";

import {
  CheckCircleOutline,
  HomeOutlined,
  LocalShippingOutlined,
  ShoppingCartOutlined,
  SupportAgentOutlined,
} from "@mui/icons-material";

import { motion } from "framer-motion";

import { Link, useNavigate, useParams } from "react-router-dom";

import { getProduct } from "../services/api";

import ProductCustomization from "../components/products/ProductCustomization";
import ProductGallery from "../components/products/ProductGallery";
import ProductVideo from "../components/products/ProductVideo";
import { useCart } from "../hooks/useCart";
import NotFound from "./NotFound";

const MotionBox = motion(Box);

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, getCartItem, updateQuantity, removeFromCart } = useCart();

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [selectedCustomization, setSelectedCustomization] = useState({});

  const [adding, setAdding] = useState(false);

  const [added, setAdded] = useState(false);
  const cartItem = getCartItem(product?._id || product?.id);
  const cartQuantity = Number(cartItem?.quantity) || 0;

  useEffect(() => {
    let mounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        setProduct(null);

        const response = await getProduct(id);

        const data = response?.data;

        const productData = data?.product ?? data?.data ?? data;

        if (
          !productData ||
          typeof productData !== "object" ||
          Array.isArray(productData)
        ) {
          throw new Error("Product not found");
        }

        if (mounted) {
          setProduct(productData);
        }
      } catch (err) {
        if (!mounted) return;

        setProduct(null);

        const status = err?.response?.status;

        if (status === 404) {
          setError("Product not found");
        } else {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load this product.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchProduct();
    } else {
      setError("Product not found");
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  const productName = useMemo(
    () => product?.title || product?.name || "NFC Product",
    [product],
  );

  const productDescription = useMemo(
    () =>
      product?.description ||
      "Premium NFC product designed for modern businesses.",
    [product],
  );

  const productPrice = useMemo(() => getProductPrice(product), [product]);

  const productImages = useMemo(() => {
    if (!product) return [];

    const images = [];

    if (Array.isArray(product.images)) {
      product.images.forEach((image) => {
        if (typeof image === "string") {
          images.push(image);
        } else if (image?.url) {
          images.push(image.url);
        } else if (image?.secure_url) {
          images.push(image.secure_url);
        } else if (image?.src) {
          images.push(image.src);
        }
      });
    }

    if (typeof product.image === "string" && product.image) {
      images.push(product.image);
    }

    if (typeof product.thumbnail === "string" && product.thumbnail) {
      images.push(product.thumbnail);
    }

    if (typeof product.imageUrl === "string" && product.imageUrl) {
      images.push(product.imageUrl);
    }

    return [...new Set(images.filter(Boolean))];
  }, [product]);

  const handleIncreaseCartQuantity = () => {
    if (!product) return;

    const productId = product._id || product.id;

    if (cartQuantity > 0) {
      updateQuantity(productId, cartQuantity + 1);
    }
  };

  const handleDecreaseCartQuantity = () => {
    if (!product || cartQuantity <= 0) return;

    const productId = product._id || product.id;

    if (cartQuantity === 1) {
      removeFromCart(productId);
      return;
    }

    updateQuantity(productId, cartQuantity - 1);
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setAdding(true);

      const cartItem = {
        ...product,
        quantity,
        customization: selectedCustomization,
      };

      await Promise.resolve(addToCart(cartItem));

      setAdded(true);

      window.setTimeout(() => {
        setAdded(false);
      }, 2200);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    try {
      setAdding(true);

      const cartItem = {
        ...product,
        quantity,
        customization: selectedCustomization,
      };

      await Promise.resolve(addToCart(cartItem));

      navigate("/cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
        }}
      >
        <Stack alignItems="center" spacing={1.5}>
          <CircularProgress
            size={42}
            thickness={4}
            sx={{
              color: "#d9a000",
            }}
          />

          <Typography
            sx={{
              color: "#666",
              fontSize: "0.92rem",
              fontWeight: 600,
            }}
          >
            Loading product...
          </Typography>
        </Stack>
      </Box>
    );
  }

  /*
   * IMPORTANT:
   * Invalid/non-existing product IDs now
   * render the complete Glyrus NotFound page
   * instead of the small "Product not found"
   * alert.
   */
  if (error || !product) {
    return <NotFound />;
  }

  const category = product?.category || "NFC Products";

  const rating = Number(product?.rating || 0);

  const reviewCount = Number(
    product?.reviewCount || product?.reviewsCount || 0,
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #fff 0%, #fffdf7 55%, #fff 100%)",
        pb: {
          xs: 7,
          md: 10,
        },
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          pt: {
            xs: 2,
            sm: 3,
            md: 4,
          },
        }}
      >
        {/* Breadcrumbs */}

        <Breadcrumbs
          separator="›"
          sx={{
            mb: {
              xs: 2.5,
              md: 4,
            },
            "& .MuiBreadcrumbs-separator": {
              color: "#aaa",
            },
          }}
        >
          <MuiLink
            component={Link}
            to="/"
            underline="none"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              color: "#777",
              fontSize: "0.84rem",
              fontWeight: 600,
              "&:hover": {
                color: "#b17d00",
              },
            }}
          >
            <HomeOutlined
              sx={{
                fontSize: 17,
              }}
            />
            Home
          </MuiLink>

          <MuiLink
            component={Link}
            to="/products"
            underline="none"
            sx={{
              color: "#777",
              fontSize: "0.84rem",
              fontWeight: 600,
              "&:hover": {
                color: "#b17d00",
              },
            }}
          >
            Products
          </MuiLink>

          <Typography
            sx={{
              color: "#222",
              fontSize: "0.84rem",
              fontWeight: 700,
              maxWidth: {
                xs: 130,
                sm: 280,
              },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {productName}
          </Typography>
        </Breadcrumbs>

        {/* Product Section */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0, 1.05fr) minmax(0, 0.95fr)",
            },
            gap: {
              xs: 3,
              sm: 4,
              md: 5,
              lg: 7,
            },
            alignItems: "start",
          }}
        >
          {/* Gallery */}

          <MotionBox
            initial={{
              opacity: 0,
              x: -25,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.55,
            }}
          >
            <ProductGallery images={productImages} product={product} />
          </MotionBox>

          {/* Product Information */}

          <MotionBox
            initial={{
              opacity: 0,
              x: 25,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.55,
              delay: 0.08,
            }}
          >
            <Stack
              spacing={{
                xs: 2,
                sm: 2.5,
              }}
            >
              <Chip
                label={formatCategory(category)}
                size="small"
                sx={{
                  width: "fit-content",
                  borderRadius: 1.8,
                  backgroundColor: "#fff4c7",
                  color: "#8c6500",
                  border: "1px solid rgba(215,164,0,0.18)",
                  fontWeight: 800,
                  px: 0.4,
                }}
              />

              <Typography
                component="h1"
                sx={{
                  fontSize: {
                    xs: "1.8rem",
                    sm: "2.3rem",
                    md: "2.7rem",
                  },
                  lineHeight: 1.12,
                  letterSpacing: "-0.04em",
                  fontWeight: 900,
                  color: "#111",
                }}
              >
                {productName}
              </Typography>

              {rating > 0 && (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Rating
                    value={rating}
                    precision={0.1}
                    readOnly
                    size="small"
                    sx={{
                      "& .MuiRating-iconFilled": {
                        color: "#e0a400",
                      },
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: "0.86rem",
                      color: "#666",
                      fontWeight: 600,
                    }}
                  >
                    {rating.toFixed(1)}

                    {reviewCount > 0 &&
                      ` (${reviewCount} ${
                        reviewCount === 1 ? "review" : "reviews"
                      })`}
                  </Typography>
                </Stack>
              )}

              <Typography
                sx={{
                  color: "#666",
                  fontSize: {
                    xs: "0.93rem",
                    sm: "1rem",
                  },
                  lineHeight: 1.8,
                }}
              >
                {productDescription}
              </Typography>

              <Divider />

              {/* Price */}

              <Stack
                direction="row"
                alignItems="baseline"
                spacing={1.5}
                flexWrap="wrap"
              >
                <Typography
                  sx={{
                    fontSize: {
                      xs: "1.9rem",
                      sm: "2.2rem",
                    },
                    lineHeight: 1,
                    fontWeight: 900,
                    color: "#111",
                    letterSpacing: "-0.035em",
                  }}
                >
                  {formatCurrency(productPrice)}
                </Typography>

                {getOriginalPrice(product) > productPrice && (
                  <Typography
                    sx={{
                      color: "#999",
                      textDecoration: "line-through",
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    {formatCurrency(getOriginalPrice(product))}
                  </Typography>
                )}

                {getDiscountPercentage(product) > 0 && (
                  <Chip
                    label={`${getDiscountPercentage(product)}% OFF`}
                    size="small"
                    sx={{
                      height: 26,
                      borderRadius: 1.5,
                      backgroundColor: "#111",
                      color: "#fff",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                    }}
                  />
                )}
              </Stack>

              <Typography
                sx={{
                  color: "#888",
                  fontSize: "0.78rem",
                }}
              >
                Inclusive of applicable taxes
              </Typography>

              {/* Features */}

              <Stack spacing={1.2}>
                <Feature
                  icon={<CheckCircleOutline />}
                  text="Premium quality NFC product"
                />

                <Feature
                  icon={<LocalShippingOutlined />}
                  text="Secure packaging and reliable delivery"
                />

                <Feature
                  icon={<SupportAgentOutlined />}
                  text="Support available for your order"
                />
              </Stack>

              {/* Customization */}

              {hasCustomization(product) && (
                <Box
                  sx={{
                    mt: 0.5,
                    p: {
                      xs: 1.5,
                      sm: 2,
                    },
                    borderRadius: 3,
                    backgroundColor: "#fff",
                    border: "1px solid rgba(0,0,0,0.07)",
                    boxShadow: "0 8px 28px rgba(0,0,0,0.045)",
                  }}
                >
                  <ProductCustomization
                    product={product}
                    value={selectedCustomization}
                    onChange={handleCustomizationChange}
                  />
                </Box>
              )}

              {/* Cart Actions */}
              <Stack spacing={1.2}>
                {cartQuantity > 0 ? (
                  <Box
                    sx={{
                      width: "100%",
                      minHeight: 50,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid rgba(215,164,0,0.35)",
                      borderRadius: 2.5,
                      backgroundColor: "#fff",
                      boxShadow: "0 6px 20px rgba(215,164,0,0.08)",
                      overflow: "hidden",
                    }}
                  >
                    <IconButton
                      onClick={handleDecreaseCartQuantity}
                      aria-label="Decrease quantity"
                      sx={{
                        width: 58,
                        height: 50,
                        borderRadius: 0,
                        color: "#222",
                        "&:hover": {
                          backgroundColor: "#fff9e5",
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "1.35rem",
                          lineHeight: 1,
                          fontWeight: 600,
                        }}
                      >
                        −
                      </Typography>
                    </IconButton>

                    <Typography
                      sx={{
                        minWidth: 55,
                        textAlign: "center",
                        fontSize: "1rem",
                        fontWeight: 900,
                        color: "#b17d00",
                      }}
                    >
                      {cartQuantity}
                    </Typography>

                    <IconButton
                      onClick={handleIncreaseCartQuantity}
                      disabled={cartQuantity >= getMaxQuantity(product)}
                      aria-label="Increase quantity"
                      sx={{
                        width: 58,
                        height: 50,
                        borderRadius: 0,
                        color: "#222",
                        "&:hover": {
                          backgroundColor: "#fff9e5",
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "1.35rem",
                          lineHeight: 1,
                          fontWeight: 600,
                        }}
                      >
                        +
                      </Typography>
                    </IconButton>
                  </Box>
                ) : (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ShoppingCartOutlined />}
                    onClick={handleAddToCart}
                    disabled={adding}
                    sx={{
                      ...secondaryButtonSx,
                      minHeight: 50,
                      borderRadius: 2.5,
                      fontSize: "0.9rem",
                    }}
                  >
                    {adding ? "Adding..." : "Add to Cart"}
                  </Button>
                )}

                {/* Buy Now */}
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleBuyNow}
                  disabled={adding}
                  sx={{
                    ...primaryButtonSx,
                    minHeight: 50,
                  }}
                >
                  Buy Now
                </Button>
              </Stack>

              {/* Delivery Note */}

              <Box
                sx={{
                  p: 1.7,
                  borderRadius: 2.5,
                  backgroundColor: "#fff9e5",
                  border: "1px solid rgba(220,170,0,0.14)",
                }}
              >
                <Stack direction="row" spacing={1.2} alignItems="flex-start">
                  <LocalShippingOutlined
                    sx={{
                      mt: 0.1,
                      color: "#b47d00",
                      fontSize: 21,
                    }}
                  />

                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.86rem",
                        fontWeight: 800,
                        color: "#332700",
                      }}
                    >
                      Delivery & Order Support
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.35,
                        fontSize: "0.78rem",
                        lineHeight: 1.55,
                        color: "#76652e",
                      }}
                    >
                      After placing your order, you will receive order and
                      tracking details on your email.
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </MotionBox>
        </Box>

        {/* Product Video */}

        {hasVideo(product) && (
          <MotionBox
            initial={{
              opacity: 0,
              y: 25,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.15,
            }}
            transition={{
              duration: 0.5,
            }}
            sx={{
              mt: {
                xs: 6,
                md: 9,
              },
            }}
          >
            <ProductVideo product={product} />
          </MotionBox>
        )}

        {/* Description / Details */}

        <MotionBox
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.15,
          }}
          transition={{
            duration: 0.5,
          }}
          sx={{
            mt: {
              xs: 6,
              md: 9,
            },
            p: {
              xs: 2,
              sm: 3,
              md: 4,
            },
            borderRadius: {
              xs: 3,
              md: 4,
            },
            backgroundColor: "#fff",
            border: "1px solid rgba(0,0,0,0.07)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.045)",
          }}
        >
          <Typography
            sx={{
              fontSize: {
                xs: "1.25rem",
                sm: "1.45rem",
              },
              fontWeight: 900,
              color: "#111",
              mb: 1.2,
            }}
          >
            Product Details
          </Typography>

          <Typography
            sx={{
              color: "#666",
              fontSize: "0.94rem",
              lineHeight: 1.8,
            }}
          >
            {productDescription}
          </Typography>

          {Array.isArray(product?.features) && product.features.length > 0 && (
            <Box
              sx={{
                mt: 3,
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
                gap: 1.2,
              }}
            >
              {product.features.map((feature, index) => (
                <Stack
                  key={`${String(feature)}-${index}`}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    p: 1.3,
                    borderRadius: 2,
                    backgroundColor: "#fafafa",
                  }}
                >
                  <CheckCircleOutline
                    sx={{
                      color: "#d5a000",
                      fontSize: 19,
                    }}
                  />

                  <Typography
                    sx={{
                      color: "#444",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                    }}
                  >
                    {typeof feature === "string"
                      ? feature
                      : feature?.title || feature?.name || ""}
                  </Typography>
                </Stack>
              ))}
            </Box>
          )}

          {Array.isArray(product?.techStack) &&
            product.techStack.length > 0 && (
              <Stack
                direction="row"
                spacing={0.8}
                flexWrap="wrap"
                useFlexGap
                sx={{
                  mt: 3,
                }}
              >
                {product.techStack.map((item, index) => (
                  <Chip
                    key={`${item}-${index}`}
                    label={item}
                    size="small"
                    sx={{
                      borderRadius: 1.5,
                      backgroundColor: "#f5f5f5",
                      color: "#555",
                      fontWeight: 600,
                    }}
                  />
                ))}
              </Stack>
            )}
        </MotionBox>
      </Container>
    </Box>
  );
};

/* =======================================================
   FEATURE
======================================================= */

const Feature = ({ icon, text }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        backgroundColor: "#fff5ca",
        color: "#bd8500",
        "& svg": {
          fontSize: 17,
        },
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        color: "#555",
        fontSize: "0.83rem",
        fontWeight: 600,
      }}
    >
      {text}
    </Typography>
  </Stack>
);

/* =======================================================
   PRODUCT PRICE
======================================================= */

const getProductPrice = (product) => {
  if (!product) return 0;

  const originalPrice = Number(product?.price) || 0;
  const discountPrice = Number(product?.discountPrice) || 0;

  if (discountPrice > 0 && originalPrice > 0 && discountPrice < originalPrice) {
    return discountPrice;
  }

  return originalPrice;
};

/* =======================================================
   ORIGINAL PRICE
======================================================= */

const getOriginalPrice = (product) => {
  if (!product) return 0;

  const originalPrice = Number(product?.price) || 0;
  const discountPrice = Number(product?.discountPrice) || 0;

  if (discountPrice > 0 && originalPrice > 0 && discountPrice < originalPrice) {
    return originalPrice;
  }

  return 0;
};

/* =======================================================
   DISCOUNT
======================================================= */

const getDiscountPercentage = (product) => {
  const original = getOriginalPrice(product);
  const current = getProductPrice(product);

  if (!original || !current || original <= current) {
    return 0;
  }

  return Math.round(((original - current) / original) * 100);
};

/* =======================================================
   MAX QUANTITY
======================================================= */

const getMaxQuantity = (product) => {
  const stock = Number(
    product?.stock ?? product?.quantityAvailable ?? product?.inventory,
  );

  if (Number.isFinite(stock) && stock > 0) {
    return Math.min(stock, 99);
  }

  return 99;
};

/* =======================================================
   CUSTOMIZATION
======================================================= */

const hasCustomization = (product) => {
  return Boolean(
    product?.isCustomizable ||
    product?.customizable ||
    product?.customization ||
    (Array.isArray(product?.customizationOptions) &&
      product.customizationOptions.length > 0),
  );
};

/* =======================================================
   VIDEO
======================================================= */

const hasVideo = (product) => {
  return Boolean(
    product?.video ||
    product?.videoUrl ||
    product?.videoURL ||
    product?.productVideo,
  );
};

/* =======================================================
   CATEGORY
======================================================= */

const formatCategory = (value) => {
  return String(value || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

/* =======================================================
   CURRENCY
======================================================= */

const formatCurrency = (value) => {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

/* =======================================================
   PRIMARY BUTTON
======================================================= */

const primaryButtonSx = {
  borderRadius: 2.5,
  minHeight: 46,
  px: 3,
  textTransform: "none",
  fontWeight: 800,
  fontSize: "0.9rem",
  backgroundColor: "#111",
  color: "#fff",
  boxShadow: "none",

  "&:hover": {
    backgroundColor: "#252525",
    boxShadow: "none",
  },

  "&:disabled": {
    backgroundColor: "#ddd",
    color: "#888",
  },
};

/* =======================================================
   SECONDARY BUTTON
======================================================= */

const secondaryButtonSx = {
  borderRadius: 2.5,
  minHeight: 46,
  px: 3,
  textTransform: "none",
  fontWeight: 800,
  fontSize: "0.9rem",
  color: "#111",
  borderColor: "rgba(0,0,0,0.16)",
  backgroundColor: "#fff",

  "&:hover": {
    borderColor: "#d5a000",
    backgroundColor: "#fffaf0",
  },

  "&:disabled": {
    borderColor: "#ddd",
    color: "#aaa",
  },
};

export default ProductDetails;
