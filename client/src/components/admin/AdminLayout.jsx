// Glyrus — AdminLayout.jsx
import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((current) => !current);
  };

  const handleCloseMobileDrawer = () => {
    setMobileOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#F7F7F7",
        color: "#171717",
      }}
    >
      <AdminSidebar
        mobileOpen={mobileOpen}
        onClose={handleCloseMobileDrawer}
      />

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          ml: {
            xs: 0,
            md: "250px",
          },
          transition:
            "margin-left 220ms ease",
        }}
      >
        <AdminHeader
          onMenuClick={handleDrawerToggle}
        />

        <Box
          sx={{
            flex: 1,
            width: "100%",
            minWidth: 0,
            p: {
              xs: 1.5,
              sm: 2.2,
              md: 3,
              lg: 3.5,
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;