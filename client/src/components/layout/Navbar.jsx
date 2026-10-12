import React, { useState } from "react";

import { Link, NavLink, useNavigate } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";

import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Menu,
  MenuItem,
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
  ExpandMoreRounded,
  AppsRounded,
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
  const [servicesAnchor, setServicesAnchor] = useState(null);

  const services = [
    {
      label: "TapReview",
      description: "Collect customer reviews",
      url: "https://tapreview-rho.vercel.app/signup",
    },
  ];

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
                spacing={0}
              sx={{
  flex: 1,
  justifyContent: "center",
  ml: 0,
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

            


{/* Compact, multi-service dropdown — desktop only */}
<Box sx={{ display: { xs: "none", md: "block" }, flexShrink: 0 }}>
  <MotionBox
    component="button"
    type="button"
    aria-haspopup="true"
    aria-expanded={Boolean(servicesAnchor)}
    onClick={(event) => setServicesAnchor(event.currentTarget)}
    whileHover={{ y: -1 }}
    whileTap={{ scale: 0.97 }}
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 0.65,
      px: 1.15,
      py: 0.7,
      border: "1px solid",
      borderColor: servicesAnchor ? "#E7B800" : "#EAEAEA",
      borderRadius: "999px",
      background: servicesAnchor ? "#FFF5CC" : "#FFFFFF",
      color: "#202020",
      cursor: "pointer",
      font: "inherit",
      transition: "all 180ms ease",
      "&:hover": {
        background: "#FFF8E1",
        borderColor: "#E7C34A",
      },
    }}
  >
    <Box
      sx={{
        width: 23,
        height: 23,
        display: "grid",
        placeItems: "center",
        borderRadius: "50%",
        background: "#FFE27A",
        color: "#493900",
      }}
    >
      <AppsRounded sx={{ fontSize: 15 }} />
    </Box>

    <Typography sx={{ fontSize: 12.5, fontWeight: 800 }}>
      Services
    </Typography>

    <motion.span
      animate={{ rotate: servicesAnchor ? 180 : 0 }}
      transition={{ duration: 0.2 }}
      style={{ display: "flex" }}
    >
      <ExpandMoreRounded sx={{ fontSize: 17 }} />
    </motion.span>
  </MotionBox>

  <Menu
    anchorEl={servicesAnchor}
    open={Boolean(servicesAnchor)}
    onClose={() => setServicesAnchor(null)}
    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    transformOrigin={{ vertical: "top", horizontal: "center" }}
    TransitionProps={{ timeout: 180 }}
    PaperProps={{
      sx: {
        mt: 0.8,
        width: 265,
        p: 0.75,
        border: "1px solid #EEEEEE",
        borderRadius: "16px",
        background: "#FFFFFF",
        boxShadow: "0 12px 35px rgba(0,0,0,0.10)",
        overflow: "hidden",
      },
    }}
  >
    {/* Neutral heading for every service */}
    <Box sx={{ px: 1.2, pt: 0.7, pb: 0.8 }}>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 850,
          color: "#202020",
        }}
      >
        Explore services
      </Typography>

      <Typography
        sx={{
          mt: 0.2,
          fontSize: 10.5,
          color: "#888888",
        }}
      >
        Discover tools and solutions
      </Typography>
    </Box>

    <Divider sx={{ mb: 0.5, borderColor: "#F0F0F0" }} />

    {services.map((service, index) => (
      <motion.div
        key={service.label}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, delay: index * 0.04 }}
      >
        <MenuItem
          component="a"
          href={service.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setServicesAnchor(null)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1,
            py: 0.9,
            mb: 0.25,
            borderRadius: "11px",
            whiteSpace: "normal",
            "&:hover": {
              background: "#FFF8E4",
            },
            "&:hover .service-icon": {
              transform: "scale(1.06)",
              background: "#FFD95C",
            },
            "&:hover .service-arrow": {
              transform: "translateX(3px)",
              color: "#B18A00",
            },
          }}
        >
          <Box
            className="service-icon"
            sx={{
              width: 35,
              height: 35,
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              borderRadius: "10px",
              background: "#FFF0B3",
              color: "#493900",
              transition: "all 180ms ease",
            }}
          >
            <AppsRounded sx={{ fontSize: 19 }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 12.5,
                fontWeight: 800,
                color: "#252525",
              }}
            >
              {service.label}
            </Typography>

            <Typography
              sx={{
                mt: 0.15,
                fontSize: 10.5,
                lineHeight: 1.4,
                color: "#858585",
              }}
            >
              {service.description}
            </Typography>
          </Box>

          <ArrowForwardRounded
            className="service-arrow"
            sx={{
              fontSize: 17,
              color: "#AAAAAA",
              transition: "transform 180ms ease, color 180ms ease",
            }}
          />
        </MenuItem>
      </motion.div>
    ))}
  </Menu>
</Box>




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

          <motion.div
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.04 * navigationItems.length,
              duration: 0.22,
            }}
          >
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component="a"
                href="https://tapreview-rho.vercel.app/signup"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMobileMenu}
                sx={{
                  minHeight: 58,
                  px: 1.8,
                  borderRadius: "14px",
                  "&:hover": { backgroundColor: "rgba(255,210,0,0.10)" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38 }}>
                  <AppsRounded sx={{ color: "#3158c9" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Services · TapReview"
                  secondary="Collect customer reviews"
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 750 }}
                  secondaryTypographyProps={{ fontSize: 11 }}
                />
                <ArrowForwardRounded sx={{ fontSize: 18, color: "#9ca3af" }} />
              </ListItemButton>
            </ListItem>
          </motion.div>

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
