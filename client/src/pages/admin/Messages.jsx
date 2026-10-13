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
  CloseRounded,
  DeleteOutlineRounded,
  EmailRounded,
  MarkEmailReadRounded,
  MessageRounded,
  PhoneRounded,
  ReplyRounded,
  SearchRounded,
  VisibilityRounded,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";

const MotionCard = motion(Card);

const MESSAGE_STATUSES = ["New", "Read", "Replied", "Resolved"];

const getMessagesData = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.messages)) return data.messages;
  if (Array.isArray(data?.data?.messages)) return data.data.messages;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getName = (message) =>
  message?.name || message?.customerName || "Unknown Customer";

const getEmail = (message) => message?.email || message?.customerEmail || "—";

const getMobile = (message) =>
  message?.mobile || message?.phone || message?.mobileNumber || "—";

const getSubject = (message) =>
  message?.subject || message?.title || "Contact Message";

const getMessageText = (message) =>
  message?.message ||
  message?.content ||
  message?.description ||
  "No message content.";

const getStatus = (message) => message?.status || "New";

const getStatusStyles = (status) => {
  const value = String(status || "")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

  if (value === "resolved") {
    return { color: "#287A3E", bgcolor: "#EAF7EE" };
  }

  if (value === "replied") {
    return { color: "#1D5FA7", bgcolor: "#EAF3FC" };
  }

  if (value === "read") {
    return { color: "#666666", bgcolor: "#F1F1F1" };
  }

  return { color: "#876600", bgcolor: "#FFF7D8" };
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

const panelSx = {
  border: "1px solid #EAEAEA",
  borderRadius: 1.5,
  bgcolor: "#FFFFFF",
  boxShadow: "0 2px 10px rgba(0,0,0,0.025)",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.2,
    bgcolor: "#FAFAFA",
    fontSize: { xs: "0.78rem", sm: "0.84rem" },
    "& fieldset": { borderColor: "#E8E8E8" },
    "&:hover fieldset": { borderColor: "#D3B33E" },
    "&.Mui-focused fieldset": {
      borderColor: "#B99316",
      borderWidth: 1,
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: { xs: "0.78rem", sm: "0.84rem" },
  },
};

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("New");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/admin/messages");
      setMessages(getMessagesData(response?.data));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load messages.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase();

    return messages.filter((message) => {
      const status = getStatus(message);

      const matchesStatus =
        statusFilter === "All" ||
        String(status).toLowerCase() === statusFilter.toLowerCase();

      if (!matchesStatus) return false;
      if (!query) return true;

      return [
        getName(message),
        getEmail(message),
        getMobile(message),
        getSubject(message),
        getMessageText(message),
      ].some((value) => String(value).toLowerCase().includes(query));
    });
  }, [messages, search, statusFilter]);

  const newCount = messages.filter(
    (message) => String(getStatus(message)).toLowerCase() === "new",
  ).length;

  const readCount = messages.filter(
    (message) => String(getStatus(message)).toLowerCase() === "read",
  ).length;

  const repliedCount = messages.filter(
    (message) => String(getStatus(message)).toLowerCase() === "replied",
  ).length;

  const openDetails = (message) => {
    setSelectedMessage(message);
    setSelectedStatus(getStatus(message));
    setError("");
    setSuccess("");
  };

  const closeDetails = () => {
    if (saving || deleting) return;
    setSelectedMessage(null);
  };

  const handleUpdateStatus = async () => {
    if (!selectedMessage) return;

    const messageId = selectedMessage?._id || selectedMessage?.id;

    if (!messageId) {
      setError("Message ID is missing.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.put(`/api/admin/messages/${messageId}`, {
        status: selectedStatus,
      });

      const updated =
        response?.data?.message ||
        response?.data?.data?.message ||
        response?.data?.data;

      setMessages((previous) =>
        previous.map((message) => {
          const id = message?._id || message?.id;

          if (String(id) !== String(messageId)) return message;

          return updated || { ...message, status: selectedStatus };
        }),
      );

      setSelectedMessage((previous) =>
        previous
          ? updated || { ...previous, status: selectedStatus }
          : previous,
      );

      setSuccess("Message status updated successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to update message.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMessage) return;

    const messageId = selectedMessage?._id || selectedMessage?.id;

    if (!messageId) {
      setError("Message ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this message?",
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await api.delete(`/api/admin/messages/${messageId}`);

      setMessages((previous) =>
        previous.filter((message) => {
          const id = message?._id || message?.id;
          return String(id) !== String(messageId);
        }),
      );

      setSelectedMessage(null);
      setSuccess("Message deleted successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to delete message.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleReply = (message) => {
    const email = getEmail(message);

    if (!email || email === "—") {
      setError("This message does not contain a valid email address.");
      return;
    }

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      `Re: ${getSubject(message)}`,
    )}`;
  };

  const stats = [
    {
      label: "TOTAL MESSAGES",
      value: messages.length,
      icon: <MessageRounded />,
      color: "#A17B00",
      bg: "#FFF6D5",
    },
    {
      label: "NEW",
      value: newCount,
      icon: <EmailRounded />,
      color: "#A17B00",
      bg: "#FFF6D5",
    },
    {
      label: "READ",
      value: readCount,
      icon: <MarkEmailReadRounded />,
      color: "#555555",
      bg: "#F1F1F1",
    },
    {
      label: "REPLIED",
      value: repliedCount,
      icon: <ReplyRounded />,
      color: "#1D5FA7",
      bg: "#EAF3FC",
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        pb: { xs: 2, sm: 3, md: 4 },
        color: "#151515",
      }}
    >
      <Stack
        direction="row"
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: { xs: 2, sm: 2.5 } }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: { xs: "1.35rem", sm: "1.7rem", md: "2rem" },
              fontWeight: 900,
              letterSpacing: "-0.045em",
              lineHeight: 1.2,
            }}
          >
            Messages
          </Typography>
          <Typography
            sx={{
              mt: 0.5,
              color: "#858585",
              fontSize: { xs: "0.7rem", sm: "0.8rem" },
              lineHeight: 1.5,
            }}
          >
            Manage customer messages and replies.
          </Typography>
        </Box>

        <Chip
          icon={<MessageRounded />}
          label={`${messages.length} Messages`}
          sx={{
            flexShrink: 0,
            height: { xs: 29, sm: 34 },
            borderRadius: 1,
            bgcolor: "#FFF6D5",
            color: "#806200",
            fontWeight: 800,
            fontSize: { xs: "0.65rem", sm: "0.75rem" },
            "& .MuiChip-icon": {
              color: "#A17B00",
              fontSize: { xs: 15, sm: 18 },
            },
          }}
        />
      </Stack>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <Alert
              severity="error"
              onClose={() => setError("")}
              sx={{
                mb: 1.5,
                borderRadius: 1,
                fontSize: "0.78rem",
                py: 0.25,
              }}
            >
              {error}
            </Alert>
          </motion.div>
        )}

        {success && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <Alert
              severity="success"
              onClose={() => setSuccess("")}
              sx={{
                mb: 1.5,
                borderRadius: 1,
                fontSize: "0.78rem",
                py: 0.25,
              }}
            >
              {success}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(4, minmax(0, 1fr))",
          },
          gap: { xs: 1, sm: 1.4 },
          mb: 2,
        }}
      >
        {stats.map((item, index) => (
          <MotionCard
            key={item.label}
            elevation={0}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: index * 0.055 }}
            whileHover={{ y: -2 }}
            sx={{
              ...panelSx,
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <CardContent
              sx={{
                p: { xs: 1.2, sm: 1.6, md: 1.8 },
                "&:last-child": { pb: { xs: 1.2, sm: 1.6, md: 1.8 } },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: { xs: 32, sm: 38 },
                    height: { xs: 32, sm: 38 },
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 1,
                    bgcolor: item.bg,
                    color: item.color,
                    "& svg": { fontSize: { xs: 17, sm: 20 } },
                  }}
                >
                  {item.icon}
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: { xs: "0.56rem", sm: "0.65rem" },
                      fontWeight: 800,
                      color: "#898989",
                      letterSpacing: "0.025em",
                      lineHeight: 1.35,
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.25,
                      fontSize: { xs: "1.2rem", sm: "1.45rem" },
                      fontWeight: 900,
                      letterSpacing: "-0.04em",
                      lineHeight: 1.1,
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

      <Card elevation={0} sx={{ ...panelSx, overflow: "hidden" }}>
        <CardContent
          sx={{
            p: { xs: 1.2, sm: 1.8, md: 2.2 },
            "&:last-child": {
              pb: { xs: 1.2, sm: 1.8, md: 2.2 },
            },
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ mb: 1.8 }}
          >
            <TextField
              fullWidth
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search messages..."
              size="small"
              sx={{
                ...fieldSx,
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  ...fieldSx["& .MuiOutlinedInput-root"],
                  height: 40,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded sx={{ color: "#929292", fontSize: 19 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              sx={{
                ...fieldSx,
                width: { xs: "100%", sm: 165 },
                flexShrink: 0,
                "& .MuiOutlinedInput-root": {
                  ...fieldSx["& .MuiOutlinedInput-root"],
                  height: 40,
                },
              }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              {MESSAGE_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {loading ? (
            <Box
              sx={{
                minHeight: 220,
                display: "grid",
                placeItems: "center",
              }}
            >
              <CircularProgress size={30} sx={{ color: "#D2AA24" }} />
            </Box>
          ) : filteredMessages.length === 0 ? (
            <Box
              sx={{
                minHeight: 220,
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                px: 2,
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    display: "grid",
                    placeItems: "center",
                    mx: "auto",
                    mb: 1,
                    borderRadius: 1,
                    bgcolor: "#F5F5F5",
                    color: "#A5A5A5",
                  }}
                >
                  <MessageRounded sx={{ fontSize: 24 }} />
                </Box>
                <Typography sx={{ fontWeight: 850, fontSize: "0.9rem" }}>
                  No messages found
                </Typography>
                <Typography
                  sx={{ mt: 0.4, fontSize: "0.73rem", color: "#929292" }}
                >
                  Try changing the search or status filter.
                </Typography>
              </Box>
            </Box>
          ) : (
            <Stack spacing={1}>
              <AnimatePresence initial={false}>
                {filteredMessages.map((message, index) => {
                  const name = getName(message);
                  const email = getEmail(message);
                  const mobile = getMobile(message);
                  const subject = getSubject(message);
                  const status = getStatus(message);
                  const statusStyle = getStatusStyles(status);

                  return (
                    <MotionCard
                      layout
                      key={message?._id || message?.id || index}
                      elevation={0}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.22 }}
                      sx={{
                        border: "1px solid #EAEAEA",
                        borderRadius: 1.2,
                        overflow: "hidden",
                        minWidth: 0,
                        transition:
                          "border-color 180ms ease, box-shadow 180ms ease",
                        "&:hover": {
                          borderColor: "#DCC36F",
                          boxShadow: "0 5px 18px rgba(0,0,0,0.035)",
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          p: { xs: 1.2, sm: 1.6, md: 1.8 },
                          "&:last-child": {
                            pb: { xs: 1.2, sm: 1.6, md: 1.8 },
                          },
                        }}
                      >
                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          spacing={{ xs: 1.2, md: 2 }}
                          alignItems={{ xs: "stretch", md: "center" }}
                        >
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="flex-start"
                            >
                              <Box
                                sx={{
                                  width: 35,
                                  height: 35,
                                  flexShrink: 0,
                                  display: "grid",
                                  placeItems: "center",
                                  borderRadius: 1,
                                  bgcolor: "#151515",
                                  color: "#F4C430",
                                }}
                              >
                                <MessageRounded sx={{ fontSize: 18 }} />
                              </Box>

                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Stack
                                  direction="row"
                                  alignItems="flex-start"
                                  justifyContent="space-between"
                                  spacing={1}
                                  sx={{ minWidth: 0 }}
                                >
                                  <Typography
                                    sx={{
                                      minWidth: 0,
                                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                                      fontWeight: 850,
                                      lineHeight: 1.4,
                                      overflowWrap: "anywhere",
                                    }}
                                  >
                                    {subject}
                                  </Typography>
                                  <Chip
                                    size="small"
                                    label={status}
                                    sx={{
                                      height: 22,
                                      flexShrink: 0,
                                      borderRadius: 0.8,
                                      fontSize: "0.59rem",
                                      fontWeight: 850,
                                      color: statusStyle.color,
                                      bgcolor: statusStyle.bgcolor,
                                      "& .MuiChip-label": { px: 0.8 },
                                    }}
                                  />
                                </Stack>

                                <Typography
                                  sx={{
                                    mt: 0.35,
                                    fontSize: { xs: "0.7rem", sm: "0.76rem" },
                                    fontWeight: 750,
                                    color: "#4D4D4D",
                                  }}
                                >
                                  {name}
                                </Typography>

                                <Stack
                                  direction={{ xs: "column", sm: "row" }}
                                  spacing={{ xs: 0.4, sm: 1.5 }}
                                  sx={{ mt: 0.55, minWidth: 0 }}
                                >
                                  <Stack
                                    direction="row"
                                    spacing={0.5}
                                    alignItems="center"
                                    sx={{ minWidth: 0 }}
                                  >
                                    <EmailRounded
                                      sx={{
                                        fontSize: 13,
                                        color: "#999999",
                                        flexShrink: 0,
                                      }}
                                    />
                                    <Typography
                                      sx={{
                                        minWidth: 0,
                                        fontSize: "0.68rem",
                                        color: "#777777",
                                        overflowWrap: "anywhere",
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
                                        fontSize: 13,
                                        color: "#999999",
                                        flexShrink: 0,
                                      }}
                                    />
                                    <Typography
                                      sx={{
                                        fontSize: "0.68rem",
                                        color: "#777777",
                                        overflowWrap: "anywhere",
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
                                mt: 1.2,
                                p: { xs: 1, sm: 1.2 },
                                borderRadius: 0.8,
                                bgcolor: "#F8F8F8",
                                borderLeft: "2px solid #E2C45D",
                              }}
                            >
                              <Typography
                                sx={{
                                  mb: 0.35,
                                  fontSize: "0.58rem",
                                  color: "#909090",
                                  fontWeight: 900,
                                  letterSpacing: "0.07em",
                                }}
                              >
                                MESSAGE
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                  color: "#555555",
                                  lineHeight: 1.6,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  overflowWrap: "anywhere",
                                }}
                              >
                                {getMessageText(message)}
                              </Typography>
                            </Box>
                          </Box>

                          <Stack
                            direction={{ xs: "row", md: "column" }}
                            alignItems={{ xs: "center", md: "stretch" }}
                            justifyContent="space-between"
                            spacing={0.8}
                            sx={{
                              flexShrink: 0,
                              minWidth: { md: 118 },
                              pt: { xs: 0.1, md: 0 },
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "0.64rem",
                                color: "#999999",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {formatDate(message?.createdAt)}
                            </Typography>

                            <Stack
                              direction="row"
                              spacing={0.6}
                              sx={{ width: { xs: "auto", md: "100%" } }}
                            >
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<VisibilityRounded />}
                                onClick={() => openDetails(message)}
                                sx={{
                                  minHeight: 32,
                                  px: { xs: 1, sm: 1.2 },
                                  borderRadius: 0.8,
                                  borderColor: "#DDDDDD",
                                  color: "#333333",
                                  fontSize: "0.68rem",
                                  fontWeight: 800,
                                  flex: { xs: 1, md: "unset" },
                                  "& .MuiButton-startIcon": {
                                    mr: 0.5,
                                    "& svg": { fontSize: 16 },
                                  },
                                  "&:hover": {
                                    borderColor: "#D6B63F",
                                    bgcolor: "#FFFBEB",
                                  },
                                }}
                              >
                                View
                              </Button>

                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<ReplyRounded />}
                                onClick={() => handleReply(message)}
                                sx={{
                                  minHeight: 32,
                                  px: { xs: 1, sm: 1.2 },
                                  borderRadius: 0.8,
                                  bgcolor: "#151515",
                                  color: "#FFFFFF",
                                  fontSize: "0.68rem",
                                  fontWeight: 800,
                                  flex: { xs: 1, md: "unset" },
                                  boxShadow: "none",
                                  "& .MuiButton-startIcon": {
                                    mr: 0.5,
                                    "& svg": { fontSize: 16 },
                                  },
                                  "&:hover": {
                                    bgcolor: "#333333",
                                    boxShadow: "none",
                                  },
                                }}
                              >
                                Reply
                              </Button>
                            </Stack>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </MotionCard>
                  );
                })}
              </AnimatePresence>
            </Stack>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(selectedMessage)}
        onClose={closeDetails}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        PaperProps={{
          sx: {
            width: { xs: "calc(100% - 20px)", sm: "100%" },
            maxWidth: "100%",
            maxHeight: { xs: "calc(100% - 20px)", sm: "calc(100% - 48px)" },
            m: { xs: 1.25, sm: 2 },
            borderRadius: { xs: 1.2, sm: 1.5 },
            overflow: "hidden",
          },
        }}
        TransitionComponent={motion.div}
      >
        {selectedMessage && (
          <>
            <DialogTitle
              sx={{
                p: { xs: 1.5, sm: 2 },
                bgcolor: "#151515",
                color: "#FFFFFF",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: { xs: "1rem", sm: "1.15rem" },
                      fontWeight: 900,
                      letterSpacing: "-0.025em",
                    }}
                  >
                    Message Details
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.35,
                      fontSize: { xs: "0.65rem", sm: "0.7rem" },
                      color: "#BDBDBD",
                      overflowWrap: "anywhere",
                    }}
                  >
                    Received {formatDateTime(selectedMessage?.createdAt)}
                  </Typography>
                </Box>

                <IconButton
                  onClick={closeDetails}
                  disabled={saving || deleting}
                  size="small"
                  sx={{
                    color: "#FFFFFF",
                    flexShrink: 0,
                    borderRadius: 1,
                    bgcolor: "rgba(255,255,255,0.09)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
                  }}
                >
                  <CloseRounded fontSize="small" />
                </IconButton>
              </Stack>
            </DialogTitle>

            <Divider />

            <DialogContent
              sx={{
                p: { xs: 1.5, sm: 2 },
                bgcolor: "#FFFFFF",
              }}
            >
              <Stack spacing={1.5}>
                <Box
                  sx={{
                    p: { xs: 1.3, sm: 1.6 },
                    borderRadius: 1,
                    bgcolor: "#151515",
                    borderLeft: "3px solid #F4C430",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.6rem",
                      color: "#B5B5B5",
                      fontWeight: 850,
                      letterSpacing: "0.08em",
                    }}
                  >
                    SUBJECT
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.5,
                      color: "#FFFFFF",
                      fontWeight: 850,
                      fontSize: { xs: "0.85rem", sm: "0.95rem" },
                      overflowWrap: "anywhere",
                    }}
                  >
                    {getSubject(selectedMessage)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      p: 1.2,
                      border: "1px solid #EAEAEA",
                      borderRadius: 1,
                      bgcolor: "#FAFAFA",
                      minWidth: 0,
                    }}
                  >
                    <Stack direction="row" spacing={0.7} alignItems="center">
                      <EmailRounded sx={{ fontSize: 16, color: "#858585" }} />
                      <Typography
                        sx={{
                          fontSize: "0.62rem",
                          color: "#888888",
                          fontWeight: 850,
                        }}
                      >
                        EMAIL
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{
                        mt: 0.7,
                        fontSize: "0.74rem",
                        color: "#333333",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {getEmail(selectedMessage)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 1.2,
                      border: "1px solid #EAEAEA",
                      borderRadius: 1,
                      bgcolor: "#FAFAFA",
                      minWidth: 0,
                    }}
                  >
                    <Stack direction="row" spacing={0.7} alignItems="center">
                      <PhoneRounded sx={{ fontSize: 16, color: "#858585" }} />
                      <Typography
                        sx={{
                          fontSize: "0.62rem",
                          color: "#888888",
                          fontWeight: 850,
                        }}
                      >
                        MOBILE
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{
                        mt: 0.7,
                        fontSize: "0.74rem",
                        color: "#333333",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {getMobile(selectedMessage)}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      mb: 0.7,
                      fontSize: "0.64rem",
                      color: "#888888",
                      fontWeight: 900,
                      letterSpacing: "0.06em",
                    }}
                  >
                    MESSAGE
                  </Typography>
                  <Box
                    sx={{
                      p: { xs: 1.2, sm: 1.5 },
                      border: "1px solid #EAEAEA",
                      borderRadius: 1,
                      bgcolor: "#FAFAFA",
                      maxHeight: { xs: 200, sm: 260 },
                      overflowY: "auto",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: "0.76rem", sm: "0.8rem" },
                        color: "#444444",
                        lineHeight: 1.75,
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {getMessageText(selectedMessage)}
                    </Typography>
                  </Box>
                </Box>

                <TextField
                  fullWidth
                  select
                  label="Message Status"
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                  disabled={saving || deleting}
                  sx={fieldSx}
                >
                  {MESSAGE_STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </DialogContent>

            <Divider />

            <DialogActions
              sx={{
                p: { xs: 1.2, sm: 1.6 },
                gap: 0.7,
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              <Button
                color="error"
                variant="outlined"
                startIcon={
                  deleting ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <DeleteOutlineRounded />
                  )
                }
                onClick={handleDelete}
                disabled={saving || deleting}
                sx={{
                  mr: "auto",
                  minHeight: 34,
                  borderRadius: 0.8,
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  px: { xs: 1, sm: 1.4 },
                }}
              >
                Delete
              </Button>

              <Button
                variant="outlined"
                startIcon={<ReplyRounded />}
                onClick={() => handleReply(selectedMessage)}
                disabled={saving || deleting}
                sx={{
                  minHeight: 34,
                  borderRadius: 0.8,
                  borderColor: "#DDDDDD",
                  color: "#333333",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  px: { xs: 1, sm: 1.4 },
                  "&:hover": {
                    borderColor: "#D6B63F",
                    bgcolor: "#FFFBEB",
                  },
                }}
              >
                Reply
              </Button>

              <Button
                onClick={closeDetails}
                disabled={saving || deleting}
                sx={{
                  minHeight: 34,
                  borderRadius: 0.8,
                  color: "#555555",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  px: { xs: 1, sm: 1.4 },
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
                    <CircularProgress size={15} color="inherit" />
                  ) : (
                    <MarkEmailReadRounded />
                  )
                }
                sx={{
                  minHeight: 34,
                  borderRadius: 0.8,
                  bgcolor: "#F4C430",
                  color: "#151515",
                  fontSize: "0.7rem",
                  fontWeight: 900,
                  px: { xs: 1.1, sm: 1.5 },
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#E5B500",
                    boxShadow: "none",
                  },
                }}
              >
                {saving ? "Updating..." : "Update Status"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Messages;
