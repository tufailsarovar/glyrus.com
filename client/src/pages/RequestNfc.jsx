import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowForwardRounded,
  BusinessRounded,
  CheckCircleRounded,
  DesignServicesRounded,
  EmailOutlined,
  Inventory2Outlined,
  LocalPhoneRounded,
  SendRounded,
  TouchAppRounded,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { submitRequest } from "../services/api.js";

const MotionBox = motion(Box);

const initialForm = {
  name: "",
  email: "",
  mobile: "",
  businessName: "",
  productType: "",
  quantity: "",
  customization: "",
  message: "",
};

const productOptions = [
  "NFC Card",
  "NFC Keychain",
  "NFC Tag",
  "NFC Stand",
  "NFC Business Card",
  "Custom NFC Product",
  "Not Sure",
];

const quantityOptions = ["1–10", "11–50", "51–100", "101–500", "500+"];

const RequestNfc = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const selectProduct = (product) => {
    setForm((prev) => ({
      ...prev,
      productType: product,
    }));

    setErrors((prev) => ({
      ...prev,
      productType: "",
    }));
  };

  const selectQuantity = (quantity) => {
    setForm((prev) => ({
      ...prev,
      quantity,
    }));

    setErrors((prev) => ({
      ...prev,
      quantity: "",
    }));
  };

  const validate = () => {
    const next = {};

    if (!form.name.trim()) {
      next.name = "Full name is required";
    }

    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      next.email = "Enter a valid email";
    }

    if (!form.mobile.trim()) {
      next.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) {
      next.mobile = "Enter a valid 10-digit number";
    }

    if (!form.businessName.trim()) {
      next.businessName = "Business name is required";
    }

    if (!form.productType) {
      next.productType = "Choose a product";
    }

    if (!form.quantity) {
      next.quantity = "Choose quantity";
    }

    if (!form.message.trim()) {
      next.message = "Please describe your requirement";
    } else if (form.message.trim().length < 10) {
      next.message = "Please provide a little more detail";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSuccess("");
    setError("");

    if (!validate()) return;

    try {
      setSubmitting(true);

      const requirement = [
        `Business Name: ${form.businessName.trim()}`,
        `Product Type: ${form.productType}`,
        `Required Quantity: ${form.quantity}`,
        form.customization.trim()
          ? `Customization: ${form.customization.trim()}`
          : "",
        `Requirement: ${form.message.trim()}`,
      ]
        .filter(Boolean)
        .join("\n");

      const response = await submitRequest({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        mobile: form.mobile.trim(),
        requirement,
      });

      setSuccess(
        response?.data?.message ||
          "Your NFC request has been submitted successfully."
      );

      setForm(initialForm);
      setErrors({});
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to submit your request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #fffdf7 0%, #f8f7f3 55%, #ffffff 100%)",
        pb: { xs: 4, sm: 6, md: 8 },
      }}
    >
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 50% -40%, rgba(244,196,48,.22), transparent 42%), #111111",
          pt: { xs: 3.2, sm: 4.5, md: 5.5 },
          pb: { xs: 5.2, sm: 6.5, md: 7 },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: { xs: 180, md: 320 },
            height: { xs: 180, md: 320 },
            borderRadius: "50%",
            background: "rgba(244,196,48,.07)",
            top: -110,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />

        <Container
          maxWidth="sm"
          sx={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            px: { xs: 2.2, sm: 3 },
          }}
        >
          <MotionBox
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.7,
                px: 1.25,
                py: 0.6,
                borderRadius: 99,
                background: "rgba(244,196,48,.12)",
                border: "1px solid rgba(244,196,48,.22)",
                color: "#f4c430",
                fontSize: { xs: ".6rem", sm: ".65rem" },
                fontWeight: 900,
                letterSpacing: ".08em",
              }}
            >
              <TouchAppRounded sx={{ fontSize: 14 }} />
              NFC PRODUCT REQUEST
            </Box>

            <Typography
              component="h1"
              sx={{
                mt: 1.4,
                color: "#fff",
                fontSize: {
                  xs: "1.7rem",
                  sm: "2.35rem",
                  md: "2.8rem",
                },
                lineHeight: 1.08,
                fontWeight: 900,
                letterSpacing: "-.055em",
              }}
            >
              Tell Us What You{" "}
              <Box component="span" sx={{ color: "#f4c430" }}>
                Need
              </Box>
            </Typography>

            <Typography
              sx={{
                mt: 1,
                maxWidth: 480,
                mx: "auto",
                color: "rgba(255,255,255,.58)",
                fontSize: { xs: ".72rem", sm: ".82rem" },
                lineHeight: 1.6,
              }}
            >
              Need custom NFC products or a bulk order? Share your
              requirements and our team will get in touch.
            </Typography>
          </MotionBox>
        </Container>
      </Box>

      <Container
        maxWidth="sm"
        sx={{
          position: "relative",
          mt: { xs: -3, sm: -4 },
          px: { xs: 1.5, sm: 2 },
        }}
      >
        <MotionBox
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            delay: 0.08,
            ease: [0.2, 0.8, 0.2, 1],
          }}
        >
          <Paper
            component="form"
            onSubmit={handleSubmit}
            elevation={0}
            sx={{
              position: "relative",
              p: {
                xs: 2,
                sm: 3,
                md: 3.5,
              },
              borderRadius: {
                xs: "18px",
                sm: "22px",
              },
              border: "1px solid #e8e5dc",
              background: "rgba(255,255,255,.98)",
              boxShadow: "0 18px 55px rgba(17,17,17,.09)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background:
                  "linear-gradient(90deg, #dca900, #f4c430, #ffe58a, #f4c430, #dca900)",
              }}
            />

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                pb: { xs: 1.7, sm: 2 },
                mb: { xs: 2.3, sm: 2.8 },
                borderBottom: "1px solid #eeeeee",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: "1rem", sm: "1.15rem" },
                    fontWeight: 900,
                    color: "#111",
                    letterSpacing: "-.025em",
                  }}
                >
                  Request Details
                </Typography>

                <Typography
                  sx={{
                    mt: 0.35,
                    color: "#929292",
                    fontSize: { xs: ".64rem", sm: ".68rem" },
                  }}
                >
                  Fill in your details and requirements
                </Typography>
              </Box>

              <Box
                sx={{
                  width: { xs: 38, sm: 42 },
                  height: { xs: 38, sm: 42 },
                  flexShrink: 0,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#FFF5D2",
                  color: "#A97A00",
                }}
              >
                <Inventory2Outlined
                  sx={{ fontSize: { xs: 19, sm: 21 } }}
                />
              </Box>
            </Stack>

            <SectionTitle
              icon={<BusinessRounded />}
              title="Contact Information"
            />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: { xs: 1.5, sm: 1.7 },
                mb: { xs: 2.8, sm: 3 },
              }}
            >
              <Field
                required
                name="name"
                label="Full Name"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                autoComplete="name"
              />

              <Field
                required
                name="email"
                label="Email Address"
                placeholder="you@example.com"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                autoComplete="email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined
                        sx={{
                          fontSize: 18,
                          color: "#9A9A9A",
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />

              <Field
                required
                name="mobile"
                label="Mobile Number"
                placeholder="10-digit number"
                value={form.mobile}
                onChange={handleChange}
                error={errors.mobile}
                autoComplete="tel"
                inputProps={{
                  maxLength: 10,
                  inputMode: "numeric",
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.45}
                      >
                        <LocalPhoneRounded
                          sx={{
                            fontSize: 16,
                            color: "#9A9A9A",
                          }}
                        />

                        <Typography
                          sx={{
                            fontSize: ".74rem",
                            fontWeight: 800,
                            color: "#777",
                          }}
                        >
                          +91
                        </Typography>
                      </Stack>
                    </InputAdornment>
                  ),
                }}
              />

              <Field
                required
                name="businessName"
                label="Business Name"
                placeholder="Your business"
                value={form.businessName}
                onChange={handleChange}
                error={errors.businessName}
                autoComplete="organization"
              />
            </Box>

            <SectionTitle
              icon={<Inventory2Outlined />}
              title="Product Requirement"
            />

            <Typography
              sx={{
                mb: 1,
                color: "#777",
                fontSize: { xs: ".68rem", sm: ".72rem" },
                fontWeight: 600,
              }}
            >
              Select the product you are interested in
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  sm: "repeat(3, minmax(0, 1fr))",
                },
                gap: { xs: 0.9, sm: 1 },
              }}
            >
              {productOptions.map((product) => {
                const selected = form.productType === product;

                return (
                  <MotionBox
                    key={product}
                    whileTap={{ scale: 0.97 }}
                    sx={{ minWidth: 0 }}
                  >
                    <Box
                      component="button"
                      type="button"
                      onClick={() => selectProduct(product)}
                      sx={{
                        width: "100%",
                        minHeight: { xs: 43, sm: 46 },
                        px: { xs: 1, sm: 1.2 },
                        py: 0.7,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        borderRadius: "11px",
                        border: selected
                          ? "1.5px solid #D5A900"
                          : "1px solid #E2E2E2",
                        background: selected
                          ? "#FFF4C7"
                          : "#FFFFFF",
                        color: selected ? "#765700" : "#454545",
                        fontSize: {
                          xs: ".65rem",
                          sm: ".7rem",
                        },
                        fontWeight: selected ? 900 : 700,
                        cursor: "pointer",
                        transition:
                          "all 180ms cubic-bezier(.2,.8,.2,1)",
                        boxShadow: selected
                          ? "0 4px 14px rgba(244,196,48,.15)"
                          : "none",

                        "&:hover": {
                          borderColor: "#D5A900",
                          background: selected
                            ? "#FFF1B7"
                            : "#FFFDF4",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      {selected && (
                        <CheckCircleRounded
                          sx={{
                            mr: 0.55,
                            fontSize: 15,
                            color: "#C18F00",
                            flexShrink: 0,
                          }}
                        />
                      )}

                      <Box
                        component="span"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {product}
                      </Box>
                    </Box>
                  </MotionBox>
                );
              })}
            </Box>

            {errors.productType && (
              <Typography
                sx={{
                  mt: 0.65,
                  ml: 0.5,
                  color: "#D32F2F",
                  fontSize: ".62rem",
                  fontWeight: 600,
                }}
              >
                {errors.productType}
              </Typography>
            )}

            <Box sx={{ mt: { xs: 2, sm: 2.2 } }}>
              <Typography
                sx={{
                  mb: 1,
                  color: "#555",
                  fontSize: { xs: ".68rem", sm: ".72rem" },
                  fontWeight: 800,
                }}
              >
                Required Quantity
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(3, minmax(0, 1fr))",
                    sm: "repeat(5, minmax(0, 1fr))",
                  },
                  gap: 0.9,
                }}
              >
                {quantityOptions.map((quantity) => {
                  const selected = form.quantity === quantity;

                  return (
                    <MotionBox
                      key={quantity}
                      whileTap={{ scale: 0.96 }}
                    >
                      <Box
                        component="button"
                        type="button"
                        onClick={() => selectQuantity(quantity)}
                        sx={{
                          width: "100%",
                          height: { xs: 40, sm: 42 },
                          borderRadius: "10px",
                          border: selected
                            ? "1.5px solid #D5A900"
                            : "1px solid #E2E2E2",
                          background: selected
                            ? "#FFF4C7"
                            : "#fff",
                          color: selected ? "#765700" : "#555",
                          fontSize: {
                            xs: ".67rem",
                            sm: ".7rem",
                          },
                          fontWeight: selected ? 900 : 700,
                          cursor: "pointer",
                          transition:
                            "all 180ms cubic-bezier(.2,.8,.2,1)",

                          "&:hover": {
                            borderColor: "#D5A900",
                            background: "#FFFDF4",
                          },
                        }}
                      >
                        {quantity}
                      </Box>
                    </MotionBox>
                  );
                })}
              </Box>

              {errors.quantity && (
                <Typography
                  sx={{
                    mt: 0.65,
                    ml: 0.5,
                    color: "#D32F2F",
                    fontSize: ".62rem",
                    fontWeight: 600,
                  }}
                >
                  {errors.quantity}
                </Typography>
              )}
            </Box>

            <Box sx={{ mt: { xs: 2.8, sm: 3.1 } }}>
              <SectionTitle
                icon={<DesignServicesRounded />}
                title="Customization"
                optional
              />

              <Field
                name="customization"
                label="Customization Requirements"
                placeholder="Logo, colors, branding, finish, design..."
                value={form.customization}
                onChange={handleChange}
                multiline
                minRows={2}
                maxRows={4}
              />
            </Box>

            <Box sx={{ mt: { xs: 2.6, sm: 3 } }}>
              <SectionTitle
                icon={<SendRounded />}
                title="Tell Us More"
              />

              <Field
                required
                name="message"
                label="What do you need?"
                placeholder="Describe your requirement, preferred design, deadline or any other details..."
                value={form.message}
                onChange={handleChange}
                error={errors.message}
                multiline
                minRows={3}
                maxRows={6}
                inputProps={{
                  maxLength: 500,
                }}
                helperText={
                  errors.message || `${form.message.length}/500`
                }
              />
            </Box>

            <MotionBox
              whileTap={{ scale: submitting ? 1 : 0.985 }}
              sx={{ mt: { xs: 2.4, sm: 2.8 } }}
            >
              <Button
                type="submit"
                fullWidth
                disabled={submitting}
                startIcon={
                  submitting ? (
                    <Box
                      component="span"
                      sx={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(17,17,17,.25)",
                        borderTopColor: "#111",
                        borderRadius: "50%",
                        animation:
                          "requestSpin .7s linear infinite",
                        "@keyframes requestSpin": {
                          to: {
                            transform: "rotate(360deg)",
                          },
                        },
                      }}
                    />
                  ) : (
                    <SendRounded sx={{ fontSize: 18 }} />
                  )
                }
                endIcon={
                  !submitting ? (
                    <ArrowForwardRounded sx={{ fontSize: 18 }} />
                  ) : null
                }
                sx={{
                  minHeight: { xs: 46, sm: 50 },
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #F4C430 0%, #E8B900 100%)",
                  color: "#111",
                  fontSize: { xs: ".74rem", sm: ".8rem" },
                  fontWeight: 900,
                  boxShadow: "0 8px 22px rgba(244,196,48,.18)",

                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #F7CD42 0%, #E6B500 100%)",
                    boxShadow:
                      "0 12px 28px rgba(244,196,48,.25)",
                  },

                  "&:disabled": {
                    background: "#EBD88D",
                    color: "#777",
                    boxShadow: "none",
                  },
                }}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit NFC Request"}
              </Button>
            </MotionBox>

            <Typography
              sx={{
                mt: 1.1,
                textAlign: "center",
                color: "#A2A2A2",
                fontSize: ".6rem",
              }}
            >
              We will contact you regarding your request.
            </Typography>
          </Paper>
        </MotionBox>
      </Container>

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={5000}
        onClose={() => setSuccess("")}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          icon={<CheckCircleRounded />}
          onClose={() => setSuccess("")}
          sx={{
            borderRadius: 2,
            fontSize: ".75rem",
            fontWeight: 700,
          }}
        >
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={5000}
        onClose={() => setError("")}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setError("")}
          sx={{
            borderRadius: 2,
            fontSize: ".75rem",
            fontWeight: 700,
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const Field = ({
  error,
  helperText,
  sx,
  ...props
}) => (
  <TextField
    {...props}
    fullWidth
    size="small"
    error={Boolean(error)}
    helperText={error || helperText}
    sx={{
      "& .MuiOutlinedInput-root": {
        minHeight: props.multiline ? "auto" : { xs: 47, sm: 49 },
        borderRadius: "12px",
        backgroundColor: "#fff",
        fontSize: { xs: ".76rem", sm: ".8rem" },

        "& fieldset": {
          borderColor: "#DEDEDE",
          borderWidth: 1,
        },

        "&:hover": {
          backgroundColor: "#FFFDF7",

          "& fieldset": {
            borderColor: "#C8A000",
          },
        },

        "&.Mui-focused": {
          backgroundColor: "#fff",
          boxShadow: "0 0 0 3px rgba(244,196,48,.09)",

          "& fieldset": {
            borderColor: "#D1A500",
            borderWidth: 1.5,
          },
        },
      },

      "& .MuiInputLabel-root": {
        fontSize: { xs: ".74rem", sm: ".77rem" },
        color: "#777",
      },

      "& .MuiInputLabel-root.Mui-focused": {
        color: "#9A7500",
      },

      "& .MuiFormHelperText-root": {
        marginLeft: 0.5,
        marginTop: 0.4,
        fontSize: ".59rem",
      },

      "& .MuiInputBase-input::placeholder": {
        color: "#A4A4A4",
        opacity: 1,
      },

      ...sx,
    }}
  >
    {props.children}
  </TextField>
);

const SectionTitle = ({
  icon,
  title,
  optional = false,
}) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={0.9}
    sx={{ mb: 1.25 }}
  >
    <Box
      sx={{
        width: { xs: 32, sm: 34 },
        height: { xs: 32, sm: 34 },
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background:
          "linear-gradient(135deg, #FFF7D9 0%, #FFF0B5 100%)",
        color: "#B17F00",
        boxShadow:
          "inset 0 0 0 1px rgba(201,157,0,.08)",

        "& svg": {
          fontSize: { xs: 17, sm: 18 },
        },
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        fontSize: { xs: ".78rem", sm: ".83rem" },
        fontWeight: 900,
        color: "#151515",
        letterSpacing: "-.015em",
      }}
    >
      {title}
    </Typography>

    {optional && (
      <Typography
        sx={{
          color: "#A0A0A0",
          fontSize: { xs: ".62rem", sm: ".65rem" },
          fontWeight: 500,
        }}
      >
        optional
      </Typography>
    )}
  </Stack>
);

export default RequestNfc;