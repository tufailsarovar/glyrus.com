import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
  CheckCircleRounded,
  EmailOutlined,
  LocationOnOutlined,
  PhoneOutlined,
  SendRounded,
  SupportAgentRounded,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { submitContact } from "../services/api.js";

const MotionBox = motion(Box);

const initialForm = {
  name: "",
  email: "",
  mobile: "",
  subject: "",
  message: "",
};

const Contact = () => {
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

  const validate = () => {
    const next = {};

    if (!form.name.trim()) {
      next.name = "Name is required";
    }

    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      next.email = "Enter a valid email";
    }

    if (form.mobile.trim() && !/^[6-9]\d{9}$/.test(form.mobile.trim())) {
      next.mobile = "Enter a valid 10-digit number";
    }

    if (!form.subject.trim()) {
      next.subject = "Subject is required";
    }

    if (!form.message.trim()) {
      next.message = "Message is required";
    } else if (form.message.trim().length < 10) {
      next.message = "Please provide more details";
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

      const response = await submitContact({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        mobile: form.mobile.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });

      setSuccess(
        response?.data?.message ||
          "Your message has been sent successfully."
      );

      setForm(initialForm);
      setErrors({});
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to send your message. Please try again."
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
          "linear-gradient(180deg, #fffdf7 0%, #faf9f5 45%, #ffffff 100%)",
        overflow: "hidden",
        pb: { xs: 5, sm: 7, md: 10 },
      }}
    >
      {/* ================= HERO ================= */}
      <Box
        sx={{
          position: "relative",
          background: "#111111",
          overflow: "hidden",
          py: {
            xs: 4,
            sm: 5.5,
            md: 7,
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: { xs: 220, sm: 330, md: 440 },
            height: { xs: 220, sm: 330, md: 440 },
            borderRadius: "50%",
            top: {
              xs: -150,
              md: -260,
            },
            right: {
              xs: -110,
              md: -90,
            },
            background:
              "radial-gradient(circle, rgba(244,196,48,.20) 0%, rgba(244,196,48,0) 68%)",
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            width: { xs: 150, md: 260 },
            height: { xs: 150, md: 260 },
            borderRadius: "50%",
            bottom: -150,
            left: -100,
            background:
              "radial-gradient(circle, rgba(244,196,48,.08), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <Container
          maxWidth="md"
          sx={{
            position: "relative",
            zIndex: 2,
            px: { xs: 2, sm: 3 },
          }}
        >
          <MotionBox
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              ease: [0.2, 0.8, 0.2, 1],
            }}
            sx={{
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: {
                  xs: 44,
                  sm: 52,
                },
                height: {
                  xs: 44,
                  sm: 52,
                },
                mx: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, #FFF8DC, #FFECA0)",
                color: "#A97800",
                boxShadow:
                  "0 8px 28px rgba(244,196,48,.12)",
              }}
            >
              <SupportAgentRounded
                sx={{
                  fontSize: {
                    xs: 23,
                    sm: 27,
                  },
                }}
              />
            </Box>

            <Typography
              component="h1"
              sx={{
                mt: { xs: 1.5, sm: 1.8 },
                color: "#fff",
                fontWeight: 900,
                fontSize: {
                  xs: "1.85rem",
                  sm: "2.65rem",
                  md: "3.2rem",
                },
                lineHeight: 1.05,
                letterSpacing: "-.055em",
              }}
            >
              Let's{" "}
              <Box
                component="span"
                sx={{
                  color: "#F4C430",
                }}
              >
                Connect
              </Box>
            </Typography>

            <Typography
              sx={{
                mt: 1,
                maxWidth: 560,
                mx: "auto",
                color: "rgba(255,255,255,.58)",
                fontSize: {
                  xs: ".72rem",
                  sm: ".82rem",
                },
                lineHeight: 1.65,
              }}
            >
              Have a question about products, orders or
              customization? We're here to help.
            </Typography>
          </MotionBox>
        </Container>
      </Box>

      {/* ================= MAIN ================= */}
      <Container
        maxWidth="md"
        sx={{
          position: "relative",
          zIndex: 5,
          mt: {
            xs: -2,
            sm: -3,
            md: -3.5,
          },
          px: {
            xs: 1.5,
            sm: 2,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              md: "row",
            },
            gap: {
              xs: 2,
              md: 2.5,
            },
            alignItems: "stretch",
          }}
        >
          {/* ================= FORM ================= */}
          <MotionBox
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              delay: 0.05,
              ease: [0.2, 0.8, 0.2, 1],
            }}
            sx={{
              order: {
                xs: 1,
                md: 2,
              },
              flex: 1,
              minWidth: 0,
            }}
          >
            <Paper
              component="form"
              onSubmit={handleSubmit}
              elevation={0}
              sx={{
                position: "relative",
                height: "100%",
                p: {
                  xs: 2,
                  sm: 2.8,
                  md: 3,
                },
                borderRadius: {
                  xs: "18px",
                  sm: "22px",
                },
                border: "1px solid #E7E4DC",
                background: "#FFFFFF",
                boxShadow:
                  "0 18px 50px rgba(17,17,17,.07)",
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
                    "linear-gradient(90deg, #D69F00, #F4C430, #FFE58A, #F4C430, #D69F00)",
                }}
              />

              {/* FORM HEADER */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  mb: {
                    xs: 2,
                    sm: 2.5,
                  },
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      color: "#111",
                      fontWeight: 900,
                      fontSize: {
                        xs: "1.05rem",
                        sm: "1.2rem",
                      },
                      letterSpacing: "-.03em",
                    }}
                  >
                    Send Us a Message
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.35,
                      color: "#8A8A8A",
                      fontSize: {
                        xs: ".65rem",
                        sm: ".72rem",
                      },
                    }}
                  >
                    We'll get back to you as soon as possible.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: {
                      xs: 38,
                      sm: 43,
                    },
                    height: {
                      xs: 38,
                      sm: 43,
                    },
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    background: "#FFF6D5",
                    color: "#A97800",
                  }}
                >
                  <SendRounded
                    sx={{
                      fontSize: {
                        xs: 18,
                        sm: 20,
                      },
                    }}
                  />
                </Box>
              </Stack>

              {/* FIELDS */}
              <Stack spacing={{ xs: 1.5, sm: 1.7 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "1fr 1fr",
                    },
                    gap: {
                      xs: 1.5,
                      sm: 1.7,
                    },
                  }}
                >
                  <ContactField
                    required
                    name="name"
                    label="Full Name"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                    error={errors.name}
                    autoComplete="name"
                  />

                  <ContactField
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
                              color: "#999",
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <ContactField
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
                          <Typography
                            sx={{
                              color: "#777",
                              fontSize: ".74rem",
                              fontWeight: 800,
                            }}
                          >
                            +91
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <ContactField
                    required
                    name="subject"
                    label="Subject"
                    placeholder="What can we help with?"
                    value={form.subject}
                    onChange={handleChange}
                    error={errors.subject}
                  />
                </Box>

                <ContactField
                  required
                  name="message"
                  label="Your Message"
                  placeholder="Tell us how we can help..."
                  value={form.message}
                  onChange={handleChange}
                  error={errors.message}
                  multiline
                  minRows={4}
                  maxRows={7}
                  inputProps={{
                    maxLength: 3000,
                  }}
                  helperText={
                    errors.message ||
                    `${form.message.length}/3000`
                  }
                />

                <Button
                  type="submit"
                  fullWidth
                  disabled={submitting}
                  startIcon={
                    submitting ? (
                      <CircularProgress
                        size={16}
                        thickness={4}
                        sx={{ color: "inherit" }}
                      />
                    ) : (
                      <SendRounded
                        sx={{ fontSize: 18 }}
                      />
                    )
                  }
                  endIcon={
                    !submitting ? (
                      <ArrowForwardRounded
                        sx={{ fontSize: 18 }}
                      />
                    ) : null
                  }
                  sx={{
                    minHeight: {
                      xs: 47,
                      sm: 50,
                    },
                    mt: 0.2,
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #F4C430 0%, #E7B700 100%)",
                    color: "#111",
                    fontSize: {
                      xs: ".75rem",
                      sm: ".82rem",
                    },
                    fontWeight: 900,
                    boxShadow:
                      "0 8px 22px rgba(244,196,48,.18)",
                    transition:
                      "transform 180ms ease, box-shadow 180ms ease",

                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #F7CE43 0%, #E9B900 100%)",
                      boxShadow:
                        "0 12px 28px rgba(244,196,48,.25)",
                      transform: "translateY(-1px)",
                    },

                    "&:active": {
                      transform: "scale(.985)",
                    },

                    "&:disabled": {
                      background: "#E8D58E",
                      color: "#777",
                      boxShadow: "none",
                    },
                  }}
                >
                  {submitting
                    ? "Sending..."
                    : "Send Message"}
                </Button>

                <Typography
                  sx={{
                    textAlign: "center",
                    color: "#A2A2A2",
                    fontSize: {
                      xs: ".58rem",
                      sm: ".62rem",
                    },
                    lineHeight: 1.5,
                  }}
                >
                  Your information is used only to respond
                  to your enquiry.
                </Typography>
              </Stack>
            </Paper>
          </MotionBox>

          {/* ================= CONTACT INFO ================= */}
          <MotionBox
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              delay: 0.12,
              ease: [0.2, 0.8, 0.2, 1],
            }}
            sx={{
              order: {
                xs: 2,
                md: 1,
              },
              width: {
                xs: "100%",
                md: 275,
              },
              flexShrink: 0,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                p: {
                  xs: 2,
                  sm: 2.7,
                  md: 2.8,
                },
                borderRadius: {
                  xs: "18px",
                  sm: "22px",
                },
                border: "1px solid #E7E4DC",
                background: "#FFFFFF",
                boxShadow:
                  "0 14px 40px rgba(17,17,17,.05)",
              }}
            >
              <Typography
                sx={{
                  fontSize: {
                    xs: "1rem",
                    sm: "1.15rem",
                  },
                  fontWeight: 900,
                  color: "#111",
                  letterSpacing: "-.03em",
                }}
              >
                Contact Information
              </Typography>

              <Typography
                sx={{
                  mt: 0.45,
                  color: "#777",
                  fontSize: {
                    xs: ".67rem",
                    sm: ".72rem",
                  },
                  lineHeight: 1.6,
                }}
              >
                Reach out for support, order assistance or
                general questions.
              </Typography>

              <Stack
                spacing={{
                  xs: 1.7,
                  sm: 2,
                }}
                sx={{
                  mt: {
                    xs: 2.2,
                    sm: 2.6,
                  },
                }}
              >
                <InfoItem
                  icon={<EmailOutlined />}
                  title="Email"
                  value="glyrus.com@gmail.com"
                />

                <InfoItem
                  icon={<PhoneOutlined />}
                  title="Phone"
                  value="Available through support"
                />

                <InfoItem
                  icon={<LocationOnOutlined />}
                  title="Location"
                  value="India"
                />
              </Stack>

              <Box
                sx={{
                  mt: {
                    xs: 2.3,
                    sm: 2.7,
                  },
                  pt: {
                    xs: 1.8,
                    sm: 2,
                  },
                  borderTop: "1px solid #EEEEEE",
                }}
              >
                <Typography
                  sx={{
                    color: "#111",
                    fontSize: {
                      xs: ".73rem",
                      sm: ".77rem",
                    },
                    fontWeight: 900,
                  }}
                >
                  Looking for NFC products?
                </Typography>

                <Typography
                  sx={{
                    mt: 0.45,
                    color: "#777",
                    fontSize: {
                      xs: ".64rem",
                      sm: ".68rem",
                    },
                    lineHeight: 1.55,
                  }}
                >
                  Request custom NFC products, bulk quantities
                  or business customization.
                </Typography>

                <Button
                  href="/request-nfc"
                  endIcon={
                    <ArrowForwardRounded
                      sx={{ fontSize: 15 }}
                    />
                  }
                  sx={{
                    mt: 1,
                    px: 0,
                    minHeight: 30,
                    color: "#A97800",
                    fontSize: {
                      xs: ".67rem",
                      sm: ".7rem",
                    },
                    fontWeight: 900,

                    "&:hover": {
                      background: "transparent",
                      color: "#765400",
                    },
                  }}
                >
                  Request NFC
                </Button>
              </Box>
            </Paper>
          </MotionBox>
        </Box>
      </Container>

      {/* SUCCESS */}
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
            borderRadius: 2.5,
            fontWeight: 700,
          }}
        >
          {success}
        </Alert>
      </Snackbar>

      {/* ERROR */}
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
            borderRadius: 2.5,
            fontWeight: 700,
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const ContactField = ({
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
        minHeight: props.multiline
          ? "auto"
          : {
              xs: 46,
              sm: 48,
            },
        borderRadius: "11px",
        backgroundColor: "#FCFCFC",
        fontSize: {
          xs: ".73rem",
          sm: ".78rem",
        },
        transition:
          "background-color 180ms ease, box-shadow 180ms ease",

        "& fieldset": {
          borderColor: "#DFDFDF",
          borderWidth: 1,
          transition:
            "border-color 180ms ease, border-width 180ms ease",
        },

        "&:hover": {
          backgroundColor: "#FFFDF7",

          "& fieldset": {
            borderColor: "#CDA400",
          },
        },

        "&.Mui-focused": {
          backgroundColor: "#FFFFFF",
          boxShadow:
            "0 0 0 3px rgba(244,196,48,.08)",

          "& fieldset": {
            borderColor: "#D1A500",
            borderWidth: 1.5,
          },
        },
      },

      "& .MuiInputLabel-root": {
        color: "#777",
        fontSize: {
          xs: ".72rem",
          sm: ".75rem",
        },
      },

      "& .MuiInputLabel-root.Mui-focused": {
        color: "#A97800",
      },

      "& .MuiFormHelperText-root": {
        mx: 0.4,
        mt: 0.35,
        fontSize: ".58rem",
      },

      "& .MuiInputBase-input::placeholder": {
        color: "#A4A4A4",
        opacity: 1,
      },

      ...sx,
    }}
  />
);

const InfoItem = ({
  icon,
  title,
  value,
}) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={1.15}
  >
    <Box
      sx={{
        width: {
          xs: 38,
          sm: 41,
        },
        height: {
          xs: 38,
          sm: 41,
        },
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background:
          "linear-gradient(135deg, #FFF8DF, #FFF0B5)",
        color: "#B98200",
        transition:
          "transform 200ms ease, box-shadow 200ms ease",

        "& svg": {
          fontSize: {
            xs: 18,
            sm: 19,
          },
        },

        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow:
            "0 7px 18px rgba(244,196,48,.14)",
        },
      }}
    >
      {icon}
    </Box>

    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          color: "#999",
          fontSize: {
            xs: ".62rem",
            sm: ".66rem",
          },
          fontWeight: 600,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 0.15,
          color: "#222",
          fontSize: {
            xs: ".71rem",
            sm: ".75rem",
          },
          fontWeight: 800,
          lineHeight: 1.35,
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </Typography>
    </Box>
  </Stack>
);

export default Contact;