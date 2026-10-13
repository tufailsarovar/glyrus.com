import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  AddPhotoAlternateRounded,
  ArrowBackRounded,
  CloudUploadRounded,
  DeleteOutlineRounded,
  ImageRounded,
  SaveRounded,
  VideoLibraryRounded,
  StoreRounded,
  Inventory2Rounded,
  TuneRounded,
  PaymentsRounded,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { validateProduct } from "../../utils/validation";

const MotionCard = motion(Card);

const initialForm = {
  name: "",
  title: "",
  category: "NFC Cards",
  description: "",
  price: "",
  discountPrice: "",
  stock: "",
  sku: "",
  images: [],
  video: "",
  isActive: true,
  isFeatured: false,
  customizationAvailable: false,
  customizationOptions: [],
};

const categories = [
  "NFC Cards",
  "QR Code Stands",
  "QR Business Cards",
  "Digital QR Menus",
  "Google Review QR",
  "NFC Tags",
  "NFC Keychains",
  "NFC Stands",
];

const customizationTypes = [
  "Name",
  "Logo",
  "Phone Number",
  "Email",
  "Website",
  "Social Links",
  "QR Code",
  "Custom Text",
];

const getProductData = (data) =>
  data?.product || data?.data?.product || data?.data || data;

const getImageUrl = (image) => {
  if (!image) return "";
  if (typeof image === "string") return image;
  return image?.url || image?.secure_url || image?.src || image?.path || "";
};

const getImages = (product) => {
  const images = product?.images || product?.productImages || [];

  if (Array.isArray(images)) {
    return images
      .map((image) => {
        if (typeof image === "string") {
          return { url: image, publicId: "" };
        }

        return {
          url:
            image?.url || image?.secure_url || image?.src || image?.path || "",
          publicId: image?.publicId || image?.public_id || "",
        };
      })
      .filter((image) => image.url);
  }

  if (typeof images === "string" && images.trim()) {
    return [{ url: images.trim(), publicId: "" }];
  }

  const fallback = product?.image || product?.imageUrl || product?.thumbnail;
  const url = getImageUrl(fallback);

  return url ? [{ url, publicId: "" }] : [];
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "7px",
    bgcolor: "#FFFFFF",
    fontSize: { xs: "0.8rem", sm: "0.86rem" },
    "& fieldset": { borderColor: "#E4E4E4" },
    "&:hover fieldset": { borderColor: "#D4B43A" },
    "&.Mui-focused fieldset": {
      borderColor: "#C4A12C",
      borderWidth: 1,
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: { xs: "0.8rem", sm: "0.86rem" },
  },
  "& .MuiFormHelperText-root": {
    fontSize: "0.67rem",
    lineHeight: 1.5,
    mx: 0,
  },
};

const cardSx = {
  width: "100%",
  minWidth: 0,
  overflow: "hidden",
  border: "1px solid #E8E8E8",
  borderRadius: "9px",
  bgcolor: "#FFFFFF",
  boxShadow: "0 3px 16px rgba(0,0,0,0.025)",
  transition: "border-color 180ms ease, box-shadow 180ms ease",
  "&:hover": {
    borderColor: "#E2D18A",
    boxShadow: "0 6px 22px rgba(0,0,0,0.04)",
  },
};

const contentSx = {
  p: { xs: 1.5, sm: 2, md: 2.2 },
  "&:last-child": {
    pb: { xs: 1.5, sm: 2, md: 2.2 },
  },
};

const headingSx = {
  fontSize: { xs: "0.92rem", sm: "1rem" },
  fontWeight: 900,
  letterSpacing: "-0.025em",
  color: "#171717",
  lineHeight: 1.35,
};

const helperSx = {
  mt: 0.35,
  mb: 1.8,
  color: "#858585",
  fontSize: "0.7rem",
  lineHeight: 1.5,
};

const MotionItem = ({ children, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.28, delay: index * 0.045, ease: "easeOut" }}
    style={{ minWidth: 0, width: "100%" }}
  >
    {children}
  </motion.div>
);

const SectionHeader = ({ icon, title, description }) => (
  <Stack direction="row" alignItems="center" spacing={1.1} sx={{ mb: 1.8 }}>
    <Box
      sx={{
        width: 36,
        height: 36,
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        borderRadius: "7px",
        bgcolor: "#FFF5CF",
        color: "#967100",
        "& svg": { fontSize: 20 },
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={headingSx}>{title}</Typography>
      <Typography sx={{ mt: 0.25, fontSize: "0.69rem", color: "#888888" }}>
        {description}
      </Typography>
    </Box>
  </Stack>
);

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const isEdit = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const allImages = useMemo(
    () => [...existingImages, ...previewUrls],
    [existingImages, previewUrls],
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  useEffect(() => {
    if (!isEdit) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/api/products/${id}`);
        const product = getProductData(response?.data);

        if (!product) {
          throw new Error("Product not found.");
        }

        const productImages = getImages(product);
        setExistingImages(productImages);

        setForm({
          name: product?.name || product?.title || "",
          title: product?.title || product?.name || "",
          category: product?.category || "NFC Cards",
          description: product?.description || "",
          price: product?.price ?? "",
          discountPrice: product?.discountPrice ?? product?.salePrice ?? "",
          stock: product?.stock ?? product?.inventory ?? "",
          sku: product?.sku || "",
          images: productImages,
          video: product?.video || product?.videoUrl || "",
          isActive:
            typeof product?.isActive === "boolean"
              ? product.isActive
              : typeof product?.active === "boolean"
                ? product.active
                : true,
          isFeatured: Boolean(product?.isFeatured),
          customizationAvailable: Boolean(product?.customizationAvailable),
          customizationOptions: Array.isArray(product?.customizationOptions)
            ? product.customizationOptions
            : [],
        });
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Unable to load product.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, isEdit]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }

    setError("");
    setSuccess("");
  };

  const handleBooleanChange = (event) => {
    const { name, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: checked,
    }));

    setError("");
    setSuccess("");
  };

  const handleCustomizationChange = (option) => {
    setForm((previous) => {
      const current = previous.customizationOptions || [];
      const exists = current.includes(option);

      return {
        ...previous,
        customizationOptions: exists
          ? current.filter((item) => item !== option)
          : [...current, option],
      };
    });
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const maxSize = 5 * 1024 * 1024;

      return isImage && file.size <= maxSize;
    });

    if (validFiles.length !== files.length) {
      setError("Only image files up to 5MB each can be uploaded.");
    } else {
      setError("");
    }

    const urls = validFiles.map((file) => URL.createObjectURL(file));

    setSelectedFiles((previous) => [...previous, ...validFiles]);
    setPreviewUrls((previous) => [...previous, ...urls]);

    event.target.value = "";
  };

  const removeExistingImage = (index) => {
    const image = existingImages[index];

    if (image?.publicId) {
      setRemovedImageIds((previous) =>
        previous.includes(image.publicId)
          ? previous
          : [...previous, image.publicId],
      );
    }

    setExistingImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  const removeSelectedImage = (index) => {
    const url = previewUrls[index];

    if (url) {
      URL.revokeObjectURL(url);
    }

    setPreviewUrls((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index),
    );

    setSelectedFiles((previous) =>
      previous.filter((_, fileIndex) => fileIndex !== index),
    );
  };

  const buildPayload = () => {
    const payload = new FormData();

    payload.append("name", form.name.trim());
    payload.append("title", (form.title || form.name).trim());
    payload.append("category", form.category);
    payload.append("description", form.description.trim());
    payload.append("price", String(Number(form.price)));

    if (
      form.discountPrice !== "" &&
      form.discountPrice !== null &&
      form.discountPrice !== undefined
    ) {
      payload.append("discountPrice", String(Number(form.discountPrice)));
    }

    payload.append("stock", String(form.stock === "" ? 0 : Number(form.stock)));

    if (form.sku.trim()) {
      payload.append("sku", form.sku.trim());
    }

    if (form.video.trim()) {
      payload.append("video", form.video.trim());
    }

    payload.append("isActive", String(form.isActive));
    payload.append("isFeatured", String(form.isFeatured));

    payload.append(
      "customizationAvailable",
      String(form.customizationAvailable),
    );

    payload.append(
      "customizationOptions",
      JSON.stringify(
        form.customizationAvailable ? form.customizationOptions : [],
      ),
    );

    payload.append("removeImageIds", JSON.stringify(removedImageIds));

    selectedFiles.forEach((file) => {
      payload.append("images", file);
    });

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validation = validateProduct(form);

    if (Object.keys(validation).length) {
      setFieldErrors(validation);
      setError("Please correct the highlighted fields.");
      return;
    }

    if (
      form.discountPrice !== "" &&
      Number(form.discountPrice) > Number(form.price)
    ) {
      setFieldErrors((previous) => ({
        ...previous,
        discountPrice:
          "Discount price cannot be higher than the original price.",
      }));
      setError("Please correct the highlighted fields.");
      return;
    }

    if (form.customizationAvailable && !form.customizationOptions.length) {
      setError("Select at least one customization option.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = buildPayload();
      let response;

      if (isEdit) {
        response = await api.put(`/api/admin/products/${id}`, payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await api.post("/api/admin/products", payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response?.data?.success === false) {
        throw new Error(response?.data?.message || "Unable to save product.");
      }

      setSuccess(
        isEdit
          ? "Product updated successfully."
          : "Product created successfully.",
      );

      setTimeout(() => {
        navigate("/admin/products");
      }, 700);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to save the product.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "45vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Stack alignItems="center" spacing={1.2}>
          <CircularProgress size={30} thickness={4} sx={{ color: "#F4C430" }} />
          <Typography sx={{ fontSize: "0.75rem", color: "#888888" }}>
            Loading product...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        width: "100%",
        minWidth: 0,
        pb: { xs: 1.5, sm: 2.5 },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: { xs: 1.8, sm: 2.2 } }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            type="button"
            onClick={() => navigate("/admin/products")}
            disabled={saving}
            sx={{
              width: 36,
              height: 36,
              border: "1px solid #E5E5E5",
              borderRadius: "7px",
              bgcolor: "#FFFFFF",
              color: "#222222",
              "&:hover": {
                bgcolor: "#FFF9E6",
                borderColor: "#E5C54E",
              },
            }}
          >
            <ArrowBackRounded sx={{ fontSize: 19 }} />
          </IconButton>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: { xs: "1.4rem", sm: "1.75rem", md: "1.95rem" },
                fontWeight: 950,
                letterSpacing: "-0.05em",
                color: "#151515",
                lineHeight: 1.15,
              }}
            >
              {isEdit ? "Edit Product" : "Add Product"}
            </Typography>

            <Typography
              sx={{
                mt: 0.35,
                fontSize: { xs: "0.7rem", sm: "0.78rem" },
                color: "#858585",
              }}
            >
              {isEdit
                ? "Update your product information."
                : "Create a new Glyrus product."}
            </Typography>
          </Box>
        </Stack>

        <Button
          type="submit"
          variant="contained"
          startIcon={
            saving ? (
              <CircularProgress size={16} sx={{ color: "#222222" }} />
            ) : (
              <SaveRounded />
            )
          }
          disabled={saving}
          sx={{
            alignSelf: { xs: "stretch", sm: "center" },
            minHeight: 39,
            px: 2,
            borderRadius: "7px",
            bgcolor: "#F4C430",
            color: "#151515",
            fontSize: "0.75rem",
            fontWeight: 900,
            boxShadow: "none",
            "&:hover": { bgcolor: "#E5B500", boxShadow: "none" },
            "&:disabled": { bgcolor: "#EEEEEE", color: "#888888" },
          }}
        >
          {saving ? "Saving..." : isEdit ? "Update Product" : "Save Product"}
        </Button>
      </Stack>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <Alert
              severity="error"
              onClose={() => setError("")}
              sx={{
                mb: 1.5,
                borderRadius: "7px",
                py: 0.2,
                fontSize: "0.76rem",
              }}
            >
              {error}
            </Alert>
          </motion.div>
        )}

        {success && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <Alert
              severity="success"
              onClose={() => setSuccess("")}
              sx={{
                mb: 1.5,
                borderRadius: "7px",
                py: 0.2,
                fontSize: "0.76rem",
              }}
            >
              {success}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Grid container spacing={{ xs: 1.2, sm: 1.5, md: 1.7 }}>
        <Grid item xs={12} md={7.5} sx={{ minWidth: 0 }}>
          <Stack spacing={{ xs: 1.2, sm: 1.5 }}>
            <MotionItem index={0}>
              <Card elevation={0} sx={cardSx}>
                <CardContent sx={contentSx}>
                  <SectionHeader
                    icon={<StoreRounded />}
                    title="Basic Information"
                    description="Add the core details customers will see."
                  />

                  <Grid container spacing={{ xs: 1.2, sm: 1.5 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        label="Product Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        error={Boolean(fieldErrors.name)}
                        helperText={fieldErrors.name}
                        disabled={saving}
                        sx={inputSx}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Display Title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        disabled={saving}
                        sx={inputSx}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth disabled={saving} sx={inputSx}>
                        <InputLabel>Category</InputLabel>
                        <Select
                          label="Category"
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                        >
                          {categories.map((category) => (
                            <MenuItem key={category} value={category}>
                              {category}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="SKU"
                        name="sku"
                        value={form.sku}
                        onChange={handleChange}
                        disabled={saving}
                        sx={inputSx}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        required
                        multiline
                        minRows={4}
                        label="Product Description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        error={Boolean(fieldErrors.description)}
                        helperText={fieldErrors.description}
                        disabled={saving}
                        sx={inputSx}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </MotionItem>

            <MotionItem index={1}>
              <Card elevation={0} sx={cardSx}>
                <CardContent sx={contentSx}>
                  <SectionHeader
                    icon={<PaymentsRounded />}
                    title="Pricing & Inventory"
                    description="Configure pricing and available stock."
                  />

                  <Grid container spacing={{ xs: 1.2, sm: 1.5 }}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        required
                        label="Price"
                        name="price"
                        type="number"
                        value={form.price}
                        onChange={handleChange}
                        error={Boolean(fieldErrors.price)}
                        helperText={
                          fieldErrors.price || "Original price in INR"
                        }
                        inputProps={{ min: 0, step: "0.01" }}
                        disabled={saving}
                        sx={inputSx}
                        InputProps={{
                          startAdornment: (
                            <Typography
                              sx={{ mr: 0.8, color: "#777", fontWeight: 700 }}
                            >
                              ₹
                            </Typography>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Discount Price"
                        name="discountPrice"
                        type="number"
                        value={form.discountPrice}
                        onChange={handleChange}
                        error={Boolean(fieldErrors.discountPrice)}
                        helperText={
                          fieldErrors.discountPrice || "Optional sale price"
                        }
                        inputProps={{ min: 0, step: "0.01" }}
                        disabled={saving}
                        sx={inputSx}
                        InputProps={{
                          startAdornment: (
                            <Typography
                              sx={{ mr: 0.8, color: "#777", fontWeight: 700 }}
                            >
                              ₹
                            </Typography>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Stock"
                        name="stock"
                        type="number"
                        value={form.stock}
                        onChange={handleChange}
                        inputProps={{ min: 0, step: 1 }}
                        disabled={saving}
                        sx={inputSx}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </MotionItem>

            <MotionItem index={2}>
              <Card elevation={0} sx={cardSx}>
                <CardContent sx={contentSx}>
                  <SectionHeader
                    icon={<ImageRounded />}
                    title="Product Images"
                    description="Upload clear images, up to 5MB per image."
                  />

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleFileChange}
                  />

                  <Box
                    component={motion.div}
                    whileHover={{ borderColor: "#D8B536", bgcolor: "#FFFCF1" }}
                    sx={{
                      p: { xs: 1.4, sm: 1.8 },
                      display: "flex",
                      alignItems: "center",
                      gap: 1.2,
                      border: "1px dashed #D9D9D9",
                      borderRadius: "7px",
                      bgcolor: "#FCFCFC",
                      transition: "background-color 180ms ease",
                    }}
                  >
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        flexShrink: 0,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: "7px",
                        bgcolor: "#FFF5CF",
                        color: "#947000",
                      }}
                    >
                      <CloudUploadRounded />
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: "0.77rem", fontWeight: 850 }}>
                        Upload product photos
                      </Typography>
                      <Typography
                        sx={{ mt: 0.25, color: "#888", fontSize: "0.67rem" }}
                      >
                        Select one or multiple image files.
                      </Typography>
                    </Box>

                    <Button
                      type="button"
                      variant="outlined"
                      size="small"
                      startIcon={<AddPhotoAlternateRounded />}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={saving}
                      sx={{
                        minWidth: 0,
                        px: 1.2,
                        minHeight: 34,
                        borderRadius: "6px",
                        borderColor: "#DCDCDC",
                        color: "#333333",
                        fontSize: "0.68rem",
                        fontWeight: 850,
                        whiteSpace: "nowrap",
                        "&:hover": {
                          borderColor: "#D0AC28",
                          bgcolor: "#FFF9E4",
                        },
                      }}
                    >
                      Add Images
                    </Button>
                  </Box>

                  {allImages.length > 0 && (
                    <Box
                      sx={{
                        mt: 1.5,
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "repeat(2, minmax(0, 1fr))",
                          sm: "repeat(3, minmax(0, 1fr))",
                          md: "repeat(4, minmax(0, 1fr))",
                        },
                        gap: 1,
                      }}
                    >
                      <AnimatePresence>
                        {existingImages.map((image, index) => (
                          <MotionCard
                            key={`existing-${image.url}-${index}`}
                            layout
                            initial={{ opacity: 0, scale: 0.94 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            elevation={0}
                            sx={{
                              position: "relative",
                              aspectRatio: "1 / 1",
                              overflow: "hidden",
                              border: "1px solid #E6E6E6",
                              borderRadius: "7px",
                              bgcolor: "#F7F7F7",
                            }}
                          >
                            <Box
                              component="img"
                              src={image.url}
                              alt={`Product ${index + 1}`}
                              sx={{
                                width: "100%",
                                height: "100%",
                                display: "block",
                                objectFit: "cover",
                              }}
                            />

                            <IconButton
                              type="button"
                              size="small"
                              aria-label={`Remove existing image ${index + 1}`}
                              onClick={() => removeExistingImage(index)}
                              disabled={saving}
                              sx={{
                                position: "absolute",
                                top: 5,
                                right: 5,
                                width: 28,
                                height: 28,
                                bgcolor: "rgba(255,255,255,0.95)",
                                color: "#B3261E",
                                "&:hover": { bgcolor: "#FFFFFF" },
                              }}
                            >
                              <DeleteOutlineRounded sx={{ fontSize: 17 }} />
                            </IconButton>
                          </MotionCard>
                        ))}

                        {previewUrls.map((url, index) => (
                          <MotionCard
                            key={`preview-${url}`}
                            layout
                            initial={{ opacity: 0, scale: 0.94 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            elevation={0}
                            sx={{
                              position: "relative",
                              aspectRatio: "1 / 1",
                              overflow: "hidden",
                              border: "1px solid #E6E6E6",
                              borderRadius: "7px",
                              bgcolor: "#F7F7F7",
                            }}
                          >
                            <Box
                              component="img"
                              src={url}
                              alt={`New product ${index + 1}`}
                              sx={{
                                width: "100%",
                                height: "100%",
                                display: "block",
                                objectFit: "cover",
                              }}
                            />

                            <Chip
                              label="New"
                              size="small"
                              sx={{
                                position: "absolute",
                                top: 5,
                                left: 5,
                                height: 21,
                                borderRadius: "4px",
                                bgcolor: "#F4C430",
                                color: "#111",
                                fontWeight: 900,
                                fontSize: "0.6rem",
                              }}
                            />

                            <IconButton
                              type="button"
                              size="small"
                              aria-label={`Remove new image ${index + 1}`}
                              onClick={() => removeSelectedImage(index)}
                              disabled={saving}
                              sx={{
                                position: "absolute",
                                top: 5,
                                right: 5,
                                width: 28,
                                height: 28,
                                bgcolor: "rgba(255,255,255,0.95)",
                                color: "#B3261E",
                                "&:hover": { bgcolor: "#FFFFFF" },
                              }}
                            >
                              <DeleteOutlineRounded sx={{ fontSize: 17 }} />
                            </IconButton>
                          </MotionCard>
                        ))}
                      </AnimatePresence>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </MotionItem>

            <MotionItem index={3}>
              <Card elevation={0} sx={cardSx}>
                <CardContent sx={contentSx}>
                  <SectionHeader
                    icon={<VideoLibraryRounded />}
                    title="Product Video"
                    description="Add an optional product demonstration."
                  />

                  <TextField
                    fullWidth
                    label="Video URL"
                    name="video"
                    value={form.video}
                    onChange={handleChange}
                    disabled={saving}
                    placeholder="https://..."
                    helperText="Optional product demonstration video URL."
                    sx={inputSx}
                  />
                </CardContent>
              </Card>
            </MotionItem>
          </Stack>
        </Grid>

        <Grid item xs={12} md={4.5} sx={{ minWidth: 0 }}>
          <Stack
            spacing={{ xs: 1.2, sm: 1.5 }}
            sx={{
              position: { md: "sticky" },
              top: { md: 16 },
            }}
          >
            <MotionItem index={1}>
              <Card elevation={0} sx={cardSx}>
                <CardContent sx={contentSx}>
                  <SectionHeader
                    icon={<TuneRounded />}
                    title="Product Settings"
                    description="Control how the product appears in your store."
                  />

                  <Stack spacing={0.5}>
                    {[
                      {
                        name: "isActive",
                        title: "Active Product",
                        description:
                          "Make this product available to customers.",
                      },
                      {
                        name: "isFeatured",
                        title: "Featured Product",
                        description: "Show this product in featured sections.",
                      },
                      {
                        name: "customizationAvailable",
                        title: "Customization Available",
                        description:
                          "Allow customers to customize this product.",
                      },
                    ].map((item) => (
                      <Box
                        key={item.name}
                        sx={{
                          px: 0.8,
                          py: 0.5,
                          borderRadius: "6px",
                          transition: "background-color 150ms ease",
                          "&:hover": { bgcolor: "#FAFAFA" },
                        }}
                      >
                        <FormControlLabel
                          sx={{
                            m: 0,
                            width: "100%",
                            alignItems: "center",
                            "& .MuiFormControlLabel-label": {
                              flex: 1,
                              minWidth: 0,
                            },
                          }}
                          control={
                            <Checkbox
                              name={item.name}
                              checked={form[item.name]}
                              onChange={handleBooleanChange}
                              disabled={saving}
                              size="small"
                              sx={{
                                p: 0.8,
                                mr: 0.6,
                                "&.Mui-checked": { color: "#D9B32C" },
                              }}
                            />
                          }
                          label={
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                sx={{
                                  fontSize: "0.76rem",
                                  fontWeight: 850,
                                  lineHeight: 1.4,
                                }}
                              >
                                {item.title}
                              </Typography>
                              <Typography
                                sx={{
                                  mt: 0.2,
                                  fontSize: "0.66rem",
                                  lineHeight: 1.45,
                                  color: "#898989",
                                }}
                              >
                                {item.description}
                              </Typography>
                            </Box>
                          }
                        />
                      </Box>
                    ))}
                  </Stack>

                  <AnimatePresence initial={false}>
                    {form.customizationAvailable && (
                      <motion.div
                        key="customization-options"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{ overflow: "hidden" }}
                      >
                        <Divider sx={{ my: 1.5 }} />

                        <Typography
                          sx={{
                            mb: 1,
                            fontSize: "0.76rem",
                            fontWeight: 900,
                          }}
                        >
                          Customization Options
                        </Typography>

                        <Stack direction="row" flexWrap="wrap" gap={0.7}>
                          {customizationTypes.map((option) => {
                            const selected =
                              form.customizationOptions.includes(option);

                            return (
                              <Chip
                                key={option}
                                label={option}
                                clickable
                                onClick={() =>
                                  handleCustomizationChange(option)
                                }
                                sx={{
                                  maxWidth: "100%",
                                  height: 29,
                                  borderRadius: "5px",
                                  bgcolor: selected ? "#F4C430" : "#F7F7F7",
                                  color: selected ? "#171717" : "#666666",
                                  border: selected
                                    ? "1px solid #D7AB00"
                                    : "1px solid #E7E7E7",
                                  fontWeight: 800,
                                  fontSize: "0.65rem",
                                  "& .MuiChip-label": {
                                    px: 1,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  },
                                  "&:hover": {
                                    bgcolor: selected ? "#E7B700" : "#FFFBEA",
                                  },
                                }}
                              />
                            );
                          })}
                        </Stack>

                        {!form.customizationOptions.length && (
                          <FormHelperText error sx={{ mt: 1 }}>
                            Select at least one option.
                          </FormHelperText>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </MotionItem>

            <MotionItem index={2}>
              <Card
                elevation={0}
                sx={{
                  ...cardSx,
                  bgcolor: "#151515",
                  color: "#FFFFFF",
                  borderColor: "#292929",
                  "&:hover": {
                    borderColor: "#6B5B28",
                    boxShadow: "0 8px 26px rgba(0,0,0,0.12)",
                  },
                }}
              >
                <CardContent sx={contentSx}>
                  <Stack direction="row" spacing={1.1} alignItems="center">
                    <Box
                      sx={{
                        width: 37,
                        height: 37,
                        flexShrink: 0,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: "7px",
                        bgcolor: "#F4C430",
                        color: "#151515",
                      }}
                    >
                      <CloudUploadRounded sx={{ fontSize: 21 }} />
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: "0.9rem",
                          fontWeight: 900,
                          color: "#FFFFFF",
                        }}
                      >
                        Ready to publish?
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.25,
                          fontSize: "0.68rem",
                          color: "#B8B8B8",
                          lineHeight: 1.5,
                        }}
                      >
                        Review your information before saving.
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 1.7, borderColor: "#303030" }} />

                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={1}
                    >
                      <Typography
                        sx={{ fontSize: "0.72rem", color: "#B8B8B8" }}
                      >
                        Product images
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          fontWeight: 850,
                          color: "#FFF",
                        }}
                      >
                        {allImages.length}
                      </Typography>
                    </Stack>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={1}
                    >
                      <Typography
                        sx={{ fontSize: "0.72rem", color: "#B8B8B8" }}
                      >
                        Product status
                      </Typography>
                      <Chip
                        size="small"
                        label={form.isActive ? "Active" : "Inactive"}
                        sx={{
                          height: 23,
                          borderRadius: "5px",
                          bgcolor: form.isActive ? "#263C2D" : "#343434",
                          color: form.isActive ? "#A5E6B6" : "#D0D0D0",
                          fontSize: "0.65rem",
                          fontWeight: 850,
                        }}
                      />
                    </Stack>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={1}
                    >
                      <Typography
                        sx={{ fontSize: "0.72rem", color: "#B8B8B8" }}
                      >
                        Customization
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          color: "#FFFFFF",
                        }}
                      >
                        {form.customizationAvailable ? "Enabled" : "Disabled"}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Button
                    fullWidth
                    type="submit"
                    disabled={saving}
                    variant="contained"
                    startIcon={
                      saving ? (
                        <CircularProgress size={16} sx={{ color: "#151515" }} />
                      ) : (
                        <SaveRounded />
                      )
                    }
                    sx={{
                      mt: 2,
                      minHeight: 42,
                      borderRadius: "7px",
                      bgcolor: "#F4C430",
                      color: "#151515",
                      fontSize: "0.75rem",
                      fontWeight: 900,
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#E5B500", boxShadow: "none" },
                      "&:disabled": {
                        bgcolor: "#363636",
                        color: "#858585",
                      },
                    }}
                  >
                    {saving
                      ? "Saving..."
                      : isEdit
                        ? "Update Product"
                        : "Create Product"}
                  </Button>

                  <Button
                    fullWidth
                    type="button"
                    onClick={() => navigate("/admin/products")}
                    disabled={saving}
                    startIcon={<ArrowBackRounded />}
                    sx={{
                      minHeight: 35,
                      borderRadius: "6px",
                      color: "#BDBDBD",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      "&:hover": {
                        bgcolor: "#242424",
                        color: "#FFFFFF",
                      },
                    }}
                  >
                    Cancel and go back
                  </Button>
                </CardContent>
              </Card>
            </MotionItem>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductForm;
