// Glyrus — Requests.jsx
import React, { useEffect, useMemo, useState } from "react";
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
  CloseRounded,
  DeleteOutlineRounded,
  EmailRounded,
  LanguageRounded,
  PhoneRounded,
  SearchRounded,
  VisibilityRounded,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import api from "../../services/api";

const MotionCard = motion(Card);

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
  if (Array.isArray(data?.data?.requests)) {
    return data.data.requests;
  }
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getStatusStyles = (status) => {
  const value = String(status || "")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

  if (value === "completed") {
    return {
      color: "#287A3E",
      bgcolor: "#EAF7EE",
    };
  }

  if (
    value === "contacted" ||
    value === "inprogress"
  ) {
    return {
      color: "#1D5FA7",
      bgcolor: "#EAF3FC",
    };
  }

  if (value === "cancelled") {
    return {
      color: "#B3261E",
      bgcolor: "#FDEDEC",
    };
  }

  return {
    color: "#876600",
    bgcolor: "#FFF7D8",
  };
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
  request?.name ||
  request?.customerName ||
  "Unknown Customer";

const getRequestEmail = (request) =>
  request?.email ||
  request?.customerEmail ||
  "—";

const getRequestMobile = (request) =>
  request?.mobile ||
  request?.phone ||
  request?.mobileNumber ||
  "—";

const getRequestDescription = (request) =>
  request?.description ||
  request?.message ||
  request?.requirements ||
  request?.whatTheyNeed ||
  "No description provided.";

const getRequestTechStack = (request) => {
  const value =
    request?.techStack ||
    request?.technology ||
    request?.technologies ||
    "";

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value || "—";
};

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [selectedRequest, setSelectedRequest] =
    useState(null);

  const [selectedStatus, setSelectedStatus] =
    useState("Pending");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/api/admin/requests"
      );

      setRequests(
        getRequestsData(response?.data)
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((request) => {
      const status =
        request?.status || "Pending";

      const matchesStatus =
        statusFilter === "All" ||
        String(status).toLowerCase() ===
          statusFilter.toLowerCase();

      if (!matchesStatus) return false;

      if (!query) return true;

      const name =
        getRequestName(request).toLowerCase();

      const email =
        getRequestEmail(request).toLowerCase();

      const mobile = String(
        getRequestMobile(request)
      ).toLowerCase();

      const description =
        getRequestDescription(
          request
        ).toLowerCase();

      const techStack =
        getRequestTechStack(
          request
        ).toLowerCase();

      return (
        name.includes(query) ||
        email.includes(query) ||
        mobile.includes(query) ||
        description.includes(query) ||
        techStack.includes(query)
      );
    });
  }, [
    requests,
    search,
    statusFilter,
  ]);

  const pendingCount = requests.filter(
    (request) =>
      String(
        request?.status || "Pending"
      ).toLowerCase() === "pending"
  ).length;

  const inProgressCount = requests.filter(
    (request) =>
      [
        "contacted",
        "in progress",
      ].includes(
        String(
          request?.status || ""
        ).toLowerCase()
      )
  ).length;

  const completedCount = requests.filter(
    (request) =>
      String(
        request?.status || ""
      ).toLowerCase() === "completed"
  ).length;

  const openDetails = (request) => {
    setSelectedRequest(request);
    setSelectedStatus(
      request?.status || "Pending"
    );
    setError("");
    setSuccess("");
  };

  const closeDetails = () => {
    if (saving || deleting) return;

    setSelectedRequest(null);
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest) return;

    const requestId =
      selectedRequest?._id ||
      selectedRequest?.id;

    if (!requestId) {
      setError("Request ID is missing.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.put(
        `/api/admin/requests/${requestId}`,
        {
          status: selectedStatus,
        }
      );

      const updated =
        response?.data?.request ||
        response?.data?.data?.request ||
        response?.data?.data;

      setRequests((previous) =>
        previous.map((request) => {
          const id =
            request?._id ||
            request?.id;

          if (String(id) !== String(requestId)) {
            return request;
          }

          return (
            updated || {
              ...request,
              status: selectedStatus,
            }
          );
        })
      );

      setSelectedRequest((previous) =>
        previous
          ? updated || {
              ...previous,
              status: selectedStatus,
            }
          : previous
      );

      setSuccess(
        "Request status updated successfully."
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to update request."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRequest) return;

    const requestId =
      selectedRequest?._id ||
      selectedRequest?.id;

    if (!requestId) {
      setError("Request ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this request?"
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await api.delete(
        `/api/admin/requests/${requestId}`
      );

      setRequests((previous) =>
        previous.filter((request) => {
          const id =
            request?._id ||
            request?.id;

          return (
            String(id) !==
            String(requestId)
          );
        })
      );

      setSelectedRequest(null);
      setSuccess(
        "Request deleted successfully."
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to delete request."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        pb: {
          xs: 3,
          md: 5,
        },
      }}
    >
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        alignItems={{
          xs: "flex-start",
          sm: "center",
        }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: {
                xs: "1.5rem",
                sm: "1.9rem",
                md: "2.2rem",
              },
              fontWeight: 950,
              letterSpacing: "-0.04em",
              color: "#111",
            }}
          >
            NFC Requests
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              color: "#888",
              fontSize: {
                xs: "0.76rem",
                sm: "0.82rem",
              },
            }}
          >
            Manage customer requests for NFC products.
          </Typography>
        </Box>

        <Chip
          icon={<AssignmentRounded />}
          label={`${requests.length} Request${
            requests.length === 1 ? "" : "s"
          }`}
          sx={{
            height: 38,
            borderRadius: 2.5,
            bgcolor: "#FFF7D2",
            color: "#806200",
            fontWeight: 900,
            "& .MuiChip-icon": {
              color: "#A17B00",
            },
          }}
        />
      </Stack>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{
            mb: 2.5,
            borderRadius: 3,
          }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess("")}
          sx={{
            mb: 2.5,
            borderRadius: 3,
          }}
        >
          {success}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 2.5,
        }}
      >
        {[
          {
            label: "TOTAL REQUESTS",
            value: requests.length,
            icon: <AssignmentRounded />,
          },
          {
            label: "PENDING",
            value: pendingCount,
            icon: <VisibilityRounded />,
          },
          {
            label: "IN PROGRESS",
            value: inProgressCount,
            icon: <PhoneRounded />,
          },
          {
            label: "COMPLETED",
            value: completedCount,
            icon: <AssignmentRounded />,
          },
        ].map((item, index) => (
          <MotionCard
            key={item.label}
            elevation={0}
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
            }}
            sx={{
              borderRadius: 3.5,
            }}
          >
            <CardContent
              sx={{
                p: 2.2,
                "&:last-child": {
                  pb: 2.2,
                },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.4}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    display: "grid",
                    placeItems: "center",
                    bgcolor:
                      index === 0
                        ? "#FFF7D2"
                        : "#F3F3F3",
                    color:
                      index === 0
                        ? "#A17B00"
                        : "#555",
                  }}
                >
                  {item.icon}
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.66rem",
                      color: "#999",
                      fontWeight: 800,
                    }}
                  >
                    {item.label}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.2,
                      fontSize: "1.35rem",
                      fontWeight: 950,
                      color: "#111",
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </MotionCard>
        ))}
      </Box>

      <Card
        elevation={0}
        sx={{
          borderRadius: {
            xs: 3,
            md: 4,
          },
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 1.5,
              sm: 2,
              md: 2.5,
            },
            "&:last-child": {
              pb: {
                xs: 1.5,
                sm: 2,
                md: 2.5,
              },
            },
          }}
        >
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={1.5}
            sx={{ mb: 2.5 }}
          >
            <TextField
              fullWidth
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, email, mobile or requirement..."
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded
                      sx={{
                        color: "#999",
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                maxWidth: {
                  md: 600,
                },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  bgcolor: "#FAFAFA",
                },
              }}
            />

            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              sx={{
                minWidth: {
                  xs: "100%",
                  md: 180,
                },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  bgcolor: "#FAFAFA",
                },
              }}
            >
              <MenuItem value="All">
                All Statuses
              </MenuItem>

              {REQUEST_STATUSES.map(
                (status) => (
                  <MenuItem
                    key={status}
                    value={status}
                  >
                    {status}
                  </MenuItem>
                )
              )}
            </TextField>
          </Stack>

          {loading ? (
            <Box
              sx={{
                minHeight: 360,
                display: "grid",
                placeItems: "center",
              }}
            >
              <CircularProgress
                size={34}
                thickness={4}
                sx={{
                  color: "#F4C430",
                }}
              />
            </Box>
          ) : filteredRequests.length === 0 ? (
            <Box
              sx={{
                minHeight: 360,
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                px: 2,
              }}
            >
              <Box>
                <AssignmentRounded
                  sx={{
                    fontSize: 48,
                    color: "#CCC",
                  }}
                />

                <Typography
                  sx={{
                    mt: 1,
                    fontWeight: 900,
                    color: "#555",
                  }}
                >
                  No requests found
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: "0.75rem",
                    color: "#999",
                  }}
                >
                  Try changing the search or status filter.
                </Typography>
              </Box>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {filteredRequests.map(
                (request, index) => {
                  const name =
                    getRequestName(
                      request
                    );

                  const email =
                    getRequestEmail(
                      request
                    );

                  const mobile =
                    getRequestMobile(
                      request
                    );

                  const status =
                    request?.status ||
                    "Pending";

                  const statusStyle =
                    getStatusStyles(
                      status
                    );

                  const techStack =
                    getRequestTechStack(
                      request
                    );

                  return (
                    <MotionCard
                      key={
                        request?._id ||
                        request?.id ||
                        index
                      }
                      elevation={0}
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.25,
                        delay:
                          index * 0.025,
                      }}
                      sx={{
                        border:
                          "1px solid #EEEEEE",
                        borderRadius: 3,
                        boxShadow:
                          "none",
                        transition:
                          "border-color 180ms ease, box-shadow 180ms ease",
                        "&:hover": {
                          borderColor:
                            "#E7D58C",
                          boxShadow:
                            "0 8px 25px rgba(0,0,0,0.05)",
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          p: {
                            xs: 1.7,
                            sm: 2,
                            md: 2.2,
                          },
                          "&:last-child": {
                            pb: {
                              xs: 1.7,
                              sm: 2,
                              md: 2.2,
                            },
                          },
                        }}
                      >
                        <Stack
                          direction={{
                            xs: "column",
                            md: "row",
                          }}
                          spacing={2}
                          alignItems={{
                            xs: "stretch",
                            md: "center",
                          }}
                        >
                          <Box
                            sx={{
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={1.3}
                              alignItems="flex-start"
                            >
                              <Box
                                sx={{
                                  width: 42,
                                  height: 42,
                                  borderRadius: 2.5,
                                  flexShrink: 0,
                                  display:
                                    "grid",
                                  placeItems:
                                    "center",
                                  bgcolor:
                                    "#111",
                                  color:
                                    "#F4C430",
                                }}
                              >
                                <AssignmentRounded
                                  sx={{
                                    fontSize: 20,
                                  }}
                                />
                              </Box>

                              <Box
                                sx={{
                                  minWidth: 0,
                                  flex: 1,
                                }}
                              >
                                <Stack
                                  direction={{
                                    xs: "column",
                                    sm: "row",
                                  }}
                                  alignItems={{
                                    xs: "flex-start",
                                    sm: "center",
                                  }}
                                  spacing={{
                                    xs: 0.7,
                                    sm: 1,
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontWeight:
                                        900,
                                      fontSize:
                                        "0.9rem",
                                      color:
                                        "#222",
                                    }}
                                  >
                                    {name}
                                  </Typography>

                                  <Chip
                                    size="small"
                                    label={
                                      status
                                    }
                                    sx={{
                                      height: 24,
                                      fontSize:
                                        "0.6rem",
                                      fontWeight:
                                        900,
                                      color:
                                        statusStyle.color,
                                      bgcolor:
                                        statusStyle.bgcolor,
                                    }}
                                  />
                                </Stack>

                                <Stack
                                  direction={{
                                    xs: "column",
                                    sm: "row",
                                  }}
                                  spacing={{
                                    xs: 0.45,
                                    sm: 1.5,
                                  }}
                                  sx={{
                                    mt: 0.65,
                                  }}
                                >
                                  <Stack
                                    direction="row"
                                    spacing={0.5}
                                    alignItems="center"
                                  >
                                    <EmailRounded
                                      sx={{
                                        fontSize:
                                          14,
                                        color:
                                          "#999",
                                      }}
                                    />

                                    <Typography
                                      sx={{
                                        fontSize:
                                          "0.69rem",
                                        color:
                                          "#777",
                                        wordBreak:
                                          "break-word",
                                      }}
                                    >
                                      {email}
                                    </Typography>
                                  </Stack>

                                  <Stack
                                    direction="row"
                                    spacing={0.5}
                                    alignItems="center"
                                  >
                                    <PhoneRounded
                                      sx={{
                                        fontSize:
                                          14,
                                        color:
                                          "#999",
                                      }}
                                    />

                                    <Typography
                                      sx={{
                                        fontSize:
                                          "0.69rem",
                                        color:
                                          "#777",
                                      }}
                                    >
                                      {mobile}
                                    </Typography>
                                  </Stack>
                                </Stack>
                              </Box>
                            </Stack>

                            <Box
                              sx={{
                                mt: 1.5,
                                p: 1.3,
                                borderRadius: 2.5,
                                bgcolor:
                                  "#FAFAFA",
                                border:
                                  "1px solid #F0F0F0",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize:
                                    "0.62rem",
                                  color:
                                    "#999",
                                  fontWeight:
                                    900,
                                  mb: 0.45,
                                }}
                              >
                                REQUIREMENT
                              </Typography>

                              <Typography
                                sx={{
                                  fontSize:
                                    "0.74rem",
                                  color:
                                    "#555",
                                  lineHeight:
                                    1.6,
                                  display:
                                    "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient:
                                    "vertical",
                                  overflow:
                                    "hidden",
                                }}
                              >
                                {getRequestDescription(
                                  request
                                )}
                              </Typography>

                              {techStack !==
                                "—" && (
                                <Stack
                                  direction="row"
                                  spacing={0.6}
                                  alignItems="center"
                                  sx={{
                                    mt: 0.8,
                                  }}
                                >
                                  <LanguageRounded
                                    sx={{
                                      fontSize:
                                        14,
                                      color:
                                        "#999",
                                    }}
                                  />

                                  <Typography
                                    sx={{
                                      fontSize:
                                        "0.67rem",
                                      color:
                                        "#777",
                                    }}
                                  >
                                    {techStack}
                                  </Typography>
                                </Stack>
                              )}
                            </Box>
                          </Box>

                          <Stack
                            direction={{
                              xs: "row",
                              md: "column",
                            }}
                            justifyContent={{
                              xs: "space-between",
                              md: "center",
                            }}
                            alignItems={{
                              xs: "center",
                              md: "flex-end",
                            }}
                            spacing={1}
                            sx={{
                              minWidth: {
                                md: 150,
                              },
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize:
                                  "0.65rem",
                                color:
                                  "#999",
                              }}
                            >
                              {formatDate(
                                request?.createdAt
                              )}
                            </Typography>

                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={
                                <VisibilityRounded />
                              }
                              onClick={() =>
                                openDetails(
                                  request
                                )
                              }
                              sx={{
                                minHeight:
                                  38,
                                borderRadius:
                                  2.2,
                                borderColor:
                                  "#DDDDDD",
                                color:
                                  "#333",
                                fontWeight:
                                  900,
                                "&:hover": {
                                  borderColor:
                                    "#F4C430",
                                  bgcolor:
                                    "#FFFBEA",
                                },
                              }}
                            >
                              View Details
                            </Button>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </MotionCard>
                  );
                }
              )}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(selectedRequest)}
        onClose={closeDetails}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: {
              xs: 3,
              sm: 4,
            },
            m: {
              xs: 1.5,
              sm: 2,
            },
            width: {
              xs: "calc(100% - 24px)",
              sm: "100%",
            },
          },
        }}
      >
        {selectedRequest && (
          <>
            <DialogTitle
              sx={{
                p: {
                  xs: 2,
                  sm: 2.5,
                },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 950,
                      fontSize: "1.2rem",
                      color: "#111",
                    }}
                  >
                    Request Details
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.35,
                      fontSize: "0.7rem",
                      color: "#999",
                    }}
                  >
                    Submitted{" "}
                    {formatDateTime(
                      selectedRequest?.createdAt
                    )}
                  </Typography>
                </Box>

                <IconButton
                  onClick={closeDetails}
                  disabled={
                    saving || deleting
                  }
                  sx={{
                    bgcolor: "#F5F5F5",
                    "&:hover": {
                      bgcolor: "#EEEEEE",
                    },
                  }}
                >
                  <CloseRounded />
                </IconButton>
              </Stack>
            </DialogTitle>

            <Divider />

            <DialogContent
              sx={{
                p: {
                  xs: 2,
                  sm: 2.5,
                },
              }}
            >
              <Stack spacing={2}>
                <Box
                  sx={{
                    p: 1.7,
                    borderRadius: 3,
                    bgcolor: "#111",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.65rem",
                      color: "#999",
                      fontWeight: 800,
                    }}
                  >
                    CUSTOMER
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.4,
                      color: "#FFF",
                      fontWeight: 900,
                      fontSize: "1rem",
                    }}
                  >
                    {getRequestName(
                      selectedRequest
                    )}
                  </Typography>
                </Box>

                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={1.5}
                >
                  <Box
                    sx={{
                      flex: 1,
                      p: 1.5,
                      borderRadius: 2.5,
                      bgcolor: "#FAFAFA",
                      border:
                        "1px solid #EEEEEE",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={0.8}
                      alignItems="center"
                    >
                      <EmailRounded
                        sx={{
                          fontSize: 17,
                          color: "#888",
                        }}
                      />

                      <Typography
                        sx={{
                          fontSize: "0.68rem",
                          color: "#999",
                          fontWeight: 800,
                        }}
                      >
                        EMAIL
                      </Typography>
                    </Stack>

                    <Typography
                      sx={{
                        mt: 0.7,
                        fontSize: "0.75rem",
                        color: "#444",
                        wordBreak:
                          "break-word",
                      }}
                    >
                      {getRequestEmail(
                        selectedRequest
                      )}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      flex: 1,
                      p: 1.5,
                      borderRadius: 2.5,
                      bgcolor: "#FAFAFA",
                      border:
                        "1px solid #EEEEEE",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={0.8}
                      alignItems="center"
                    >
                      <PhoneRounded
                        sx={{
                          fontSize: 17,
                          color: "#888",
                        }}
                      />

                      <Typography
                        sx={{
                          fontSize: "0.68rem",
                          color: "#999",
                          fontWeight: 800,
                        }}
                      >
                        MOBILE
                      </Typography>
                    </Stack>

                    <Typography
                      sx={{
                        mt: 0.7,
                        fontSize: "0.75rem",
                        color: "#444",
                      }}
                    >
                      {getRequestMobile(
                        selectedRequest
                      )}
                    </Typography>
                  </Box>
                </Stack>

                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.68rem",
                      color: "#999",
                      fontWeight: 900,
                      mb: 0.8,
                    }}
                  >
                    REQUIREMENT
                  </Typography>

                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      bgcolor: "#FAFAFA",
                      border:
                        "1px solid #EEEEEE",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color: "#444",
                        lineHeight: 1.7,
                        whiteSpace:
                          "pre-wrap",
                        wordBreak:
                          "break-word",
                      }}
                    >
                      {getRequestDescription(
                        selectedRequest
                      )}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.68rem",
                      color: "#999",
                      fontWeight: 900,
                      mb: 0.8,
                    }}
                  >
                    TECH STACK
                  </Typography>

                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      bgcolor: "#FAFAFA",
                      border:
                        "1px solid #EEEEEE",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color: "#444",
                      }}
                    >
                      {getRequestTechStack(
                        selectedRequest
                      )}
                    </Typography>
                  </Box>
                </Box>

                {selectedRequest?.budget && (
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.68rem",
                        color: "#999",
                        fontWeight: 900,
                        mb: 0.8,
                      }}
                    >
                      BUDGET
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        fontWeight: 800,
                        color: "#222",
                      }}
                    >
                      {selectedRequest.budget}
                    </Typography>
                  </Box>
                )}

                <TextField
                  fullWidth
                  select
                  label="Update Request Status"
                  value={selectedStatus}
                  onChange={(event) =>
                    setSelectedStatus(
                      event.target.value
                    )
                  }
                  disabled={
                    saving || deleting
                  }
                >
                  {REQUEST_STATUSES.map(
                    (status) => (
                      <MenuItem
                        key={status}
                        value={status}
                      >
                        {status}
                      </MenuItem>
                    )
                  )}
                </TextField>
              </Stack>
            </DialogContent>

            <Divider />

            <DialogActions
              sx={{
                p: {
                  xs: 1.5,
                  sm: 2,
                },
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Button
                color="error"
                variant="outlined"
                startIcon={
                  deleting ? (
                    <CircularProgress
                      size={16}
                      color="inherit"
                    />
                  ) : (
                    <DeleteOutlineRounded />
                  )
                }
                onClick={handleDelete}
                disabled={
                  saving || deleting
                }
                sx={{
                  borderRadius: 2.2,
                  fontWeight: 900,
                  mr: "auto",
                }}
              >
                Delete
              </Button>

              <Button
                onClick={closeDetails}
                disabled={
                  saving || deleting
                }
                sx={{
                  borderRadius: 2.2,
                  color: "#555",
                  fontWeight: 800,
                }}
              >
                Close
              </Button>

              <Button
                variant="contained"
                onClick={
                  handleUpdateStatus
                }
                disabled={
                  saving || deleting
                }
                startIcon={
                  saving ? (
                    <CircularProgress
                      size={17}
                      sx={{
                        color: "#555",
                      }}
                    />
                  ) : (
                    <AssignmentRounded />
                  )
                }
                sx={{
                  minHeight: 42,
                  borderRadius: 2.2,
                  bgcolor: "#F4C430",
                  color: "#111",
                  fontWeight: 900,
                  "&:hover": {
                    bgcolor: "#E5B500",
                  },
                }}
              >
                {saving
                  ? "Updating..."
                  : "Update Status"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Requests;