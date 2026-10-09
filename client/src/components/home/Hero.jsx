// Glyrus — Hero.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowForwardRounded,
  AutoAwesomeRounded,
  BoltRounded,
  TouchAppRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const MotionBox = motion(Box);

const Hero = () => {
  const theme = useTheme();
  const isSmallMobile = useMediaQuery("(max-width:380px)");
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        minHeight: {
          xs: "auto",
          md: "calc(100vh - 78px)",
        },
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 85% 25%, rgba(255, 210, 0, 0.15) 0%, rgba(255, 210, 0, 0) 30%), linear-gradient(135deg, #FFFFFF 0%, #FFFDF5 55%, #FFFFFF 100%)",
        py: {
          xs: 6,
          sm: 7,
          md: 9,
        },
      }}
    >
      {/* Background decorations */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: -100, md: -180 },
          right: { xs: -110, md: -180 },
          width: { xs: 250, md: 460 },
          height: { xs: 250, md: 460 },
          borderRadius: "50%",
          border: "1px solid rgba(245, 180, 0, 0.13)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: { xs: -60, md: -100 },
          right: { xs: -60, md: -100 },
          width: { xs: 170, md: 310 },
          height: { xs: 170, md: 310 },
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255, 210, 0, 0.11) 0%, rgba(255, 210, 0, 0) 68%)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: -180,
          left: -150,
          width: { xs: 300, md: 500 },
          height: { xs: 300, md: 500 },
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255, 195, 0, 0.08) 0%, rgba(255, 195, 0, 0) 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Decorative dots */}
      <Box
        sx={{
          position: "absolute",
          top: "18%",
          left: { xs: "5%", md: "8%" },
          width: 7,
          height: 7,
          borderRadius: "50%",
          backgroundColor: "#FFD000",
          opacity: 0.7,
          boxShadow: "0 0 0 7px rgba(255,208,0,0.08)",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: "19%",
          right: { xs: "7%", md: "11%" },
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: "#111111",
          opacity: 0.15,
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1.05fr 0.95fr",
            },
            alignItems: "center",
            gap: {
              xs: 5,
              sm: 6,
              md: 7,
              lg: 10,
            },
          }}
        >
          {/* Content */}
          <MotionBox
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
            }}
            sx={{
              maxWidth: {
                xs: "100%",
                md: 690,
              },
              textAlign: {
                xs: "center",
                md: "left",
              },
              mx: {
                xs: "auto",
                md: 0,
              },
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: 0.1,
              }}
            >
              <Chip
                icon={
                  <AutoAwesomeRounded
                    sx={{
                      fontSize: {
                        xs: 15,
                        sm: 17,
                      },
                    }}
                  />
                }
                label="Premium NFC Products for Modern Businesses"
                sx={{
                  height: {
                    xs: 31,
                    sm: 35,
                  },
                  px: {
                    xs: 0.5,
                    sm: 0.8,
                  },
                  borderRadius: "999px",
                  backgroundColor: "rgba(255, 208, 0, 0.12)",
                  border: "1px solid rgba(245, 180, 0, 0.22)",
                  color: "#7A5A00",
                  fontSize: {
                    xs: 10.5,
                    sm: 12,
                  },
                  fontWeight: 750,
                  "& .MuiChip-icon": {
                    color: "#F2AD00",
                  },
                }}
              />
            </motion.div>

            <Typography
              component="h1"
              sx={{
                mt: {
                  xs: 2.4,
                  sm: 3,
                },
                fontSize: {
                  xs: isSmallMobile ? "2.25rem" : "2.55rem",
                  sm: "3.35rem",
                  md: "4rem",
                  lg: "4.75rem",
                },
                lineHeight: {
                  xs: 1.08,
                  sm: 1.05,
                  md: 1.02,
                },
                letterSpacing: {
                  xs: "-1.7px",
                  sm: "-2.3px",
                  md: "-3.4px",
                },
                fontWeight: 950,
                color: "#111111",
              }}
            >
              Make Your Business
              <Box
                component="span"
                sx={{
                  display: {
                    xs: "block",
                    md: "inline",
                  },
                  ml: {
                    xs: 0,
                    md: 1.2,
                  },
                  color: "#F2AE00",
                }}
              >
                Tap.
              </Box>
            </Typography>

            <Typography
              sx={{
                mt: {
                  xs: 2,
                  sm: 2.4,
                  md: 2.8,
                },
                maxWidth: 610,
                mx: {
                  xs: "auto",
                  md: 0,
                },
                color: "#5C5C5C",
                fontSize: {
                  xs: 13.5,
                  sm: 15,
                  md: 17,
                },
                lineHeight: {
                  xs: 1.65,
                  md: 1.75,
                },
                fontWeight: 450,
              }}
            >
              Discover premium physical NFC products for restaurants, cafes,
              salons, shops, hotels, offices, and professionals. Customize your
              product and order it your way.
            </Typography>

            {/* CTAs */}
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1.4}
              justifyContent={{
                xs: "center",
                md: "flex-start",
              }}
              sx={{
                mt: {
                  xs: 3,
                  sm: 3.5,
                  md: 4,
                },
              }}
            >
              <Button
                component={Link}
                to="/products"
                variant="contained"
                endIcon={<ArrowForwardRounded />}
                sx={{
                  width: {
                    xs: "100%",
                    sm: "auto",
                  },
                  minHeight: {
                    xs: 48,
                    sm: 52,
                  },
                  px: {
                    xs: 2.5,
                    sm: 3,
                  },
                  borderRadius: "14px",
                  textTransform: "none",
                  fontSize: {
                    xs: 13.5,
                    sm: 14.5,
                  },
                  fontWeight: 850,
                  color: "#111111",
                  background:
                    "linear-gradient(135deg, #FFD900 0%, #F2A900 100%)",
                  boxShadow: "0 12px 30px rgba(242, 169, 0, 0.22)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #FFE52E 0%, #F5B500 100%)",
                    boxShadow: "0 15px 35px rgba(242, 169, 0, 0.29)",
                    transform: "translateY(-2px)",
                  },
                  transition: "transform 180ms ease, box-shadow 180ms ease",
                }}
              >
                Explore Products
              </Button>

              <Button
                component={Link}
                to="/request-nfc"
                variant="outlined"
                startIcon={<TouchAppRounded />}
                sx={{
                  width: {
                    xs: "100%",
                    sm: "auto",
                  },
                  minHeight: {
                    xs: 48,
                    sm: 52,
                  },
                  px: {
                    xs: 2.5,
                    sm: 2.8,
                  },
                  borderRadius: "14px",
                  textTransform: "none",
                  fontSize: {
                    xs: 13.5,
                    sm: 14.5,
                  },
                  fontWeight: 800,
                  color: "#171717",
                  borderColor: "rgba(17,17,17,0.14)",
                  backgroundColor: "rgba(255,255,255,0.7)",
                  "&:hover": {
                    borderColor: "#F2B000",
                    backgroundColor: "rgba(255,210,0,0.08)",
                  },
                }}
              >
                Request Custom NFC
              </Button>
            </Stack>

            {/* Trust points */}
            <Stack
              direction="row"
              flexWrap="wrap"
              justifyContent={{
                xs: "center",
                md: "flex-start",
              }}
              spacing={{
                xs: 1.2,
                sm: 2.2,
              }}
              useFlexGap
              sx={{
                mt: {
                  xs: 3,
                  sm: 3.5,
                },
              }}
            >
              {["Premium Quality", "Custom Designs", "Secure Checkout"].map(
                (item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.45 + index * 0.08,
                      duration: 0.4,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.7}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          backgroundColor: "#F2AE00",
                        }}
                      />

                      <Typography
                        sx={{
                          color: "#666666",
                          fontSize: {
                            xs: 10.5,
                            sm: 12,
                          },
                          fontWeight: 650,
                        }}
                      >
                        {item}
                      </Typography>
                    </Stack>
                  </motion.div>
                ),
              )}
            </Stack>
          </MotionBox>

          {/* Product Visual */}
          <MotionBox
            initial={{
              opacity: 0,
              scale: 0.9,
              x: 25,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
            }}
            transition={{
              duration: 0.8,
              delay: 0.15,
              ease: "easeOut",
            }}
            sx={{
              position: "relative",
              minHeight: {
                xs: 315,
                sm: 390,
                md: 510,
                lg: 580,
              },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Floating label */}
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                position: "absolute",
                top: isMobile ? "2%" : "8%",
                right: isMobile ? "4%" : "3%",
                zIndex: 4,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                  px: {
                    xs: 1.3,
                    sm: 1.7,
                  },
                  py: {
                    xs: 0.8,
                    sm: 1,
                  },
                  borderRadius: "13px",
                  backgroundColor: "rgba(255,255,255,0.92)",
                  border: "1px solid rgba(17,17,17,0.07)",
                  boxShadow: "0 12px 35px rgba(0,0,0,0.09)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <BoltRounded
                  sx={{
                    color: "#F2AE00",
                    fontSize: {
                      xs: 16,
                      sm: 19,
                    },
                  }}
                />

                <Typography
                  sx={{
                    fontSize: {
                      xs: 10,
                      sm: 11.5,
                    },
                    fontWeight: 800,
                    color: "#222222",
                  }}
                >
                  Tap. Connect. Grow.
                </Typography>
              </Box>
            </motion.div>

            {/* Main visual */}
            <motion.div
              animate={{
                y: [0, -12, 0],
                rotate: [0, 1, 0, -1, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: {
                    xs: 235,
                    sm: 300,
                    md: 390,
                    lg: 440,
                  },
                  height: {
                    xs: 235,
                    sm: 300,
                    md: 390,
                    lg: 440,
                  },
                  borderRadius: {
                    xs: "38px",
                    md: "55px",
                  },
                  background:
                    "linear-gradient(145deg, #FFFFFF 0%, #FAFAFA 58%, #F3F3F3 100%)",
                  border: "1px solid rgba(17,17,17,0.07)",
                  boxShadow:
                    "0 35px 90px rgba(17,17,17,0.13), 0 8px 25px rgba(245,180,0,0.10)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {/* Golden glow */}
                <Box
                  sx={{
                    position: "absolute",
                    width: "78%",
                    height: "78%",
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(255,211,0,0.27) 0%, rgba(255,211,0,0.08) 40%, rgba(255,211,0,0) 72%)",
                  }}
                />

                {/* NFC card */}
                <Box
                  sx={{
                    position: "relative",
                    width: {
                      xs: 150,
                      sm: 195,
                      md: 255,
                      lg: 285,
                    },
                    aspectRatio: "1.59 / 1",
                    borderRadius: {
                      xs: "17px",
                      sm: "21px",
                      md: "26px",
                    },
                    background:
                      "linear-gradient(135deg, #171717 0%, #292929 48%, #111111 100%)",
                    boxShadow:
                      "0 22px 42px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
                    transform: "rotate(-8deg)",
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  {/* Card glow */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: -60,
                      right: -45,
                      width: 150,
                      height: 150,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle, rgba(255,208,0,0.35) 0%, rgba(255,208,0,0) 70%)",
                    }}
                  />

                  {/* Glyrus mark */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: {
                        xs: 13,
                        sm: 18,
                        md: 22,
                      },
                      left: {
                        xs: 14,
                        sm: 19,
                        md: 24,
                      },
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: {
                          xs: 19,
                          sm: 25,
                          md: 31,
                        },
                        height: {
                          xs: 19,
                          sm: 25,
                          md: 31,
                        },
                        borderRadius: "7px",
                        display: "grid",
                        placeItems: "center",
                        background: "linear-gradient(135deg, #FFE000, #F2A800)",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#111111",
                          fontWeight: 950,
                          fontSize: {
                            xs: 11,
                            sm: 14,
                            md: 17,
                          },
                          lineHeight: 1,
                        }}
                      >
                        T
                      </Typography>
                    </Box>

                    <Typography
                      sx={{
                        color: "#FFFFFF",
                        fontSize: {
                          xs: 10,
                          sm: 13,
                          md: 16,
                        },
                        fontWeight: 900,
                        letterSpacing: "-0.5px",
                      }}
                    >
                      Glyrus
                      <Box
                        component="span"
                        sx={{
                          color: "#FFD000",
                        }}
                      >
                        Tap
                      </Box>
                    </Typography>
                  </Box>

                  {/* NFC icon */}
                  <Box
                    sx={{
                      position: "absolute",
                      right: {
                        xs: 17,
                        sm: 22,
                        md: 29,
                      },
                      bottom: {
                        xs: 16,
                        sm: 21,
                        md: 27,
                      },
                      width: {
                        xs: 43,
                        sm: 55,
                        md: 70,
                      },
                      height: {
                        xs: 43,
                        sm: 55,
                        md: 70,
                      },
                      borderRadius: "50%",
                      border: {
                        xs: "2px solid rgba(255,208,0,0.85)",
                        md: "3px solid rgba(255,208,0,0.85)",
                      },
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <TouchAppRounded
                      sx={{
                        color: "#FFD000",
                        fontSize: {
                          xs: 22,
                          sm: 28,
                          md: 36,
                        },
                      }}
                    />
                  </Box>

                  {/* Card text */}
                  <Box
                    sx={{
                      position: "absolute",
                      left: {
                        xs: 15,
                        sm: 20,
                        md: 26,
                      },
                      bottom: {
                        xs: 17,
                        sm: 22,
                        md: 28,
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#FFFFFF",
                        fontSize: {
                          xs: 9,
                          sm: 11,
                          md: 14,
                        },
                        fontWeight: 750,
                        letterSpacing: "0.5px",
                      }}
                    >
                      BUSINESS NFC
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.25,
                        color: "rgba(255,255,255,0.5)",
                        fontSize: {
                          xs: 6.5,
                          sm: 8,
                          md: 10,
                        },
                        fontWeight: 500,
                      }}
                    >
                      TAP TO CONNECT
                    </Typography>
                  </Box>
                </Box>

                {/* NFC waves */}
                <Box
                  sx={{
                    position: "absolute",
                    top: {
                      xs: 25,
                      sm: 34,
                      md: 45,
                    },
                    right: {
                      xs: 25,
                      sm: 35,
                      md: 45,
                    },
                    width: {
                      xs: 58,
                      sm: 76,
                      md: 100,
                    },
                    height: {
                      xs: 58,
                      sm: 76,
                      md: 100,
                    },
                    transform: "rotate(-8deg)",
                  }}
                >
                  {[0, 1, 2].map((index) => (
                    <Box
                      key={index}
                      sx={{
                        position: "absolute",
                        inset: index * 9,
                        borderTop: {
                          xs: "3px solid #FFD000",
                          md: "4px solid #FFD000",
                        },
                        borderRight: {
                          xs: "3px solid #FFD000",
                          md: "4px solid #FFD000",
                        },
                        borderRadius: "50%",
                        opacity: 0.85 - index * 0.2,
                      }}
                    />
                  ))}
                </Box>

                {/* Bottom shine */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: "10%",
                    width: "80%",
                    height: 2,
                    borderRadius: "999px",
                    background:
                      "linear-gradient(90deg, transparent, #FFD000, transparent)",
                    opacity: 0.7,
                  }}
                />
              </Box>
            </motion.div>

            {/* Floating feature card */}
            <motion.div
              animate={{
                y: [0, 8, 0],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                position: "absolute",
                left: isMobile ? "1%" : "0%",
                bottom: isMobile ? "4%" : "8%",
                zIndex: 5,
              }}
            >
              <Box
                sx={{
                  px: {
                    xs: 1.4,
                    sm: 1.8,
                  },
                  py: {
                    xs: 1.15,
                    sm: 1.4,
                  },
                  minWidth: {
                    xs: 125,
                    sm: 160,
                  },
                  borderRadius: {
                    xs: "14px",
                    sm: "17px",
                  },
                  backgroundColor: "rgba(255,255,255,0.94)",
                  border: "1px solid rgba(17,17,17,0.07)",
                  boxShadow: "0 14px 40px rgba(0,0,0,0.10)",
                  backdropFilter: "blur(15px)",
                }}
              >
                <Typography
                  sx={{
                    color: "#F2AE00",
                    fontSize: {
                      xs: 17,
                      sm: 20,
                    },
                    fontWeight: 950,
                    lineHeight: 1,
                  }}
                >
                  NFC
                </Typography>

                <Typography
                  sx={{
                    mt: 0.45,
                    color: "#222222",
                    fontSize: {
                      xs: 9.5,
                      sm: 11,
                    },
                    fontWeight: 700,
                  }}
                >
                  Made for business
                </Typography>
              </Box>
            </motion.div>
          </MotionBox>
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;
