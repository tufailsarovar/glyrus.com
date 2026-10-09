// Glyrus — About.jsx

import React from "react";
import {
  ArrowForwardRounded,
  BusinessRounded,
  CheckCircleRounded,
  DesignServicesRounded,
  LocalShippingRounded,
  NfcRounded,
  SecurityRounded,
  ShoppingBagRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const MotionBox = motion(Box);

const values = [
  {
    icon: NfcRounded,
    title: "Physical NFC Products",
    description:
      "A focused marketplace for physical NFC products that businesses can order and customize.",
  },
  {
    icon: DesignServicesRounded,
    title: "Business Customization",
    description:
      "Choose customization details that help your physical NFC product match your business identity.",
  },
  {
    icon: ShoppingBagRounded,
    title: "Simple Shopping",
    description:
      "Browse products, compare details, add products to your cart, and complete your order easily.",
  },
  {
    icon: LocalShippingRounded,
    title: "Order Tracking",
    description:
      "Every order can have a unique tracking number so customers can follow its delivery progress.",
  },
];

const process = [
  {
    number: "01",
    icon: ShoppingBagRounded,
    title: "Choose",
    text: "Explore the available Glyrus products and select the one that fits your business.",
  },
  {
    number: "02",
    icon: DesignServicesRounded,
    title: "Customize",
    text: "Provide your business and customization requirements where supported.",
  },
  {
    number: "03",
    icon: SecurityRounded,
    title: "Checkout",
    text: "Enter your delivery details and choose Razorpay or Cash on Delivery when available.",
  },
  {
    number: "04",
    icon: LocalShippingRounded,
    title: "Track",
    text: "Receive your order information and use the tracking number to follow its progress.",
  },
];

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const About = () => {
  return (
    <Box
      sx={{
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* =====================================================
          HERO
      ===================================================== */}
      <Box
        component="section"
        sx={{
          position: "relative",
          overflow: "hidden",
          py: {
            xs: 4.5,
            sm: 7,
            md: 10,
          },
          background:
            "linear-gradient(180deg, #FFFDF7 0%, #FFFFFF 100%)",
        }}
      >
        <MotionBox
          animate={{
            x: [0, 15, 0],
            y: [0, 10, 0],
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
              xs: 190,
              sm: 300,
              md: 450,
            },
            height: {
              xs: 190,
              sm: 300,
              md: 450,
            },
            top: {
              xs: -90,
              md: -180,
            },
            right: {
              xs: -90,
              md: -150,
            },
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,208,0,0.14) 0%, rgba(255,208,0,0) 70%)",
            pointerEvents: "none",
          }}
        />

        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            zIndex: 2,
          }}
        >
          <MotionBox
            initial={{
              opacity: 0,
              y: 22,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            sx={{
              maxWidth: 820,
              mx: "auto",
              textAlign: "center",
            }}
          >
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={0.7}
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
                    xs: 18,
                    sm: 27,
                  },
                  height: 2,
                  borderRadius: 99,
                  background:
                    "linear-gradient(90deg, #FFD000, #EBA500)",
                }}
              />

              <Typography
                sx={{
                  color: "#B07B00",
                  fontSize: {
                    xs: 8,
                    sm: 10.5,
                  },
                  fontWeight: 900,
                  letterSpacing: {
                    xs: "0.7px",
                    sm: "1px",
                  },
                  textTransform: "uppercase",
                }}
              >
                About Glyrus
              </Typography>

              <Box
                sx={{
                  width: {
                    xs: 18,
                    sm: 27,
                  },
                  height: 2,
                  borderRadius: 99,
                  background:
                    "linear-gradient(90deg, #EBA500, #FFD000)",
                }}
              />
            </Stack>

            <Typography
              component="h1"
              sx={{
                color: "#111111",
                fontSize: {
                  xs: "1.65rem",
                  sm: "2.45rem",
                  md: "3.4rem",
                  lg: "3.9rem",
                },
                lineHeight: 1.04,
                letterSpacing: {
                  xs: "-0.9px",
                  sm: "-1.5px",
                  md: "-2px",
                },
                fontWeight: 950,
              }}
            >
              Physical NFC products,
              <Box
                component="span"
                sx={{
                  color: "#F0AE00",
                  display: {
                    xs: "block",
                    sm: "inline",
                  },
                  ml: {
                    xs: 0,
                    sm: 0.8,
                  },
                }}
              >
                made simple.
              </Box>
            </Typography>

            <Typography
              sx={{
                mt: {
                  xs: 1,
                  sm: 1.6,
                },
                maxWidth: 680,
                mx: "auto",
                color: "#737373",
                fontSize: {
                  xs: 9.8,
                  sm: 12.5,
                  md: 14.5,
                },
                lineHeight: 1.65,
              }}
            >
              Glyrus is a marketplace focused on physical NFC products for
              businesses. Discover products, customize where available, place
              your order, and track it through delivery.
            </Typography>
          </MotionBox>
        </Container>
      </Box>

      {/* =====================================================
          INTRO
      ===================================================== */}
      <Box
        component="section"
        sx={{
          py: {
            xs: 4,
            sm: 6,
            md: 8,
          },
          backgroundColor: "#FFFFFF",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "0.85fr 1.15fr",
              },
              gap: {
                xs: 2.5,
                md: 6,
              },
              alignItems: "center",
            }}
          >
            {/* NFC visual */}
            <MotionBox
              initial={{
                opacity: 0,
                x: -25,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.15,
              }}
              transition={{
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  minHeight: {
                    xs: 175,
                    sm: 250,
                    md: 325,
                  },
                  borderRadius: {
                    xs: "17px",
                    sm: "23px",
                    md: "29px",
                  },
                  overflow: "hidden",
                  background:
                    "linear-gradient(145deg, #101010, #1B1B1B)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MotionBox
                  animate={{
                    scale: [1, 1.08, 1],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  sx={{
                    position: "absolute",
                    width: {
                      xs: 150,
                      sm: 220,
                      md: 270,
                    },
                    height: {
                      xs: 150,
                      sm: 220,
                      md: 270,
                    },
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(255,208,0,0.2), rgba(255,208,0,0) 70%)",
                  }}
                />

                <MotionBox
                  animate={{
                    y: [0, -6, 0],
                    rotate: [-1, 1, -1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    width: {
                      xs: 88,
                      sm: 125,
                      md: 155,
                    },
                    height: {
                      xs: 88,
                      sm: 125,
                      md: 155,
                    },
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "50%",
                    color: "#111111",
                    background:
                      "linear-gradient(135deg, #FFD900, #ECA800)",
                    boxShadow:
                      "0 20px 50px rgba(0,0,0,0.25)",
                  }}
                >
                  <NfcRounded
                    sx={{
                      fontSize: {
                        xs: 43,
                        sm: 61,
                        md: 78,
                      },
                    }}
                  />
                </MotionBox>

                <Typography
                  sx={{
                    position: "absolute",
                    bottom: {
                      xs: 11,
                      sm: 17,
                      md: 22,
                    },
                    color:
                      "rgba(255,255,255,0.55)",
                    fontSize: {
                      xs: 7,
                      sm: 9,
                    },
                    fontWeight: 800,
                    letterSpacing: {
                      xs: "0.7px",
                      sm: "1px",
                    },
                    textTransform: "uppercase",
                  }}
                >
                  Glyrus Marketplace
                </Typography>
              </Box>
            </MotionBox>

            {/* Text */}
            <MotionBox
              initial={{
                opacity: 0,
                x: 25,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.15,
              }}
              transition={{
                duration: 0.55,
                delay: 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Typography
                sx={{
                  color: "#B07B00",
                  fontSize: {
                    xs: 8.5,
                    sm: 10.5,
                  },
                  fontWeight: 900,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                }}
              >
                What We Do
              </Typography>

              <Typography
                component="h2"
                sx={{
                  mt: 0.6,
                  color: "#171717",
                  fontSize: {
                    xs: "1.45rem",
                    sm: "2rem",
                    md: "2.6rem",
                  },
                  lineHeight: 1.1,
                  letterSpacing: {
                    xs: "-0.7px",
                    md: "-1.3px",
                  },
                  fontWeight: 900,
                }}
              >
                One place to order
                <Box
                  component="span"
                  sx={{
                    color: "#E8A700",
                    ml: 0.4,
                  }}
                >
                  NFC products.
                </Box>
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "#707070",
                  fontSize: {
                    xs: 9.8,
                    sm: 12,
                    md: 14,
                  },
                  lineHeight: 1.7,
                }}
              >
                Glyrus brings physical NFC products into a straightforward
                online shopping experience. Businesses can explore the
                available catalog, review product information, provide
                customization requirements, and place orders without
                unnecessary complexity.
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "#707070",
                  fontSize: {
                    xs: 9.8,
                    sm: 12,
                    md: 14,
                  },
                  lineHeight: 1.7,
                }}
              >
                From product selection to delivery tracking, the marketplace
                is designed to keep the ordering journey clear and convenient.
              </Typography>

              <Stack
                direction="row"
                flexWrap="wrap"
                gap={{
                  xs: 0.55,
                  sm: 0.8,
                }}
                sx={{
                  mt: {
                    xs: 1.4,
                    sm: 2,
                  },
                }}
              >
                {[
                  "Premium Products",
                  "Customization",
                  "Secure Checkout",
                  "Order Tracking",
                ].map((item) => (
                  <Stack
                    key={item}
                    direction="row"
                    alignItems="center"
                    spacing={0.4}
                    sx={{
                      px: {
                        xs: 0.7,
                        sm: 1,
                      },
                      py: {
                        xs: 0.45,
                        sm: 0.6,
                      },
                      borderRadius: "999px",
                      backgroundColor: "#FAFAFA",
                      border:
                        "1px solid rgba(17,17,17,0.07)",
                    }}
                  >
                    <CheckCircleRounded
                      sx={{
                        color: "#D79A00",
                        fontSize: {
                          xs: 11,
                          sm: 14,
                        },
                      }}
                    />

                    <Typography
                      sx={{
                        color: "#555555",
                        fontSize: {
                          xs: 7.5,
                          sm: 10,
                        },
                        fontWeight: 700,
                      }}
                    >
                      {item}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </MotionBox>
          </Box>
        </Container>
      </Box>

      {/* =====================================================
          VALUES — 2 COLUMNS ON PHONE
      ===================================================== */}
      <Box
        component="section"
        sx={{
          py: {
            xs: 4.5,
            sm: 6,
            md: 8,
          },
          backgroundColor: "#FAFAFA",
        }}
      >
        <Container maxWidth="lg">
          <MotionBox
            initial={{
              opacity: 0,
              y: 18,
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
              duration: 0.5,
            }}
            sx={{
              maxWidth: 700,
              mb: {
                xs: 2.5,
                sm: 4,
                md: 5,
              },
            }}
          >
            <Typography
              sx={{
                color: "#B07B00",
                fontSize: {
                  xs: 8.5,
                  sm: 10.5,
                },
                fontWeight: 900,
                letterSpacing: "0.9px",
                textTransform: "uppercase",
              }}
            >
              The Glyrus Approach
            </Typography>

            <Typography
              component="h2"
              sx={{
                mt: 0.6,
                color: "#171717",
                fontSize: {
                  xs: "1.5rem",
                  sm: "2.1rem",
                  md: "2.7rem",
                },
                lineHeight: 1.08,
                letterSpacing: "-0.9px",
                fontWeight: 900,
              }}
            >
              Focused on a better
              <Box
                component="span"
                sx={{
                  color: "#E8A700",
                  ml: 0.4,
                }}
              >
                buying experience.
              </Box>
            </Typography>
          </MotionBox>

          <Box
            sx={{
              display: "grid",

              // PHONE = 2 COLUMNS
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
              },

              gap: {
                xs: 0.9,
                sm: 1.7,
                md: 2.2,
              },
            }}
          >
            {values.map((item, index) => {
              const Icon = item.icon;

              return (
                <MotionBox
                  key={item.title}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{
                    once: true,
                    amount: 0.1,
                  }}
                  transition={{
                    delay: index * 0.05,
                  }}
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
                    sx={{
                      position: "relative",
                      height: "100%",
                      minHeight: {
                        xs: 150,
                        sm: 180,
                        md: 195,
                      },
                      p: {
                        xs: 1.15,
                        sm: 1.8,
                        md: 2.2,
                      },
                      borderRadius: {
                        xs: "13px",
                        sm: "18px",
                        md: "21px",
                      },
                      border:
                        "1px solid rgba(17,17,17,0.065)",
                      backgroundColor: "#FFFFFF",
                      boxShadow:
                        "0 6px 22px rgba(17,17,17,0.035)",
                      transition:
                        "box-shadow 200ms ease, border-color 200ms ease",
                      "&:hover": {
                        borderColor:
                          "rgba(255,190,0,0.35)",
                        boxShadow:
                          "0 14px 34px rgba(17,17,17,0.08)",
                      },
                    }}
                  >
                    <MotionBox
                      whileHover={{
                        rotate: -5,
                        scale: 1.06,
                      }}
                      sx={{
                        width: {
                          xs: 35,
                          sm: 46,
                        },
                        height: {
                          xs: 35,
                          sm: 46,
                        },
                        display: "grid",
                        placeItems: "center",
                        borderRadius: {
                          xs: "9px",
                          sm: "12px",
                        },
                        color: "#111111",
                        background:
                          "linear-gradient(135deg, #FFD900, #F0AA00)",
                        boxShadow:
                          "0 7px 16px rgba(255,190,0,0.14)",
                      }}
                    >
                      <Icon
                        sx={{
                          fontSize: {
                            xs: 17,
                            sm: 23,
                          },
                        }}
                      />
                    </MotionBox>

                    <Typography
                      sx={{
                        mt: {
                          xs: 1.15,
                          sm: 1.7,
                        },
                        color: "#222222",
                        fontSize: {
                          xs: 9.8,
                          sm: 13,
                          md: 14,
                        },
                        fontWeight: 900,
                        lineHeight: 1.25,
                      }}
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      sx={{
                        mt: {
                          xs: 0.45,
                          sm: 0.7,
                        },
                        color: "#7A7A7A",
                        fontSize: {
                          xs: 7.8,
                          sm: 10,
                          md: 11.5,
                        },
                        lineHeight: 1.55,
                      }}
                    >
                      {item.description}
                    </Typography>

                    <Box
                      sx={{
                        position: "absolute",
                        left: {
                          xs: 11,
                          sm: 17,
                        },
                        bottom: 0,
                        width: {
                          xs: 22,
                          sm: 38,
                        },
                        height: {
                          xs: 2,
                          sm: 3,
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
          </Box>
        </Container>
      </Box>

      {/* =====================================================
          PROCESS — 2 COLUMNS ON PHONE
      ===================================================== */}
      <Box
        component="section"
        sx={{
          py: {
            xs: 4.5,
            sm: 6,
            md: 8,
          },
          backgroundColor: "#FFFFFF",
        }}
      >
        <Container maxWidth="lg">
          <MotionBox
            initial={{
              opacity: 0,
              y: 18,
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
              duration: 0.5,
            }}
            sx={{
              textAlign: "center",
              maxWidth: 680,
              mx: "auto",
            }}
          >
            <Typography
              sx={{
                color: "#B07B00",
                fontSize: {
                  xs: 8.5,
                  sm: 10.5,
                },
                fontWeight: 900,
                letterSpacing: "0.9px",
                textTransform: "uppercase",
              }}
            >
              Simple From Start to Finish
            </Typography>

            <Typography
              component="h2"
              sx={{
                mt: 0.6,
                color: "#171717",
                fontSize: {
                  xs: "1.5rem",
                  sm: "2.1rem",
                  md: "2.7rem",
                },
                lineHeight: 1.08,
                letterSpacing: "-0.9px",
                fontWeight: 900,
              }}
            >
              How Glyrus works
            </Typography>

            <Typography
              sx={{
                mt: 0.8,
                color: "#777777",
                fontSize: {
                  xs: 9.5,
                  sm: 12,
                  md: 13.5,
                },
                lineHeight: 1.65,
              }}
            >
              A clear marketplace journey from selecting your physical NFC
              product to receiving and tracking your order.
            </Typography>
          </MotionBox>

          <Box
            sx={{
              mt: {
                xs: 2.7,
                sm: 4,
                md: 5,
              },

              display: "grid",

              // PHONE = 2 COLUMNS
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
              },

              gap: {
                xs: 0.9,
                sm: 1.7,
                md: 2.3,
              },
            }}
          >
            {process.map((item, index) => {
              const Icon = item.icon;

              return (
                <MotionBox
                  key={item.number}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{
                    once: true,
                    amount: 0.1,
                  }}
                  transition={{
                    delay: index * 0.06,
                  }}
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
                    sx={{
                      position: "relative",
                      height: "100%",
                      minHeight: {
                        xs: 160,
                        sm: 185,
                        md: 210,
                      },
                      p: {
                        xs: 1.25,
                        sm: 1.8,
                        md: 2.3,
                      },
                      borderRadius: {
                        xs: "13px",
                        sm: "18px",
                      },
                      border:
                        "1px solid rgba(17,17,17,0.07)",
                      backgroundColor: "#FFFFFF",
                      boxShadow:
                        "0 7px 25px rgba(17,17,17,0.04)",
                      transition:
                        "box-shadow 200ms ease, border-color 200ms ease",
                      "&:hover": {
                        borderColor:
                          "rgba(255,190,0,0.38)",
                        boxShadow:
                          "0 15px 35px rgba(17,17,17,0.08)",
                      },
                    }}
                  >
                    {/* Number */}
                    <Typography
                      sx={{
                        position: "absolute",
                        top: {
                          xs: 9,
                          sm: 13,
                        },
                        right: {
                          xs: 10,
                          sm: 15,
                        },
                        color:
                          "rgba(17,17,17,0.055)",
                        fontSize: {
                          xs: 25,
                          sm: 34,
                        },
                        fontWeight: 950,
                        lineHeight: 1,
                      }}
                    >
                      {item.number}
                    </Typography>

                    {/* Icon */}
                    <MotionBox
                      whileHover={{
                        rotate: -5,
                        scale: 1.06,
                      }}
                      sx={{
                        width: {
                          xs: 37,
                          sm: 47,
                        },
                        height: {
                          xs: 37,
                          sm: 47,
                        },
                        display: "grid",
                        placeItems: "center",
                        borderRadius: {
                          xs: "9px",
                          sm: "12px",
                        },
                        color: "#111111",
                        background:
                          "linear-gradient(135deg, #FFD900, #F0AA00)",
                        boxShadow:
                          "0 7px 17px rgba(255,190,0,0.15)",
                      }}
                    >
                      <Icon
                        sx={{
                          fontSize: {
                            xs: 18,
                            sm: 23,
                          },
                        }}
                      />
                    </MotionBox>

                    <Typography
                      sx={{
                        mt: {
                          xs: 1.2,
                          sm: 1.7,
                        },
                        color: "#222222",
                        fontSize: {
                          xs: 10.5,
                          sm: 14,
                          md: 15,
                        },
                        fontWeight: 900,
                        lineHeight: 1.25,
                      }}
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      sx={{
                        mt: {
                          xs: 0.5,
                          sm: 0.7,
                        },
                        color: "#7A7A7A",
                        fontSize: {
                          xs: 8,
                          sm: 10.5,
                          md: 11.5,
                        },
                        lineHeight: 1.55,
                      }}
                    >
                      {item.text}
                    </Typography>

                    <Box
                      sx={{
                        position: "absolute",
                        left: {
                          xs: 11,
                          sm: 17,
                        },
                        bottom: 0,
                        width: {
                          xs: 23,
                          sm: 38,
                        },
                        height: {
                          xs: 2,
                          sm: 3,
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
          </Box>
        </Container>
      </Box>

      {/* =====================================================
          CTA
      ===================================================== */}
      <Box
        component="section"
        sx={{
          py: {
            xs: 4,
            sm: 6,
            md: 7,
          },
          backgroundColor: "#111111",
        }}
      >
        <Container maxWidth="lg">
          <MotionBox
            initial={{
              opacity: 0,
              scale: 0.98,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            viewport={{
              once: true,
              amount: 0.15,
            }}
            transition={{
              duration: 0.5,
            }}
            sx={{
              position: "relative",
              overflow: "hidden",
              p: {
                xs: 1.7,
                sm: 2.8,
                md: 4,
              },
              borderRadius: {
                xs: "16px",
                sm: "22px",
                md: "28px",
              },
              border:
                "1px solid rgba(255,255,255,0.08)",
              background:
                "linear-gradient(135deg, #171717, #111111)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                right: -90,
                top: -110,
                width: {
                  xs: 210,
                  md: 300,
                },
                height: {
                  xs: 210,
                  md: 300,
                },
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,208,0,0.16), rgba(255,208,0,0) 70%)",
              }}
            />

            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "1fr auto",
                },
                gap: {
                  xs: 2,
                  md: 4,
                },
                alignItems: "center",
              }}
            >
              <Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.7}
                >
                  <BusinessRounded
                    sx={{
                      color: "#FFD000",
                      fontSize: {
                        xs: 15,
                        sm: 18,
                      },
                    }}
                  />

                  <Typography
                    sx={{
                      color: "#FFD000",
                      fontSize: {
                        xs: 8.5,
                        sm: 10.5,
                      },
                      fontWeight: 900,
                      letterSpacing: "0.8px",
                      textTransform: "uppercase",
                    }}
                  >
                    For Businesses
                  </Typography>
                </Stack>

                <Typography
                  component="h2"
                  sx={{
                    mt: 0.7,
                    color: "#FFFFFF",
                    fontSize: {
                      xs: "1.35rem",
                      sm: "1.9rem",
                      md: "2.4rem",
                    },
                    lineHeight: 1.1,
                    letterSpacing: "-0.8px",
                    fontWeight: 900,
                  }}
                >
                  Ready to explore Glyrus?
                </Typography>

                <Typography
                  sx={{
                    mt: 0.7,
                    maxWidth: 620,
                    color: "#A5A5A5",
                    fontSize: {
                      xs: 9.5,
                      sm: 11.5,
                      md: 13,
                    },
                    lineHeight: 1.6,
                  }}
                >
                  Browse the product catalog or send a request if you need a
                  custom NFC product.
                </Typography>
              </Box>

              <Stack
                direction={{
                  xs: "row",
                  sm: "row",
                }}
                spacing={0.8}
                sx={{
                  flexShrink: 0,
                }}
              >
                <Button
                  component={Link}
                  to="/products"
                  endIcon={
                    <ArrowForwardRounded
                      sx={{
                        fontSize:
                          "14px !important",
                      }}
                    />
                  }
                  sx={{
                    minHeight: {
                      xs: 36,
                      sm: 42,
                    },
                    px: {
                      xs: 1.2,
                      sm: 1.8,
                    },
                    borderRadius: {
                      xs: "9px",
                      sm: "11px",
                    },
                    color: "#111111",
                    background:
                      "linear-gradient(135deg, #FFD900, #F0AA00)",
                    textTransform: "none",
                    fontSize: {
                      xs: 9,
                      sm: 11,
                    },
                    fontWeight: 900,
                    whiteSpace: "nowrap",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #FFD900, #F0AA00)",
                    },
                  }}
                >
                  Browse
                </Button>

                <Button
                  component={Link}
                  to="/request-nfc"
                  sx={{
                    minHeight: {
                      xs: 36,
                      sm: 42,
                    },
                    px: {
                      xs: 1.2,
                      sm: 1.8,
                    },
                    borderRadius: {
                      xs: "9px",
                      sm: "11px",
                    },
                    color: "#FFFFFF",
                    border:
                      "1px solid rgba(255,255,255,0.13)",
                    textTransform: "none",
                    fontSize: {
                      xs: 9,
                      sm: 11,
                    },
                    fontWeight: 750,
                    whiteSpace: "nowrap",
                    "&:hover": {
                      borderColor:
                        "rgba(255,208,0,0.4)",
                      backgroundColor:
                        "rgba(255,208,0,0.05)",
                    },
                  }}
                >
                  Request NFC
                </Button>
              </Stack>
            </Box>
          </MotionBox>
        </Container>
      </Box>

      <Divider
        sx={{
          borderColor:
            "rgba(17,17,17,0.05)",
        }}
      />
    </Box>
  );
};

export default About;