
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
  const {
    addToCart,
    getCartItem,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomization, setSelectedCustomization] = useState({});
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  const productId = product?._id || product?.id;
  const cartItem = getCartItem(productId);
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
          setSelectedCustomization({});
          setQuantity(1);
        }
      } catch (err) {
        if (!mounted) return;

        setProduct(null);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load this product."
        );
      } finally {
        if (mounted) setLoading(false);
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
    [product]
  );

  const productDescription = useMemo(
    () =>
      product?.description ||
      "Premium NFC product designed for modern businesses.",
    [product]
  );

  const productPrice = useMemo(() => getProductPrice(product), [product]);

  const productImages = useMemo(() => {
    if (!product) return [];

    const images = [];

    if (Array.isArray(product.images)) {
      product.images.forEach((image) => {
        if (typeof image === "string") {
          images.push(image);
        } else if (
          typeof image?.url === "string" ||
          typeof image?.secure_url === "string" ||
          typeof image?.src === "string"
        ) {
          images.push(image.url || image.secure_url || image.src);
        }
      });
    }

    [product.image, product.thumbnail, product.imageUrl].forEach(
      (image) => {
        if (typeof image === "string" && image.trim()) {
          images.push(image);
        }
      }
    );

    return [...new Set(images.filter(Boolean))];
  }, [product]);

  const handleCustomizationChange = (nextValues) => {
    setSelectedCustomization((previous) => ({
      ...previous,
      ...(nextValues && typeof nextValues === "object"
        ? nextValues
        : {}),
    }));
  };

  const handleIncreaseCartQuantity = () => {
    if (!productId || cartQuantity <= 0) return;

    if (cartQuantity < getMaxQuantity(product)) {
      updateQuantity(productId, cartQuantity + 1);
    }
  };

  const handleDecreaseCartQuantity = () => {
    if (!productId || cartQuantity <= 0) return;

    if (cartQuantity <= 1) {
      removeFromCart(productId);
      return;
    }

    updateQuantity(productId, cartQuantity - 1);
  };

  const handleAddToCart = async () => {
    if (!product || adding) return;

    try {
      setAdding(true);

      await Promise.resolve(
        addToCart({
          ...product,
          quantity,
          customization: selectedCustomization,
        })
      );

      setAdded(true);
      window.setTimeout(() => setAdded(false), 2200);
    } catch (err) {
      console.error("Unable to add product to cart:", err);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || adding) return;

    try {
      setAdding(true);

      await Promise.resolve(
        addToCart({
          ...product,
          quantity,
          customization: selectedCustomization,
        })
      );

      navigate("/cart");
    } catch (err) {
      console.error("Unable to proceed to checkout:", err);
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
          <CircularProgress size={42} sx={{ color: "#d9a000" }} />
          <Typography sx={{ color: "#666", fontWeight: 600 }}>
            Loading product...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !product) {
    return <NotFound />;
  }

  const category = product.category || "NFC Products";
  const rating = Number(product.rating || 0);
  const reviewCount = Number(
    product.reviewCount || product.reviewsCount || 0
  );

  const productActions = (
    <>
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
            overflow: "hidden",
          }}
        >
          <IconButton
            onClick={handleDecreaseCartQuantity}
            aria-label="Decrease quantity"
            sx={{ width: 50, height: 50, color: "#222" }}
          >
            <Typography sx={{ fontSize: "1.35rem" }}>−</Typography>
          </IconButton>

          <Typography
            sx={{
              minWidth: 40,
              textAlign: "center",
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
            sx={{ width: 50, height: 50, color: "#222" }}
          >
            <Typography sx={{ fontSize: "1.35rem" }}>+</Typography>
          </IconButton>
        </Box>
      ) : (
        <Button
          fullWidth
          variant="outlined"
          startIcon={<ShoppingCartOutlined />}
          onClick={handleAddToCart}
          disabled={adding}
          sx={secondaryButtonSx}
        >
          {adding ? "Adding..." : added ? "Added to Cart ✓" : "Add to Cart"}
        </Button>
      )}

      <Button
        fullWidth
        variant="contained"
        onClick={handleBuyNow}
        disabled={adding}
        sx={primaryButtonSx}
      >
        {adding ? "Please wait..." : "Buy Now"}
      </Button>
    </>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #fff 0%, #fffdf7 55%, #fff 100%)",
        pb: { xs: "115px", sm: "125px", md: 10 },
      }}
    >
      <Container
        maxWidth="xl"
        sx={{ pt: { xs: 2, sm: 3, md: 4 } }}
      >
        <Breadcrumbs
          separator="›"
          sx={{
            mb: { xs: 2.5, md: 4 },
            "& .MuiBreadcrumbs-separator": { color: "#aaa" },
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
            }}
          >
            <HomeOutlined sx={{ fontSize: 17 }} />
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
            }}
          >
            Products
          </MuiLink>

          <Typography
            sx={{
              color: "#222",
              fontSize: "0.84rem",
              fontWeight: 700,
              maxWidth: { xs: 130, sm: 280 },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {productName}
          </Typography>
        </Breadcrumbs>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              lg: "minmax(0, 1.05fr) minmax(0, 0.95fr)",
            },
            gap: { xs: 3, sm: 4, md: 5, lg: 7 },
            alignItems: "start",
          }}
        >
          <MotionBox
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
          >
            <ProductGallery images={productImages} product={product} />
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            <Stack spacing={{ xs: 2, sm: 2.5 }}>
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
                      "& .MuiRating-iconFilled": { color: "#e0a400" },
                    }}
                  />
                  <Typography sx={{ fontSize: "0.86rem", color: "#666" }}>
                    {rating.toFixed(1)}
                    {reviewCount > 0 &&
                      ` (${reviewCount} ${
                        reviewCount === 1 ? "review" : "reviews"
                      })`}
                  </Typography>
                </Stack>
              )}

              <Box>
                <Typography
                  sx={{
                    color: "#666",
                    fontSize: { xs: "0.93rem", sm: "1rem" },
                    lineHeight: 1.8,
                    ...(!descriptionExpanded && {
                      display: "-webkit-box",
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }),
                  }}
                >
                  {productDescription}
                </Typography>

                {String(productDescription).length > 180 && (
                  <Button
                    onClick={() =>
                      setDescriptionExpanded((previous) => !previous)
                    }
                    sx={textToggleSx}
                  >
                    {descriptionExpanded ? "See less" : "See more"}
                  </Button>
                )}
              </Box>

              <Divider />

              <Stack
                direction="row"
                alignItems="baseline"
                spacing={1.5}
                flexWrap="wrap"
              >
                <Typography
                  sx={{
                    fontSize: { xs: "1.9rem", sm: "2.2rem" },
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
                      backgroundColor: "#111",
                      color: "#fff",
                      fontWeight: 800,
                    }}
                  />
                )}
              </Stack>

              <Typography sx={{ color: "#888", fontSize: "0.78rem" }}>
                Inclusive of applicable taxes
              </Typography>

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

              {hasCustomization(product) && (
                <Box
                  sx={{
                    mt: 0.5,
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 3,
                    backgroundColor: "#fff",
                    border: "1px solid rgba(0,0,0,0.07)",
                    boxShadow: "0 8px 28px rgba(0,0,0,0.045)",
                  }}
                >
                  <ProductCustomization
                    customization={selectedCustomization}
                    onChange={handleCustomizationChange}
                  />
                </Box>
              )}

              {/* Desktop/tablet product actions */}
              <Stack
                spacing={1.2}
                sx={{ display: { xs: "none", md: "flex" } }}
              >
                {productActions}
              </Stack>

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
                    sx={{ color: "#b47d00", fontSize: 21, mt: 0.1 }}
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

        {hasVideo(product) && (
          <MotionBox
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5 }}
            sx={{ mt: { xs: 6, md: 9 } }}
          >
            <ProductVideo product={product} />
          </MotionBox>
        )}

        <MotionBox
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5 }}
          sx={{
            mt: { xs: 6, md: 9 },
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: { xs: 3, md: 4 },
            backgroundColor: "#fff",
            border: "1px solid rgba(0,0,0,0.07)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.045)",
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "1.25rem", sm: "1.45rem" },
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
              ...(!detailsExpanded && {
                display: "-webkit-box",
                WebkitLineClamp: 5,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }),
            }}
          >
            {productDescription}
          </Typography>

          {String(productDescription).length > 220 && (
            <Button
              onClick={() => setDetailsExpanded((previous) => !previous)}
              sx={textToggleSx}
            >
              {detailsExpanded ? "See less" : "See more"}
            </Button>
          )}

          {Array.isArray(product.features) && product.features.length > 0 && (
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
                  key={`${String(feature?.title || feature)}-${index}`}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ p: 1.3, borderRadius: 2, backgroundColor: "#fafafa" }}
                >
                  <CheckCircleOutline
                    sx={{ color: "#d5a000", fontSize: 19 }}
                  />
                  <Typography
                    sx={{ color: "#444", fontSize: "0.82rem", fontWeight: 600 }}
                  >
                    {typeof feature === "string"
                      ? feature
                      : feature?.title || feature?.name || ""}
                  </Typography>
                </Stack>
              ))}
            </Box>
          )}

          {Array.isArray(product.techStack) && product.techStack.length > 0 && (
            <Stack
              direction="row"
              spacing={0.8}
              flexWrap="wrap"
              useFlexGap
              sx={{ mt: 3 }}
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

      {/* Fixed mobile purchase bar */}
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          zIndex: (theme) => theme.zIndex.appBar + 2,
          bottom: 0,
          left: 0,
          right: 0,
          p: 1.2,
          pb: "calc(10px + env(safe-area-inset-bottom, 0px))",
          backgroundColor: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(0,0,0,0.09)",
          boxShadow: "0 -8px 24px rgba(0,0,0,0.08)",
        }}
      >
        <Container maxWidth="sm" disableGutters>
          <Stack direction="row" spacing={1} alignItems="stretch">
            <Box sx={{ flex: 1, minWidth: 0, display: "flex" }}>
              {cartQuantity > 0 ? (
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-around",
                    border: "1px solid rgba(215,164,0,0.35)",
                    borderRadius: 2.5,
                    backgroundColor: "#fff",
                  }}
                >
                  <IconButton
                    onClick={handleDecreaseCartQuantity}
                    aria-label="Decrease cart quantity"
                    size="small"
                  >
                    −
                  </IconButton>
                  <Typography sx={{ fontWeight: 900 }}>
                    {cartQuantity}
                  </Typography>
                  <IconButton
                    onClick={handleIncreaseCartQuantity}
                    disabled={cartQuantity >= getMaxQuantity(product)}
                    aria-label="Increase cart quantity"
                    size="small"
                  >
                    +
                  </IconButton>
                </Box>
              ) : (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleAddToCart}
                  disabled={adding}
                  startIcon={<ShoppingCartOutlined />}
                  sx={{
                    ...secondaryButtonSx,
                    minWidth: 0,
                    minHeight: 48,
                    px: 1,
                    fontSize: "0.78rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  {adding ? "Adding..." : added ? "Added ✓" : "Add to Cart"}
                </Button>
              )}
            </Box>

            <Button
              variant="contained"
              onClick={handleBuyNow}
              disabled={adding}
              sx={{
                ...primaryButtonSx,
                flex: 1,
                minWidth: 0,
                minHeight: 48,
                px: 1,
                fontSize: "0.84rem",
                whiteSpace: "nowrap",
              }}
            >
              {adding ? "Please wait..." : "Buy Now"}
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

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
        "& svg": { fontSize: 17 },
      }}
    >
      {icon}
    </Box>
    <Typography sx={{ color: "#555", fontSize: "0.83rem", fontWeight: 600 }}>
      {text}
    </Typography>
  </Stack>
);

const getProductPrice = (product) => {
  if (!product) return 0;

  const originalPrice = Number(product.price) || 0;
  const discountPrice = Number(product.discountPrice) || 0;

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
  if (!product) return 0;

  const originalPrice = Number(product.price) || 0;
  const discountPrice = Number(product.discountPrice) || 0;

  if (
    discountPrice > 0 &&
    originalPrice > 0 &&
    discountPrice < originalPrice
  ) {
    return originalPrice;
  }

  return 0;
};

const getDiscountPercentage = (product) => {
  const original = getOriginalPrice(product);
  const current = getProductPrice(product);

  if (!original || !current || original <= current) return 0;

  return Math.round(((original - current) / original) * 100);
};

const getMaxQuantity = (product) => {
  const stock = Number(
    product?.stock ??
      product?.quantityAvailable ??
      product?.inventory
  );

  if (Number.isFinite(stock) && stock > 0) {
    return Math.min(stock, 99);
  }

  return 99;
};

const hasCustomization = (product) =>
  Boolean(
    product?.isCustomizable ||
      product?.customizable ||
      product?.customization ||
      (Array.isArray(product?.customizationOptions) &&
        product.customizationOptions.length > 0)
  );

const hasVideo = (product) =>
  Boolean(
    product?.video ||
      product?.videoUrl ||
      product?.videoURL ||
      product?.productVideo
  );

const formatCategory = (value) =>
  String(value || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

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

const textToggleSx = {
  mt: 0.5,
  p: 0,
  minWidth: 0,
  textTransform: "none",
  color: "#a77700",
  fontWeight: 800,
  fontSize: "0.85rem",
  "&:hover": {
    backgroundColor: "transparent",
    color: "#805b00",
  },
};

export default ProductDetails;
