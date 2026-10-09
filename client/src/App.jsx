// Glyrus — App.jsx

import React, { Suspense, lazy, useEffect, useState } from "react";

import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { Box, CircularProgress } from "@mui/material";

// ============================================================
// LAYOUTS
// ============================================================

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AdminLayout from "./components/admin/AdminLayout";
import Home from "./pages/Home";

// ============================================================
// PUBLIC PAGES
// ============================================================

const About = lazy(() => import("./pages/About"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Search = lazy(() => import("./pages/Search"));
const RequestNfc = lazy(() => import("./pages/RequestNfc"));
const Contact = lazy(() => import("./pages/Contact"));
const Tracking = lazy(() => import("./pages/Tracking"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));

// ============================================================
// LEGAL PAGES
// PrivacyPolicy is intentionally imported normally.
// This avoids the Vite dynamic-import problem.
// ============================================================

import PrivacyPolicy from "./pages/Privacy";

const Terms = lazy(() => import("./pages/Terms"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));

// ============================================================
// 404
// ============================================================

const NotFound = lazy(() => import("./pages/NotFound"));

// ============================================================
// ADMIN PAGES
// ============================================================

const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminProductForm = lazy(() => import("./pages/admin/ProductForm"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminOrderDetails = lazy(() => import("./pages/admin/OrderDetails"));
const AdminCustomers = lazy(() => import("./pages/admin/Customers"));
const AdminRequests = lazy(() => import("./pages/admin/Requests"));
const AdminMessages = lazy(() => import("./pages/admin/Messages"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));

// ============================================================
// PAGE LOADER
// ============================================================

const PageLoader = () => {
  return (
    <Box
      sx={{
        minHeight: "60vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        backgroundColor: "#ffffff",
      }}
    >
      <Box
        sx={{
          width: 54,
          height: 54,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          bgcolor: "#FFF8D9",
          border: "1px solid #F4D66A",
        }}
      >
        <CircularProgress
          size={26}
          thickness={4}
          sx={{
            color: "#D3A800",
          }}
        />
      </Box>
    </Box>
  );
};

// ============================================================
// SCROLL TO TOP
// ============================================================

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
};

// ============================================================
// PUBLIC LAYOUT
// ============================================================

const PublicLayout = ({ children }) => {
  return (
    <>
      <Navbar />

      <Box
        component="main"
        sx={{
          width: "100%",
          minHeight: "40vh",
          backgroundColor: "#ffffff",
        }}
      >
        {children}
      </Box>

      <Footer />
    </>
  );
};

// ============================================================
// ADMIN AUTH
// ============================================================

const ADMIN_SESSION_DURATION = 60 * 60 * 1000; // 1 hour

const getAdminToken = () => {
  return (
    localStorage.getItem("Glyrus_admin_token") ||
    sessionStorage.getItem("Glyrus_admin_token")
  );
};

const getAdminStorage = () => {
  if (localStorage.getItem("Glyrus_admin_token")) {
    return localStorage;
  }

  if (sessionStorage.getItem("Glyrus_admin_token")) {
    return sessionStorage;
  }

  return null;
};

const clearAdminSession = () => {
  localStorage.removeItem("Glyrus_admin_token");
  sessionStorage.removeItem("Glyrus_admin_token");

  localStorage.removeItem("Glyrus_admin");
  sessionStorage.removeItem("Glyrus_admin");

  localStorage.removeItem("Glyrus_admin_login_time");
  sessionStorage.removeItem("Glyrus_admin_login_time");
};

// ============================================================
// ADMIN ROUTE
// ============================================================

const AdminRoute = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = getAdminToken();

    if (!token) {
      return false;
    }

    const storage = getAdminStorage();

    if (!storage) {
      return false;
    }

    const loginTime = Number(storage.getItem("Glyrus_admin_login_time"));

    if (!loginTime) {
      clearAdminSession();
      return false;
    }

    if (Date.now() - loginTime >= ADMIN_SESSION_DURATION) {
      clearAdminSession();
      return false;
    }

    return true;
  });

  useEffect(() => {
    const token = getAdminToken();
    const storage = getAdminStorage();

    if (!token || !storage) {
      clearAdminSession();
      setIsAuthenticated(false);
      return;
    }

    const loginTime = Number(storage.getItem("Glyrus_admin_login_time"));

    if (!loginTime) {
      clearAdminSession();
      setIsAuthenticated(false);
      return;
    }

    const elapsed = Date.now() - loginTime;

    if (elapsed >= ADMIN_SESSION_DURATION) {
      clearAdminSession();
      setIsAuthenticated(false);

      navigate("/admin/login", {
        replace: true,
        state: {
          sessionExpired: true,
        },
      });

      return;
    }

    const remainingTime = ADMIN_SESSION_DURATION - elapsed;

    const timer = window.setTimeout(() => {
      clearAdminSession();
      setIsAuthenticated(false);

      navigate("/admin/login", {
        replace: true,
        state: {
          sessionExpired: true,
        },
      });
    }, remainingTime);

    return () => {
      window.clearTimeout(timer);
    };
  }, [navigate]);

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return children;
};

// ============================================================
// APP
// ============================================================

const App = () => {
  return (
    <>
      <ScrollToTop />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ==================================================
              PUBLIC ROUTES
          ================================================== */}

          <Route
            path="/"
            element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            }
          />

          <Route
            path="/about"
            element={
              <PublicLayout>
                <About />
              </PublicLayout>
            }
          />

          <Route
            path="/products"
            element={
              <PublicLayout>
                <Products />
              </PublicLayout>
            }
          />

          <Route
            path="/products/:id"
            element={
              <PublicLayout>
                <ProductDetails />
              </PublicLayout>
            }
          />

          <Route
            path="/search"
            element={
              <PublicLayout>
                <Search />
              </PublicLayout>
            }
          />

          <Route
            path="/request-nfc"
            element={
              <PublicLayout>
                <RequestNfc />
              </PublicLayout>
            }
          />

          <Route
            path="/contact"
            element={
              <PublicLayout>
                <Contact />
              </PublicLayout>
            }
          />

          <Route
            path="/tracking"
            element={
              <PublicLayout>
                <Tracking />
              </PublicLayout>
            }
          />

          <Route
            path="/cart"
            element={
              <PublicLayout>
                <Cart />
              </PublicLayout>
            }
          />

          <Route
            path="/checkout"
            element={
              <PublicLayout>
                <Checkout />
              </PublicLayout>
            }
          />

          {/* ==================================================
              LEGAL ROUTES
          ================================================== */}

          {/* PrivacyPolicy is NOT lazy-loaded */}
          <Route
            path="/privacy-policy"
            element={
              <PublicLayout>
                <PrivacyPolicy />
              </PublicLayout>
            }
          />

          <Route
            path="/terms"
            element={
              <PublicLayout>
                <Terms />
              </PublicLayout>
            }
          />

          <Route
            path="/shipping-policy"
            element={
              <PublicLayout>
                <ShippingPolicy />
              </PublicLayout>
            }
          />

          <Route
            path="/refund-policy"
            element={
              <PublicLayout>
                <RefundPolicy />
              </PublicLayout>
            }
          />

          {/* ==================================================
              ADMIN LOGIN
          ================================================== */}

          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ==================================================
              ADMIN
          ================================================== */}

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />

            <Route path="products" element={<AdminProducts />} />

            <Route path="products/add" element={<AdminProductForm />} />

            <Route path="products/edit/:id" element={<AdminProductForm />} />

            <Route path="orders" element={<AdminOrders />} />

            <Route path="orders/:id" element={<AdminOrderDetails />} />

            <Route path="customers" element={<AdminCustomers />} />

            <Route path="requests" element={<AdminRequests />} />

            <Route path="messages" element={<AdminMessages />} />

            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* ==================================================
              404
          ================================================== */}

          <Route
            path="*"
            element={
              <PublicLayout>
                <NotFound />
              </PublicLayout>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
