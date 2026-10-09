import React from "react";
import { Link } from "react-router-dom";
import { Box, Button, Container, Typography } from "@mui/material";
import { ArrowForwardRounded } from "@mui/icons-material";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const NotFound = () => {
  return (
    <Box
      sx={{
        minHeight: {
          xs: "calc(100vh - 150px)",
          sm: "calc(100vh - 165px)",
        },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3 },
        py: { xs: 5, sm: 7 },
        background:
          "linear-gradient(180deg, #fff 0%, #fffdf5 100%)",
        overflow: "hidden",
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          textAlign: "center",
        }}
      >
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
            duration: 0.45,
          }}
        >
          {/* 404 */}
          <Typography
            component="h1"
            sx={{
              fontSize: {
                xs: "5.5rem",
                sm: "7rem",
                md: "8rem",
              },
              lineHeight: 0.9,
              fontWeight: 900,
              letterSpacing: "-0.08em",
              color: "#111",
            }}
          >
            4
            <Box
              component="span"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: {
                  xs: "0.7em",
                  sm: "0.72em",
                },
                height: {
                  xs: "0.7em",
                  sm: "0.72em",
                },
                mx: "0.02em",
                borderRadius: "50%",
                background:
                  "#F4C430",
                boxShadow:
                  "0 8px 24px rgba(244,196,48,0.28)",
              }}
            >
              <Box
                sx={{
                  width: "22%",
                  height: "22%",
                  borderRadius: "50%",
                  background:
                    "#111",
                }}
              />
            </Box>
            4
          </Typography>

          {/* Small label */}
          <Typography
            sx={{
              mt: {
                xs: 2,
                sm: 2.5,
              },
              display: "inline-block",
              px: 1.4,
              py: 0.55,
              borderRadius: "999px",
              background: "#FFF7D6",
              border:
                "1px solid #F4D66A",
              color: "#856300",
              fontSize: {
                xs: "0.68rem",
                sm: "0.72rem",
              },
              fontWeight: 800,
              letterSpacing: "0.04em",
            }}
          >
            PAGE NOT FOUND
          </Typography>

          {/* Heading */}
          <Typography
            component="h2"
            sx={{
              mt: 1.5,
              fontSize: {
                xs: "1.45rem",
                sm: "1.8rem",
                md: "2rem",
              },
              lineHeight: 1.2,
              fontWeight: 900,
              letterSpacing: "-0.035em",
              color: "#111",
            }}
          >
            This page doesn't exist.
          </Typography>

          {/* Description */}
          <Typography
            sx={{
              mt: 1,
              mx: "auto",
              maxWidth: 420,
              fontSize: {
                xs: "0.82rem",
                sm: "0.9rem",
              },
              lineHeight: 1.6,
              color: "#707070",
            }}
          >
            The link may be incorrect or the
            page may have been moved.
          </Typography>

          {/* CTA */}
          <Button
            component={Link}
            to="/"
            variant="contained"
            endIcon={
              <ArrowForwardRounded
                sx={{
                  fontSize: 18,
                }}
              />
            }
            sx={{
              mt: 2.5,
              minHeight: {
                xs: 44,
                sm: 46,
              },
              px: {
                xs: 2.4,
                sm: 2.8,
              },
              borderRadius: "11px",
              background: "#F4C430",
              color: "#111",
              fontSize: {
                xs: "0.78rem",
                sm: "0.84rem",
              },
              fontWeight: 800,
              textTransform: "none",
              boxShadow:
                "0 8px 20px rgba(244,196,48,0.22)",
              "&:hover": {
                background: "#E8B800",
                boxShadow:
                  "0 10px 24px rgba(244,196,48,0.28)",
              },
            }}
          >
            Back to Home
          </Button>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default NotFound;