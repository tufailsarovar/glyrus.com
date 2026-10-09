// Glyrus — Home.jsx

import React from "react";
import {
  ArrowForwardRounded,
  LocalShippingRounded,
  RequestQuoteRounded,
  ShoppingBagRounded,
  TrackChangesRounded,
  AutoAwesomeRounded,
  NorthEastRounded,
} from "@mui/icons-material";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import Hero from "../components/home/Hero";
import FeaturedProducts from "../components/home/FeaturedProducts";
import HowItWorks from "../components/home/HowItWorks";
import WhyGlyrus from "../components/home/WhyGlyrus";

const MotionBox = motion(Box);

const ease = [0.22, 1, 0.36, 1];

const reveal = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease,
    },
  },
};

const cardContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
    },
  },
};

const cardItem = {
  hidden: {
    opacity: 0,
    y: 22,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease,
    },
  },
};

const Home = () => {
  const quickActions = [
    {
      icon: ShoppingBagRounded,
      title: "Shop Products",
      text: "Explore NFC products.",
      to: "/products",
    },
    {
      icon: LocalShippingRounded,
      title: "Order Updates",
      text: "Stay updated on fulfillment.",
      to: "/tracking",
    },
    {
      icon: TrackChangesRounded,
      title: "Track Order",
      text: "Check your delivery status.",
      to: "/tracking",
    },
    {
      icon: RequestQuoteRounded,
      title: "Custom NFC",
      text: "Need something unique?",
      to: "/request-nfc",
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* =========================================================
          HERO
      ========================================================= */}
      <Hero />

      {/* =========================================================
          FEATURED PRODUCTS
      ========================================================= */}
      <FeaturedProducts />

      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}
      <HowItWorks />

      {/* =========================================================
          WHY Glyrus
      ========================================================= */}
      <WhyGlyrus />

      {/* =========================================================
          CUSTOM NFC REQUEST
      ========================================================= */}
      <Box
        component="section"
        sx={{
          position: "relative",
          overflow: "hidden",
          py: {
            xs: 4.5,
            sm: 6,
            md: 9,
          },
          background:
            "linear-gradient(135deg, #0D0D0D 0%, #151515 55%, #0D0D0D 100%)",
        }}
      >
        {/* Animated glow - top right */}
        <MotionBox
          animate={{
            x: [0, 18, 0],
            y: [0, 12, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          sx={{
            position: "absolute",
            width: {
              xs: 220,
              sm: 330,
              md: 480,
            },
            height: {
              xs: 220,
              sm: 330,
              md: 480,
            },
            right: {
              xs: -130,
              sm: -150,
              md: -170,
            },
            top: {
              xs: -125,
              sm: -170,
              md: -220,
            },
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,208,0,0.20) 0%, rgba(255,208,0,0) 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Animated glow - bottom left */}
        <MotionBox
          animate={{
            x: [0, -15, 0],
            y: [0, -10, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          sx={{
            position: "absolute",
            width: {
              xs: 180,
              md: 320,
            },
            height: {
              xs: 180,
              md: 320,
            },
            left: {
              xs: -120,
              md: -170,
            },
            bottom: {
              xs: -120,
              md: -180,
            },
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,208,0,0.09) 0%, rgba(255,208,0,0) 70%)",
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
          <MotionBox
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
            }}
            sx={{
              position: "relative",
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1.25fr 0.75fr",
              },
              alignItems: "center",
              gap: {
                xs: 2.5,
                sm: 3,
                md: 5,
              },
              p: {
                xs: 2,
                sm: 3,
                md: 4.5,
              },
              borderRadius: {
                xs: "18px",
                sm: "24px",
                md: "30px",
              },
              border: "1px solid rgba(255,255,255,0.08)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))",
              backdropFilter: "blur(12px)",
              boxShadow: "0 25px 70px rgba(0,0,0,0.28)",
            }}
          >
            {/* Subtle animated shine */}
            <MotionBox
              animate={{
                x: ["-120%", "120%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatDelay: 5,
                ease: "easeInOut",
              }}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "40%",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.045), transparent)",
                transform: "skewX(-18deg)",
                pointerEvents: "none",
              }}
            />

            {/* Content */}
            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                minWidth: 0,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.8}
                sx={{
                  mb: {
                    xs: 1,
                    sm: 1.4,
                  },
                }}
              >
                <MotionBox
                  animate={{
                    rotate: [0, 8, -8, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  sx={{
                    display: "flex",
                  }}
                >
                  <AutoAwesomeRounded
                    sx={{
                      color: "#FFD000",
                      fontSize: {
                        xs: 15,
                        sm: 18,
                      },
                    }}
                  />
                </MotionBox>

                <Typography
                  sx={{
                    color: "#FFD000",
                    fontSize: {
                      xs: 9,
                      sm: 10.5,
                      md: 11,
                    },
                    fontWeight: 900,
                    letterSpacing: {
                      xs: "0.7px",
                      sm: "1px",
                    },
                    textTransform: "uppercase",
                  }}
                >
                  Need Something Custom?
                </Typography>
              </Stack>

              <Typography
                component="h2"
                sx={{
                  color: "#FFFFFF",
                  fontSize: {
                    xs: "1.45rem",
                    sm: "2rem",
                    md: "2.55rem",
                  },
                  lineHeight: 1.08,
                  letterSpacing: {
                    xs: "-0.7px",
                    md: "-1.3px",
                  },
                  fontWeight: 900,
                }}
              >
                Create your own
                <Box
                  component="span"
                  sx={{
                    display: {
                      xs: "block",
                      sm: "inline",
                    },
                    color: "#FFD000",
                    ml: {
                      xs: 0,
                      sm: 0.7,
                    },
                  }}
                >
                  NFC product.
                </Box>
              </Typography>

              <Typography
                sx={{
                  mt: {
                    xs: 1,
                    sm: 1.2,
                  },
                  maxWidth: 680,
                  color: "#A7A7A7",
                  fontSize: {
                    xs: 10.5,
                    sm: 12,
                    md: 13.5,
                  },
                  lineHeight: 1.65,
                }}
              >
                Have a specific product, design, quantity, branding, or
                customization requirement? Tell us what you need and our team
                can review your request.
              </Typography>
            </Box>

            {/* CTA */}
            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                justifyContent: {
                  xs: "flex-start",
                  md: "flex-end",
                },
              }}
            >
              <MotionBox
                whileHover={{
                  scale: 1.035,
                }}
                whileTap={{
                  scale: 0.97,
                }}
              >
                <Button
                  component={Link}
                  to="/request-nfc"
                  endIcon={
                    <ArrowForwardRounded
                      sx={{
                        fontSize: "16px !important",
                      }}
                    />
                  }
                  sx={{
                    minHeight: {
                      xs: 40,
                      sm: 45,
                      md: 48,
                    },
                    px: {
                      xs: 1.7,
                      sm: 2.2,
                      md: 2.6,
                    },
                    borderRadius: {
                      xs: "11px",
                      sm: "13px",
                      md: "14px",
                    },
                    color: "#111111",
                    background:
                      "linear-gradient(135deg, #FFE000 0%, #F1B500 100%)",
                    textTransform: "none",
                    fontSize: {
                      xs: 10.5,
                      sm: 12,
                      md: 12.5,
                    },
                    fontWeight: 900,
                    boxShadow: "0 10px 30px rgba(255,208,0,0.15)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #FFE000 0%, #F1B500 100%)",
                      boxShadow: "0 15px 38px rgba(255,208,0,0.25)",
                    },
                  }}
                >
                  Request NFC Product
                </Button>
              </MotionBox>
            </Box>
          </MotionBox>
        </Container>
      </Box>

      {/* =========================================================
          QUICK ACTIONS
      ========================================================= */}
      <Box
        component="section"
        sx={{
          position: "relative",
          py: {
            xs: 4,
            sm: 5,
            md: 7,
          },
          backgroundColor: "#F8F8F8",
        }}
      >
        <Container maxWidth="xl">
          {/* Section heading */}
          <MotionBox
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
            }}
            sx={{
              mb: {
                xs: 1.8,
                sm: 2.5,
                md: 3,
              },
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
                    color: "#111111",
                    fontSize: {
                      xs: 17,
                      sm: 21,
                      md: 25,
                    },
                    fontWeight: 900,
                    letterSpacing: "-0.5px",
                  }}
                >
                  Quick Actions
                </Typography>

                <Typography
                  sx={{
                    mt: 0.35,
                    color: "#888888",
                    fontSize: {
                      xs: 9.5,
                      sm: 11,
                      md: 12,
                    },
                  }}
                >
                  Everything you need, right here.
                </Typography>
              </Box>

              <MotionBox
                animate={{
                  x: [0, 4, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                sx={{
                  display: {
                    xs: "none",
                    sm: "flex",
                  },
                }}
              >
                <NorthEastRounded
                  sx={{
                    color: "#C2C2C2",
                    fontSize: 21,
                  }}
                />
              </MotionBox>
            </Stack>
          </MotionBox>

          {/* 
            IMPORTANT:
            2 columns on phone
          */}
          <MotionBox
            variants={cardContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.1,
            }}
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
              },
              gap: {
                xs: 1,
                sm: 1.6,
                md: 2,
              },
            }}
          >
            {quickActions.map((item) => {
              const Icon = item.icon;

              return (
                <MotionBox
                  key={item.title}
                  variants={cardItem}
                  whileHover={{
                    y: -5,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  sx={{
                    minWidth: 0,
                  }}
                >
                  <Box
                    component={Link}
                    to={item.to}
                    sx={{
                      position: "relative",
                      display: "block",
                      height: "100%",
                      overflow: "hidden",
                      p: {
                        xs: 1.35,
                        sm: 1.8,
                        md: 2.2,
                      },
                      borderRadius: {
                        xs: "13px",
                        sm: "17px",
                        md: "20px",
                      },
                      border: "1px solid rgba(17,17,17,0.065)",
                      backgroundColor: "#FFFFFF",
                      textDecoration: "none",
                      boxShadow: "0 5px 18px rgba(17,17,17,0.035)",
                      transition:
                        "box-shadow 220ms ease, border-color 220ms ease",
                      "&:hover": {
                        borderColor: "rgba(255,208,0,0.35)",
                        boxShadow: "0 15px 35px rgba(17,17,17,0.09)",
                      },
                    }}
                  >
                    {/* Hover glow */}
                    <Box
                      sx={{
                        position: "absolute",
                        width: {
                          xs: 80,
                          sm: 110,
                        },
                        height: {
                          xs: 80,
                          sm: 110,
                        },
                        right: {
                          xs: -45,
                          sm: -55,
                        },
                        top: {
                          xs: -45,
                          sm: -55,
                        },
                        borderRadius: "50%",
                        background:
                          "radial-gradient(circle, rgba(255,208,0,0.13), transparent 70%)",
                        pointerEvents: "none",
                      }}
                    />

                    <Stack
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      alignItems={{
                        xs: "flex-start",
                        sm: "center",
                      }}
                      spacing={{
                        xs: 1,
                        sm: 1.2,
                      }}
                      sx={{
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      {/* Icon */}
                      <MotionBox
                        whileHover={{
                          rotate: -5,
                          scale: 1.08,
                        }}
                        sx={{
                          width: {
                            xs: 34,
                            sm: 42,
                            md: 46,
                          },
                          height: {
                            xs: 34,
                            sm: 42,
                            md: 46,
                          },
                          flexShrink: 0,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: {
                            xs: "9px",
                            sm: "11px",
                            md: "13px",
                          },
                          color: "#111111",
                          background:
                            "linear-gradient(135deg, #FFE000, #F0B000)",
                          boxShadow: "0 7px 16px rgba(255,208,0,0.13)",
                        }}
                      >
                        <Icon
                          sx={{
                            fontSize: {
                              xs: 17,
                              sm: 20,
                              md: 22,
                            },
                          }}
                        />
                      </MotionBox>

                      {/* Text */}
                      <Box
                        sx={{
                          minWidth: 0,
                          width: "100%",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#171717",
                            fontSize: {
                              xs: 10.5,
                              sm: 12.5,
                              md: 13.5,
                            },
                            fontWeight: 900,
                            lineHeight: 1.25,
                            whiteSpace: {
                              xs: "normal",
                              sm: "nowrap",
                            },
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.title}
                        </Typography>

                        <Typography
                          sx={{
                            mt: {
                              xs: 0.35,
                              sm: 0.45,
                            },
                            color: "#858585",
                            fontSize: {
                              xs: 8.5,
                              sm: 10,
                              md: 10.8,
                            },
                            lineHeight: 1.45,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {item.text}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Arrow */}
                    <MotionBox
                      initial={{
                        opacity: 0.35,
                        x: 0,
                      }}
                      whileHover={{
                        opacity: 1,
                        x: 3,
                      }}
                      sx={{
                        position: "absolute",
                        right: {
                          xs: 9,
                          sm: 13,
                        },
                        bottom: {
                          xs: 9,
                          sm: 13,
                        },
                        display: "flex",
                      }}
                    >
                      <ArrowForwardRounded
                        sx={{
                          color: "#B5B5B5",
                          fontSize: {
                            xs: 13,
                            sm: 16,
                          },
                        }}
                      />
                    </MotionBox>
                  </Box>
                </MotionBox>
              );
            })}
          </MotionBox>
        </Container>
      </Box>

      {/* =========================================================
          FINAL SPACING
      ========================================================= */}
      <Box
        sx={{
          height: {
            xs: 2,
            md: 4,
          },
          backgroundColor: "#FFFFFF",
        }}
      />
    </Box>
  );
};

export default Home;
