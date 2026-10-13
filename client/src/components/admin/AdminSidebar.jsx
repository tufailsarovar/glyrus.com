import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  AssessmentRounded,
  CloseRounded,
  DashboardRounded,
  Inventory2Rounded,
  LogoutRounded,
  MessageRounded,
  PeopleAltRounded,
  RequestQuoteRounded,
  SettingsRounded,
  ShoppingBagRounded,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const DRAWER_WIDTH = 250;

const roundLogo = "/src/assets/logo/glyrus_round_logo.png";
const nameLogo = "/src/assets/logo/name_logo_footer.png";

const menuItems = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: DashboardRounded,
    end: true,
  },
  {
    label: "Products",
    path: "/admin/products",
    icon: Inventory2Rounded,
  },
  {
    label: "Orders",
    path: "/admin/orders",
    icon: ShoppingBagRounded,
  },
  {
    label: "Customers",
    path: "/admin/customers",
    icon: PeopleAltRounded,
  },
  {
    label: "Requests",
    path: "/admin/requests",
    icon: RequestQuoteRounded,
  },
  {
    label: "Messages",
    path: "/admin/messages",
    icon: MessageRounded,
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: SettingsRounded,
  },
];

const AdminSidebar = ({ mobileOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("Glyrus_admin_token");
    sessionStorage.removeItem("Glyrus_admin_token");

    localStorage.removeItem("Glyrus_admin");
    sessionStorage.removeItem("Glyrus_admin");

    localStorage.removeItem("Glyrus_admin_login_time");
    sessionStorage.removeItem("Glyrus_admin_login_time");

    if (typeof onClose === "function") {
      onClose();
    }

    navigate("/admin/login", {
      replace: true,
    });
  };

  const sidebarContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        bgcolor: "#111111",
        color: "#FFFFFF",
      }}
    >
      {/* Brand */}
      <Box
        sx={{
          px: { xs: 1.8, md: 2.1 },
          pt: { xs: 1.8, md: 2.1 },
          pb: { xs: 1.6, md: 1.9 },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.2}
            sx={{ minWidth: 0, flex: 1 }}
          >
            <MotionBox
              whileHover={{ scale: 1.05, rotate: -2 }}
              transition={{ duration: 0.2 }}
              sx={{
                width: 43,
                height: 43,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                overflow: "hidden",
                borderRadius: "9px",
                bgcolor: "#FFFFFF",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <Box
                component="img"
                src={roundLogo}
                alt="Glyrus logo"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </MotionBox>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box
                component="img"
                src={nameLogo}
                alt="Glyrus"
                sx={{
                  display: "block",
                  width: "100%",
                  maxWidth: 132,
                  height: 27,
                  objectFit: "contain",
                  objectPosition: "left center",
                }}
              />

              <Typography
                sx={{
                  mt: 0.45,
                  color: "#929292",
                  fontSize: "0.57rem",
                  fontWeight: 750,
                  letterSpacing: "1.2px",
                  lineHeight: 1.3,
                  textTransform: "uppercase",
                }}
              >
                Admin Panel
              </Typography>
            </Box>
          </Stack>

          <IconButton
            aria-label="Close admin menu"
            onClick={onClose}
            sx={{
              display: { xs: "flex", md: "none" },
              width: 32,
              height: 32,
              flexShrink: 0,
              borderRadius: "6px",
              color: "#BEBEBE",
              "&:hover": {
                color: "#FFD000",
                bgcolor: "rgba(255,208,0,0.08)",
              },
            }}
          >
            <CloseRounded fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.09)" }} />

      {/* Navigation */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          px: { xs: 1.2, md: 1.35 },
          py: 1.7,
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.18) transparent",
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "rgba(255,255,255,0.15)",
            borderRadius: "4px",
          },
        }}
      >
        <Typography
          sx={{
            px: 1.2,
            mb: 1,
            color: "#696969",
            fontSize: "0.57rem",
            fontWeight: 850,
            letterSpacing: "1.3px",
            textTransform: "uppercase",
          }}
        >
          Management
        </Typography>

        <List
          disablePadding
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.45,
          }}
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon;

            const isActive = item.end
              ? location.pathname === item.path
              : location.pathname === item.path ||
                location.pathname.startsWith(`${item.path}/`);

            return (
              <MotionBox
                key={item.path}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.23,
                  delay: index * 0.035,
                }}
              >
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  onClick={() => {
                    if (typeof onClose === "function") {
                      onClose();
                    }
                  }}
                  sx={{
                    position: "relative",
                    minHeight: 42,
                    px: 1.2,
                    borderRadius: "6px",
                    color: isActive ? "#111111" : "#AFAFAF",
                    bgcolor: isActive ? "#FFD000" : "transparent",
                    transition:
                      "background-color 180ms ease, color 180ms ease, transform 180ms ease",
                    "&:hover": {
                      color: isActive ? "#111111" : "#FFFFFF",
                      bgcolor: isActive ? "#FFD000" : "rgba(255,255,255,0.055)",
                      transform: "translateX(2px)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 35,
                      color: "inherit",
                    }}
                  >
                    <Icon sx={{ fontSize: 19 }} />
                  </ListItemIcon>

                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: "0.77rem",
                      fontWeight: isActive ? 850 : 650,
                    }}
                  />

                  {isActive && (
                    <MotionBox
                      layoutId="glyrus-active-nav"
                      sx={{
                        width: 5,
                        height: 5,
                        flexShrink: 0,
                        borderRadius: "50%",
                        bgcolor: "#111111",
                      }}
                    />
                  )}
                </ListItemButton>
              </MotionBox>
            );
          })}
        </List>
      </Box>

      {/* Bottom */}
      <Box
        sx={{
          px: { xs: 1.2, md: 1.35 },
          pb: { xs: 1.3, md: 1.6 },
          flexShrink: 0,
        }}
      >
        <Divider
          sx={{
            mb: 1.1,
            borderColor: "rgba(255,255,255,0.09)",
          }}
        />

        <ListItemButton
          onClick={handleLogout}
          sx={{
            minHeight: 42,
            px: 1.2,
            borderRadius: "6px",
            color: "#AAAAAA",
            "&:hover": {
              color: "#FFB4B4",
              bgcolor: "rgba(255,70,70,0.07)",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 35, color: "inherit" }}>
            <LogoutRounded sx={{ fontSize: 19 }} />
          </ListItemIcon>

          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontSize: "0.77rem",
              fontWeight: 750,
            }}
          />
        </ListItemButton>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.8}
          sx={{ px: 1.2, pt: 1.4 }}
        >
          <AssessmentRounded sx={{ fontSize: 13, color: "#777777" }} />

          <Typography sx={{ color: "#777777", fontSize: "0.58rem" }}>
            Glyrus Administration
          </Typography>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "block" },
          position: "fixed",
          zIndex: 1200,
          top: 0,
          left: 0,
          bottom: 0,
          width: DRAWER_WIDTH,
        }}
      >
        {sidebarContent}
      </Box>

      {/* Mobile Sidebar */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            maxWidth: "88vw",
            boxSizing: "border-box",
            border: "none",
            bgcolor: "#111111",
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
};

export default AdminSidebar;
