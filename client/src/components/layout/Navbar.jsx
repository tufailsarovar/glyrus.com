// Glyrus — Navbar.jsx
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
    Array.isArray(cartItems) && cartItems.length > 0
      ? cartItems
      : items;

  const cartCount = currentCartItems.reduce(
    (total, item) =>
      total + (Number(item?.quantity) || 0),
    0
  );

  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const handleNavigation = (path) => {
    closeMobileMenu();
    navigate(path);
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        component="header"
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.94)",
          color: "#111111",
          borderBottom:
            "1px solid rgba(17, 17, 17, 0.08)",
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
              gap: 2,
            }}
          >
            {/* Logo */}
            <MotionBox
              component={Link}
              to="/"
              aria-label="Glyrus Home"
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.97 }}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                textDecoration: "none",
                flexShrink: 0,
                color: "inherit",
              }}
            >
              <Box
                component="img"
                src="/logo.png"
                alt="Glyrus"
                sx={{
                  display: "block",
                  width: {
                    xs: 112,
                    sm: 128,
                    md: 142,
                  },
                  height: "auto",
                  maxHeight: 54,
                  objectFit: "contain",
                }}
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";

                  const fallback =
                    event.currentTarget.nextElementSibling;

                  if (fallback) {
                    fallback.style.display = "flex";
                  }
                }}
              />

              <Box
                sx={{
                  display: "none",
                  alignItems: "center",
                  gap: 0.8,
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "10px",
                    background:
                      "linear-gradient(135deg, #FFD900 0%, #F4A900 100%)",
                    display: "grid",
                    placeItems: "center",
                    boxShadow:
                      "0 6px 18px rgba(244, 169, 0, 0.22)",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: 19,
                      lineHeight: 1,
                      color: "#111111",
                    }}
                  >
                    T
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    fontSize: {
                      xs: 21,
                      sm: 23,
                    },
                    fontWeight: 900,
                    letterSpacing: "-0.8px",
                    color: "#111111",
                  }}
                >
                  Glyrus
                </Typography>
              </Box>
            </MotionBox>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Stack
                component="nav"
                direction="row"
                alignItems="center"
                spacing={{
                  md: 0.5,
                  lg: 1,
                }}
                sx={{
                  flex: 1,
                  justifyContent: "center",
                  ml: {
                    md: 1,
                    lg: 3,
                  },
                }}
              >
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    style={{
                      textDecoration: "none",
                    }}
                  >
                    {({ isActive }) => (
                      <MotionBox
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        sx={{
                          position: "relative",
                          px: {
                            md: 1.15,
                            lg: 1.45,
                          },
                          py: 1,
                          borderRadius: 2,
                          color: isActive
                            ? "#111111"
                            : "#5E5E5E",
                          transition:
                            "color 180ms ease, background-color 180ms ease",
                          "&:hover": {
                            color: "#111111",
                            backgroundColor:
                              "rgba(245, 180, 0, 0.07)",
                          },
                          "&::after": {
                            content: '""',
                            position: "absolute",
                            left: "50%",
                            bottom: 3,
                            width: isActive
                              ? "22px"
                              : "0px",
                            height: "3px",
                            borderRadius: "999px",
                            background:
                              "linear-gradient(90deg, #FFD600, #F2A900)",
                            transform:
                              "translateX(-50%)",
                            transition:
                              "width 220ms ease",
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: {
                              md: 13,
                              lg: 14,
                            },
                            fontWeight: isActive
                              ? 750
                              : 600,
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

            {/* Desktop Actions */}
            {!isMobile && (
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
              >
                <MotionButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => navigate("/search")}
                  aria-label="Search Glyrus products"
                  sx={{
                    minWidth: 42,
                    width: 42,
                    height: 42,
                    p: 0,
                    borderRadius: "50%",
                    color: "#191919",
                    "&:hover": {
                      backgroundColor:
                        "rgba(245, 180, 0, 0.10)",
                    },
                  }}
                >
                  <SearchRounded />
                </MotionButton>

                <MotionButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => navigate("/tracking")}
                  aria-label="Track your order"
                  sx={{
                    minWidth: 42,
                    width: 42,
                    height: 42,
                    p: 0,
                    borderRadius: "50%",
                    color: "#191919",
                    "&:hover": {
                      backgroundColor:
                        "rgba(245, 180, 0, 0.10)",
                    },
                  }}
                >
                  <TrackChangesRounded />
                </MotionButton>

                {/* Desktop Cart */}
                <MotionButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => navigate("/cart")}
                  aria-label={`Open shopping cart${
                    cartCount > 0
                      ? `, ${cartCount} items`
                      : ""
                  }`}
                  sx={{
                    minWidth: 42,
                    width: 42,
                    height: 42,
                    p: 0,
                    borderRadius: "50%",
                    color: "#191919",
                    "&:hover": {
                      backgroundColor:
                        "rgba(245, 180, 0, 0.10)",
                    },
                  }}
                >
                  <Badge
                    badgeContent={cartCount}
                    invisible={cartCount === 0}
                    overlap="circular"
                    sx={{
                      "& .MuiBadge-badge": {
                        minWidth: 18,
                        height: 18,
                        px: 0.45,
                        fontSize: 10,
                        fontWeight: 900,
                        color: "#111111",
                        backgroundColor: "#FFD000",
                        border:
                          "2px solid #FFFFFF",
                        top: 1,
                        right: 1,
                      },
                    }}
                  >
                    <ShoppingBagOutlined />
                  </Badge>
                </MotionButton>

                <MotionButton
                  component={Link}
                  to="/request-nfc"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  endIcon={
                    <ArrowForwardRounded
                      sx={{ fontSize: 18 }}
                    />
                  }
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
                      "linear-gradient(135deg, #FFD900 0%, #F4AE00 100%)",
                    boxShadow:
                      "0 8px 22px rgba(245, 174, 0, 0.20)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #FFE329 0%, #F6B600 100%)",
                      boxShadow:
                        "0 11px 26px rgba(245, 174, 0, 0.28)",
                    },
                  }}
                >
                  Get NFC
                </MotionButton>
              </Stack>
            )}

            {/* Mobile Actions */}
            {isMobile && (
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.2}
              >
                <IconButton
                  onClick={() => navigate("/search")}
                  aria-label="Search products"
                  sx={{
                    width: 42,
                    height: 42,
                    color: "#111111",
                    "&:hover": {
                      backgroundColor:
                        "rgba(245, 180, 0, 0.10)",
                    },
                  }}
                >
                  <SearchRounded />
                </IconButton>

                {/* Mobile Cart */}
                <IconButton
                  onClick={() => navigate("/cart")}
                  aria-label={`Open cart${
                    cartCount > 0
                      ? `, ${cartCount} items`
                      : ""
                  }`}
                  sx={{
                    width: 42,
                    height: 42,
                    color: "#111111",
                    "&:hover": {
                      backgroundColor:
                        "rgba(245, 180, 0, 0.10)",
                    },
                  }}
                >
                  <Badge
                    badgeContent={cartCount}
                    invisible={cartCount === 0}
                    overlap="circular"
                    sx={{
                      "& .MuiBadge-badge": {
                        minWidth: 17,
                        height: 17,
                        px: 0.35,
                        fontSize: 9,
                        fontWeight: 900,
                        color: "#111111",
                        backgroundColor: "#FFD000",
                        border:
                          "2px solid #FFFFFF",
                        top: 1,
                        right: 1,
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
                    width: 44,
                    height: 44,
                    ml: 0.2,
                    color: "#111111",
                    border:
                      "1px solid rgba(17,17,17,0.08)",
                    borderRadius: "12px",
                    backgroundColor: "#FFFFFF",
                    "&:hover": {
                      backgroundColor:
                        "rgba(245, 180, 0, 0.08)",
                    },
                  }}
                >
                  <MenuRounded />
                </IconButton>
              </Stack>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={closeMobileMenu}
        ModalProps={{
          keepMounted: true,
        }}
        PaperProps={{
          sx: {
            width: {
              xs: "86vw",
              sm: 370,
            },
            maxWidth: 390,
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: "24px",
            borderBottomLeftRadius: "24px",
            boxShadow:
              "0 20px 70px rgba(0,0,0,0.16)",
            overflow: "hidden",
          },
        }}
      >
        <AnimatePresence>
          {mobileOpen && (
            <MotionBox
              initial={{
                opacity: 0,
                x: 35,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: 35,
              }}
              transition={{
                duration: 0.24,
                ease: "easeOut",
              }}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Drawer Header */}
              <Box
                sx={{
                  px: 2.2,
                  py: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom:
                    "1px solid rgba(17,17,17,0.07)",
                }}
              >
                <Box
                  component={Link}
                  to="/"
                  onClick={closeMobileMenu}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    textDecoration: "none",
                  }}
                >
                  <Box
                    component="img"
                    src="/logo.png"
                    alt="Glyrus"
                    sx={{
                      width: 110,
                      maxHeight: 48,
                      objectFit: "contain",
                    }}
                  />
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
                    "&:hover": {
                      backgroundColor: "#FFF4C7",
                    },
                  }}
                >
                  <CloseRounded />
                </IconButton>
              </Box>

              {/* Navigation */}
              <List
                disablePadding
                sx={{
                  px: 1.5,
                  pt: 2,
                }}
              >
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{
                      opacity: 0,
                      x: 18,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: 0.04 * index,
                      duration: 0.22,
                    }}
                  >
                    <NavLink
                      to={item.path}
                      end={item.path === "/"}
                      onClick={closeMobileMenu}
                      style={{
                        textDecoration: "none",
                      }}
                    >
                      {({ isActive }) => (
                        <ListItem
                          disablePadding
                          sx={{ mb: 0.5 }}
                        >
                          <ListItemButton
                            sx={{
                              minHeight: 52,
                              px: 1.8,
                              borderRadius: "14px",
                              color: isActive
                                ? "#111111"
                                : "#555555",
                              backgroundColor: isActive
                                ? "rgba(255, 210, 0, 0.14)"
                                : "transparent",
                              "&:hover": {
                                backgroundColor:
                                  "rgba(255, 210, 0, 0.10)",
                                color: "#111111",
                              },
                            }}
                          >
                            <ListItemText
                              primary={item.label}
                              primaryTypographyProps={{
                                fontSize: 15,
                                fontWeight:
                                  isActive ? 800 : 600,
                              }}
                            />

                            {isActive && (
                              <Box
                                sx={{
                                  width: 7,
                                  height: 7,
                                  borderRadius: "50%",
                                  backgroundColor:
                                    "#F5B400",
                                  boxShadow:
                                    "0 0 0 5px rgba(245,180,0,0.10)",
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

              {/* Mobile Extra Actions */}
              <Box
                sx={{
                  px: 1.5,
                  mt: 1,
                }}
              >
                <Button
                  fullWidth
                  onClick={() =>
                    handleNavigation("/tracking")
                  }
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
                    "&:hover": {
                      backgroundColor:
                        "rgba(255, 210, 0, 0.10)",
                    },
                  }}
                >
                  Track Order
                </Button>

                <Button
                  fullWidth
                  onClick={() =>
                    handleNavigation("/cart")
                  }
                  startIcon={
                    <Badge
                      badgeContent={cartCount}
                      invisible={cartCount === 0}
                      sx={{
                        "& .MuiBadge-badge": {
                          minWidth: 16,
                          height: 16,
                          px: 0.3,
                          fontSize: 8,
                          fontWeight: 900,
                          color: "#111111",
                          backgroundColor: "#FFD000",
                          border:
                            "2px solid #FFFFFF",
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
                    "&:hover": {
                      backgroundColor:
                        "rgba(255, 210, 0, 0.10)",
                    },
                  }}
                >
                  Cart
                </Button>
              </Box>

              {/* Mobile CTA */}
              <Box
                sx={{
                  mt: "auto",
                  p: 2,
                }}
              >
                <MotionButton
                  fullWidth
                  onClick={() =>
                    handleNavigation("/request-nfc")
                  }
                  whileTap={{ scale: 0.97 }}
                  endIcon={<ArrowForwardRounded />}
                  sx={{
                    minHeight: 54,
                    borderRadius: "15px",
                    textTransform: "none",
                    fontSize: 15,
                    fontWeight: 850,
                    color: "#111111",
                    background:
                      "linear-gradient(135deg, #FFD900 0%, #F4AE00 100%)",
                    boxShadow:
                      "0 10px 28px rgba(245, 174, 0, 0.24)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #FFE329 0%, #F6B600 100%)",
                    },
                  }}
                >
                  Request Custom NFC
                </MotionButton>
              </Box>
            </MotionBox>
          )}
        </AnimatePresence>
      </Drawer>
    </>
  );
};

export default Navbar;