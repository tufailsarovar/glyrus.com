// Glyrus — api.js

import axios from "axios";

const API_URL = (import.meta.env.VITE_API_URL || "")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("Glyrus_admin_token") ||
      sessionStorage.getItem("Glyrus_admin_token");

    if (token && config.url?.includes("/admin")) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const requestUrl = error?.config?.url || "";

      if (requestUrl.includes("/admin")) {
        localStorage.removeItem("Glyrus_admin_token");
        sessionStorage.removeItem("Glyrus_admin_token");
      }
    }

    return Promise.reject(error);
  },
);

// ================= PUBLIC =================

export const getProducts = (params = {}) =>
  api.get("/api/products", { params });

export const getProduct = (id) => api.get(`/api/products/${id}`);

export const createOrder = (data) => api.post("/api/orders", data);

export const createPaymentOrder = (data) =>
  api.post("/api/payments/create-order", data);

export const verifyPayment = (data) => api.post("/api/payments/verify", data);

export const getTracking = (trackingNumber) =>
  api.get(`/api/tracking/${encodeURIComponent(String(trackingNumber).trim())}`);

export const submitRequest = (data) => api.post("/api/requests", data);

export const submitContact = (data) => api.post("/api/contact", data);

// ================= ADMIN =================

export const adminLogin = (data) => api.post("/api/admin/auth/login", data);

export const getAdminDashboard = () => api.get("/api/admin/dashboard");

export const getAdminProducts = (params = {}) =>
  api.get("/api/admin/products", { params });

export const createAdminProduct = (data) =>
  api.post("/api/admin/products", data);

export const updateAdminProduct = (id, data) =>
  api.put(`/api/admin/products/${id}`, data);

export const deleteAdminProduct = (id) =>
  api.delete(`/api/admin/products/${id}`);

export const getAdminOrders = (params = {}) =>
  api.get("/api/admin/orders", { params });

export const getAdminOrder = (id) => api.get(`/api/admin/orders/${id}`);

export const updateAdminOrder = (id, data) =>
  api.put(`/api/admin/orders/${id}`, data);

export const getAdminCustomers = (params = {}) =>
  api.get("/api/admin/customers", { params });

export const getAdminRequests = (params = {}) =>
  api.get("/api/admin/requests", { params });

export const updateAdminRequest = (id, data) =>
  api.put(`/api/admin/requests/${id}`, data);

export const getAdminMessages = (params = {}) =>
  api.get("/api/admin/messages", { params });

export const updateAdminMessage = (id, data) =>
  api.put(`/api/admin/messages/${id}`, data);

export const getAdminSettings = () => api.get("/api/admin/settings");

export const updateAdminSettings = (data) =>
  api.put("/api/admin/settings", data);

export default api;
