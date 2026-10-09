// WhyGlyrus.jsx

import React from "react";
import {
  WorkspacePremiumRounded,
  BusinessCenterRounded,
  ConstructionRounded,
  ShoppingCartRounded,
  LockRounded,
  LocalShippingRounded,
} from "@mui/icons-material";
import { Box, Container, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const features = [
  {
    number: "01",
    title: "Premium Products",
    description:
      "Professionally designed physical NFC products made to represent your business.",
    icon: WorkspacePremiumRounded,
  },
  {
    number: "02",
    title: "Built for Business",
    description:
      "NFC products created around the practical needs of restaurants, shops, salons, hotels, and professionals.",
    icon: BusinessCenterRounded,
  },
  {
    number: "03",
    title: "Custom Designs",
    description:
      "Personalize your product with your business name, logo, colors, text, and other requirements.",
    icon: ConstructionRounded,
  },
  {
    number: "04",
    title: "Easy Ordering",
    description:
      "Choose your product, customize it, add it to your cart, and complete your order in a few simple steps.",
    icon: ShoppingCartRounded,
  },
  {
    number: "05",
    title: "Secure Payments",
    description:
      "Checkout securely with Razorpay or choose Cash on Delivery when available.",
    icon: LockRounded,
  },
  {
    number: "06",
    title: "Reliable Delivery",
    description:
      "Track your order from processing through shipping and delivery with your unique tracking number.",
    icon: LocalShippingRounded,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 25,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const WhyGlyrus = () => {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        py: {
          xs: 4.5,
          sm: 6,
          md: 8,
        },
        backgroundColor: "#FFFFFF",
      }}
    >
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
            amount: 0.15,
          }}
          transition={{
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 1fr",
            },
            gap: {
              xs: 1.5,
              md: 5,
            },
            alignItems: "start",
            mb: {
              xs: 3,
              sm: 4,
              md: 5,
            },
          }}
        >
          <Typography
            component="h2"
            sx={{
              maxWidth: 650,
              color: "#111111",
              fontSize: {
                xs: "1.75rem",
                sm: "2.35rem",
                md: "3rem",
              },
              lineHeight: 1.03,
              letterSpacing: {
                xs: "-1px",
                sm: "-1.4px",
                md: "-2px",
              },
              fontWeight: 950,
            }}
          >
            Designed for the way{" "}
            <Box
              component="span"
              sx={{
                color: "#F2AC00",
              }}
            >
              businesses connect.
            </Box>
          </Typography>

          <Typography
            sx={{
              maxWidth: 700,
              color: "#707070",
              fontSize: {
                xs: 10.5,
                sm: 12,
                md: 14,
              },
              lineHeight: 1.7,
              pt: {
                xs: 0,
                md: 0.8,
              },
            }}
          >
            Glyrus combines premium physical NFC products with a simple
            shopping and customization experience, helping businesses choose
            products that fit their brand and everyday customer interactions.
          </Typography>
        </MotionBox>

        {/* Feature Cards */}
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
              md: "repeat(3, minmax(0, 1fr))",
            },

            gap: {
              xs: 1,
              sm: 1.7,
              md: 2.3,
            },
          }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <MotionBox
                key={feature.number}
                variants={itemVariants}
                whileHover={{
                  y: -6,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                sx={{
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    height: "100%",
                    minHeight: {
                      xs: 175,
                      sm: 195,
                      md: 220,
                    },
                    p: {
                      xs: 1.25,
                      sm: 1.8,
                      md: 2.5,
                    },
                    overflow: "hidden",
                    borderRadius: {
                      xs: "14px",
                      sm: "18px",
                      md: "22px",
                    },
                    border:
                      "1px solid rgba(17,17,17,0.075)",
                    background:
                      "linear-gradient(145deg, #FFFFFF 0%, #FCFCFC 100%)",
                    boxShadow:
                      "0 7px 25px rgba(17,17,17,0.035)",
                    transition:
                      "box-shadow 220ms ease, border-color 220ms ease",
                    "&:hover": {
                      borderColor:
                        "rgba(245,180,0,0.42)",
                      boxShadow:
                        "0 18px 42px rgba(17,17,17,0.085)",
                    },
                  }}
                >
                  {/* Large number */}
                  <Typography
                    sx={{
                      position: "absolute",
                      top: {
                        xs: 8,
                        sm: 11,
                        md: 14,
                      },
                      right: {
                        xs: 8,
                        sm: 13,
                        md: 17,
                      },
                      color: "#F2F2F2",
                      fontSize: {
                        xs: 27,
                        sm: 34,
                        md: 42,
                      },
                      fontWeight: 950,
                      lineHeight: 1,
                      letterSpacing: "-1px",
                    }}
                  >
                    {feature.number}
                  </Typography>

                  {/* Icon */}
                  <MotionBox
                    whileHover={{
                      rotate: -6,
                      scale: 1.08,
                    }}
                    sx={{
                      width: {
                        xs: 40,
                        sm: 47,
                        md: 57,
                      },
                      height: {
                        xs: 40,
                        sm: 47,
                        md: 57,
                      },
                      display: "grid",
                      placeItems: "center",
                      borderRadius: {
                        xs: "10px",
                        sm: "13px",
                        md: "16px",
                      },
                      background:
                        "linear-gradient(135deg, #FFD900, #F0AD00)",
                      color: "#111111",
                      boxShadow:
                        "0 8px 18px rgba(255,190,0,0.16)",
                    }}
                  >
                    <Icon
                      sx={{
                        fontSize: {
                          xs: 20,
                          sm: 23,
                          md: 28,
                        },
                      }}
                    />
                  </MotionBox>

                  {/* Content */}
                  <Box
                    sx={{
                      mt: {
                        xs: 1.35,
                        sm: 1.8,
                        md: 2.3,
                      },
                    }}
                  >
                    <Typography
                      component="h3"
                      sx={{
                        color: "#171717",
                        fontSize: {
                          xs: 10.5,
                          sm: 13,
                          md: 16,
                        },
                        fontWeight: 900,
                        lineHeight: 1.25,
                      }}
                    >
                      {feature.title}
                    </Typography>

                    <Typography
                      sx={{
                        mt: {
                          xs: 0.55,
                          sm: 0.8,
                          md: 1,
                        },
                        color: "#7B7B7B",
                        fontSize: {
                          xs: 8.4,
                          sm: 10,
                          md: 12,
                        },
                        lineHeight: 1.55,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Box>

                  {/* Bottom yellow accent */}
                  <MotionBox
                    initial={{
                      width: 28,
                    }}
                    whileInView={{
                      width: 45,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 0.45,
                    }}
                    sx={{
                      position: "absolute",
                      left: {
                        xs: 12,
                        sm: 17,
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
              </MotionBox>
            );
          })}
        </MotionBox>

        {/* Bottom Banner */}
        <MotionBox
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.15,
          }}
          transition={{
            duration: 0.55,
            delay: 0.15,
          }}
          sx={{
            mt: {
              xs: 2,
              sm: 2.5,
              md: 3,
            },
            p: {
              xs: 1.4,
              sm: 1.8,
              md: 2.2,
            },
            display: "flex",
            alignItems: "center",
            gap: {
              xs: 1.2,
              sm: 1.5,
            },
            borderRadius: {
              xs: "14px",
              sm: "17px",
              md: "20px",
            },
            border:
              "1px solid rgba(238,179,0,0.28)",
            background:
              "linear-gradient(135deg, #FFFDF3, #FFFFFF)",
          }}
        >
          <Box
            sx={{
              width: {
                xs: 42,
                sm: 48,
                md: 54,
              },
              height: {
                xs: 42,
                sm: 48,
                md: 54,
              },
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              borderRadius: {
                xs: "11px",
                sm: "13px",
              },
              backgroundColor: "#111111",
              color: "#FFD000",
            }}
          >
            <WorkspacePremiumRounded
              sx={{
                fontSize: {
                  xs: 21,
                  sm: 24,
                  md: 27,
                },
              }}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                color: "#171717",
                fontSize: {
                  xs: 10.5,
                  sm: 12.5,
                  md: 14,
                },
                fontWeight: 900,
                lineHeight: 1.3,
              }}
            >
              Built around your business.
            </Typography>

            <Typography
              sx={{
                mt: 0.3,
                color: "#777777",
                fontSize: {
                  xs: 8.7,
                  sm: 10.5,
                  md: 12,
                },
                lineHeight: 1.5,
              }}
            >
              Choose a ready-made product or request a custom NFC solution
              when you need something specific.
            </Typography>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default WhyGlyrus;