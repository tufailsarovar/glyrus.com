// Glyrus — Login.jsx
import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  AdminPanelSettingsRounded,
  ArrowForwardRounded,
  LockRounded,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const MotionPaper = motion(Paper);

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/api/admin/auth/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      const data = response?.data;

      const token =
        data?.token ||
        data?.accessToken ||
        data?.admin?.token ||
        data?.data?.token ||
        data?.data?.accessToken;

      if (!token) {
        throw new Error(
          data?.message || "Login failed. No authentication token received.",
        );
      }

      const storage = rememberMe ? localStorage : sessionStorage;

      storage.setItem("Glyrus_admin_token", token);

      storage.setItem("Glyrus_admin_login_time", String(Date.now()));

      // Clear the other storage completely
      const otherStorage = rememberMe ? sessionStorage : localStorage;

      otherStorage.removeItem("Glyrus_admin_token");

      otherStorage.removeItem("Glyrus_admin_login_time");

      if (data?.admin) {
        const adminData = {
          name: data.admin.name || "Glyrus Admin",
          email: data.admin.email || form.email.trim().toLowerCase(),
        };

        const storage = rememberMe ? localStorage : sessionStorage;

        storage.setItem("Glyrus_admin", JSON.stringify(adminData));
      }

      navigate("/admin", { replace: true });
    } catch (err) {
      console.error("Admin login error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Invalid admin credentials. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#FAFAFA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 5 },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: { xs: 260, sm: 420 },
          height: { xs: 260, sm: 420 },
          borderRadius: "50%",
          bgcolor: "#FFF1A8",
          filter: "blur(90px)",
          opacity: 0.38,
          top: { xs: -130, sm: -180 },
          right: { xs: -120, sm: -150 },
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          width: { xs: 220, sm: 340 },
          height: { xs: 220, sm: 340 },
          borderRadius: "50%",
          bgcolor: "#F7D65A",
          filter: "blur(100px)",
          opacity: 0.16,
          bottom: { xs: -130, sm: -170 },
          left: { xs: -100, sm: -140 },
          pointerEvents: "none",
        }}
      />

      <Container
        maxWidth="sm"
        sx={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <MotionPaper
          elevation={0}
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          sx={{
            width: "100%",
            p: {
              xs: 2.5,
              sm: 4,
              md: 5,
            },
            borderRadius: {
              xs: 3,
              sm: 4,
            },
            bgcolor: "#FFFFFF",
            border: "1px solid #E9E9E9",
            boxShadow: "0 24px 70px rgba(17,17,17,0.09)",
          }}
        >
          <Stack spacing={3}>
            <Box sx={{ textAlign: "center" }}>
              <Box
                component="div"
                sx={{
                  width: { xs: 58, sm: 68 },
                  height: { xs: 58, sm: 68 },
                  borderRadius: 3,
                  bgcolor: "#111111",
                  color: "#F4C430",
                  display: "grid",
                  placeItems: "center",
                  mx: "auto",
                  mb: 2.5,
                  boxShadow: "0 12px 28px rgba(17,17,17,0.16)",
                }}
              >
                <AdminPanelSettingsRounded
                  sx={{
                    fontSize: {
                      xs: 30,
                      sm: 36,
                    },
                  }}
                />
              </Box>

              <Typography
                component="h1"
                sx={{
                  fontSize: {
                    xs: "1.65rem",
                    sm: "2rem",
                  },
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  color: "#111111",
                  lineHeight: 1.1,
                }}
              >
                Glyrus Admin
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "#777777",
                  fontSize: {
                    xs: "0.85rem",
                    sm: "0.92rem",
                  },
                }}
              >
                Sign in to manage your store
              </Typography>
            </Box>

            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{
                  borderRadius: 2.5,
                  fontSize: "0.84rem",
                  fontWeight: 600,
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2.2}>
                <TextField
                  fullWidth
                  label="Admin Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={loading}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AdminPanelSettingsRounded
                          sx={{
                            color: "#A8A8A8",
                            fontSize: 21,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={loading}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockRounded
                          sx={{
                            color: "#A8A8A8",
                            fontSize: 21,
                          }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="button"
                          edge="end"
                          onClick={() =>
                            setShowPassword((previous) => !previous)
                          }
                          disabled={loading}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      disabled={loading}
                      sx={{
                        color: "#C9C9C9",
                        "&.Mui-checked": {
                          color: "#F4C430",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        fontSize: "0.84rem",
                        color: "#666666",
                        fontWeight: 600,
                      }}
                    >
                      Keep me signed in
                    </Typography>
                  }
                  sx={{
                    mx: 0,
                    width: "fit-content",
                  }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  endIcon={!loading ? <ArrowForwardRounded /> : undefined}
                  sx={{
                    minHeight: 52,
                    borderRadius: 3,
                    bgcolor: "#F4C430",
                    color: "#111111",
                    fontSize: "0.94rem",
                    fontWeight: 900,
                    "&:hover": {
                      bgcolor: "#E4B400",
                      transform: "translateY(-1px)",
                      boxShadow: "0 12px 26px rgba(244,196,48,0.25)",
                    },
                    "&:disabled": {
                      bgcolor: "#EAEAEA",
                      color: "#999999",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress
                      size={23}
                      thickness={4}
                      sx={{
                        color: "#555555",
                      }}
                    />
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </Stack>
            </Box>

            <Box
              sx={{
                pt: 1,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  color: "#999999",
                  lineHeight: 1.5,
                }}
              >
                Authorized access only
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: "0.7rem",
                  color: "#B0B0B0",
                }}
              >
                Glyrus Store Management
              </Typography>
            </Box>
          </Stack>
        </MotionPaper>
      </Container>
    </Box>
  );
};

export default Login;
