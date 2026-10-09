// Glyrus — Settings.jsx
import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  EmailRounded,
  LocalShippingRounded,
  PaymentsRounded,
  SaveRounded,
  StoreRounded,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import api from "../../services/api";

const MotionCard = motion(Card);

const getSettingsData = (data) =>
  data?.settings ||
  data?.data?.settings ||
  data?.data ||
  data ||
  {};

const Settings = () => {
  const [settings, setSettings] = useState({
    storeName: "Glyrus",
    supportEmail: "",
    supportPhone: "",
    codEnabled: true,
    codCharge: 49,
    freeShippingThreshold: 999,
    shippingCharge: 79,
    razorpayEnabled: true,
    orderEmailEnabled: true,
    shippingEmailEnabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/api/admin/settings"
      );

      const data = getSettingsData(
        response?.data
      );

      if (data && typeof data === "object") {
        setSettings((previous) => ({
          ...previous,
          ...data,
        }));
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load settings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field) => (event) => {
    setSettings((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

  const handleNumberChange = (field) => (event) => {
    const value = event.target.value;

    setSettings((previous) => ({
      ...previous,
      [field]:
        value === ""
          ? ""
          : Number(value),
    }));
  };

  const handleToggle = (field) => (event) => {
    setSettings((previous) => ({
      ...previous,
      [field]: event.target.checked,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        ...settings,
        codCharge: Number(
          settings.codCharge || 0
        ),
        freeShippingThreshold: Number(
          settings.freeShippingThreshold || 0
        ),
        shippingCharge: Number(
          settings.shippingCharge || 0
        ),
      };

      const response = await api.put(
        "/api/admin/settings",
        payload
      );

      const updated = getSettingsData(
        response?.data
      );

      if (
        updated &&
        typeof updated === "object"
      ) {
        setSettings((previous) => ({
          ...previous,
          ...updated,
        }));
      } else {
        setSettings(payload);
      }

      setSuccess(
        "Settings saved successfully."
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to save settings."
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
          sx={{
            color: "#F4C430",
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        pb: {
          xs: 3,
          md: 5,
        },
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
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: {
                xs: "1.5rem",
                sm: "1.9rem",
                md: "2.2rem",
              },
              fontWeight: 950,
              letterSpacing: "-0.04em",
              color: "#111",
            }}
          >
            Settings
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              color: "#888",
              fontSize: {
                xs: "0.76rem",
                sm: "0.82rem",
              },
            }}
          >
            Configure store, payment, shipping and email settings.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={
            saving ? (
              <CircularProgress
                size={18}
                sx={{
                  color: "#555",
                }}
              />
            ) : (
              <SaveRounded />
            )
          }
          onClick={handleSave}
          disabled={saving}
          sx={{
            minHeight: 44,
            borderRadius: 2.5,
            bgcolor: "#F4C430",
            color: "#111",
            fontWeight: 900,
            px: 2.5,
            "&:hover": {
              bgcolor: "#E5B500",
            },
          }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </Stack>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{
            mb: 2.5,
            borderRadius: 3,
          }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess("")}
          sx={{
            mb: 2.5,
            borderRadius: 3,
          }}
        >
          {success}
        </Alert>
      )}

      <Grid
        container
        spacing={{
          xs: 2,
          md: 2.5,
        }}
      >
        <Grid item xs={12} md={6}>
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
            }}
            sx={{
              borderRadius: {
                xs: 3,
                md: 4,
              },
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2,
                  sm: 3,
                },
                "&:last-child": {
                  pb: {
                    xs: 2,
                    sm: 3,
                  },
                },
              }}
            >
              <Stack
                direction="row"
                spacing={1.3}
                alignItems="center"
                sx={{
                  mb: 2.5,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "#FFF7D2",
                    color: "#A17B00",
                  }}
                >
                  <StoreRounded />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: "1.05rem",
                    }}
                  >
                    Store Information
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.25,
                      color: "#999",
                      fontSize: "0.72rem",
                    }}
                  >
                    Basic public store information.
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Store Name"
                  value={
                    settings.storeName || ""
                  }
                  onChange={handleChange(
                    "storeName"
                  )}
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Support Email"
                  type="email"
                  value={
                    settings.supportEmail || ""
                  }
                  onChange={handleChange(
                    "supportEmail"
                  )}
                  disabled={saving}
                  InputProps={{
                    startAdornment: (
                      <EmailRounded
                        sx={{
                          mr: 1,
                          color: "#999",
                        }}
                      />
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Support Phone"
                  value={
                    settings.supportPhone || ""
                  }
                  onChange={handleChange(
                    "supportPhone"
                  )}
                  disabled={saving}
                />
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={12} md={6}>
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
              borderRadius: {
                xs: 3,
                md: 4,
              },
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2,
                  sm: 3,
                },
                "&:last-child": {
                  pb: {
                    xs: 2,
                    sm: 3,
                  },
                },
              }}
            >
              <Stack
                direction="row"
                spacing={1.3}
                alignItems="center"
                sx={{
                  mb: 2.5,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "#F3F3F3",
                    color: "#555",
                  }}
                >
                  <LocalShippingRounded />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: "1.05rem",
                    }}
                  >
                    Shipping
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.25,
                      color: "#999",
                      fontSize: "0.72rem",
                    }}
                  >
                    Configure delivery charges.
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  type="number"
                  label="Shipping Charge"
                  value={
                    settings.shippingCharge ?? ""
                  }
                  onChange={handleNumberChange(
                    "shippingCharge"
                  )}
                  disabled={saving}
                  InputProps={{
                    startAdornment: (
                      <Typography
                        sx={{
                          mr: 1,
                          color: "#999",
                        }}
                      >
                        ₹
                      </Typography>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Free Shipping Above"
                  value={
                    settings.freeShippingThreshold ??
                    ""
                  }
                  onChange={handleNumberChange(
                    "freeShippingThreshold"
                  )}
                  disabled={saving}
                  helperText="Set 0 to disable the free-shipping threshold."
                  InputProps={{
                    startAdornment: (
                      <Typography
                        sx={{
                          mr: 1,
                          color: "#999",
                        }}
                      >
                        ₹
                      </Typography>
                    ),
                  }}
                />
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={12} md={6}>
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
              borderRadius: {
                xs: 3,
                md: 4,
              },
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2,
                  sm: 3,
                },
                "&:last-child": {
                  pb: {
                    xs: 2,
                    sm: 3,
                  },
                },
              }}
            >
              <Stack
                direction="row"
                spacing={1.3}
                alignItems="center"
                sx={{
                  mb: 2.5,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "#FFF7D2",
                    color: "#A17B00",
                  }}
                >
                  <PaymentsRounded />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: "1.05rem",
                    }}
                  >
                    Payment
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.25,
                      color: "#999",
                      fontSize: "0.72rem",
                    }}
                  >
                    Configure available payment methods.
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={1}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    bgcolor: "#FAFAFA",
                    border:
                      "1px solid #EEEEEE",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: "0.82rem",
                        }}
                      >
                        Razorpay Payments
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.3,
                          color: "#999",
                          fontSize: "0.68rem",
                        }}
                      >
                        Allow online Razorpay payments.
                      </Typography>
                    </Box>

                    <Switch
                      checked={
                        Boolean(
                          settings.razorpayEnabled
                        )
                      }
                      onChange={handleToggle(
                        "razorpayEnabled"
                      )}
                      disabled={saving}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#F4C430",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          bgcolor: "#F4C430",
                          opacity: 1,
                        },
                      }}
                    />
                  </Stack>
                </Box>

                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    bgcolor: "#FAFAFA",
                    border:
                      "1px solid #EEEEEE",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: "0.82rem",
                        }}
                      >
                        Cash on Delivery
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.3,
                          color: "#999",
                          fontSize: "0.68rem",
                        }}
                      >
                        Allow customers to place COD orders.
                      </Typography>
                    </Box>

                    <Switch
                      checked={Boolean(
                        settings.codEnabled
                      )}
                      onChange={handleToggle(
                        "codEnabled"
                      )}
                      disabled={saving}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#F4C430",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          bgcolor: "#F4C430",
                          opacity: 1,
                        },
                      }}
                    />
                  </Stack>
                </Box>

                <TextField
                  fullWidth
                  type="number"
                  label="COD Charge"
                  value={
                    settings.codCharge ?? ""
                  }
                  onChange={handleNumberChange(
                    "codCharge"
                  )}
                  disabled={
                    saving ||
                    !settings.codEnabled
                  }
                  helperText="Applied only when COD is selected."
                  InputProps={{
                    startAdornment: (
                      <Typography
                        sx={{
                          mr: 1,
                          color: "#999",
                        }}
                      >
                        ₹
                      </Typography>
                    ),
                  }}
                />
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={12} md={6}>
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
              borderRadius: {
                xs: 3,
                md: 4,
              },
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2,
                  sm: 3,
                },
                "&:last-child": {
                  pb: {
                    xs: 2,
                    sm: 3,
                  },
                },
              }}
            >
              <Stack
                direction="row"
                spacing={1.3}
                alignItems="center"
                sx={{
                  mb: 2.5,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "#F3F3F3",
                    color: "#555",
                  }}
                >
                  <EmailRounded />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: "1.05rem",
                    }}
                  >
                    Email Notifications
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.25,
                      color: "#999",
                      fontSize: "0.72rem",
                    }}
                  >
                    Control customer order email notifications.
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={1}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    bgcolor: "#FAFAFA",
                    border:
                      "1px solid #EEEEEE",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: "0.82rem",
                        }}
                      >
                        Order Emails
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.3,
                          color: "#999",
                          fontSize: "0.68rem",
                        }}
                      >
                        Confirmation and payment emails.
                      </Typography>
                    </Box>

                    <Switch
                      checked={Boolean(
                        settings.orderEmailEnabled
                      )}
                      onChange={handleToggle(
                        "orderEmailEnabled"
                      )}
                      disabled={saving}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#F4C430",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          bgcolor: "#F4C430",
                          opacity: 1,
                        },
                      }}
                    />
                  </Stack>
                </Box>

                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    bgcolor: "#FAFAFA",
                    border:
                      "1px solid #EEEEEE",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: "0.82rem",
                        }}
                      >
                        Shipping Emails
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.3,
                          color: "#999",
                          fontSize: "0.68rem",
                        }}
                      >
                        Shipment and delivery status emails.
                      </Typography>
                    </Box>

                    <Switch
                      checked={Boolean(
                        settings.shippingEmailEnabled
                      )}
                      onChange={handleToggle(
                        "shippingEmailEnabled"
                      )}
                      disabled={saving}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#F4C430",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          bgcolor: "#F4C430",
                          opacity: 1,
                        },
                      }}
                    />
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      <Box
        sx={{
          mt: 2.5,
          p: {
            xs: 1.5,
            sm: 2,
          },
          borderRadius: 3,
          bgcolor: "#FFFBEA",
          border:
            "1px solid #F1DEA0",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.72rem",
            color: "#806200",
            fontWeight: 800,
            lineHeight: 1.6,
          }}
        >
          Payment, shipping and COD amounts should always be
          recalculated and validated by the backend before an
          order is created or payment is processed.
        </Typography>
      </Box>
    </Box>
  );
};

export default Settings;