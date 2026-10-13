import React, { useEffect, useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowForwardRounded,
  ArrowBackRounded,
  EmailOutlined,
  LockOutlined,
  SecurityRounded,
} from "@mui/icons-material";

import { motion, AnimatePresence } from "framer-motion";

import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import Navbar from "../../components/layout/Navbar";

import Footer from "../../components/layout/Footer";

import roundLogo from "../../assets/logo/glyrus_round_logo.png";

import nameLogo from "../../assets/logo/name_logo.png";

const MotionBox = motion(Box);

const MotionPaper = motion(Paper);

const SESSION_DURATION = 60 * 60 * 1000;

const clearAdminSession = () => {
  localStorage.removeItem("Glyrus_admin_token");

  localStorage.removeItem("Glyrus_admin_login_time");

  localStorage.removeItem("Glyrus_admin");

  sessionStorage.removeItem("Glyrus_admin_token");

  sessionStorage.removeItem("Glyrus_admin_login_time");
};

const Login = () => {
  const navigate = useNavigate();

  const ticketProcessed = useRef(false);

  const [method, setMethod] = useState(0);

  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // Check whether an existing stored session has expired.

  useEffect(() => {
    const token = localStorage.getItem("Glyrus_admin_token");

    const loginTime = Number(localStorage.getItem("Glyrus_admin_login_time"));

    if (!token || !loginTime) return;

    const remaining = SESSION_DURATION - (Date.now() - loginTime);

    if (remaining <= 0) {
      clearAdminSession();

      return;
    }

    const timer = window.setTimeout(() => {
      clearAdminSession();

      navigate("/admin/login", { replace: true });
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [navigate]);

  // Complete the Google login ticket exchange.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleError = params.get("google_error");
    const googleTicket = params.get("google_ticket");
    const returnedNonce = params.get("google_nonce");
    const savedNonce = sessionStorage.getItem("googleAdminNonce");

    if (googleError) {
      sessionStorage.removeItem("googleAdminNonce");
      setMethod(0);
      setError(googleError);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (!googleTicket || ticketProcessed.current) return;

    if (!returnedNonce || !savedNonce || returnedNonce !== savedNonce) {
      sessionStorage.removeItem("googleAdminNonce");
      window.history.replaceState({}, document.title, window.location.pathname);
      setError("Invalid Google login session. Please try again.");
      return;
    }

    sessionStorage.removeItem("googleAdminNonce");
    ticketProcessed.current = true;
    window.history.replaceState({}, document.title, window.location.pathname);

    const exchangeTicket = async () => {
      try {
        setGoogleLoading(true);
        setError("");
        setSuccess("");

        const response = await api.post(
          "/api/admin/auth/google/exchange-ticket",
          { ticket: googleTicket, nonce: returnedNonce },
        );

        const data = response?.data;

        if (!data?.success || !data?.token) {
          throw new Error(data?.message || "Google login verification failed.");
        }

        localStorage.setItem("Glyrus_admin_token", data.token);
        localStorage.setItem("Glyrus_admin_login_time", String(Date.now()));
        localStorage.setItem("Glyrus_admin", JSON.stringify(data.admin));

        sessionStorage.removeItem("Glyrus_admin_token");
        sessionStorage.removeItem("Glyrus_admin_login_time");

        navigate("/admin", { replace: true });
      } catch (err) {
        ticketProcessed.current = false;
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Google login failed. Please try again.",
        );
      } finally {
        setGoogleLoading(false);
      }
    };

    exchangeTicket();
  }, [navigate]);

  const saveSession = (data) => {
    const token = data?.token || data?.accessToken;

    if (!token) {
      throw new Error("Authentication token was not received.");
    }

    localStorage.setItem("Glyrus_admin_token", token);

    localStorage.setItem("Glyrus_admin_login_time", String(Date.now()));

    sessionStorage.removeItem("Glyrus_admin_token");

    sessionStorage.removeItem("Glyrus_admin_login_time");

    localStorage.setItem(
      "Glyrus_admin",

      JSON.stringify({
        name: data?.admin?.name || "Glyrus Admin",

        email: data?.admin?.email || email.trim().toLowerCase(),

        role: "admin",
      }),
    );

    navigate("/admin", { replace: true });
  };

  const handleRequestOtp = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);

      setError("");

      setSuccess("");

      const response = await api.post("/api/admin/auth/request-otp", {
        email: email.trim().toLowerCase(),
      });

      setOtpSent(true);

      setSuccess(
        response?.data?.message ||
          "OTP sent successfully. Check your admin email.",
      );
    } catch (err) {
      setError(
        err?.response?.data?.message || "Unable to send OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the valid 6-digit OTP.");

      return;
    }

    try {
      setLoading(true);

      setError("");

      setSuccess("");

      const response = await api.post("/api/admin/auth/verify-otp", {
        email: email.trim().toLowerCase(),

        otp: otp.trim(),
      });

      saveSession(response?.data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "OTP verification failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setError("");
      setSuccess("");

      const randomBytes = new Uint8Array(32);
      window.crypto.getRandomValues(randomBytes);

      const nonce = Array.from(randomBytes)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

      sessionStorage.setItem("googleAdminNonce", nonce);

      const response = await api.get(
        `/api/admin/auth/google?nonce=${encodeURIComponent(nonce)}`,
      );

      if (response?.data?.url) {
        window.location.assign(response.data.url);
      } else {
        throw new Error("Unable to start Google login.");
      }
    } catch (error) {
      console.error("Google login error:", error);
      sessionStorage.removeItem("googleAdminNonce");
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to start Google login. Please try again.",
      );
      setGoogleLoading(false);
    }
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      minHeight: 43,

      borderRadius: "5px",

      fontSize: "0.84rem",

      bgcolor: "#fff",

      "& fieldset": { borderColor: "#dce2ec" },

      "&:hover fieldset": { borderColor: "#a9baf3" },

      "&.Mui-focused fieldset": {
        borderColor: "#315EF4",

        borderWidth: "1px",
      },
    },

    "& .MuiInputLabel-root": { fontSize: "0.84rem" },
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",

        display: "flex",

        flexDirection: "column",

        overflowX: "hidden",

        color: "#172033",

        background:
          "radial-gradient(ellipse at 10% 15%, #e9efff 0%, transparent 38%), radial-gradient(ellipse at 90% 80%, #eeecff 0%, transparent 35%), #f8faff",

        "& *": { boxSizing: "border-box" },
      }}
    >
      {/* Use the existing website navbar */}

      <Navbar />

      <Box
        component="main"
        sx={{
          flex: "1 0 auto",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          position: "relative",

          px: { xs: 1.5, sm: 2.5 },

          // Less vertical whitespace on mobile.

          py: { xs: 1.5, sm: 3, md: 4 },

          minHeight: { xs: "auto", sm: "460px" },
        }}
      >
        <MotionBox
          aria-hidden="true"
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{
            duration: 9,

            repeat: Infinity,

            ease: "easeInOut",
          }}
          sx={{
            position: "absolute",

            top: "10%",

            left: { xs: "-50px", sm: "8%" },

            width: { xs: 85, sm: 130 },

            height: { xs: 85, sm: 130 },

            border: "1px solid rgba(49,94,244,0.12)",

            borderRadius: "10px",

            pointerEvents: "none",
          }}
        />

        <MotionBox
          aria-hidden="true"
          animate={{ y: [0, 10, 0], rotate: [0, -6, 0] }}
          transition={{
            duration: 10,

            repeat: Infinity,

            ease: "easeInOut",
          }}
          sx={{
            position: "absolute",

            bottom: "8%",

            right: { xs: "-35px", sm: "8%" },

            width: { xs: 65, sm: 100 },

            height: { xs: 65, sm: 100 },

            border: "1px solid rgba(109,83,245,0.14)",

            borderRadius: "50%",

            pointerEvents: "none",
          }}
        />

        <Container
          maxWidth="xs"
          disableGutters
          sx={{ position: "relative", zIndex: 1, width: "100%" }}
        >
          <MotionPaper
            elevation={0}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            sx={{
              position: "relative",

              overflow: "hidden",

              width: "100%",

              p: { xs: 1.8, sm: 3 },

              border: "1px solid #e1e7f1",

              borderRadius: { xs: "7px", sm: "9px" },

              bgcolor: "rgba(255,255,255,0.97)",

              boxShadow: "0 12px 38px rgba(30,55,110,0.08)",
            }}
          >
            <Box
              sx={{
                position: "absolute",

                inset: "0 0 auto",

                height: 3,

                background: "linear-gradient(90deg,#315EF4,#7164F5,#9b8aff)",
              }}
            />

            <Stack spacing={{ xs: 1.35, sm: 1.8 }}>
              {/* Brand logos */}

              <Box sx={{ textAlign: "center" }}>
                <Box
                  component="img"
                  src={roundLogo}
                  alt="Glyrus logo"
                  sx={{
                    display: "block",

                    width: { xs: 70, sm: 70 },

                    height: { xs: 70, sm: 70 },

                    mx: "auto",

                    objectFit: "contain",
                  }}
                />

                <Box
                  component="img"
                  src={nameLogo}
                  alt="Glyrus"
                  sx={{
                    display: "block",

                    width: { xs: 120, sm: 145 },

                    height: { xs: 27, sm: 31 },

                    objectFit: "contain",

                    mx: "auto",

                    mt: -0.8,
                  }}
                />

                <Typography
                  component="h1"
                  sx={{
                    mt: 0.65,

                    fontSize: { xs: "1.1rem", sm: "1.25rem" },

                    lineHeight: 1.25,

                    fontWeight: 750,

                    letterSpacing: "-0.035em",

                    color: "#182238",
                  }}
                >
                  Admin sign in
                </Typography>

                <Typography
                  sx={{
                    mt: 0.45,

                    color: "#758198",

                    fontSize: { xs: "0.74rem", sm: "0.82rem" },

                    lineHeight: 1.5,
                  }}
                >
                  Secure access to your Glyrus dashboard.
                </Typography>
              </Box>

              {/* Login method tabs */}

              <Box
                sx={{
                  p: 0.35,

                  bgcolor: "#f1f4fa",

                  border: "1px solid #e7ebf3",

                  borderRadius: "5px",
                }}
              >
                <Tabs
                  value={method}
                  onChange={(_, value) => {
                    setMethod(value);

                    setError("");

                    setSuccess("");
                  }}
                  variant="fullWidth"
                  TabIndicatorProps={{ style: { display: "none" } }}
                  sx={{
                    minHeight: 36,

                    "& .MuiTabs-flexContainer": { gap: 0.4 },

                    "& .MuiTab-root": {
                      minHeight: 35,

                      minWidth: 0,

                      px: 0.5,

                      py: 0.4,

                      color: "#68758b",

                      fontSize: { xs: "0.77rem", sm: "0.82rem" },

                      fontWeight: 750,

                      textTransform: "none",

                      borderRadius: "4px",
                    },

                    "& .MuiTab-root.Mui-selected": {
                      color: "#2855e9",

                      bgcolor: "#fff",

                      boxShadow: "0 1px 4px rgba(25,45,90,0.08)",
                    },
                  }}
                >
                  <Tab disableRipple label="Google" />

                  <Tab disableRipple label="Email OTP" />
                </Tabs>
              </Box>

              <AnimatePresence mode="wait">
                {error && (
                  <MotionBox
                    key="error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <Alert
                      severity="error"
                      onClose={() => setError("")}
                      sx={{
                        py: 0,

                        px: 0.8,

                        borderRadius: "4px",

                        fontSize: "0.76rem",

                        alignItems: "center",

                        overflowWrap: "anywhere",

                        "& .MuiAlert-icon": { fontSize: 18 },

                        "& .MuiAlert-message": { py: 0.7 },
                      }}
                    >
                      {error}
                    </Alert>
                  </MotionBox>
                )}

                {success && (
                  <MotionBox
                    key="success"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <Alert
                      severity="success"
                      onClose={() => setSuccess("")}
                      sx={{
                        py: 0,

                        px: 0.8,

                        borderRadius: "4px",

                        fontSize: "0.76rem",

                        "& .MuiAlert-icon": { fontSize: 18 },

                        "& .MuiAlert-message": { py: 0.7 },
                      }}
                    >
                      {success}
                    </Alert>
                  </MotionBox>
                )}
              </AnimatePresence>

              {/* Google login */}

              {method === 0 && (
                <MotionBox
                  key="google"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading || loading}
                    startIcon={
                      googleLoading ? (
                        <CircularProgress size={17} />
                      ) : (
                        <Box
                          component="span"
                          sx={{
                            color: "#4285F4",

                            fontWeight: 900,

                            fontSize: "1.05rem",

                            lineHeight: 1,
                          }}
                        >
                          G
                        </Box>
                      )
                    }
                    sx={{
                      minHeight: { xs: 41, sm: 44 },

                      borderRadius: "5px",

                      borderColor: "#d8deea",

                      color: "#263247",

                      bgcolor: "#fff",

                      fontSize: { xs: "0.8rem", sm: "0.85rem" },

                      fontWeight: 700,

                      textTransform: "none",

                      "&:hover": {
                        bgcolor: "#f7f9ff",

                        borderColor: "#9eb2f7",
                      },
                    }}
                  >
                    {googleLoading
                      ? "Connecting to Google..."
                      : "Continue with Google"}
                  </Button>

                  <Typography
                    sx={{
                      mt: 1,

                      textAlign: "center",

                      color: "#8490a4",

                      fontSize: "0.72rem",

                      lineHeight: 1.5,
                    }}
                  >
                    Use your authorized administrator account.
                  </Typography>
                </MotionBox>
              )}

              {/* Email OTP login */}

              {method === 1 && (
                <MotionBox
                  key="email"
                  component="form"
                  onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Stack spacing={1.2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Admin email address"
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);

                        setError("");

                        setSuccess("");
                      }}
                      autoComplete="email"
                      required
                      disabled={loading || otpSent}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlined
                              sx={{ color: "#8290a5", fontSize: 19 }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldSx}
                    />

                    {otpSent && (
                      <>
                        <Typography
                          sx={{
                            color: "#6d798e",

                            fontSize: "0.75rem",

                            lineHeight: 1.5,

                            overflowWrap: "anywhere",
                          }}
                        >
                          Enter the 6-digit code sent to{" "}
                          <Box component="strong" sx={{ color: "#243149" }}>
                            {email.trim().toLowerCase()}
                          </Box>
                        </Typography>

                        <TextField
                          fullWidth
                          size="small"
                          label="6-digit OTP"
                          value={otp}
                          onChange={(event) => {
                            setOtp(
                              event.target.value.replace(/\D/g, "").slice(0, 6),
                            );

                            setError("");
                          }}
                          inputProps={{
                            inputMode: "numeric",

                            maxLength: 6,

                            autoComplete: "one-time-code",

                            style: {
                              textAlign: "center",

                              letterSpacing: "0.35em",

                              fontSize: "1rem",

                              fontWeight: 800,
                            },
                          }}
                          required
                          disabled={loading}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockOutlined
                                  sx={{ color: "#8290a5", fontSize: 19 }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={fieldSx}
                        />
                      </>
                    )}

                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      disabled={loading || (otpSent && otp.length !== 6)}
                      endIcon={!loading ? <ArrowForwardRounded /> : undefined}
                      sx={{
                        minHeight: { xs: 41, sm: 44 },

                        borderRadius: "5px",

                        background: "linear-gradient(100deg,#315EF4,#5149EC)",

                        fontSize: { xs: "0.8rem", sm: "0.85rem" },

                        fontWeight: 750,

                        textTransform: "none",

                        boxShadow: "0 4px 12px rgba(49,94,244,0.15)",

                        "&:hover": {
                          background: "linear-gradient(100deg,#244FE0,#433AD8)",
                        },
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : otpSent ? (
                        "Verify OTP & Sign In"
                      ) : (
                        "Continue with Email OTP"
                      )}
                    </Button>

                    {otpSent && (
                      <Button
                        size="small"
                        startIcon={<ArrowBackRounded />}
                        onClick={() => {
                          setOtpSent(false);

                          setOtp("");

                          setError("");

                          setSuccess("");
                        }}
                        disabled={loading}
                        sx={{
                          alignSelf: "center",

                          color: "#6c7890",

                          fontSize: "0.75rem",

                          textTransform: "none",
                        }}
                      >
                        Change email address
                      </Button>
                    )}
                  </Stack>
                </MotionBox>
              )}

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                spacing={0.65}
                sx={{
                  pt: 1,

                  borderTop: "1px solid #edf0f6",
                }}
              >
                <SecurityRounded sx={{ color: "#169b62", fontSize: 17 }} />

                <Typography
                  sx={{
                    color: "#718098",

                    fontSize: { xs: "0.68rem", sm: "0.74rem" },

                    textAlign: "center",
                  }}
                >
                  Protected sign-in · Authorized admins only
                </Typography>
              </Stack>
            </Stack>
          </MotionPaper>
        </Container>
      </Box>

      {/* Use the existing website footer */}

      <Footer />
    </Box>
  );
};

export default Login;
