import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  AssignmentRounded,
  CheckCircleOutlineRounded,
  CloseRounded,
  DeleteOutlineRounded,
  EmailRounded,
  LanguageRounded,
  PhoneRounded,
  RefreshRounded,
  SearchRounded,
  VisibilityRounded,
} from "@mui/icons-material";

import { motion } from "framer-motion";
import api from "../../services/api";

const MotionCard = motion(Card);

const C = {
  black: "#171717",
  gold: "#F4C430",
  goldDark: "#987300",
  goldLight: "#FFF8DB",
  border: "#EAEAEA",
  muted: "#858585",
  surface: "#FAFAFA",
  green: "#287A3E",
  greenBg: "#EAF7EE",
  blue: "#1D5FA7",
  blueBg: "#EAF3FC",
  red: "#B3261E",
  redBg: "#FDEDEC",
};

const REQUEST_STATUSES = [
  "Pending",
  "Contacted",
  "In Progress",
  "Completed",
  "Cancelled",
];

const getRequestsData = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.requests)) return data.requests;
  if (Array.isArray(data?.data?.requests)) return data.data.requests;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const normalizeStatus = (status) =>
  String(status || "Pending")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const getStatusStyles = (status) => {
  const value = normalizeStatus(status);

  if (value === "completed") {
    return { color: C.green, bgcolor: C.greenBg };
  }

  if (value === "contacted" || value === "inprogress") {
    return { color: C.blue, bgcolor: C.blueBg };
  }

  if (value === "cancelled") {
    return { color: C.red, bgcolor: C.redBg };
  }

  return { color: C.goldDark, bgcolor: C.goldLight };
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRequestName = (request) =>
  request?.name || request?.customerName || "Unknown Customer";

const getRequestEmail = (request) =>
  request?.email || request?.customerEmail || "—";

const getRequestMobile = (request) =>
  request?.mobile || request?.phone || request?.mobileNumber || "—";

const getRequestDescription = (request) =>
  request?.description ||
  request?.message ||
  request?.requirements ||
  request?.whatTheyNeed ||
  "No description provided.";

const getRequestTechStack = (request) => {
  const value =
    request?.techStack || request?.technology || request?.technologies || "";

  if (Array.isArray(value)) return value.join(", ");
  return value || "—";
};

const getRequestId = (request) => request?._id || request?.id;

const getErrorMessage = (err, fallback) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  fallback;

const panelSx = {
  border: `1px solid ${C.border}`,
  borderRadius: 2,
  boxShadow: "none",
  bgcolor: "#FFFFFF",
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5,
    bgcolor: C.surface,
    fontSize: "0.79rem",
    "& fieldset": { borderColor: C.border },
    "&:hover fieldset": { borderColor: "#D7C26D" },
    "&.Mui-focused fieldset": { borderColor: C.goldDark },
  },
  "& .MuiInputLabel-root": { fontSize: "0.82rem" },
};

const SectionLabel = ({ children }) => (
  <Typography
    sx={{
      fontSize: "0.66rem",
      color: C.muted,
      fontWeight: 900,
      letterSpacing: "0.07em",
      textTransform: "uppercase",
    }}
  >
    {children}
  </Typography>
);

const StatusChip = ({ status }) => {
  const styles = getStatusStyles(status);

  return (
    <Chip
      size="small"
      label={status || "Pending"}
      sx={{
        height: 25,
        maxWidth: "100%",
        borderRadius: 1,
        fontSize: "0.66rem",
        fontWeight: 900,
        color: styles.color,
        bgcolor: styles.bgcolor,
        "& .MuiChip-label": {
          px: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
      }}
    />
  );
};

const MetricCard = ({ label, value, icon, delay = 0, tone = "default" }) => {
  const iconColor = tone === "gold" ? C.goldDark : C.black;
  const iconBg = tone === "gold" ? C.goldLight : "#F3F3F3";

  return (
    <MotionCard
      elevation={0}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay }}
      sx={{
        ...panelSx,
        height: "100%",
        "&:hover": { borderColor: "#DCC66F" },
      }}
    >
      <CardContent
        sx={{
          p: { xs: 1.6, sm: 2 },
          "&:last-child": { pb: { xs: 1.6, sm: 2 } },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
        >
          <Box sx={{ minWidth: 0 }}>
            <SectionLabel>{label}</SectionLabel>
            <Typography
              sx={{
                mt: 0.8,
                fontSize: { xs: "1.5rem", sm: "1.7rem" },
                lineHeight: 1.15,
                fontWeight: 950,
                letterSpacing: "-0.045em",
                color: C.black,
              }}
            >
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              bgcolor: iconBg,
              color: iconColor,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </MotionCard>
  );
};

const ContactLine = ({ icon, children }) => (
  <Stack
    direction="row"
    spacing={0.7}
    alignItems="flex-start"
    sx={{ minWidth: 0 }}
  >
    {React.cloneElement(icon, {
      sx: { fontSize: 15, color: "#999", mt: "2px", flexShrink: 0 },
    })}

    <Typography
      sx={{
        fontSize: "0.71rem",
        color: "#666",
        overflowWrap: "anywhere",
        lineHeight: 1.5,
      }}
    >
      {children}
    </Typography>
  </Stack>
);

const DetailField = ({ label, children }) => (
  <Box sx={{ minWidth: 0 }}>
    <SectionLabel>{label}</SectionLabel>
    <Box
      sx={{
        mt: 0.7,
        p: 1.35,
        border: `1px solid ${C.border}`,
        borderRadius: 1.5,
        bgcolor: C.surface,
        minWidth: 0,
      }}
    >
      <Typography
        sx={{
          fontSize: "0.79rem",
          color: "#444",
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
        }}
      >
        {children || "—"}
      </Typography>
    </Box>
  </Box>
);

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("Pending");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/admin/requests");
      setRequests(getRequestsData(response?.data));
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load requests."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((request) => {
      const status = request?.status || "Pending";

      const matchesStatus =
        statusFilter === "All" ||
        normalizeStatus(status) === normalizeStatus(statusFilter);

      if (!matchesStatus) return false;
      if (!query) return true;

      const searchableValues = [
        getRequestName(request),
        getRequestEmail(request),
        getRequestMobile(request),
        getRequestDescription(request),
        getRequestTechStack(request),
      ];

      return searchableValues.some((value) =>
        String(value).toLowerCase().includes(query),
      );
    });
  }, [requests, search, statusFilter]);

  const pendingCount = requests.filter(
    (request) => normalizeStatus(request?.status) === "pending",
  ).length;

  const inProgressCount = requests.filter((request) =>
    ["contacted", "inprogress"].includes(normalizeStatus(request?.status)),
  ).length;

  const completedCount = requests.filter(
    (request) => normalizeStatus(request?.status) === "completed",
  ).length;

  const openDetails = (request) => {
    setSelectedRequest(request);
    setSelectedStatus(request?.status || "Pending");
    setError("");
    setSuccess("");
    setConfirmDelete(false);
  };

  const closeDetails = () => {
    if (saving || deleting) return;
    setSelectedRequest(null);
    setConfirmDelete(false);
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest) return;

    const requestId = getRequestId(selectedRequest);

    if (!requestId) {
      setError("Request ID is missing.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.put(`/api/admin/requests/${requestId}`, {
        status: selectedStatus,
      });

      const updated =
        response?.data?.request ||
        response?.data?.data?.request ||
        response?.data?.data;

      setRequests((previous) =>
        previous.map((request) => {
          if (String(getRequestId(request)) !== String(requestId)) {
            return request;
          }

          return updated && typeof updated === "object"
            ? { ...request, ...updated }
            : { ...request, status: selectedStatus };
        }),
      );

      setSelectedRequest((previous) =>
        previous
          ? updated && typeof updated === "object"
            ? { ...previous, ...updated }
            : { ...previous, status: selectedStatus }
          : previous,
      );

      setSuccess("Request status updated successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update request."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRequest) return;

    const requestId = getRequestId(selectedRequest);

    if (!requestId) {
      setError("Request ID is missing.");
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await api.delete(`/api/admin/requests/${requestId}`);

      setRequests((previous) =>
        previous.filter(
          (request) => String(getRequestId(request)) !== String(requestId),
        ),
      );

      setSelectedRequest(null);
      setConfirmDelete(false);
      setSuccess("Request deleted successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to delete request."));
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ width: "100%", minWidth: 0, pb: { xs: 3, md: 4 } }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={1.8}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            sx={{
              mb: 0.7,
              color: C.goldDark,
              fontSize: "0.67rem",
              fontWeight: 900,
              letterSpacing: "0.13em",
            }}
          >
            GLYRUS / ADMINISTRATION
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: "1.7rem", sm: "2rem", md: "2.25rem" },
              fontWeight: 950,
              letterSpacing: "-0.055em",
              color: C.black,
              lineHeight: 1.15,
            }}
          >
            NFC Requests<span style={{ color: C.goldDark }}>.</span>
          </Typography>

          <Typography sx={{ mt: 0.7, color: C.muted, fontSize: "0.8rem" }}>
            Review customer requirements and manage request status.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            icon={<AssignmentRounded />}
            label={`${requests.length} ${
              requests.length === 1 ? "Request" : "Requests"
            }`}
            sx={{
              height: 35,
              borderRadius: 1.5,
              bgcolor: C.goldLight,
              color: C.goldDark,
              fontWeight: 850,
              "& .MuiChip-icon": { color: C.goldDark },
            }}
          />

          <Button
            variant="outlined"
            onClick={fetchRequests}
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <RefreshRounded />
              )
            }
            sx={{
              height: 35,
              borderRadius: 1.5,
              borderColor: "#DDD",
              color: C.black,
              fontSize: "0.75rem",
              fontWeight: 850,
              textTransform: "none",
              "&:hover": {
                borderColor: C.goldDark,
                bgcolor: C.goldLight,
              },
            }}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {/* Notifications */}
      {error && !selectedRequest && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{ mb: 2, borderRadius: 1.5 }}
        >
          {error}
        </Alert>
      )}

      {success && !selectedRequest && (
        <Alert
          severity="success"
          onClose={() => setSuccess("")}
          sx={{ mb: 2, borderRadius: 1.5 }}
        >
          {success}
        </Alert>
      )}

      {/* Overview */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
          },
          gap: { xs: 1.2, sm: 1.6 },
          mb: 2.5,
        }}
      >
        <MetricCard
          label="Total requests"
          value={requests.length}
          icon={<AssignmentRounded />}
          tone="gold"
        />

        <MetricCard
          label="Pending"
          value={pendingCount}
          icon={<VisibilityRounded />}
          delay={0.04}
        />

        <MetricCard
          label="In progress"
          value={inProgressCount}
          icon={<PhoneRounded />}
          delay={0.08}
        />

        <MetricCard
          label="Completed"
          value={completedCount}
          icon={<CheckCircleOutlineRounded />}
          delay={0.12}
        />
      </Box>

      {/* Request directory */}
      <Card elevation={0} sx={panelSx}>
        <CardContent
          sx={{
            p: { xs: 1.4, sm: 2, md: 2.4 },
            "&:last-child": {
              pb: { xs: 1.4, sm: 2, md: 2.4 },
            },
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={1.2}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography
                sx={{ color: C.black, fontSize: "0.98rem", fontWeight: 950 }}
              >
                Request directory
              </Typography>

              <Typography
                sx={{ mt: 0.35, color: C.muted, fontSize: "0.72rem" }}
              >
                Search, filter and open a request to manage it.
              </Typography>
            </Box>

            <Chip
              size="small"
              label={`${filteredRequests.length} results`}
              sx={{
                alignSelf: { xs: "flex-start", sm: "center" },
                height: 25,
                borderRadius: 1,
                bgcolor: "#F3F3F3",
                color: "#555",
                fontWeight: 850,
                fontSize: "0.67rem",
              }}
            />
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.2}
            sx={{ mb: 2 }}
          >
            <TextField
              fullWidth
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, mobile or requirement..."
              inputProps={{ "aria-label": "Search requests" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded sx={{ color: "#999", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ ...inputSx, maxWidth: { md: 560 } }}
            />

            <TextField
              select
              size="small"
              label="Filter status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              sx={{
                ...inputSx,
                minWidth: { xs: "100%", md: 180 },
              }}
            >
              <MenuItem value="All">All statuses</MenuItem>
              {REQUEST_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Divider sx={{ borderColor: "#EFEFEF", mb: 1.8 }} />

          {loading ? (
            <Box
              sx={{
                minHeight: 230,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 1.3,
              }}
            >
              <CircularProgress
                size={30}
                thickness={4}
                sx={{ color: C.goldDark }}
              />
              <Typography sx={{ fontSize: "0.76rem", color: C.muted }}>
                Loading requests...
              </Typography>
            </Box>
          ) : filteredRequests.length === 0 ? (
            <Box sx={{ py: 7, px: 2, textAlign: "center" }}>
              <AssignmentRounded sx={{ fontSize: 38, color: "#C8B66C" }} />

              <Typography sx={{ mt: 1.2, fontWeight: 900, color: C.black }}>
                No requests found
              </Typography>

              <Typography sx={{ mt: 0.5, fontSize: "0.76rem", color: C.muted }}>
                Try changing the search or status filter.
              </Typography>

              {(search || statusFilter !== "All") && (
                <Button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                  }}
                  sx={{
                    mt: 1,
                    color: C.goldDark,
                    fontWeight: 850,
                    textTransform: "none",
                  }}
                >
                  Clear filters
                </Button>
              )}
            </Box>
          ) : (
            <Stack spacing={1.2}>
              {filteredRequests.map((request, index) => {
                const name = getRequestName(request);
                const email = getRequestEmail(request);
                const mobile = getRequestMobile(request);
                const status = request?.status || "Pending";
                const techStack = getRequestTechStack(request);

                return (
                  <MotionCard
                    key={getRequestId(request) || index}
                    elevation={0}
                    initial={{ opacity: 0, y: 7 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.22,
                      delay: Math.min(index * 0.02, 0.2),
                    }}
                    sx={{
                      border: `1px solid ${C.border}`,
                      borderRadius: 1.5,
                      boxShadow: "none",
                      overflow: "hidden",
                      "&:hover": { borderColor: "#DCC66F" },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: { xs: 1.4, sm: 1.8, md: 2 },
                        "&:last-child": {
                          pb: { xs: 1.4, sm: 1.8, md: 2 },
                        },
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        alignItems={{ xs: "stretch", md: "center" }}
                        spacing={1.8}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack
                            direction="row"
                            spacing={1.1}
                            alignItems="flex-start"
                          >
                            <Box
                              sx={{
                                width: 39,
                                height: 39,
                                flexShrink: 0,
                                display: "grid",
                                placeItems: "center",
                                borderRadius: 1.5,
                                bgcolor: C.black,
                                color: C.gold,
                              }}
                            >
                              <AssignmentRounded sx={{ fontSize: 20 }} />
                            </Box>

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                alignItems={{ xs: "flex-start", sm: "center" }}
                                spacing={0.8}
                                sx={{ mb: 0.55 }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: "0.87rem",
                                    fontWeight: 900,
                                    color: C.black,
                                    overflowWrap: "anywhere",
                                  }}
                                >
                                  {name}
                                </Typography>

                                <StatusChip status={status} />
                              </Stack>

                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={{ xs: 0.45, sm: 1.4 }}
                              >
                                <ContactLine icon={<EmailRounded />}>
                                  {email}
                                </ContactLine>

                                <ContactLine icon={<PhoneRounded />}>
                                  {mobile}
                                </ContactLine>
                              </Stack>
                            </Box>
                          </Stack>

                          <Box
                            sx={{
                              mt: 1.4,
                              p: 1.2,
                              border: "1px solid #EFEFEF",
                              borderRadius: 1.5,
                              bgcolor: C.surface,
                            }}
                          >
                            <SectionLabel>Requirement</SectionLabel>

                            <Typography
                              sx={{
                                mt: 0.55,
                                fontSize: "0.75rem",
                                color: "#555",
                                lineHeight: 1.65,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                overflowWrap: "anywhere",
                              }}
                            >
                              {getRequestDescription(request)}
                            </Typography>

                            {techStack !== "—" && (
                              <Stack
                                direction="row"
                                spacing={0.6}
                                alignItems="flex-start"
                                sx={{ mt: 0.9 }}
                              >
                                <LanguageRounded
                                  sx={{
                                    fontSize: 15,
                                    color: "#999",
                                    mt: "2px",
                                  }}
                                />

                                <Typography
                                  sx={{
                                    fontSize: "0.69rem",
                                    color: "#777",
                                    overflowWrap: "anywhere",
                                  }}
                                >
                                  {techStack}
                                </Typography>
                              </Stack>
                            )}
                          </Box>
                        </Box>

                        <Stack
                          direction={{ xs: "row", md: "column" }}
                          alignItems={{ xs: "center", md: "flex-end" }}
                          justifyContent="space-between"
                          spacing={1}
                          sx={{ minWidth: { md: 135 } }}
                        >
                          <Box sx={{ textAlign: { md: "right" } }}>
                            <SectionLabel>Submitted</SectionLabel>
                            <Typography
                              sx={{
                                mt: 0.4,
                                fontSize: "0.7rem",
                                color: "#777",
                              }}
                            >
                              {formatDate(request?.createdAt)}
                            </Typography>
                          </Box>

                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityRounded />}
                            onClick={() => openDetails(request)}
                            sx={{
                              minHeight: 35,
                              px: 1.4,
                              borderRadius: 1.5,
                              borderColor: "#DDD",
                              color: C.black,
                              fontSize: "0.72rem",
                              fontWeight: 900,
                              textTransform: "none",
                              whiteSpace: "nowrap",
                              "&:hover": {
                                borderColor: C.goldDark,
                                bgcolor: C.goldLight,
                              },
                            }}
                          >
                            View details
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </MotionCard>
                );
              })}
            </Stack>
          )}

          {!loading && filteredRequests.length > 0 && (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              spacing={0.7}
              sx={{ mt: 1.8 }}
            >
              <Typography sx={{ fontSize: "0.69rem", color: C.muted }}>
                Showing {filteredRequests.length} of {requests.length} requests
              </Typography>

              <Typography sx={{ fontSize: "0.66rem", color: "#AAA" }}>
                Glyrus request management
              </Typography>
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Request details dialog */}
      <Dialog
        open={Boolean(selectedRequest)}
        onClose={closeDetails}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: `1px solid ${C.border}`,
            boxShadow: "0 18px 60px rgba(0,0,0,0.14)",
            m: { xs: 1.5, sm: 2 },
            width: { xs: "calc(100% - 24px)", sm: "100%" },
          },
        }}
      >
        {selectedRequest && (
          <>
            <DialogTitle sx={{ p: { xs: 1.8, sm: 2.2 } }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1.5}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: "1.15rem",
                      fontWeight: 950,
                      color: C.black,
                    }}
                  >
                    Request details
                  </Typography>

                  <Typography
                    sx={{ mt: 0.4, fontSize: "0.7rem", color: C.muted }}
                  >
                    Submitted {formatDateTime(selectedRequest?.createdAt)}
                  </Typography>
                </Box>

                <IconButton
                  onClick={closeDetails}
                  disabled={saving || deleting}
                  size="small"
                  sx={{
                    borderRadius: 1.5,
                    bgcolor: "#F3F3F3",
                    "&:hover": { bgcolor: "#EAEAEA" },
                  }}
                >
                  <CloseRounded />
                </IconButton>
              </Stack>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ p: { xs: 1.8, sm: 2.2 } }}>
              <Stack spacing={1.8}>
                {error && (
                  <Alert
                    severity="error"
                    onClose={() => setError("")}
                    sx={{ borderRadius: 1.5 }}
                  >
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert
                    severity="success"
                    onClose={() => setSuccess("")}
                    sx={{ borderRadius: 1.5 }}
                  >
                    {success}
                  </Alert>
                )}

                <Box
                  sx={{
                    p: 1.6,
                    borderRadius: 1.5,
                    bgcolor: C.black,
                    color: "#FFF",
                  }}
                >
                  <SectionLabel>Customer</SectionLabel>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: "1rem",
                      fontWeight: 900,
                      color: "#FFF",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {getRequestName(selectedRequest)}
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    <StatusChip status={selectedRequest?.status || "Pending"} />
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                    },
                    gap: 1.2,
                  }}
                >
                  <Box
                    sx={{
                      p: 1.3,
                      border: `1px solid ${C.border}`,
                      borderRadius: 1.5,
                    }}
                  >
                    <Stack direction="row" spacing={0.7} alignItems="center">
                      <EmailRounded sx={{ fontSize: 16, color: "#888" }} />
                      <SectionLabel>Email</SectionLabel>
                    </Stack>

                    <Typography
                      sx={{
                        mt: 0.7,
                        fontSize: "0.76rem",
                        color: "#444",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {getRequestEmail(selectedRequest)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 1.3,
                      border: `1px solid ${C.border}`,
                      borderRadius: 1.5,
                    }}
                  >
                    <Stack direction="row" spacing={0.7} alignItems="center">
                      <PhoneRounded sx={{ fontSize: 16, color: "#888" }} />
                      <SectionLabel>Mobile</SectionLabel>
                    </Stack>

                    <Typography
                      sx={{
                        mt: 0.7,
                        fontSize: "0.76rem",
                        color: "#444",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {getRequestMobile(selectedRequest)}
                    </Typography>
                  </Box>
                </Box>

                <DetailField label="Requirement">
                  {getRequestDescription(selectedRequest)}
                </DetailField>

                <DetailField label="Tech stack">
                  {getRequestTechStack(selectedRequest)}
                </DetailField>

                {selectedRequest?.budget && (
                  <DetailField label="Budget">
                    {selectedRequest.budget}
                  </DetailField>
                )}

                <Box>
                  <SectionLabel>Manage request</SectionLabel>

                  <TextField
                    fullWidth
                    select
                    size="small"
                    label="Update request status"
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value)}
                    disabled={saving || deleting}
                    sx={{ ...inputSx, mt: 1 }}
                  >
                    {REQUEST_STATUSES.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Stack>
            </DialogContent>

            <Divider />

            <DialogActions
              sx={{
                p: { xs: 1.4, sm: 1.8 },
                gap: 0.8,
                flexWrap: "wrap",
              }}
            >
              {confirmDelete ? (
                <>
                  <Typography
                    sx={{
                      flex: "1 1 100%",
                      px: 0.5,
                      color: C.red,
                      fontSize: "0.76rem",
                      fontWeight: 800,
                    }}
                  >
                    Delete this request permanently?
                  </Typography>

                  <Button
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleting}
                    sx={{
                      borderRadius: 1.5,
                      color: "#555",
                      fontWeight: 800,
                      textTransform: "none",
                    }}
                  >
                    Keep request
                  </Button>

                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDelete}
                    disabled={deleting}
                    startIcon={
                      deleting ? (
                        <CircularProgress size={15} color="inherit" />
                      ) : (
                        <DeleteOutlineRounded />
                      )
                    }
                    sx={{
                      borderRadius: 1.5,
                      fontWeight: 900,
                      textTransform: "none",
                    }}
                  >
                    {deleting ? "Deleting..." : "Confirm delete"}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    color="error"
                    variant="outlined"
                    startIcon={<DeleteOutlineRounded />}
                    onClick={() => setConfirmDelete(true)}
                    disabled={saving || deleting}
                    sx={{
                      mr: "auto",
                      borderRadius: 1.5,
                      fontSize: "0.74rem",
                      fontWeight: 850,
                      textTransform: "none",
                    }}
                  >
                    Delete
                  </Button>

                  <Button
                    onClick={closeDetails}
                    disabled={saving || deleting}
                    sx={{
                      borderRadius: 1.5,
                      color: "#555",
                      fontWeight: 800,
                      textTransform: "none",
                    }}
                  >
                    Close
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleUpdateStatus}
                    disabled={saving || deleting}
                    startIcon={
                      saving ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <AssignmentRounded />
                      )
                    }
                    sx={{
                      minHeight: 39,
                      px: 1.8,
                      borderRadius: 1.5,
                      bgcolor: C.gold,
                      color: C.black,
                      fontSize: "0.75rem",
                      fontWeight: 900,
                      textTransform: "none",
                      boxShadow: "none",
                      "&:hover": {
                        bgcolor: "#E5B500",
                        boxShadow: "none",
                      },
                    }}
                  >
                    {saving ? "Updating..." : "Update status"}
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Requests;
