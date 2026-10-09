// Glyrus — AdminSidebar.jsx
import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  AssessmentRounded,
  CloseRounded,
  ContactMailRounded,
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

const AdminSidebar = ({
  mobileOpen = false,
  onClose,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

 const handleLogout = () => {
  // Remove admin authentication token
  localStorage.removeItem("Glyrus_admin_token");
  sessionStorage.removeItem("Glyrus_admin_token");

  // Remove admin profile
  localStorage.removeItem("Glyrus_admin");
  sessionStorage.removeItem("Glyrus_admin");

  // Remove 1-hour session timestamp
  localStorage.removeItem("Glyrus_admin_login_time");
  sessionStorage.removeItem("Glyrus_admin_login_time");

  // Close mobile sidebar
  if (typeof onClose === "function") {
    onClose();
  }

  // Go to login page
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
        backgroundColor: "#111111",
        color: "#FFFFFF",
      }}
    >
      {/* Brand */}
      <Box
        sx={{
          px: {
            xs: 2,
            md: 2.3,
          },
          pt: {
            xs: 2,
            md: 2.4,
          },
          pb: {
            xs: 1.8,
            md: 2.2,
          },
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
            spacing={1.1}
            sx={{
              minWidth: 0,
            }}
          >
            <MotionBox
              whileHover={{
                scale: 1.05,
                rotate: -2,
              }}
              sx={{
                width: 40,
                height: 40,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: "12px",
                color: "#111111",
                background:
                  "linear-gradient(135deg, #FFD900 0%, #F0AA00 100%)",
                fontWeight: 950,
                fontSize: 18,
              }}
            >
              T
            </MotionBox>

            <Box
              sx={{
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  color: "#FFFFFF",
                  fontSize: 18,
                  lineHeight: 1.1,
                  fontWeight: 900,
                  letterSpacing: "-0.5px",
                }}
              >
                Glyrus
              </Typography>

              <Typography
                sx={{
                  mt: 0.3,
                  color: "#8F8F8F",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.8px",
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
              display: {
                xs: "flex",
                md: "none",
              },
              color: "#BEBEBE",
              width: 34,
              height: 34,
              "&:hover": {
                color: "#FFD000",
                backgroundColor:
                  "rgba(255,208,0,0.08)",
              },
            }}
          >
            <CloseRounded fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <Divider
        sx={{
          borderColor: "rgba(255,255,255,0.08)",
        }}
      />

      {/* Navigation */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: {
            xs: 1.2,
            md: 1.35,
          },
          py: 1.8,
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": {
            width: 4,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor:
              "rgba(255,255,255,0.12)",
            borderRadius: 999,
          },
        }}
      >
        <Typography
          sx={{
            px: 1.2,
            mb: 1,
            color: "#666666",
            fontSize: 8.5,
            fontWeight: 850,
            letterSpacing: "1px",
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
                location.pathname.startsWith(
                  `${item.path}/`
                );

            return (
              <MotionBox
                key={item.path}
                initial={{
                  opacity: 0,
                  x: -8,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.25,
                  delay: index * 0.035,
                }}
              >
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  onClick={() => {
                    if (
                      typeof onClose ===
                      "function"
                    ) {
                      onClose();
                    }
                  }}
                  sx={{
                    position: "relative",
                    minHeight: 44,
                    px: 1.2,
                    borderRadius: "12px",
                    color: isActive
                      ? "#111111"
                      : "#AFAFAF",
                    backgroundColor: isActive
                      ? "#FFD000"
                      : "transparent",
                    transition:
                      "background-color 180ms ease, color 180ms ease, transform 180ms ease",
                    "&:hover": {
                      color: isActive
                        ? "#111111"
                        : "#FFFFFF",
                      backgroundColor: isActive
                        ? "#FFD000"
                        : "rgba(255,255,255,0.055)",
                      transform:
                        "translateX(2px)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: "inherit",
                    }}
                  >
                    <Icon
                      sx={{
                        fontSize: 20,
                      }}
                    />
                  </ListItemIcon>

                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 12.5,
                      fontWeight: isActive
                        ? 850
                        : 650,
                    }}
                  />

                  {isActive && (
                    <Box
                      sx={{
                        width: 5,
                        height: 5,
                        flexShrink: 0,
                        borderRadius: "50%",
                        backgroundColor:
                          "#111111",
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
          px: {
            xs: 1.2,
            md: 1.35,
          },
          pb: {
            xs: 1.4,
            md: 1.8,
          },
        }}
      >
        <Divider
          sx={{
            mb: 1.2,
            borderColor:
              "rgba(255,255,255,0.08)",
          }}
        />

        <ListItemButton
          onClick={handleLogout}
          sx={{
            minHeight: 44,
            px: 1.2,
            borderRadius: "12px",
            color: "#AAAAAA",
            "&:hover": {
              color: "#FFB4B4",
              backgroundColor:
                "rgba(255,70,70,0.07)",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 36,
              color: "inherit",
            }}
          >
            <LogoutRounded
              sx={{
                fontSize: 20,
              }}
            />
          </ListItemIcon>

          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontSize: 12.5,
              fontWeight: 700,
            }}
          />
        </ListItemButton>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.7}
          sx={{
            px: 1.2,
            pt: 1.2,
          }}
        >
          <AssessmentRounded
            sx={{
              fontSize: 13,
              color: "#666666",
            }}
          />

          <Typography
            sx={{
              color: "#666666",
              fontSize: 8.5,
            }}
          >
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
          display: {
            xs: "none",
            md: "block",
          },
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
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: {
            xs: "block",
            md: "none",
          },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            border: "none",
            backgroundColor: "#111111",
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
};

export default AdminSidebar;