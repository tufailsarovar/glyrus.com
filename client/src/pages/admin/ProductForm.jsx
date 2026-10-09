// Glyrus — ProductForm.jsx
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
} from "@mui/icons-material";
import { motion } from "framer-motion";
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
  "NFC Tags",
  "NFC Keychains",
  "NFC Stickers",
  "NFC Stands",
  "NFC Accessories",
  "Business Solutions",
  "Other",
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
  data?.product ||
  data?.data?.product ||
  data?.data ||
  data;

const getImageUrl = (image) => {
  if (!image) return "";

  if (typeof image === "string") return image;

  return (
    image?.url ||
    image?.secure_url ||
    image?.src ||
    image?.path ||
    ""
  );
};

const getImages = (product) => {
  const images =
    product?.images ||
    product?.productImages ||
    [];

  if (Array.isArray(images)) {
    return images
      .map(getImageUrl)
      .filter(Boolean);
  }

  if (typeof images === "string" && images.trim()) {
    return [images.trim()];
  }

  const fallback = getImageUrl(
    product?.image ||
      product?.imageUrl ||
      product?.thumbnail
  );

  return fallback ? [fallback] : [];
};

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const isEdit = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});

  const allImages = useMemo(
    () => [...existingImages, ...previewUrls],
    [existingImages, previewUrls]
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
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

        const response = await api.get(
          `/api/products/${id}`
        );

        const product = getProductData(response?.data);

        if (!product) {
          throw new Error("Product not found.");
        }

        const productImages = getImages(product);

        setExistingImages(productImages);

        setForm({
          name:
            product?.name ||
            product?.title ||
            "",
          title:
            product?.title ||
            product?.name ||
            "",
          category:
            product?.category ||
            "NFC Cards",
          description:
            product?.description || "",
          price:
            product?.price ??
            "",
          discountPrice:
            product?.discountPrice ??
            product?.salePrice ??
            "",
          stock:
            product?.stock ??
            product?.inventory ??
            "",
          sku:
            product?.sku || "",
          images: productImages,
          video:
            product?.video ||
            product?.videoUrl ||
            "",
          isActive:
            typeof product?.isActive ===
            "boolean"
              ? product.isActive
              : typeof product?.active ===
                "boolean"
              ? product.active
              : true,
          isFeatured:
            Boolean(product?.isFeatured),
          customizationAvailable:
            Boolean(
              product?.customizationAvailable
            ),
          customizationOptions:
            Array.isArray(
              product?.customizationOptions
            )
              ? product.customizationOptions
              : [],
        });
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Unable to load product."
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
      const current =
        previous.customizationOptions || [];

      const exists = current.includes(option);

      return {
        ...previous,
        customizationOptions: exists
          ? current.filter(
              (item) => item !== option
            )
          : [...current, option],
      };
    });
  };

  const handleFileChange = (event) => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) return;

    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const maxSize = 5 * 1024 * 1024;

      return isImage && file.size <= maxSize;
    });

    if (validFiles.length !== files.length) {
      setError(
        "Only image files up to 5MB each can be uploaded."
      );
    } else {
      setError("");
    }

    const urls = validFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setSelectedFiles((previous) => [
      ...previous,
      ...validFiles,
    ]);

    setPreviewUrls((previous) => [
      ...previous,
      ...urls,
    ]);

    event.target.value = "";
  };

  const removeExistingImage = (index) => {
    setExistingImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index)
    );
  };

  const removeSelectedImage = (index) => {
    const url = previewUrls[index];

    if (url) {
      URL.revokeObjectURL(url);
    }

    setPreviewUrls((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index)
    );

    setSelectedFiles((previous) =>
      previous.filter((_, fileIndex) => fileIndex !== index)
    );
  };

  const buildPayload = () => {
    const payload = new FormData();

    payload.append(
      "name",
      form.name.trim()
    );

    payload.append(
      "title",
      (form.title || form.name).trim()
    );

    payload.append(
      "category",
      form.category
    );

    payload.append(
      "description",
      form.description.trim()
    );

    payload.append(
      "price",
      String(Number(form.price))
    );

    if (
      form.discountPrice !== "" &&
      form.discountPrice !== null &&
      form.discountPrice !== undefined
    ) {
      payload.append(
        "discountPrice",
        String(Number(form.discountPrice))
      );
    }

    payload.append(
      "stock",
      String(
        form.stock === ""
          ? 0
          : Number(form.stock)
      )
    );

    if (form.sku.trim()) {
      payload.append(
        "sku",
        form.sku.trim()
      );
    }

    if (form.video.trim()) {
      payload.append(
        "video",
        form.video.trim()
      );
    }

    payload.append(
      "isActive",
      String(form.isActive)
    );

    payload.append(
      "isFeatured",
      String(form.isFeatured)
    );

    payload.append(
      "customizationAvailable",
      String(
        form.customizationAvailable
      )
    );

    payload.append(
      "customizationOptions",
      JSON.stringify(
        form.customizationAvailable
          ? form.customizationOptions
          : []
      )
    );

    payload.append(
      "existingImages",
      JSON.stringify(existingImages)
    );

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
      setError(
        "Please correct the highlighted fields."
      );
      return;
    }

    if (
      form.discountPrice !== "" &&
      Number(form.discountPrice) >
        Number(form.price)
    ) {
      setFieldErrors((previous) => ({
        ...previous,
        discountPrice:
          "Discount price cannot be higher than the original price.",
      }));
      setError(
        "Please correct the highlighted fields."
      );
      return;
    }

    if (
      form.customizationAvailable &&
      !form.customizationOptions.length
    ) {
      setError(
        "Select at least one customization option."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = buildPayload();

      let response;

      if (isEdit) {
        response = await api.put(
          `/api/admin/products/${id}`,
          payload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        response = await api.post(
          "/api/admin/products",
          payload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      if (response?.data?.success === false) {
        throw new Error(
          response?.data?.message ||
            "Unable to save product."
        );
      }

      setSuccess(
        isEdit
          ? "Product updated successfully."
          : "Product created successfully."
      );

      setTimeout(() => {
        navigate("/admin/products");
      }, 700);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to save the product."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
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
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        width: "100%",
        pb: { xs: 3, md: 5 },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: { xs: 2.5, md: 3.5 } }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.2}
        >
          <IconButton
            onClick={() =>
              navigate("/admin/products")
            }
            disabled={saving}
            sx={{
              border: "1px solid #E4E4E4",
              borderRadius: 2.5,
              bgcolor: "#fff",
            }}
          >
            <ArrowBackRounded />
          </IconButton>

          <Box>
            <Typography
              sx={{
                fontSize: {
                  xs: "1.45rem",
                  sm: "1.85rem",
                  md: "2.2rem",
                },
                fontWeight: 900,
                letterSpacing: "-0.04em",
                color: "#111",
              }}
            >
              {isEdit
                ? "Edit Product"
                : "Add Product"}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                color: "#777",
                fontSize: {
                  xs: "0.78rem",
                  sm: "0.88rem",
                },
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
              <CircularProgress
                size={18}
                sx={{ color: "#555" }}
              />
            ) : (
              <SaveRounded />
            )
          }
          disabled={saving}
          sx={{
            minHeight: 45,
            borderRadius: 2.5,
            bgcolor: "#F4C430",
            color: "#111",
            fontWeight: 900,
            px: 2.5,
            "&:hover": {
              bgcolor: "#E5B500",
            },
            "&:disabled": {
              bgcolor: "#E8E8E8",
              color: "#999",
            },
          }}
        >
          {saving
            ? "Saving..."
            : isEdit
            ? "Update Product"
            : "Save Product"}
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

      <Grid
        container
        spacing={{ xs: 2, md: 2.5 }}
      >
        <Grid item xs={12} md={7.5}>
          <Stack spacing={2.5}>
            <MotionCard
              elevation={0}
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{ duration: 0.35 }}
              sx={{
                borderRadius: { xs: 3, md: 4 },
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 2, sm: 3 },
                  "&:last-child": {
                    pb: { xs: 2, sm: 3 },
                  },
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: "1.1rem",
                    color: "#111",
                  }}
                >
                  Basic Information
                </Typography>

                <Typography
                  sx={{
                    mt: 0.4,
                    mb: 2.5,
                    color: "#888",
                    fontSize: "0.78rem",
                  }}
                >
                  Add the core information customers will
                  see.
                </Typography>

                <Grid container spacing={2}>
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
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      disabled={saving}
                    >
                      <InputLabel>
                        Category
                      </InputLabel>

                      <Select
                        label="Category"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                      >
                        {categories.map(
                          (category) => (
                            <MenuItem
                              key={category}
                              value={category}
                            >
                              {category}
                            </MenuItem>
                          )
                        )}
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
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      multiline
                      minRows={5}
                      label="Product Description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      error={Boolean(
                        fieldErrors.description
                      )}
                      helperText={
                        fieldErrors.description
                      }
                      disabled={saving}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </MotionCard>

            <MotionCard
              elevation={0}
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.35,
                delay: 0.05,
              }}
              sx={{
                borderRadius: { xs: 3, md: 4 },
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 2, sm: 3 },
                  "&:last-child": {
                    pb: { xs: 2, sm: 3 },
                  },
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: "1.1rem",
                    color: "#111",
                  }}
                >
                  Pricing & Inventory
                </Typography>

                <Typography
                  sx={{
                    mt: 0.4,
                    mb: 2.5,
                    color: "#888",
                    fontSize: "0.78rem",
                  }}
                >
                  Configure the product price and available
                  stock.
                </Typography>

                <Grid container spacing={2}>
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
                        fieldErrors.price ||
                        "Original price in INR"
                      }
                      inputProps={{
                        min: 0,
                        step: "0.01",
                      }}
                      disabled={saving}
                      InputProps={{
                        startAdornment: (
                          <Typography
                            sx={{
                              mr: 1,
                              color: "#777",
                              fontWeight: 700,
                            }}
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
                      error={Boolean(
                        fieldErrors.discountPrice
                      )}
                      helperText={
                        fieldErrors.discountPrice ||
                        "Optional sale price"
                      }
                      inputProps={{
                        min: 0,
                        step: "0.01",
                      }}
                      disabled={saving}
                      InputProps={{
                        startAdornment: (
                          <Typography
                            sx={{
                              mr: 1,
                              color: "#777",
                              fontWeight: 700,
                            }}
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
                      inputProps={{
                        min: 0,
                        step: 1,
                      }}
                      disabled={saving}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </MotionCard>

            <MotionCard
              elevation={0}
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.35,
                delay: 0.1,
              }}
              sx={{
                borderRadius: { xs: 3, md: 4 },
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 2, sm: 3 },
                  "&:last-child": {
                    pb: { xs: 2, sm: 3 },
                  },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ mb: 0.5 }}
                >
                  <ImageRounded
                    sx={{
                      color: "#A17B00",
                    }}
                  />

                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: "1.1rem",
                      color: "#111",
                    }}
                  >
                    Product Images
                  </Typography>
                </Stack>

                <Typography
                  sx={{
                    color: "#888",
                    fontSize: "0.78rem",
                    mb: 2.5,
                  }}
                >
                  Upload clear product images. Maximum 5MB
                  per image.
                </Typography>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleFileChange}
                />

                <Button
                  variant="outlined"
                  startIcon={
                    <AddPhotoAlternateRounded />
                  }
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={saving}
                  sx={{
                    minHeight: 44,
                    borderRadius: 2.5,
                    borderColor: "#DCDCDC",
                    color: "#444",
                    "&:hover": {
                      borderColor: "#F4C430",
                      bgcolor: "#FFFBEA",
                    },
                  }}
                >
                  Add Images
                </Button>

                {allImages.length > 0 && (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "repeat(2, minmax(0, 1fr))",
                        sm: "repeat(3, minmax(0, 1fr))",
                        md: "repeat(4, minmax(0, 1fr))",
                      },
                      gap: 1.5,
                      mt: 2.5,
                    }}
                  >
                    {existingImages.map(
                      (image, index) => (
                        <Box
                          key={`existing-${image}-${index}`}
                          sx={{
                            position: "relative",
                            aspectRatio: "1 / 1",
                            borderRadius: 3,
                            overflow: "hidden",
                            border:
                              "1px solid #E5E5E5",
                            bgcolor: "#F7F7F7",
                          }}
                        >
                          <Box
                            component="img"
                            src={image}
                            alt={`Product ${index + 1}`}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />

                          <IconButton
                            type="button"
                            size="small"
                            onClick={() =>
                              removeExistingImage(
                                index
                              )
                            }
                            disabled={saving}
                            sx={{
                              position: "absolute",
                              top: 7,
                              right: 7,
                              width: 30,
                              height: 30,
                              bgcolor:
                                "rgba(255,255,255,0.92)",
                              color: "#B3261E",
                              "&:hover": {
                                bgcolor: "#FFFFFF",
                              },
                            }}
                          >
                            <DeleteOutlineRounded
                              sx={{ fontSize: 18 }}
                            />
                          </IconButton>
                        </Box>
                      )
                    )}

                    {previewUrls.map(
                      (url, index) => (
                        <Box
                          key={`preview-${url}`}
                          sx={{
                            position: "relative",
                            aspectRatio: "1 / 1",
                            borderRadius: 3,
                            overflow: "hidden",
                            border:
                              "1px solid #E5E5E5",
                            bgcolor: "#F7F7F7",
                          }}
                        >
                          <Box
                            component="img"
                            src={url}
                            alt={`New product ${
                              index + 1
                            }`}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />

                          <Chip
                            label="New"
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 7,
                              left: 7,
                              height: 24,
                              bgcolor: "#F4C430",
                              color: "#111",
                              fontWeight: 900,
                              fontSize: "0.62rem",
                            }}
                          />

                          <IconButton
                            type="button"
                            size="small"
                            onClick={() =>
                              removeSelectedImage(
                                index
                              )
                            }
                            disabled={saving}
                            sx={{
                              position: "absolute",
                              top: 7,
                              right: 7,
                              width: 30,
                              height: 30,
                              bgcolor:
                                "rgba(255,255,255,0.92)",
                              color: "#B3261E",
                              "&:hover": {
                                bgcolor: "#FFFFFF",
                              },
                            }}
                          >
                            <DeleteOutlineRounded
                              sx={{ fontSize: 18 }}
                            />
                          </IconButton>
                        </Box>
                      )
                    )}
                  </Box>
                )}
              </CardContent>
            </MotionCard>

            <MotionCard
              elevation={0}
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.35,
                delay: 0.15,
              }}
              sx={{
                borderRadius: { xs: 3, md: 4 },
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 2, sm: 3 },
                  "&:last-child": {
                    pb: { xs: 2, sm: 3 },
                  },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ mb: 2 }}
                >
                  <VideoLibraryRounded
                    sx={{
                      color: "#A17B00",
                    }}
                  />

                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: "1.1rem",
                      color: "#111",
                    }}
                  >
                    Product Video
                  </Typography>
                </Stack>

                <TextField
                  fullWidth
                  label="Video URL"
                  name="video"
                  value={form.video}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="https://..."
                  helperText="Optional product demonstration video URL"
                />
              </CardContent>
            </MotionCard>
          </Stack>
        </Grid>

        <Grid item xs={12} md={4.5}>
          <Stack
            spacing={2.5}
            sx={{
              position: {
                md: "sticky",
              },
              top: {
                md: 90,
              },
            }}
          >
            <MotionCard
              elevation={0}
              initial={{
                opacity: 0,
                x: 12,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{ duration: 0.35 }}
              sx={{
                borderRadius: { xs: 3, md: 4 },
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 2, sm: 3 },
                  "&:last-child": {
                    pb: { xs: 2, sm: 3 },
                  },
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: "1.1rem",
                    color: "#111",
                  }}
                >
                  Product Settings
                </Typography>

                <Typography
                  sx={{
                    mt: 0.4,
                    mb: 2,
                    color: "#888",
                    fontSize: "0.78rem",
                  }}
                >
                  Control how this product appears in the
                  store.
                </Typography>

                <Stack spacing={0.5}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="isActive"
                        checked={form.isActive}
                        onChange={
                          handleBooleanChange
                        }
                        disabled={saving}
                        sx={{
                          "&.Mui-checked": {
                            color: "#F4C430",
                          },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography
                          sx={{
                            fontSize: "0.86rem",
                            fontWeight: 800,
                          }}
                        >
                          Active Product
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: "0.7rem",
                            color: "#999",
                          }}
                        >
                          Make this product available
                          to customers.
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        name="isFeatured"
                        checked={form.isFeatured}
                        onChange={
                          handleBooleanChange
                        }
                        disabled={saving}
                        sx={{
                          "&.Mui-checked": {
                            color: "#F4C430",
                          },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography
                          sx={{
                            fontSize: "0.86rem",
                            fontWeight: 800,
                          }}
                        >
                          Featured Product
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: "0.7rem",
                            color: "#999",
                          }}
                        >
                          Show this product in featured
                          sections.
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        name="customizationAvailable"
                        checked={
                          form.customizationAvailable
                        }
                        onChange={
                          handleBooleanChange
                        }
                        disabled={saving}
                        sx={{
                          "&.Mui-checked": {
                            color: "#F4C430",
                          },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography
                          sx={{
                            fontSize: "0.86rem",
                            fontWeight: 800,
                          }}
                        >
                          Customization Available
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: "0.7rem",
                            color: "#999",
                          }}
                        >
                          Allow customers to customize
                          this product.
                        </Typography>
                      </Box>
                    }
                  />
                </Stack>

                {form.customizationAvailable && (
                  <>
                    <Divider sx={{ my: 2 }} />

                    <Typography
                      sx={{
                        fontSize: "0.82rem",
                        fontWeight: 900,
                        color: "#333",
                        mb: 1,
                      }}
                    >
                      Customization Options
                    </Typography>

                    <Stack
                      direction="row"
                      flexWrap="wrap"
                      gap={0.8}
                    >
                      {customizationTypes.map(
                        (option) => {
                          const selected =
                            form.customizationOptions.includes(
                              option
                            );

                          return (
                            <Chip
                              key={option}
                              label={option}
                              clickable
                              onClick={() =>
                                handleCustomizationChange(
                                  option
                                )
                              }
                              sx={{
                                bgcolor: selected
                                  ? "#F4C430"
                                  : "#F6F6F6",
                                color: selected
                                  ? "#111"
                                  : "#666",
                                border: selected
                                  ? "1px solid #D7AB00"
                                  : "1px solid #E5E5E5",
                                fontWeight: 800,
                                fontSize:
                                  "0.68rem",
                                "&:hover": {
                                  bgcolor: selected
                                    ? "#E7B700"
                                    : "#FFFBEA",
                                },
                              }}
                            />
                          );
                        }
                      )}
                    </Stack>

                    {!form.customizationOptions
                      .length && (
                      <FormHelperText
                        error
                        sx={{ mt: 1 }}
                      >
                        Select at least one option.
                      </FormHelperText>
                    )}
                  </>
                )}
              </CardContent>
            </MotionCard>

            <MotionCard
              elevation={0}
              initial={{
                opacity: 0,
                x: 12,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.35,
                delay: 0.05,
              }}
              sx={{
                borderRadius: { xs: 3, md: 4 },
                bgcolor: "#111111",
                color: "#FFFFFF",
                border: "1px solid #222222",
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 2, sm: 3 },
                  "&:last-child": {
                    pb: { xs: 2, sm: 3 },
                  },
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.2}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2.5,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "#F4C430",
                      color: "#111",
                    }}
                  >
                    <CloudUploadRounded />
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        color: "#fff",
                        fontSize: "0.98rem",
                      }}
                    >
                      Ready to publish?
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.25,
                        color: "#AAAAAA",
                        fontSize: "0.72rem",
                        lineHeight: 1.45,
                      }}
                    >
                      Review your information before
                      saving the product.
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  fullWidth
                  type="submit"
                  disabled={saving}
                  variant="contained"
                  startIcon={
                    saving ? (
                      <CircularProgress
                        size={18}
                        sx={{ color: "#555" }}
                      />
                    ) : (
                      <SaveRounded />
                    )
                  }
                  sx={{
                    mt: 2.5,
                    minHeight: 48,
                    borderRadius: 2.5,
                    bgcolor: "#F4C430",
                    color: "#111",
                    fontWeight: 900,
                    "&:hover": {
                      bgcolor: "#E5B500",
                    },
                    "&:disabled": {
                      bgcolor: "#333",
                      color: "#777",
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
                  onClick={() =>
                    navigate("/admin/products")
                  }
                  disabled={saving}
                  sx={{
                    mt: 1,
                    minHeight: 42,
                    borderRadius: 2.5,
                    color: "#AAAAAA",
                    fontWeight: 800,
                    "&:hover": {
                      bgcolor: "#1B1B1B",
                      color: "#FFFFFF",
                    },
                  }}
                >
                  Cancel
                </Button>
              </CardContent>
            </MotionCard>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductForm;