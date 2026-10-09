// Glyrus — AdminHeader.jsx
import React from "react";
import {
  AccountCircleRounded,
  MenuRounded,
  NotificationsNoneRounded,
  OpenInNewRounded,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const pageTitles = {
  "/admin": {
    title: "Dashboard",
    subtitle: "Overview of your Glyrus store",
  },
  "/admin/products": {
    title: "Products",
    subtitle: "Manage your NFC product catalog",
  },
  "/admin/orders": {
    title: "Orders",
    subtitle: "View and manage customer orders",
  },
  "/admin/customers": {
    title: "Customers",
    subtitle: "View customer and order information",
  },
  "/admin/requests": {
    title: "NFC Requests",
    subtitle: "Manage custom product requests",
  },
  "/admin/messages": {
    title: "Messages",
    subtitle: "Manage customer enquiries",
  },
  "/admin/settings": {
    title: "Settings",
    subtitle: "Manage store configuration",
  },
};

const AdminHeader = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getPageInfo = () => {
    if (pageTitles[location.pathname]) {
      return pageTitles[location.pathname];
    }

    if (
      location.pathname.startsWith(
        "/admin/products/edit/"
      )
    ) {
      return {
        title: "Edit Product",
        subtitle: "Update product information",
      };
    }

    if (
      location.pathname ===
      "/admin/products/add"
    ) {
      return {
        title: "Add Product",
        subtitle: "Create a new NFC product",
      };
    }

    if (
      location.pathname.startsWith(
        "/admin/orders/"
      )
    ) {
      return {
        title: "Order Details",
        subtitle: "Review and manage this order",
      };
    }

    return {
      title: "Admin Panel",
      subtitle: "Manage your Glyrus store",
    };
  };

  const pageInfo = getPageInfo();

  const handleStoreView = () => {
    navigate("/");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        zIndex: 1100,
        backgroundColor:
          "rgba(255,255,255,0.94)",
        backdropFilter: "blur(14px)",
        borderBottom:
          "1px solid rgba(17,17,17,0.07)",
        color: "#171717",
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: {
            xs: 68,
            sm: 74,
            md: 78,
          },
          px: {
            xs: 1.5,
            sm: 2.2,
            md: 3,
            lg: 3.5,
          },
          gap: {
            xs: 1,
            sm: 1.5,
          },
        }}
      >
        {/* Mobile Menu */}
        <IconButton
          aria-label="Open admin menu"
          onClick={onMenuClick}
          sx={{
            display: {
              xs: "flex",
              md: "none",
            },
            width: 40,
            height: 40,
            flexShrink: 0,
            color: "#222222",
            borderRadius: "11px",
            border:
              "1px solid rgba(17,17,17,0.08)",
            backgroundColor: "#FFFFFF",
            "&:hover": {
              backgroundColor: "#FAFAFA",
            },
          }}
        >
          <MenuRounded />
        </IconButton>

        {/* Page Information */}
        <MotionBox
          key={location.pathname}
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
          }}
          sx={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <Typography
            component="h1"
            sx={{
              color: "#171717",
              fontSize: {
                xs: 15,
                sm: 17,
                md: 19,
              },
              lineHeight: 1.2,
              fontWeight: 850,
              letterSpacing: "-0.3px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {pageInfo.title}
          </Typography>

          <Typography
            sx={{
              display: {
                xs: "none",
                sm: "block",
              },
              mt: 0.35,
              color: "#858585",
              fontSize: {
                sm: 10.5,
                md: 11.5,
              },
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {pageInfo.subtitle}
          </Typography>
        </MotionBox>

        {/* Right Actions */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={{
            xs: 0.6,
            sm: 1,
          }}
        >
          {/* Store */}
          <Button
            onClick={handleStoreView}
            startIcon={
              <OpenInNewRounded
                sx={{
                  fontSize:
                    "16px !important",
                }}
              />
            }
            sx={{
              display: {
                xs: "none",
                sm: "inline-flex",
              },
              minHeight: {
                sm: 38,
                md: 40,
              },
              px: {
                sm: 1.4,
                md: 1.7,
              },
              borderRadius: "11px",
              color: "#222222",
              border:
                "1px solid rgba(17,17,17,0.09)",
              backgroundColor: "#FFFFFF",
              textTransform: "none",
              fontSize: {
                sm: 10.5,
                md: 11.5,
              },
              fontWeight: 750,
              whiteSpace: "nowrap",
              "&:hover": {
                backgroundColor: "#FAFAFA",
                borderColor:
                  "rgba(17,17,17,0.17)",
              },
            }}
          >
            View Store
          </Button>

          {/* Notifications */}
          <IconButton
            aria-label="Notifications"
            sx={{
              width: {
                xs: 38,
                sm: 40,
              },
              height: {
                xs: 38,
                sm: 40,
              },
              color: "#444444",
              borderRadius: "11px",
              "&:hover": {
                color: "#111111",
                backgroundColor:
                  "rgba(255,208,0,0.10)",
              },
            }}
          >
            <Badge
              variant="dot"
              sx={{
                "& .MuiBadge-badge": {
                  minWidth: 7,
                  height: 7,
                  p: 0,
                  right: 3,
                  top: 4,
                  backgroundColor:
                    "#E4A700",
                  border:
                    "2px solid #FFFFFF",
                },
              }}
            >
              <NotificationsNoneRounded
                sx={{
                  fontSize: {
                    xs: 21,
                    sm: 22,
                  },
                }}
              />
            </Badge>
          </IconButton>

          {/* Admin Profile */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              pl: {
                xs: 0,
                sm: 0.7,
              },
              ml: {
                xs: 0,
                sm: 0.3,
              },
              borderLeft: {
                xs: "none",
                sm: "1px solid rgba(17,17,17,0.08)",
              },
            }}
          >
            <Avatar
              sx={{
                width: {
                  xs: 34,
                  sm: 38,
                },
                height: {
                  xs: 34,
                  sm: 38,
                },
                color: "#111111",
                background:
                  "linear-gradient(135deg, #FFD900, #F0AA00)",
                fontSize: {
                  xs: 15,
                  sm: 17,
                },
                fontWeight: 900,
              }}
            >
              <AccountCircleRounded
                sx={{
                  fontSize: {
                    xs: 21,
                    sm: 24,
                  },
                }}
              />
            </Avatar>

            <Box
              sx={{
                display: {
                  xs: "none",
                  md: "block",
                },
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  color: "#222222",
                  fontSize: 11.5,
                  fontWeight: 800,
                  lineHeight: 1.2,
                }}
              >
                Administrator
              </Typography>

              <Typography
                sx={{
                  mt: 0.25,
                  color: "#8A8A8A",
                  fontSize: 9.5,
                  lineHeight: 1.2,
                }}
              >
                Glyrus Store
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default AdminHeader;