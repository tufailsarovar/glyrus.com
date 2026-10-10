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
  ArrowBackRounded,
  CheckCircleRounded,
  HomeRounded,
  LocalShippingOutlined,
  ShoppingCartOutlined,
  SupportAgentOutlined,
  AddRounded,
  RemoveRounded,
  VerifiedRounded,
} from "@mui/icons-material";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getProduct } from "../services/api";
import ProductCustomization from "../components/products/ProductCustomization";
import ProductGallery from "../components/products/ProductGallery";
import ProductVideo from "../components/products/ProductVideo";
import { useCart } from "../hooks/useCart";
import NotFound from "./NotFound";

const MotionBox = motion(Box);

const renderInlineFormatting = (text) => {
  const parts = String(text || "").split(/(\*\*[\s\S]+?\*\*|\*[^*]+?\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <Box
          key={index}
          component="strong"
          sx={{ color: "#222", fontWeight: 800 }}
        >
          {part.slice(2, -2)}
        </Box>
      );
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <Box key={index} component="em">
          {part.slice(1, -1)}
        </Box>
      );
    }

    return part;
  });
};

const FormattedDescription = ({ description }) => {
  const lines = String(description || "").split(/\r?\n/);

  return (
    <Box
      sx={{
        color: "#666",
        fontSize: "inherit",
        lineHeight: "inherit",
        overflowWrap: "anywhere",
        whiteSpace: "normal",
        "& p": { m: 0, mb: 1.2 },
        "& ul, & ol": { mt: 0.5, mb: 1.5, pl: 3 },
        "& li": { mb: 0.5 },
        "& strong": { color: "#222", fontWeight: 800 },
        "& h2, & h3": {
          color: "#222",
          fontWeight: 800,
          lineHeight: 1.4,
          mt: 2,
          mb: 1,
        },
      }}
    >
      {lines.map((line, index) => {
        const text = line.trim();

        if (!text) {
          return <Box key={index} sx={{ height: 6 }} />;
        }

        if (text.startsWith("## ")) {
          return (
            <Typography key={index} component="h3" variant="h4">
              {renderInlineFormatting(text.slice(3))}
            </Typography>
          );
        }

        if (text.startsWith("# ")) {
          return (
            <Typography key={index} component="h2" variant="h3">
              {renderInlineFormatting(text.slice(2))}
            </Typography>
          );
        }

        if (/^[-*]\s+/.test(text)) {
          return (
            <Box
              key={index}
              component="li"
              sx={{ ml: 2, display: "list-item", listStyleType: "disc" }}
            >
              {renderInlineFormatting(text.replace(/^[-*]\s+/, ""))}
            </Box>
          );
        }

        const numberedMatch = text.match(/^(\d+)\.\s+(.*)$/);

        if (numberedMatch) {
          return (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                mb: 0.8,
              }}
            >
              <Typography
                component="span"
                sx={{
                  flexShrink: 0,
                  fontSize: "inherit",
                  lineHeight: "inherit",
                  color: "inherit",
                }}
              >
                {numberedMatch[1]}.
              </Typography>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                {renderInlineFormatting(numberedMatch[2])}
              </Box>
            </Box>
          );
        }

        return (
          <Typography key={index} component="p">
            {renderInlineFormatting(text)}
          </Typography>
        );
      })}
    </Box>
  );
};

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
  const [addingMode, setAddingMode] = useState("");
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
          setDescriptionExpanded(false);
          setDetailsExpanded(false);
        }
      } catch (err) {
        if (!mounted) return;

        setProduct(null);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load this product.",
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
    [product],
  );

  const productDescription = useMemo(
    () =>
      product?.description ||
      "A premium NFC product designed to help modern businesses connect with customers more easily.",
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
        } else if (
          typeof image?.url === "string" ||
          typeof image?.secure_url === "string" ||
          typeof image?.src === "string"
        ) {
          images.push(image.url || image.secure_url || image.src);
        }
      });
    }

    [product.image, product.thumbnail, product.imageUrl].forEach((image) => {
      if (typeof image === "string" && image.trim()) {
        images.push(image);
      }
    });

    return [...new Set(images.filter(Boolean))];
  }, [product]);

  const handleCustomizationChange = (nextValues) => {
    setSelectedCustomization((previous) => ({
      ...previous,
      ...(nextValues && typeof nextValues === "object" ? nextValues : {}),
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
      setAddingMode("cart");

      await Promise.resolve(
        addToCart({
          ...product,
          quantity,
          customization: selectedCustomization,
        }),
      );

      setAdded(true);
      window.setTimeout(() => setAdded(false), 2200);
    } catch (err) {
      console.error("Unable to add product to cart:", err);
    } finally {
      setAdding(false);
      setAddingMode("");
    }
  };

  const handleBuyNow = async () => {
    if (!product || adding) return;

    try {
      setAdding(true);
      setAddingMode("buy");

      await Promise.resolve(
        addToCart({
          ...product,
          quantity,
          customization: selectedCustomization,
        }),
      );

      navigate("/cart");
    } catch (err) {
      console.error("Unable to proceed to checkout:", err);
    } finally {
      setAdding(false);
      setAddingMode("");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "65vh",
          display: "grid",
          placeItems: "center",
          background: "#fff",
          px: 2,
        }}
      >
        <Stack alignItems="center" spacing={1.5}>
          <CircularProgress size={34} sx={{ color: "#c99716" }} />
          <Typography sx={{ color: "#777", fontSize: 13, fontWeight: 600 }}>
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
  const reviewCount = Number(product.reviewCount || product.reviewsCount || 0);
  const originalPrice = getOriginalPrice(product);
  const discount = getDiscountPercentage(product);
  const hasOptions = hasCustomization(product);

  const productActions = (
    <>
      {cartQuantity > 0 ? (
        <Box sx={quantityControlSx}>
          <IconButton
            onClick={handleDecreaseCartQuantity}
            aria-label="Decrease quantity"
            size="small"
            sx={quantityIconSx}
          >
            <RemoveRounded fontSize="small" />
          </IconButton>

          <Typography sx={quantityNumberSx}>{cartQuantity}</Typography>

          <IconButton
            onClick={handleIncreaseCartQuantity}
            disabled={cartQuantity >= getMaxQuantity(product)}
            aria-label="Increase quantity"
            size="small"
            sx={quantityIconSx}
          >
            <AddRounded fontSize="small" />
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
          {adding && addingMode === "cart"
            ? "Adding..."
            : added
              ? "Added to Cart ✓"
              : "Add to Cart"}
        </Button>
      )}

      <Button
        fullWidth
        variant="contained"
        onClick={handleBuyNow}
        disabled={adding}
        sx={primaryButtonSx}
      >
        {adding && addingMode === "buy" ? "Processing..." : "Buy Now"}
      </Button>
    </>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        overflowX: "clip",
        pb: { xs: "76px", md: 7 },
        background:
          "radial-gradient(ellipse at 12% 0%, rgba(246,220,146,0.16), transparent 34%), #fff",
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          pt: { xs: 1.2, sm: 3, md: 4 },
          px: { xs: 1.5, sm: 2.5, md: 3 },
        }}
      >
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator="›"
          sx={{
            mb: { xs: 1.5, sm: 3 },
            "& .MuiBreadcrumbs-separator": { color: "#bbb", mx: 0.5 },
          }}
        >
          <MuiLink component={Link} to="/" underline="none" sx={breadcrumbSx}>
            <HomeRounded sx={{ fontSize: 16 }} />
            <Box
              component="span"
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              Home
            </Box>
          </MuiLink>

          <MuiLink
            component={Link}
            to="/products"
            underline="none"
            sx={breadcrumbSx}
          >
            Products
          </MuiLink>

          <Typography
            sx={{
              ...breadcrumbSx,
              color: "#222",
              maxWidth: { xs: 125, sm: 280 },
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {productName}
          </Typography>
        </Breadcrumbs>

        {/* Main product layout */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              lg: "minmax(0, 1.05fr) minmax(0, 0.95fr)",
            },
            gap: { xs: 2, sm: 4, md: 5, lg: 7 },
            alignItems: "start",
          }}
        >
          {/* Product gallery */}
          <MotionBox
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            sx={{ minWidth: 0 }}
          >
            <ProductGallery images={productImages} product={product} />
          </MotionBox>

          {/* Product information */}
          <MotionBox
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06, ease: "easeOut" }}
            sx={{ minWidth: 0 }}
          >
            <Stack spacing={{ xs: 1.4, sm: 2.3 }}>
              <Box>
                <Chip
                  label={formatCategory(category)}
                  size="small"
                  sx={{
                    height: 25,
                    mb: 1,
                    borderRadius: 1.5,
                    background: "#fff5d6",
                    color: "#896000",
                    border: "1px solid #f1e1aa",
                    fontWeight: 800,
                    fontSize: 11,
                  }}
                />

                <Typography
                  component="h1"
                  sx={{
                    fontSize: {
                      xs: "1.42rem",
                      sm: "2.1rem",
                      md: "2.6rem",
                    },
                    lineHeight: { xs: 1.22, md: 1.12 },
                    letterSpacing: "-0.035em",
                    fontWeight: 900,
                    color: "#171717",
                    overflowWrap: "anywhere",
                  }}
                >
                  {productName}
                </Typography>
              </Box>

              {rating > 0 && (
                <Stack
                  direction="row"
                  spacing={0.7}
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Rating
                    value={rating}
                    precision={0.1}
                    readOnly
                    size="small"
                    sx={{
                      "& .MuiRating-iconFilled": { color: "#dfa900" },
                      "& .MuiRating-iconEmpty": { color: "#e9e2d0" },
                    }}
                  />

                  <Typography
                    sx={{ color: "#555", fontSize: 12, fontWeight: 700 }}
                  >
                    {rating.toFixed(1)}
                  </Typography>

                  {reviewCount > 0 && (
                    <Typography sx={{ color: "#888", fontSize: 12 }}>
                      ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                    </Typography>
                  )}
                </Stack>
              )}

              {/* Short description */}
              <Box>
                <Box
                  sx={{
                    color: "#666",
                    fontSize: { xs: 13, sm: 15 },
                    lineHeight: { xs: 1.7, sm: 1.8 },
                    overflowWrap: "anywhere",
                    maxHeight: descriptionExpanded
                      ? "none"
                      : { xs: "6.5em", sm: "7.2em" },
                    overflow: "hidden",
                  }}
                >
                  <FormattedDescription description={productDescription} />
                </Box>

                {String(productDescription).length > 150 && (
                  <Button
                    onClick={() =>
                      setDescriptionExpanded((previous) => !previous)
                    }
                    sx={textToggleSx}
                  >
                    {descriptionExpanded ? "See less" : "Read Full Description"}
                  </Button>
                )}
              </Box>

              <Divider sx={{ borderColor: "#eee" }} />

              {/* Price */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
              >
                <Typography
                  sx={{
                    fontSize: { xs: "1.55rem", sm: "2.15rem" },
                    lineHeight: 1.1,
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                    color: "#151515",
                  }}
                >
                  {formatCurrency(productPrice)}
                </Typography>

                {originalPrice > productPrice && (
                  <Typography
                    sx={{
                      color: "#999",
                      textDecoration: "line-through",
                      fontSize: { xs: 12, sm: 15 },
                      fontWeight: 600,
                    }}
                  >
                    {formatCurrency(originalPrice)}
                  </Typography>
                )}

                {discount > 0 && (
                  <Chip
                    label={`${discount}% OFF`}
                    size="small"
                    sx={{
                      height: 23,
                      background: "#eaf6e9",
                      color: "#27733b",
                      fontSize: 10,
                      fontWeight: 900,
                    }}
                  />
                )}
              </Stack>

              <Typography sx={{ color: "#999", fontSize: 11 }}>
                Inclusive of applicable taxes
              </Typography>

              {/* Product benefits */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr" },
                  gap: { xs: 1, sm: 1.2 },
                }}
              >
                <Feature text="Premium quality NFC product" />
                <Feature text="Secure packaging and reliable delivery" />
                <Feature text="Customer support for your order" />
              </Box>

              {/* Customization */}
              {hasOptions && (
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2.2 },
                    borderRadius: { xs: 2.5, sm: 3 },
                    background: "#fff",
                    border: "1px solid #eee8d9",
                    boxShadow: "0 5px 20px rgba(0,0,0,0.025)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 850,
                      mb: 1.2,
                      color: "#222",
                    }}
                  >
                    Personalize your product
                  </Typography>

                  <ProductCustomization
                    customization={selectedCustomization}
                    onChange={handleCustomizationChange}
                  />
                </Box>
              )}

              {/* Desktop purchase controls */}
              <Stack
                spacing={1}
                sx={{ display: { xs: "none", md: "flex" }, pt: 0.5 }}
              >
                {productActions}
              </Stack>

              {/* Delivery information */}
              <Box
                sx={{
                  p: { xs: 1.3, sm: 1.8 },
                  borderRadius: 2.5,
                  background: "#fffbef",
                  border: "1px solid #f3e9c9",
                }}
              >
                <Stack direction="row" spacing={1.1} alignItems="flex-start">
                  <LocalShippingOutlined
                    sx={{ color: "#a77700", fontSize: 21, mt: 0.1 }}
                  />

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{ fontSize: 12, fontWeight: 850, color: "#44350d" }}
                    >
                      Delivery & order support
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.35,
                        fontSize: 11,
                        lineHeight: 1.6,
                        color: "#827345",
                      }}
                    >
                      Order and tracking information will be shared with you
                      through your registered email, where available.
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </MotionBox>
        </Box>

        {/* Product video */}
        {hasVideo(product) && (
          <MotionBox
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.4 }}
            sx={{ mt: { xs: 4, md: 8 } }}
          >
            <ProductVideo product={product} />
          </MotionBox>
        )}
      </Container>

      {/* Compact mobile purchase bar */}
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          zIndex: (theme) => theme.zIndex.appBar + 2,
          bottom: 0,
          left: 0,
          right: 0,
          p: 0.8,
          pb: "calc(7px + env(safe-area-inset-bottom, 0px))",
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 -5px 22px rgba(0,0,0,0.055)",
        }}
      >
        <Container maxWidth="sm" disableGutters>
          <Stack direction="row" spacing={0.8} alignItems="stretch">
            <Box sx={{ flex: 1, minWidth: 0, display: "flex" }}>
              {cartQuantity > 0 ? (
                <Box
                  sx={{
                    width: "100%",
                    minHeight: 41,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-around",
                    border: "1px solid #e8d8a6",
                    borderRadius: 2,
                    background: "#fff",
                  }}
                >
                  <IconButton
                    onClick={handleDecreaseCartQuantity}
                    aria-label="Decrease cart quantity"
                    size="small"
                    sx={{ color: "#292929", p: 0.6 }}
                  >
                    <RemoveRounded fontSize="small" />
                  </IconButton>

                  <Typography sx={{ fontSize: 13, fontWeight: 900 }}>
                    {cartQuantity}
                  </Typography>

                  <IconButton
                    onClick={handleIncreaseCartQuantity}
                    disabled={cartQuantity >= getMaxQuantity(product)}
                    aria-label="Increase cart quantity"
                    size="small"
                    sx={{ color: "#292929", p: 0.6 }}
                  >
                    <AddRounded fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleAddToCart}
                  disabled={adding}
                  startIcon={<ShoppingCartOutlined sx={{ fontSize: 17 }} />}
                  sx={{
                    ...secondaryButtonSx,
                    minWidth: 0,
                    minHeight: 41,
                    px: 0.7,
                    fontSize: 11,
                    borderRadius: 2,
                    whiteSpace: "nowrap",
                    "& .MuiButton-startIcon": { mr: 0.5, ml: 0 },
                  }}
                >
                  {adding && addingMode === "cart"
                    ? "Adding..."
                    : added
                      ? "Added ✓"
                      : "Add to Cart"}
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
                minHeight: 41,
                px: 0.7,
                fontSize: 12,
                borderRadius: 2,
                whiteSpace: "nowrap",
              }}
            >
              {adding && addingMode === "buy" ? "Processing..." : "Buy Now"}
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

const Feature = ({ text }) => (
  <Stack direction="row" spacing={0.9} alignItems="center">
    <Box
      sx={{
        width: 25,
        height: 25,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        background: "#f5f0df",
        color: "#987000",
      }}
    >
      <VerifiedRounded sx={{ fontSize: 16 }} />
    </Box>

    <Typography sx={{ color: "#555", fontSize: 12, fontWeight: 650 }}>
      {text}
    </Typography>
  </Stack>
);

const getProductPrice = (product) => {
  if (!product) return 0;

  const price = Number(product.price) || 0;
  const discountPrice = Number(product.discountPrice) || 0;

  if (discountPrice > 0 && price > 0 && discountPrice < price) {
    return discountPrice;
  }

  return price;
};

const getOriginalPrice = (product) => {
  if (!product) return 0;

  const price = Number(product.price) || 0;
  const discountPrice = Number(product.discountPrice) || 0;

  if (discountPrice > 0 && price > 0 && discountPrice < price) {
    return price;
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
    product?.stock ?? product?.quantityAvailable ?? product?.inventory,
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
      product.customizationOptions.length > 0),
  );

const hasVideo = (product) =>
  Boolean(
    product?.video ||
    product?.videoUrl ||
    product?.videoURL ||
    product?.productVideo,
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

const breadcrumbSx = {
  display: "flex",
  alignItems: "center",
  gap: 0.45,
  color: "#858585",
  fontSize: 12,
  fontWeight: 650,
};

const quantityControlSx = {
  width: "100%",
  minHeight: 46,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #e7d8a9",
  borderRadius: 2,
  background: "#fff",
};

const quantityIconSx = {
  width: 42,
  height: 42,
  color: "#222",
};

const quantityNumberSx = {
  minWidth: 38,
  textAlign: "center",
  fontWeight: 900,
  color: "#8d6900",
};

const primaryButtonSx = {
  minHeight: 46,
  px: 2.5,
  borderRadius: 2,
  textTransform: "none",
  fontWeight: 850,
  fontSize: 13,
  background: "#171717",
  color: "#fff",
  boxShadow: "none",
  transition: "background 180ms ease, transform 180ms ease",
  "&:hover": {
    background: "#303030",
    boxShadow: "none",
    transform: "translateY(-1px)",
  },
  "&:disabled": {
    background: "#d8d8d8",
    color: "#888",
  },
};

const secondaryButtonSx = {
  minHeight: 46,
  px: 2.5,
  borderRadius: 2,
  textTransform: "none",
  fontWeight: 800,
  fontSize: 13,
  color: "#222",
  borderColor: "#dedbd1",
  background: "#fff",
  transition: "background 180ms ease, border-color 180ms ease",
  "&:hover": {
    borderColor: "#c49a26",
    background: "#fffcf2",
  },
  "&:disabled": {
    borderColor: "#ddd",
    color: "#aaa",
  },
};

const textToggleSx = {
  mt: 0.25,
  p: 0,
  minWidth: 0,
  textTransform: "none",
  color: "#9a740d",
  fontWeight: 850,
  fontSize: 12,
  "&:hover": {
    background: "transparent",
    color: "#725300",
  },
};

export default ProductDetails;
