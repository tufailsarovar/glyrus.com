// Glyrus — Footer.jsx

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowForwardRounded,
  ArrowUpwardRounded,
  EmailRounded,
  LocationOnRounded,
  PhoneRounded,
  FacebookRounded,
  Instagram,
  LinkedIn,
  YouTube,
} from "@mui/icons-material";
import {
  Box,
  Container,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

const MotionBox = motion(Box);
const MotionDiv = motion.div;

const navigationLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "All Products", path: "/products" },
  { label: "Request NFC", path: "/request-nfc" },
  { label: "Track Order", path: "/tracking" },
  { label: "Contact", path: "/contact" },
];

const legalLinks = [
  { label: "Privacy Policy", path: "/privacy-policy" },
  { label: "Terms & Conditions", path: "/terms" },
  { label: "Shipping Policy", path: "/shipping-policy" },
  { label: "Refund & Cancellation", path: "/refund-policy" },
];

const socialLinks = [
  {
    label: "Instagram",
    icon: <Instagram />,
    href: "https://instagram.com",
  },
  {
    label: "Facebook",
    icon: <FacebookRounded />,
    href: "https://facebook.com",
  },
  {
    label: "LinkedIn",
    icon: <LinkedIn />,
    href: "https://linkedin.com",
  },
  {
    label: "YouTube",
    icon: <YouTube />,
    href: "https://youtube.com",
  },
];

const sectionAnimation = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Box
      component="footer"
      sx={{
        position: "relative",

        /* IMPORTANT: remove the huge mobile gap */
        mt: {
          xs: 0,
          sm: 4,
          md: 7,
        },

        overflow: "hidden",
        color: "#fff",
        background:
          "linear-gradient(145deg,#151515 0%,#0d0d0d 60%,#090909 100%)",
      }}
    >
      {/* Background glow */}
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
            xs: 170,
            sm: 300,
            md: 420,
          },
          height: {
            xs: 170,
            sm: 300,
            md: 420,
          },
          top: {
            xs: -110,
            md: -170,
          },
          right: {
            xs: -90,
            md: -120,
          },
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(255,208,0,.12),transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: -150,
          left: -120,
          width: {
            xs: 200,
            md: 400,
          },
          height: {
            xs: 200,
            md: 400,
          },
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(255,190,0,.055),transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 2,
          px: {
            xs: 1.7,
            sm: 3,
            md: 4,
          },
        }}
      >
        {/* ================= MAIN FOOTER ================= */}

        <Box
          sx={{
            py: {
              xs: 2.4,
              sm: 5,
              md: 7,
            },
          }}
        >
          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs: "1fr 1fr",
                sm: "1.1fr 1fr 1fr",
                md: "1.5fr .85fr .9fr 1.1fr",
              },

              gap: {
                xs: 2,
                sm: 4,
                md: 6,
              },
            }}
          >
            {/* ================= BRAND ================= */}

            <MotionBox
              variants={sectionAnimation}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.1,
              }}
              sx={{
                gridColumn: {
                  xs: "1 / -1",
                  sm: "auto",
                },
              }}
            >
              <Link
                to="/"
                onClick={scrollToTop}
                style={{
                  display: "inline-flex",
                  textDecoration: "none",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={0.8}>
                  <MotionBox
                    whileHover={{
                      rotate: -5,
                      scale: 1.05,
                    }}
                    sx={{
                      width: {
                        xs: 31,
                        sm: 42,
                      },
                      height: {
                        xs: 31,
                        sm: 42,
                      },
                      display: "grid",
                      placeItems: "center",
                      borderRadius: {
                        xs: "9px",
                        sm: "12px",
                      },
                      background: "linear-gradient(135deg,#FFE000,#F1AA00)",
                      boxShadow: "0 7px 22px rgba(255,196,0,.16)",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#111",
                        fontSize: {
                          xs: 17,
                          sm: 23,
                        },
                        fontWeight: 950,
                        lineHeight: 1,
                      }}
                    >
                      T
                    </Typography>
                  </MotionBox>

                  <Typography
                    sx={{
                      color: "#fff",
                      fontSize: {
                        xs: 18,
                        sm: 26,
                        md: 28,
                      },
                      fontWeight: 900,
                      letterSpacing: "-1px",
                    }}
                  >
                    Glyrus
                  </Typography>
                </Stack>
              </Link>

              <Typography
                sx={{
                  mt: {
                    xs: 0.9,
                    sm: 1.8,
                  },
                  maxWidth: 390,
                  color: "rgba(255,255,255,.52)",
                  fontSize: {
                    xs: 8.5,
                    sm: 12,
                    md: 14,
                  },
                  lineHeight: 1.55,
                }}
              >
                Premium physical NFC products designed for modern businesses.
                Discover, customize, order, and connect your business with
                Glyrus.
              </Typography>

              {/* Social */}
              <Stack
                direction="row"
                spacing={{
                  xs: 0.45,
                  sm: 0.9,
                }}
                sx={{
                  mt: {
                    xs: 1.1,
                    sm: 2.2,
                  },
                }}
              >
                {socialLinks.map((social, index) => (
                  <MotionDiv
                    key={social.label}
                    initial={{
                      opacity: 0,
                      scale: 0.8,
                    }}
                    whileInView={{
                      opacity: 1,
                      scale: 1,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 0.25,
                      delay: index * 0.05,
                    }}
                  >
                    <IconButton
                      component="a"
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      sx={{
                        width: {
                          xs: 27,
                          sm: 37,
                        },
                        height: {
                          xs: 27,
                          sm: 37,
                        },
                        color: "rgba(255,255,255,.62)",
                        border: "1px solid rgba(255,255,255,.08)",
                        backgroundColor: "rgba(255,255,255,.025)",
                        "&:hover": {
                          color: "#111",
                          backgroundColor: "#FFD000",
                          borderColor: "#FFD000",
                        },
                      }}
                    >
                      {React.cloneElement(social.icon, {
                        sx: {
                          fontSize: {
                            xs: 13,
                            sm: 18,
                          },
                        },
                      })}
                    </IconButton>
                  </MotionDiv>
                ))}
              </Stack>
            </MotionBox>

            {/* ================= EXPLORE ================= */}

            <MotionBox
              variants={sectionAnimation}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.1,
              }}
            >
              <FooterTitle>Explore</FooterTitle>

              <Stack
                spacing={{
                  xs: 0.55,
                  sm: 1.1,
                }}
              >
                {navigationLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={scrollToTop}
                    style={{
                      textDecoration: "none",
                    }}
                  >
                    <MotionBox
                      whileHover={{
                        x: 3,
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.3,
                        color: "rgba(255,255,255,.5)",
                        "&:hover": {
                          color: "#FFD000",
                        },
                      }}
                    >
                      <ArrowForwardRounded
                        sx={{
                          fontSize: {
                            xs: 9,
                            sm: 12,
                          },
                        }}
                      />

                      <Typography
                        component="span"
                        sx={{
                          fontSize: {
                            xs: 7.7,
                            sm: 11.5,
                            md: 13,
                          },
                          lineHeight: 1.35,
                        }}
                      >
                        {item.label}
                      </Typography>
                    </MotionBox>
                  </Link>
                ))}
              </Stack>
            </MotionBox>

            {/* ================= INFORMATION ================= */}

            <MotionBox
              variants={sectionAnimation}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.1,
              }}
            >
              <FooterTitle>Information</FooterTitle>

              <Stack
                spacing={{
                  xs: 0.55,
                  sm: 1.1,
                }}
              >
                {legalLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={scrollToTop}
                    style={{
                      textDecoration: "none",
                    }}
                  >
                    <MotionBox
                      whileHover={{
                        x: 3,
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.3,
                        color: "rgba(255,255,255,.5)",
                        "&:hover": {
                          color: "#FFD000",
                        },
                      }}
                    >
                      <ArrowForwardRounded
                        sx={{
                          fontSize: {
                            xs: 9,
                            sm: 12,
                          },
                        }}
                      />

                      <Typography
                        component="span"
                        sx={{
                          fontSize: {
                            xs: 7.7,
                            sm: 11.5,
                            md: 13,
                          },
                          lineHeight: 1.35,
                        }}
                      >
                        {item.label}
                      </Typography>
                    </MotionBox>
                  </Link>
                ))}
              </Stack>
            </MotionBox>

            {/* ================= CONTACT ================= */}

            <MotionBox
              variants={sectionAnimation}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.1,
              }}
              sx={{
                gridColumn: {
                  xs: "1 / -1",
                  sm: "auto",
                },
              }}
            >
              <FooterTitle>Get in Touch</FooterTitle>

              <Stack
                spacing={{
                  xs: 0.8,
                  sm: 1.5,
                }}
              >
                {[
                  {
                    icon: EmailRounded,
                    label: "Email",
                    value: "glyrus.com@gmail.com",
                  },
                  {
                    icon: PhoneRounded,
                    label: "Support",
                    value: "Contact our support team",
                  },
                  {
                    icon: LocationOnRounded,
                    label: "Service",
                    value: "Business-focused NFC products",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <Stack
                      key={item.label}
                      direction="row"
                      spacing={{
                        xs: 0.7,
                        sm: 1.2,
                      }}
                      alignItems="flex-start"
                    >
                      <Box
                        sx={{
                          width: {
                            xs: 26,
                            sm: 34,
                          },
                          height: {
                            xs: 26,
                            sm: 34,
                          },
                          flexShrink: 0,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: {
                            xs: "7px",
                            sm: "10px",
                          },
                          color: "#FFD000",
                          backgroundColor: "rgba(255,208,0,.07)",
                        }}
                      >
                        <Icon
                          sx={{
                            fontSize: {
                              xs: 13,
                              sm: 18,
                            },
                          }}
                        />
                      </Box>

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            mb: 0.1,
                            color: "rgba(255,255,255,.3)",
                            fontSize: {
                              xs: 6.5,
                              sm: 9.5,
                            },
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: ".5px",
                          }}
                        >
                          {item.label}
                        </Typography>

                        <Typography
                          component={item.label === "Email" ? "a" : "div"}
                          href={
                            item.label === "Email"
                              ? "mailto:glyrus.com@gmail.com"
                              : undefined
                          }
                          sx={{
                            color: "rgba(255,255,255,.65)",
                            fontSize: {
                              xs: 7.7,
                              sm: 11,
                              md: 12.5,
                            },
                            lineHeight: 1.35,
                            textDecoration: "none",
                            wordBreak: "break-word",
                            "&:hover": {
                              color: "#FFD000",
                            },
                          }}
                        >
                          {item.value}
                        </Typography>
                      </Box>
                    </Stack>
                  );
                })}
              </Stack>
            </MotionBox>
          </Box>
        </Box>

        {/* ================= BOTTOM ================= */}

        <Divider
          sx={{
            borderColor: "rgba(255,255,255,.065)",
          }}
        />

        <Box
          sx={{
            minHeight: {
              xs: 48,
              sm: 72,
            },
            py: {
              xs: 0.8,
              sm: 1.8,
            },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography
            sx={{
              color: "rgba(255,255,255,.32)",
              fontSize: {
                xs: 6.8,
                sm: 10.5,
                md: 12,
              },
              lineHeight: 1.35,
            }}
          >
            © {new Date().getFullYear()} Glyrus. All rights reserved.
          </Typography>

          <Typography
            sx={{
              display: {
                xs: "none",
                md: "block",
              },
              color: "rgba(255,255,255,.23)",
              fontSize: 11,
            }}
          >
            Premium NFC products for modern businesses.
          </Typography>

          <MotionBox
            whileHover={{
              y: -3,
              scale: 1.04,
            }}
            whileTap={{
              scale: 0.94,
            }}
          >
            <IconButton
              onClick={scrollToTop}
              aria-label="Back to top"
              sx={{
                width: {
                  xs: 27,
                  sm: 36,
                },
                height: {
                  xs: 27,
                  sm: 36,
                },
                flexShrink: 0,
                color: "#111",
                backgroundColor: "#FFD000",
                borderRadius: {
                  xs: "8px",
                  sm: "11px",
                },
                "&:hover": {
                  backgroundColor: "#FFE13A",
                },
              }}
            >
              <ArrowUpwardRounded
                sx={{
                  fontSize: {
                    xs: 13,
                    sm: 18,
                  },
                }}
              />
            </IconButton>
          </MotionBox>
        </Box>
      </Container>

      {/* Bottom accent */}
      <MotionBox
        animate={{
          opacity: [0.35, 0.8, 0.35],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        sx={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: {
            xs: "42%",
            sm: "30%",
          },
          height: 2,
          borderRadius: "999px",
          backgroundColor: "#FFD000",
        }}
      />
    </Box>
  );
};

const FooterTitle = ({ children }) => (
  <Typography
    sx={{
      mb: {
        xs: 0.8,
        sm: 1.8,
      },
      color: "#fff",
      fontSize: {
        xs: 9.5,
        sm: 13,
        md: 14,
      },
      fontWeight: 900,
    }}
  >
    {children}
  </Typography>
);

export default Footer;
