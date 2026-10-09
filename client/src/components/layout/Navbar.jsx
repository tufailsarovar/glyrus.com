import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  CloseRounded,
  MenuRounded,
  SearchRounded,
  ShoppingBagOutlined,
  TrackChangesRounded,
  ArrowForwardRounded,
} from "@mui/icons-material";

import { useCart } from "../../hooks/useCart";
import nameLogo from "../../assets/logo/name_logo.png";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const navigationItems = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "All Products", path: "/products" },
  { label: "Request NFC", path: "/request-nfc" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const { items = [], cartItems = [] } = useCart();

  const currentCartItems =
    Array.isArray(cartItems) && cartItems.length > 0 ? cartItems : items;

  const cartCount = currentCartItems.reduce(
    (total, item) => total + (Number(item?.quantity) || 0),
    0,
  );

  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => setMobileOpen(false);

  const handleNavigation = (path) => {
    closeMobileMenu();
    navigate(path);
  };

  // Shared brand logo for desktop and mobile drawer
  const BrandLogo = ({ mobile = false }) => (
    <Stack
      direction="row"
      alignItems="center"
      spacing={mobile ? 0.8 : 1}
      sx={{
        flexShrink: 0,
        minWidth: 0,
      }}
    >
      <Box
        component="img"
        src={nameLogo}
        alt="Glyrus"
        onError={(event) => {
          console.error(
            "Unable to load Glyrus wordmark:",
            event.currentTarget.src,
          );
        }}
        sx={{
          display: "block",
          width: mobile ? 110 : { xs: 100, sm: 120, md: 135 },
          height: mobile ? 36 : { xs: 36, sm: 40, md: 44 },
          maxWidth: "100%",
          flexShrink: 1,
          objectFit: "contain",
          objectPosition: "left center",
        }}
      />
    </Stack>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        component="header"
        sx={{
          backgroundColor: "rgba(255,255,255,0.96)",
          color: "#111111",
          borderBottom: "1px solid rgba(17,17,17,0.08)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          zIndex: theme.zIndex.appBar,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 68, md: 78 },
              justifyContent: "space-between",
              gap: { xs: 1, md: 2 },
            }}
          >
            {/* Brand logo */}
            <MotionBox
              component={Link}
              to="/"
              aria-label="Glyrus Home"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                flexShrink: 0,
                textDecoration: "none",
              }}
            >
              <BrandLogo />
            </MotionBox>

            {/* Desktop navigation */}
            {!isMobile && (
              <Stack
                component="nav"
                direction="row"
                alignItems="center"
                spacing={{ md: 0.5, lg: 1 }}
                sx={{
                  flex: 1,
                  justifyContent: "center",
                  ml: { md: 1, lg: 2 },
                }}
              >
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    style={{ textDecoration: "none" }}
                  >
                    {({ isActive }) => (
                      <MotionBox
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        sx={{
                          position: "relative",
                          px: { md: 1, lg: 1.4 },
                          py: 1,
                          borderRadius: 2,
                          color: isActive ? "#111111" : "#5E5E5E",
                          transition: "color 180ms ease",
                          "&:hover": {
                            color: "#111111",
                            backgroundColor: "rgba(245,180,0,0.07)",
                          },
                          "&::after": {
                            content: '""',
                            position: "absolute",
                            left: "50%",
                            bottom: 3,
                            width: isActive ? 22 : 0,
                            height: 3,
                            borderRadius: 999,
                            background:
                              "linear-gradient(90deg,#FFD600,#F2A900)",
                            transform: "translateX(-50%)",
                            transition: "width 220ms ease",
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: { md: 13, lg: 14 },
                            fontWeight: isActive ? 750 : 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.label}
                        </Typography>
                      </MotionBox>
                    )}
                  </NavLink>
                ))}
              </Stack>
            )}

            {/* Desktop actions */}
            {!isMobile && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <IconButton
                  onClick={() => navigate("/search")}
                  aria-label="Search products"
                  sx={{ color: "#191919", width: 42, height: 42 }}
                >
                  <SearchRounded />
                </IconButton>

                <IconButton
                  onClick={() => navigate("/tracking")}
                  aria-label="Track your order"
                  sx={{ color: "#191919", width: 42, height: 42 }}
                >
                  <TrackChangesRounded />
                </IconButton>

                <IconButton
                  onClick={() => navigate("/cart")}
                  aria-label="Open shopping cart"
                  sx={{ color: "#191919", width: 42, height: 42 }}
                >
                  <Badge
                    badgeContent={cartCount}
                    invisible={cartCount === 0}
                    sx={{
                      "& .MuiBadge-badge": {
                        backgroundColor: "#FFD000",
                        color: "#111111",
                        fontWeight: 900,
                      },
                    }}
                  >
                    <ShoppingBagOutlined />
                  </Badge>
                </IconButton>

                <Button
                  component={Link}
                  to="/request-nfc"
                  endIcon={<ArrowForwardRounded />}
                  sx={{
                    ml: 0.7,
                    minHeight: 42,
                    px: 2,
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 800,
                    fontSize: 13,
                    color: "#111111",
                    background:
                      "linear-gradient(135deg,#FFD900 0%,#F4AE00 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg,#FFE329 0%,#F6B600 100%)",
                    },
                  }}
                >
                  Get NFC
                </Button>
              </Stack>
            )}

            {/* Mobile actions */}
            {isMobile && (
              <Stack direction="row" alignItems="center" spacing={0.2}>
                <IconButton
                  onClick={() => navigate("/search")}
                  aria-label="Search products"
                  sx={{ color: "#111111", width: 40, height: 40 }}
                >
                  <SearchRounded />
                </IconButton>

                <IconButton
                  onClick={() => navigate("/cart")}
                  aria-label={`Open cart${cartCount ? `, ${cartCount} items` : ""}`}
                  sx={{ color: "#111111", width: 40, height: 40 }}
                >
                  <Badge
                    badgeContent={cartCount}
                    invisible={cartCount === 0}
                    sx={{
                      "& .MuiBadge-badge": {
                        backgroundColor: "#FFD000",
                        color: "#111111",
                      },
                    }}
                  >
                    <ShoppingBagOutlined />
                  </Badge>
                </IconButton>

                <IconButton
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open navigation menu"
                  sx={{
                    width: 42,
                    height: 42,
                    color: "#111111",
                    border: "1px solid rgba(17,17,17,0.08)",
                    borderRadius: "12px",
                  }}
                >
                  <MenuRounded />
                </IconButton>
              </Stack>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile navigation drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={closeMobileMenu}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: { xs: "86vw", sm: 370 },
            maxWidth: 390,
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: "24px",
            borderBottomLeftRadius: "24px",
            overflow: "hidden",
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Drawer header */}
          <Box
            sx={{
              px: 2.2,
              py: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(17,17,17,0.07)",
            }}
          >
            <Box
              component={Link}
              to="/"
              onClick={closeMobileMenu}
              aria-label="Glyrus Home"
              sx={{ textDecoration: "none", minWidth: 0 }}
            >
              <BrandLogo mobile />
            </Box>

            <IconButton
              onClick={closeMobileMenu}
              aria-label="Close navigation menu"
              sx={{
                width: 42,
                height: 42,
                color: "#111111",
                borderRadius: "12px",
                backgroundColor: "#F7F7F7",
              }}
            >
              <CloseRounded />
            </IconButton>
          </Box>

          {/* Navigation links */}
          <List disablePadding sx={{ px: 1.5, pt: 2 }}>
            {navigationItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * index, duration: 0.22 }}
              >
                <NavLink
                  to={item.path}
                  end={item.path === "/"}
                  onClick={closeMobileMenu}
                  style={{ textDecoration: "none" }}
                >
                  {({ isActive }) => (
                    <ListItem disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        sx={{
                          minHeight: 52,
                          px: 1.8,
                          borderRadius: "14px",
                          color: isActive ? "#111111" : "#555555",
                          backgroundColor: isActive
                            ? "rgba(255,210,0,0.14)"
                            : "transparent",
                          "&:hover": {
                            backgroundColor: "rgba(255,210,0,0.10)",
                            color: "#111111",
                          },
                        }}
                      >
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontSize: 15,
                            fontWeight: isActive ? 800 : 600,
                          }}
                        />
                        {isActive && (
                          <Box
                            sx={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              backgroundColor: "#F5B400",
                              boxShadow: "0 0 0 5px rgba(245,180,0,0.10)",
                            }}
                          />
                        )}
                      </ListItemButton>
                    </ListItem>
                  )}
                </NavLink>
              </motion.div>
            ))}
          </List>

          {/* Mobile extra actions */}
          <Box sx={{ px: 1.5, mt: 1 }}>
            <Button
              fullWidth
              onClick={() => handleNavigation("/tracking")}
              startIcon={<TrackChangesRounded />}
              sx={{
                justifyContent: "flex-start",
                minHeight: 52,
                px: 1.8,
                borderRadius: "14px",
                textTransform: "none",
                fontSize: 15,
                fontWeight: 700,
                color: "#333333",
              }}
            >
              Track Order
            </Button>

            <Button
              fullWidth
              onClick={() => handleNavigation("/cart")}
              startIcon={
                <Badge
                  badgeContent={cartCount}
                  invisible={cartCount === 0}
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: "#FFD000",
                      color: "#111111",
                    },
                  }}
                >
                  <ShoppingBagOutlined />
                </Badge>
              }
              sx={{
                justifyContent: "flex-start",
                minHeight: 52,
                px: 1.8,
                borderRadius: "14px",
                textTransform: "none",
                fontSize: 15,
                fontWeight: 700,
                color: "#333333",
              }}
            >
              Cart
            </Button>
          </Box>

          {/* Mobile CTA */}
          <Box sx={{ mt: "auto", p: 2 }}>
            <MotionButton
              fullWidth
              onClick={() => handleNavigation("/request-nfc")}
              whileTap={{ scale: 0.97 }}
              endIcon={<ArrowForwardRounded />}
              sx={{
                minHeight: 54,
                borderRadius: "15px",
                textTransform: "none",
                fontSize: 15,
                fontWeight: 850,
                color: "#111111",
                background: "linear-gradient(135deg,#FFD900 0%,#F4AE00 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg,#FFE329 0%,#F6B600 100%)",
                },
              }}
            >
              Request Custom NFC
            </MotionButton>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
