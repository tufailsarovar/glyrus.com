import React from "react";
import {
  AccountCircleRounded,
  MenuRounded,
  NotificationsNoneRounded,
  OpenInNewRounded,
  StoreRounded,
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
  Tooltip,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const MotionBox = motion(Box);

const pageTitles = {
  "/admin": {
    title: "Dashboard",
    subtitle: "Overview of your Glyrus store",
    section: "OVERVIEW",
  },
  "/admin/products": {
    title: "Products",
    subtitle: "Manage your NFC product catalog",
    section: "CATALOG",
  },
  "/admin/orders": {
    title: "Orders",
    subtitle: "View and manage customer orders",
    section: "SALES",
  },
  "/admin/customers": {
    title: "Customers",
    subtitle: "View customer and order information",
    section: "CUSTOMERS",
  },
  "/admin/requests": {
    title: "NFC Requests",
    subtitle: "Manage custom product requests",
    section: "CUSTOM REQUESTS",
  },
  "/admin/messages": {
    title: "Messages",
    subtitle: "Manage customer enquiries",
    section: "COMMUNICATION",
  },
  "/admin/settings": {
    title: "Settings",
    subtitle: "Manage store configuration",
    section: "CONFIGURATION",
  },
};

const getPageInfo = (pathname) => {
  if (pageTitles[pathname]) return pageTitles[pathname];

  if (pathname.startsWith("/admin/products/edit/")) {
    return {
      title: "Edit Product",
      subtitle: "Update product information",
      section: "CATALOG",
    };
  }

  if (pathname === "/admin/products/add") {
    return {
      title: "Add Product",
      subtitle: "Create a new NFC product",
      section: "CATALOG",
    };
  }

  if (pathname.startsWith("/admin/orders/")) {
    return {
      title: "Order Details",
      subtitle: "Review and manage this order",
      section: "SALES",
    };
  }

  return {
    title: "Admin Panel",
    subtitle: "Manage your Glyrus store",
    section: "ADMINISTRATION",
  };
};

const AdminHeader = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const pageInfo = getPageInfo(location.pathname);

  const handleStoreView = () => {
    navigate("/");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        zIndex: 1100,
        color: "#171717",
        backgroundColor: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: "1px solid #EAEAEA",
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: {
            xs: "60px !important",
            sm: "68px !important",
            md: "74px !important",
          },
          px: {
            xs: 1.2,
            sm: 2,
            md: 2.5,
            lg: 3,
          },
          gap: { xs: 1, sm: 1.4 },
          width: "100%",
          minWidth: 0,
        }}
      >
        {/* Mobile Navigation */}
        <Tooltip title="Open navigation" arrow>
          <IconButton
            aria-label="Open admin menu"
            onClick={onMenuClick}
            sx={{
              display: { xs: "flex", md: "none" },
              width: 37,
              height: 37,
              flexShrink: 0,
              border: "1px solid #E8E8E8",
              borderRadius: "7px",
              color: "#202020",
              bgcolor: "#FFFFFF",
              transition: "all 180ms ease",
              "&:hover": {
                bgcolor: "#FFF8E2",
                borderColor: "#E2C45D",
              },
            }}
          >
            <MenuRounded sx={{ fontSize: 21 }} />
          </IconButton>
        </Tooltip>

        {/* Page Heading */}
        <MotionBox
          key={location.pathname}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          sx={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.8}
            sx={{ minWidth: 0 }}
          >
            <Typography
              component="h1"
              sx={{
                minWidth: 0,
                color: "#171717",
                fontSize: {
                  xs: "0.94rem",
                  sm: "1.05rem",
                  md: "1.2rem",
                },
                lineHeight: 1.25,
                fontWeight: 900,
                letterSpacing: "-0.045em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {pageInfo.title}
            </Typography>

            <Box
              sx={{
                display: { xs: "none", sm: "block" },
                width: 4,
                height: 4,
                borderRadius: "50%",
                bgcolor: "#D5B12D",
                flexShrink: 0,
              }}
            />

            <Typography
              sx={{
                display: { xs: "none", lg: "block" },
                minWidth: 0,
                fontSize: "0.65rem",
                color: "#999999",
                fontWeight: 700,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {pageInfo.section}
            </Typography>
          </Stack>

          <Typography
            sx={{
              display: { xs: "none", sm: "block" },
              mt: 0.35,
              color: "#858585",
              fontSize: { sm: "0.68rem", md: "0.73rem" },
              lineHeight: 1.35,
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
          spacing={{ xs: 0.35, sm: 0.7, md: 1 }}
          sx={{ flexShrink: 0 }}
        >
          {/* Store Shortcut */}
          <Tooltip title="View public store" arrow>
            <Button
              onClick={handleStoreView}
              startIcon={<StoreRounded sx={{ fontSize: "17px !important" }} />}
              endIcon={
                <OpenInNewRounded
                  sx={{
                    display: { xs: "none", sm: "inline-flex" },
                    fontSize: "13px !important",
                  }}
                />
              }
              sx={{
                display: { xs: "none", sm: "inline-flex" },
                minHeight: 35,
                px: { sm: 1.1, md: 1.5 },
                border: "1px solid #E7E7E7",
                borderRadius: "7px",
                bgcolor: "#FFFFFF",
                color: "#292929",
                textTransform: "none",
                fontSize: { sm: "0.68rem", md: "0.73rem" },
                fontWeight: 800,
                whiteSpace: "nowrap",
                "& .MuiButton-startIcon": { mr: 0.6 },
                "& .MuiButton-endIcon": { ml: 0.5 },
                "&:hover": {
                  bgcolor: "#FFF9E8",
                  borderColor: "#E1C34F",
                },
              }}
            >
              View Store
            </Button>
          </Tooltip>

          {/* Mobile Store Shortcut */}
          <Tooltip title="View store" arrow>
            <IconButton
              aria-label="View store"
              onClick={handleStoreView}
              sx={{
                display: { xs: "flex", sm: "none" },
                width: 36,
                height: 36,
                borderRadius: "7px",
                border: "1px solid #E8E8E8",
                color: "#333333",
                bgcolor: "#FFFFFF",
                "&:hover": {
                  bgcolor: "#FFF8E2",
                  borderColor: "#E2C45D",
                },
              }}
            >
              <OpenInNewRounded sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications" arrow>
            <IconButton
              aria-label="Notifications"
              sx={{
                width: { xs: 35, sm: 37 },
                height: { xs: 35, sm: 37 },
                color: "#454545",
                borderRadius: "7px",
                "&:hover": {
                  bgcolor: "#FFF8E2",
                  color: "#171717",
                },
              }}
            >
              <Badge
                variant="dot"
                overlap="circular"
                sx={{
                  "& .MuiBadge-badge": {
                    minWidth: 7,
                    height: 7,
                    p: 0,
                    top: 4,
                    right: 3,
                    bgcolor: "#D8AA00",
                    border: "2px solid #FFFFFF",
                  },
                }}
              >
                <NotificationsNoneRounded
                  sx={{ fontSize: { xs: 21, sm: 22 } }}
                />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Admin Profile */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.9}
            sx={{
              pl: { xs: 0.25, sm: 1 },
              ml: { xs: 0, sm: 0.3 },
              borderLeft: {
                xs: "none",
                sm: "1px solid #EAEAEA",
              },
            }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.16 }}
            >
              <Avatar
                src="/src/assets/logo/glyrus_round_logo.png"
                alt="Glyrus"
                variant="rounded"
                sx={{
                  width: { xs: 33, sm: 36, md: 38 },
                  height: { xs: 33, sm: 36, md: 38 },
                  borderRadius: "50%",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E8E8E8",
                  "& img": {
                    objectFit: "contain",
                    padding: "2px",
                  },
                }}
              >
                <AccountCircleRounded />
              </Avatar>
            </motion.div>

            <Box
              sx={{
                display: { xs: "none", md: "block" },
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  color: "#222222",
                  fontSize: "0.72rem",
                  fontWeight: 850,
                  lineHeight: 1.25,
                  whiteSpace: "nowrap",
                }}
              >
                Administrator
              </Typography>

              <Typography
                sx={{
                  mt: 0.25,
                  color: "#929292",
                  fontSize: "0.62rem",
                  lineHeight: 1.25,
                  whiteSpace: "nowrap",
                }}
              >
                Glyrus Store
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Toolbar>

      {/* Subtle animated page indicator */}
      <AnimatePresence mode="wait">
        <MotionBox
          key={location.pathname}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          exit={{ scaleX: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          sx={{
            position: "absolute",
            bottom: -1,
            left: 0,
            width: 48,
            height: 2,
            bgcolor: "#E5B91F",
            transformOrigin: "left",
          }}
        />
      </AnimatePresence>
    </AppBar>
  );
};

export default AdminHeader;
