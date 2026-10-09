// Glyrus — PaymentSection.jsx
import React from "react";
import {
  AccountBalanceWalletRounded,
  CheckCircleRounded,
  CreditCardRounded,
  LocalAtmRounded,
  SecurityRounded,
} from "@mui/icons-material";
import {
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const PaymentSection = ({
  paymentMethod = "razorpay",
  onChange,
  razorpayAvailable = true,
  codAvailable = true,
}) => {
  const selectedMethod = paymentMethod || "razorpay";

  const handleChange = (event) => {
    if (typeof onChange === "function") {
      onChange(event.target.value);
    }
  };

  const methods = [
    {
      value: "razorpay",
      title: "Pay Online",
      description:
        "Pay securely using UPI, cards, net banking or supported wallets.",
      icon: CreditCardRounded,
      available: razorpayAvailable,
    },
    {
      value: "cod",
      title: "Cash on Delivery",
      description:
        "Pay when your order is delivered. No payment is required now.",
      icon: LocalAtmRounded,
      available: codAvailable,
    },
  ];

  return (
    <MotionBox
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
      }}
      sx={{
        width: "100%",
        minWidth: 0,
        p: {
          xs: 1.7,
          sm: 2.3,
          md: 1.8,
        },
        borderRadius: {
          xs: "17px",
          sm: "21px",
          md: "24px",
        },
        border: "1px solid rgba(17,17,17,0.07)",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 10px 32px rgba(17,17,17,0.055)",
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={{
          xs: 1.1,
          sm: 1,
        }}
      >
      </Stack>

      {/* Payment Options */}
      <FormControl
        fullWidth
        sx={{
          mt: {
            xs: 2,
            sm: 2.5,
            md: 0.2,
          },
        }}
      >
        <RadioGroup value={selectedMethod} onChange={handleChange}>
          <Stack
            spacing={{
              xs: 1.1,
              sm: 1.4,
            }}
          >
            {methods.map((method) => {
              const Icon = method.icon;
              const selected = selectedMethod === method.value;

              return (
                <Box
                  key={method.value}
                  sx={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: {
                      xs: "14px",
                      sm: "16px",
                    },
                    border: selected
                      ? "1.5px solid #E6AA00"
                      : "1px solid rgba(17,17,17,0.09)",
                    backgroundColor: selected
                      ? "rgba(255,208,0,0.055)"
                      : "#FFFFFF",
                    transition:
                      "border-color 180ms ease, background-color 180ms ease, box-shadow 180ms ease",
                    boxShadow: selected
                      ? "0 8px 24px rgba(225,166,0,0.08)"
                      : "none",
                    opacity: method.available ? 1 : 0.48,
                  }}
                >
                  <FormControlLabel
                    value={method.value}
                    disabled={!method.available}
                    control={
                      <Radio
                        sx={{
                          ml: {
                            xs: 0.5,
                            sm: 0.7,
                          },
                          mr: {
                            xs: 0.2,
                            sm: 0.4,
                          },
                          color: "#B7B7B7",
                          "&.Mui-checked": {
                            color: "#E4A800",
                          },
                        }}
                      />
                    }
                    label={
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={{
                          xs: 1,
                          sm: 1.3,
                        }}
                        sx={{
                          py: {
                            xs: 1.2,
                            sm: 1.45,
                          },
                          pr: {
                            xs: 1.2,
                            sm: 1.6,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: {
                              xs: 38,
                              sm: 44,
                            },
                            height: {
                              xs: 38,
                              sm: 44,
                            },
                            flexShrink: 0,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: {
                              xs: "10px",
                              sm: "12px",
                            },
                            color: selected ? "#111111" : "#666666",
                            backgroundColor: selected ? "#FFD000" : "#F3F3F3",
                            transition:
                              "background-color 180ms ease, color 180ms ease",
                          }}
                        >
                          <Icon
                            sx={{
                              fontSize: {
                                xs: 19,
                                sm: 22,
                              },
                            }}
                          />
                        </Box>

                        <Box
                          sx={{
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              color: "#222222",
                              fontSize: {
                                xs: 12.5,
                                sm: 13.5,
                                md: 14,
                              },
                              fontWeight: 800,
                              lineHeight: 1.3,
                            }}
                          >
                            {method.title}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.35,
                              color: "#7B7B7B",
                              fontSize: {
                                xs: 9.8,
                                sm: 10.5,
                                md: 11,
                              },
                              lineHeight: 1.5,
                            }}
                          >
                            {method.description}
                          </Typography>
                        </Box>
                      </Stack>
                    }
                    sx={{
                      m: 0,
                      width: "100%",
                      alignItems: "center",
                      "& .MuiFormControlLabel-label": {
                        width: "100%",
                      },
                    }}
                  />

                  {selected && (
                    <CheckCircleRounded
                      sx={{
                        position: "absolute",
                        top: {
                          xs: 10,
                          sm: 13,
                        },
                        right: {
                          xs: 10,
                          sm: 13,
                        },
                        color: "#D69B00",
                        fontSize: {
                          xs: 17,
                          sm: 19,
                        },
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Stack>
        </RadioGroup>
      </FormControl>
    </MotionBox>
  );
};

export default PaymentSection;
