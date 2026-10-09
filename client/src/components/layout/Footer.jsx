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
import nameLogo from "../../assets/logo/name_logo_footer.png";

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
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const FooterTitle = ({ children }) => (
  <Typography
    sx={{
      mb: { xs: 1.2, sm: 2 },
      color: "#FFFFFF",
      fontSize: { xs: 13, sm: 14, md: 15 },
      fontWeight: 800,
      letterSpacing: "-0.02em",
    }}
  >
    {children}
  </Typography>
);

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const footerLinkSx = {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    color: "rgba(255,255,255,0.62)",
    fontSize: { xs: 12, sm: 13 },
    lineHeight: 1.6,
    transition: "color 180ms ease",
    "&:hover": {
      color: "#FFD000",
    },
  };

  return (
    <Box
      component="footer"
      sx={{
        position: "relative",
        mt: { xs: 0, sm: 4, md: 7 },
        overflow: "hidden",
        color: "#FFFFFF",
        background:
          "linear-gradient(145deg, #151515 0%, #0D0D0D 60%, #090909 100%)",
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
          width: { xs: 180, sm: 300, md: 420 },
          height: { xs: 180, sm: 300, md: 420 },
          top: { xs: -100, md: -170 },
          right: { xs: -90, md: -120 },
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,208,0,0.12), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: -150,
          left: -120,
          width: { xs: 200, md: 400 },
          height: { xs: 200, md: 400 },
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,190,0,0.055), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 2,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {/* Main footer */}
        <Box
          sx={{
            py: { xs: 3.5, sm: 5, md: 7 },
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr 1fr",
                sm: "1.2fr 1fr 1fr",
                md: "1.5fr 0.85fr 0.9fr 1.1fr",
              },
              gap: { xs: 3.5, sm: 4, md: 6 },
            }}
          >
            {/* Brand */}
            <MotionBox
              variants={sectionAnimation}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              sx={{
                gridColumn: { xs: "1 / -1", sm: "auto" },
                minWidth: 0,
              }}
            >
              <Link
                to="/"
                onClick={scrollToTop}
                aria-label="Glyrus Home"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  textDecoration: "none",
                }}
              >
                <MotionBox
                  component="img"
                  src={nameLogo}
                  alt="Glyrus"
                  whileHover={{ scale: 1.03 }}
                  sx={{
                    display: "block",
                    width: { xs: 100, sm: 120, md: 135 },
                    height: { xs: 36, sm: 42 },
                    objectFit: "contain",
                    objectPosition: "left center",
                    flexShrink: 0,
                  }}
                />
              </Link>

              <Typography
                sx={{
                  mt: 1.5,
                  mb: 0,
                  maxWidth: 370,
                  color: "rgba(255,255,255,0.62)",
                  fontSize: { xs: 13, sm: 13, md: 14 },
                  fontWeight: 400,
                  lineHeight: 1.8,
                  letterSpacing: "0.005em",
                }}
              >
                Premium physical NFC products for modern businesses. Discover,
                customize, and order NFC products to help your business connect
                with customers.
              </Typography>

              {/* Social media */}
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                {socialLinks.map((social, index) => (
                  <MotionDiv
                    key={social.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
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
                        width: { xs: 34, sm: 36 },
                        height: { xs: 34, sm: 36 },
                        p: 0,
                        color: "rgba(255,255,255,0.65)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        backgroundColor: "rgba(255,255,255,0.025)",
                        "&:hover": {
                          color: "#111111",
                          backgroundColor: "#FFD000",
                          borderColor: "#FFD000",
                        },
                      }}
                    >
                      {React.cloneElement(social.icon, {
                        sx: { fontSize: 17 },
                      })}
                    </IconButton>
                  </MotionDiv>
                ))}
              </Stack>
            </MotionBox>

            {/* Explore */}
            <MotionBox
              variants={sectionAnimation}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <FooterTitle>Explore</FooterTitle>

              <Stack spacing={{ xs: 1.1, sm: 1.3 }}>
                {navigationLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={scrollToTop}
                    style={{ textDecoration: "none" }}
                  >
                    <MotionBox whileHover={{ x: 3 }} sx={footerLinkSx}>
                      <ArrowForwardRounded sx={{ fontSize: 15 }} />
                      <Typography
                        component="span"
                        sx={{ fontSize: "inherit", lineHeight: "inherit" }}
                      >
                        {item.label}
                      </Typography>
                    </MotionBox>
                  </Link>
                ))}
              </Stack>
            </MotionBox>

            {/* Information */}
            <MotionBox
              variants={sectionAnimation}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <FooterTitle>Information</FooterTitle>

              <Stack spacing={{ xs: 1.1, sm: 1.3 }}>
                {legalLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={scrollToTop}
                    style={{ textDecoration: "none" }}
                  >
                    <MotionBox whileHover={{ x: 3 }} sx={footerLinkSx}>
                      <ArrowForwardRounded sx={{ fontSize: 15 }} />
                      <Typography
                        component="span"
                        sx={{ fontSize: "inherit", lineHeight: "inherit" }}
                      >
                        {item.label}
                      </Typography>
                    </MotionBox>
                  </Link>
                ))}
              </Stack>
            </MotionBox>

            {/* Get in Touch */}
            <MotionBox
              variants={sectionAnimation}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              sx={{
                gridColumn: { xs: "1 / -1", sm: "auto" },
                minWidth: 0,
                width: "100%",
              }}
            >
              <FooterTitle>Get in Touch</FooterTitle>

              <Stack spacing={{ xs: 1.2, sm: 1.8 }}>
                {[
                  {
                    icon: EmailRounded,
                    label: "Email",
                    value: "glyrus.com@gmail.com",
                    href: "mailto:glyrus.com@gmail.com",
                  },
                  {
                    icon: PhoneRounded,
                    label: "Support",
                    value: "Contact our support team",
                    href: "/contact",
                  },
                  {
                    icon: LocationOnRounded,
                    label: "Service",
                    value: "Business-focused NFC products",
                    href: null,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <Stack
                      key={item.label}
                      direction="row"
                      spacing={{ xs: 1, sm: 1.2 }}
                      alignItems="center"
                      sx={{ minWidth: 0 }}
                    >
                      <Box
                        sx={{
                          width: { xs: 32, sm: 38 },
                          height: { xs: 32, sm: 38 },
                          flexShrink: 0,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: { xs: "9px", sm: "11px" },
                          color: "#FFD000",
                          backgroundColor: "rgba(255,208,0,0.08)",
                        }}
                      >
                        <Icon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                      </Box>

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          sx={{
                            mb: 0.2,
                            color: "rgba(255,255,255,0.42)",
                            fontSize: { xs: 9, sm: 11 },
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: { xs: "0.5px", sm: "0.7px" },
                            lineHeight: 1.4,
                          }}
                        >
                          {item.label}
                        </Typography>

                        {item.href ? (
                          <Box
                            component={item.href.startsWith("/") ? Link : "a"}
                            to={
                              item.href.startsWith("/") ? item.href : undefined
                            }
                            href={
                              item.href.startsWith("/") ? undefined : item.href
                            }
                            sx={{
                              display: "block",
                              color: "rgba(255,255,255,0.7)",
                              fontSize: { xs: 11, sm: 13 },
                              fontWeight: 500,
                              lineHeight: 1.5,
                              overflowWrap: "anywhere",
                              textDecoration: "none",
                              transition: "color 180ms ease",
                              "&:hover": {
                                color: "#FFD000",
                              },
                            }}
                          >
                            {item.value}
                          </Box>
                        ) : (
                          <Typography
                            sx={{
                              color: "rgba(255,255,255,0.7)",
                              fontSize: { xs: 11, sm: 13 },
                              fontWeight: 500,
                              lineHeight: 1.5,
                              overflowWrap: "anywhere",
                            }}
                          >
                            {item.value}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  );
                })}
              </Stack>
            </MotionBox>
          </Box>
        </Box>

        {/* Footer bottom */}
        <Divider sx={{ borderColor: "rgba(255,255,255,0.09)" }} />

        <Box
          sx={{
            minHeight: { xs: 64, sm: 76 },
            py: { xs: 1.5, sm: 2 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography
            sx={{
              color: "rgba(255,255,255,0.48)",
              fontSize: { xs: 11, sm: 12 },
              lineHeight: 1.5,
            }}
          >
            © {new Date().getFullYear()} Glyrus. All rights reserved.
          </Typography>

          <Typography
            sx={{
              display: { xs: "none", md: "block" },
              color: "rgba(255,255,255,0.35)",
              fontSize: 12,
            }}
          >
            Premium NFC products for modern businesses.
          </Typography>

          <MotionBox
            whileHover={{ y: -3, scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
          >
            <IconButton
              onClick={scrollToTop}
              aria-label="Back to top"
              sx={{
                width: 38,
                height: 38,
                flexShrink: 0,
                color: "#111111",
                backgroundColor: "#FFD000",
                borderRadius: "11px",
                "&:hover": { backgroundColor: "#FFE13A" },
              }}
            >
              <ArrowUpwardRounded />
            </IconButton>
          </MotionBox>
        </Box>
      </Container>

      {/* Bottom accent */}
      <MotionBox
        animate={{ opacity: [0.35, 0.8, 0.35] }}
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
          width: { xs: "42%", sm: "30%" },
          height: 2,
          borderRadius: "999px",
          backgroundColor: "#FFD000",
        }}
      />
    </Box>
  );
};

export default Footer;
