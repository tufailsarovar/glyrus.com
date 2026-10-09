// HowItWorks.jsx

import React from "react";
import {
  SearchRounded,
  TuneRounded,
  ShoppingCartRounded,
  LocalShippingRounded,
  ArrowForwardRounded,
} from "@mui/icons-material";
import { Box, Container, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const steps = [
  {
    number: "01",
    title: "Browse",
    description:
      "Explore premium NFC products designed for different business needs.",
    icon: SearchRounded,
  },
  {
    number: "02",
    title: "Customize",
    description:
      "Add your business details, logo, colors, text, and other requirements.",
    icon: TuneRounded,
  },
  {
    number: "03",
    title: "Order",
    description:
      "Add your customized product to cart and complete your checkout securely.",
    icon: ShoppingCartRounded,
  },
  {
    number: "04",
    title: "Receive",
    description:
      "We process, prepare, ship, and deliver your physical NFC product.",
    icon: LocalShippingRounded,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const HowItWorks = () => {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        py: {
          xs: 5,
          sm: 7,
          md: 10,
        },
        background:
          "linear-gradient(180deg, #FFFFFF 0%, #FFFDF7 55%, #FFF8D9 100%)",
      }}
    >
      {/* Background glow */}
      <MotionBox
        animate={{
          x: [0, 25, 0],
          y: [0, -15, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        sx={{
          position: "absolute",
          width: {
            xs: 220,
            sm: 350,
            md: 500,
          },
          height: {
            xs: 220,
            sm: 350,
            md: 500,
          },
          left: "50%",
          bottom: {
            xs: -150,
            md: -260,
          },
          transform: "translateX(-50%)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,208,0,0.24) 0%, rgba(255,208,0,0) 70%)",
          pointerEvents: "none",
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Heading */}
        <MotionBox
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
          sx={{
            textAlign: "center",
            maxWidth: 900,
            mx: "auto",
            mb: {
              xs: 4,
              sm: 5,
              md: 7,
            },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={{
              xs: 0.7,
              sm: 1,
            }}
            sx={{
              mb: {
                xs: 1,
                sm: 1.5,
              },
            }}
          >
            <Box
              sx={{
                width: {
                  xs: 25,
                  sm: 30,
                },
                height: 3,
                borderRadius: 5,
                backgroundColor: "#EBAF00",
              }}
            />

            <Typography
              sx={{
                color: "#B77C00",
                fontSize: {
                  xs: 9,
                  sm: 11,
                  md: 12,
                },
                fontWeight: 900,
                letterSpacing: {
                  xs: "0.7px",
                  sm: "1.2px",
                },
                textTransform: "uppercase",
              }}
            >
              Simple Process
            </Typography>

            <Box
              sx={{
                width: {
                  xs: 25,
                  sm: 30,
                },
                height: 3,
                borderRadius: 5,
                backgroundColor: "#EBAF00",
              }}
            />
          </Stack>

          <Typography
            component="h2"
            sx={{
              color: "#111111",
              fontSize: {
                xs: "1.8rem",
                sm: "2.5rem",
                md: "3.3rem",
              },
              lineHeight: 1.05,
              letterSpacing: {
                xs: "-1px",
                sm: "-1.6px",
                md: "-2.2px",
              },
              fontWeight: 950,
            }}
          >
            From product to{" "}
            <Box
              component="span"
              sx={{
                color: "#F2AD00",
              }}
            >
              tap-ready.
            </Box>
          </Typography>

          <Typography
            sx={{
              mt: {
                xs: 1,
                sm: 1.4,
              },
              px: {
                xs: 1,
                sm: 2,
              },
              color: "#6D6D6D",
              fontSize: {
                xs: 10.5,
                sm: 12.5,
                md: 14.5,
              },
              lineHeight: 1.65,
            }}
          >
            Getting your Glyrus product is simple. Choose a product,
            personalize it for your business, place your order, and let us
            handle the rest.
          </Typography>
        </MotionBox>

        {/* Cards */}
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.08,
          }}
          sx={{
            display: "grid",

            // 2 COLUMNS ON PHONE
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(4, minmax(0, 1fr))",
            },

            gap: {
              xs: 1,
              sm: 1.8,
              md: 2.5,
            },
          }}
        >
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <MotionBox
                key={step.number}
                variants={itemVariants}
                whileHover={{
                  y: -7,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                sx={{
                  position: "relative",
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    height: "100%",
                    minHeight: {
                      xs: 190,
                      sm: 210,
                      md: 235,
                    },
                    p: {
                      xs: 1.35,
                      sm: 2,
                      md: 2.5,
                    },
                    overflow: "hidden",
                    borderRadius: {
                      xs: "15px",
                      sm: "19px",
                      md: "22px",
                    },
                    border: "1px solid rgba(17,17,17,0.08)",
                    backgroundColor: "#FFFFFF",
                    boxShadow:
                      "0 8px 25px rgba(17,17,17,0.045)",
                    transition:
                      "box-shadow 220ms ease, border-color 220ms ease",
                    "&:hover": {
                      borderColor:
                        "rgba(245,181,0,0.45)",
                      boxShadow:
                        "0 18px 40px rgba(17,17,17,0.10)",
                    },
                  }}
                >
                  {/* Number */}
                  <Typography
                    sx={{
                      position: "absolute",
                      top: {
                        xs: 9,
                        sm: 12,
                        md: 15,
                      },
                      right: {
                        xs: 9,
                        sm: 14,
                        md: 17,
                      },
                      color: "#F0F0F0",
                      fontSize: {
                        xs: 27,
                        sm: 36,
                        md: 42,
                      },
                      lineHeight: 1,
                      fontWeight: 950,
                      letterSpacing: "-1px",
                      userSelect: "none",
                    }}
                  >
                    {step.number}
                  </Typography>

                  {/* Icon */}
                  <MotionBox
                    whileHover={{
                      rotate: -6,
                      scale: 1.07,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                    sx={{
                      position: "relative",
                      width: {
                        xs: 42,
                        sm: 48,
                        md: 58,
                      },
                      height: {
                        xs: 42,
                        sm: 48,
                        md: 58,
                      },
                      display: "grid",
                      placeItems: "center",
                      borderRadius: {
                        xs: "11px",
                        sm: "13px",
                        md: "16px",
                      },
                      background:
                        "linear-gradient(135deg, #FFD900, #F1B000)",
                      color: "#111111",
                      boxShadow:
                        "0 8px 18px rgba(255,193,0,0.18)",
                    }}
                  >
                    <Icon
                      sx={{
                        fontSize: {
                          xs: 21,
                          sm: 24,
                          md: 29,
                        },
                      }}
                    />
                  </MotionBox>

                  {/* Text */}
                  <Box
                    sx={{
                      position: "relative",
                      mt: {
                        xs: 1.5,
                        sm: 2,
                        md: 2.5,
                      },
                    }}
                  >
                    <Typography
                      component="h3"
                      sx={{
                        color: "#171717",
                        fontSize: {
                          xs: 11.5,
                          sm: 14,
                          md: 17,
                        },
                        fontWeight: 900,
                        lineHeight: 1.2,
                      }}
                    >
                      {step.title}
                    </Typography>

                    <Typography
                      sx={{
                        mt: {
                          xs: 0.65,
                          sm: 0.8,
                          md: 1,
                        },
                        color: "#737373",
                        fontSize: {
                          xs: 8.8,
                          sm: 10.5,
                          md: 12.5,
                        },
                        lineHeight: 1.55,
                      }}
                    >
                      {step.description}
                    </Typography>
                  </Box>

                  {/* Bottom accent */}
                  <MotionBox
                    initial={{
                      width: 30,
                    }}
                    whileInView={{
                      width: 55,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      delay: 0.3 + index * 0.1,
                      duration: 0.5,
                    }}
                    sx={{
                      position: "absolute",
                      left: {
                        xs: 12,
                        sm: 18,
                        md: 22,
                      },
                      bottom: 0,
                      height: {
                        xs: 3,
                        sm: 4,
                      },
                      borderRadius:
                        "5px 5px 0 0",
                      backgroundColor: "#FFC400",
                    }}
                  />
                </Box>

                {/* Desktop connector */}
                {index < steps.length - 1 && (
                  <Box
                    sx={{
                      display: {
                        xs: "none",
                        md: "flex",
                      },
                      position: "absolute",
                      top: "50%",
                      right: -18,
                      zIndex: 5,
                      transform: "translateY(-50%)",
                      width: 35,
                      height: 35,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      backgroundColor: "#FFFDF4",
                    }}
                  >
                    <ArrowForwardRounded
                      sx={{
                        color: "#E0A000",
                        fontSize: 20,
                      }}
                    />
                  </Box>
                )}
              </MotionBox>
            );
          })}
        </MotionBox>
      </Container>
    </Box>
  );
};

export default HowItWorks;