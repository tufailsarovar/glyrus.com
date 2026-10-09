// Glyrus — StatsCard.jsx
import React from "react";
import {
  ArrowDownwardRounded,
  ArrowUpwardRounded,
} from "@mui/icons-material";
import {
  Box,
  Stack,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const StatsCard = ({
  title = "Total",
  value = 0,
  icon,
  trend,
  trendLabel = "vs. previous period",
  description,
  loading = false,
}) => {
  const hasTrend =
    trend !== undefined &&
    trend !== null &&
    trend !== "";

  const numericTrend =
    typeof trend === "number"
      ? trend
      : Number.parseFloat(
          String(trend || "").replace("%", "")
        );

  const isPositive =
    Number.isFinite(numericTrend) &&
    numericTrend > 0;

  const isNegative =
    Number.isFinite(numericTrend) &&
    numericTrend < 0;

  return (
    <MotionBox
      initial={{
        opacity: 0,
        y: 16,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -4,
      }}
      transition={{
        duration: 0.35,
        ease: "easeOut",
      }}
      sx={{
        width: "100%",
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          position: "relative",
          height: "100%",
          minHeight: {
            xs: 142,
            sm: 155,
            md: 165,
          },
          p: {
            xs: 1.6,
            sm: 1.9,
            md: 2.2,
          },
          overflow: "hidden",
          borderRadius: {
            xs: "16px",
            sm: "19px",
            md: "21px",
          },
          border:
            "1px solid rgba(17,17,17,0.07)",
          background:
            "linear-gradient(145deg, #FFFFFF 0%, #FCFCFC 100%)",
          boxShadow:
            "0 8px 28px rgba(17,17,17,0.055)",
          transition:
            "box-shadow 220ms ease, border-color 220ms ease",
          "&:hover": {
            borderColor:
              "rgba(235,171,0,0.22)",
            boxShadow:
              "0 16px 38px rgba(17,17,17,0.09)",
          },
        }}
      >
        {/* Decorative background */}
        <Box
          sx={{
            position: "absolute",
            width: {
              xs: 100,
              sm: 125,
              md: 145,
            },
            height: {
              xs: 100,
              sm: 125,
              md: 145,
            },
            right: {
              xs: -48,
              sm: -58,
              md: -65,
            },
            top: {
              xs: -48,
              sm: -58,
              md: -65,
            },
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,208,0,0.12) 0%, rgba(255,208,0,0) 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Top */}
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={1}
          sx={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <Typography
            sx={{
              minWidth: 0,
              color: "#777777",
              fontSize: {
                xs: 10.5,
                sm: 11.5,
                md: 12,
              },
              lineHeight: 1.35,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.45px",
            }}
          >
            {title}
          </Typography>

          {icon && (
            <Box
              sx={{
                width: {
                  xs: 36,
                  sm: 41,
                  md: 44,
                },
                height: {
                  xs: 36,
                  sm: 41,
                  md: 44,
                },
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: {
                  xs: "10px",
                  sm: "12px",
                },
                color: "#111111",
                background:
                  "linear-gradient(135deg, #FFD900 0%, #F0AA00 100%)",
                boxShadow:
                  "0 7px 18px rgba(240,170,0,0.15)",
              }}
            >
              {React.isValidElement(icon)
                ? React.cloneElement(icon, {
                    sx: {
                      fontSize: {
                        xs: 19,
                        sm: 21,
                        md: 23,
                      },
                      ...(icon.props?.sx || {}),
                    },
                  })
                : null}
            </Box>
          )}
        </Stack>

        {/* Value */}
        <Typography
          sx={{
            position: "relative",
            zIndex: 1,
            mt: {
              xs: 1.5,
              sm: 1.7,
              md: 2,
            },
            color: "#171717",
            fontSize: {
              xs: 24,
              sm: 28,
              md: 31,
            },
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: "-1px",
            wordBreak: "break-word",
          }}
        >
          {loading ? "—" : value}
        </Typography>

        {/* Trend / Description */}
        {(hasTrend || description) && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.65}
            sx={{
              position: "relative",
              zIndex: 1,
              mt: {
                xs: 1.1,
                sm: 1.3,
              },
              minWidth: 0,
            }}
          >
            {hasTrend && (
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.25}
                sx={{
                  flexShrink: 0,
                  px: 0.7,
                  py: 0.3,
                  borderRadius: "999px",
                  backgroundColor: isPositive
                    ? "rgba(46,125,50,0.08)"
                    : isNegative
                    ? "rgba(211,47,47,0.08)"
                    : "rgba(17,17,17,0.06)",
                  color: isPositive
                    ? "#2E7D32"
                    : isNegative
                    ? "#D32F2F"
                    : "#666666",
                }}
              >
                {isPositive && (
                  <ArrowUpwardRounded
                    sx={{ fontSize: 12 }}
                  />
                )}

                {isNegative && (
                  <ArrowDownwardRounded
                    sx={{ fontSize: 12 }}
                  />
                )}

                <Typography
                  component="span"
                  sx={{
                    fontSize: {
                      xs: 9,
                      sm: 9.5,
                    },
                    fontWeight: 850,
                    lineHeight: 1.2,
                  }}
                >
                  {typeof trend === "number"
                    ? `${Math.abs(trend)}%`
                    : String(trend).includes("%")
                    ? String(trend)
                    : `${trend}%`}
                </Typography>
              </Stack>
            )}

            <Typography
              sx={{
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: "#8A8A8A",
                fontSize: {
                  xs: 9,
                  sm: 9.8,
                  md: 10.5,
                },
              }}
            >
              {description || trendLabel}
            </Typography>
          </Stack>
        )}

        {/* Bottom accent */}
        <Box
          sx={{
            position: "absolute",
            left: {
              xs: 16,
              sm: 19,
              md: 22,
            },
            bottom: 0,
            width: {
              xs: 28,
              sm: 34,
              md: 40,
            },
            height: 3,
            borderRadius: "999px 999px 0 0",
            background:
              "linear-gradient(90deg, #FFD000, #E9A500)",
          }}
        />
      </Box>
    </MotionBox>
  );
};

export default StatsCard;