import React from "react";
import {
  Box,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  AssignmentReturnRounded,
  CancelRounded,
  CheckCircleRounded,
} from "@mui/icons-material";

const RefundPolicy = () => {
  return (
    <Box
      sx={{
        bgcolor: "#FAFAFA",
        minHeight: "70vh",
        py: { xs: 5, sm: 7, md: 9 },
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.2, sm: 4, md: 5.5 },
            borderRadius: { xs: "18px", sm: "24px" },
            border: "1px solid rgba(17,17,17,.07)",
            boxShadow: "0 12px 40px rgba(0,0,0,.05)",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: "13px",
                display: "grid",
                placeItems: "center",
                bgcolor: "#FFD000",
                color: "#111",
              }}
            >
              <AssignmentReturnRounded />
            </Box>

            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: 25, sm: 32 },
                }}
              >
                Refund & Cancellation
              </Typography>

              <Typography
                sx={{
                  color: "#777",
                  fontSize: 12,
                  mt: 0.3,
                }}
              >
                Last updated: October 2026
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Notice
            icon={<CancelRounded />}
            title="Order Cancellation"
          >
            Cancellation requests should be submitted as soon as possible.
            Once an order has been processed or shipped, cancellation may
            no longer be possible.
          </Notice>

          <Notice
            icon={<CheckCircleRounded />}
            title="Refund Eligibility"
          >
            Refunds may be considered for eligible situations such as
            approved cancellations, payment issues, or qualifying product
            problems.
          </Notice>

          <Section title="1. Cancellation Before Processing">
            If an order has not yet entered processing, a cancellation
            request may be accepted. Approval depends on the current order
            status.
          </Section>

          <Section title="2. Cancellation After Shipping">
            Once an order has been shipped, cancellation may not be
            available. Customers may need to follow the applicable return or
            resolution process instead.
          </Section>

          <Section title="3. Damaged or Incorrect Product">
            If you receive a damaged or incorrect product, contact support
            with your order details and relevant photographs or other
            evidence as soon as reasonably possible.
          </Section>

          <Section title="4. Refund Processing">
            Once a refund is approved, the refund will generally be
            processed through the applicable payment method or payment
            provider. Processing time may depend on the payment provider or
            banking system.
          </Section>

          <Section title="5. Non-Refundable Situations">
            Refunds may not be available for products that have been
            customized, damaged after delivery due to customer handling, or
            cases where the applicable return or cancellation conditions are
            not satisfied.
          </Section>

          <Section title="6. COD Orders">
            For Cash on Delivery orders, any applicable advance payment,
            COD charge, or refund amount will be handled according to the
            final order status and applicable refund decision.
          </Section>

          <Section title="7. How to Contact Us">
            To request cancellation, refund, or order assistance, contact
            Glyrus with your order number and the reason for your request.
          </Section>
        </Paper>
      </Container>
    </Box>
  );
};

const Notice = ({ icon, title, children }) => (
  <Box
    sx={{
      display: "flex",
      gap: 1.5,
      p: { xs: 1.5, sm: 2 },
      mb: 2,
      borderRadius: "14px",
      bgcolor: "#FFFBEA",
      border: "1px solid rgba(255,208,0,.25)",
    }}
  >
    <Box
      sx={{
        flexShrink: 0,
        width: 38,
        height: 38,
        display: "grid",
        placeItems: "center",
        borderRadius: "10px",
        bgcolor: "#FFD000",
        color: "#111",
      }}
    >
      {icon}
    </Box>

    <Box>
      <Typography
        sx={{
          fontWeight: 850,
          fontSize: 14,
          mb: 0.3,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          color: "#666",
          fontSize: 12.5,
          lineHeight: 1.7,
        }}
      >
        {children}
      </Typography>
    </Box>
  </Box>
);

const Section = ({ title, children }) => (
  <Box sx={{ mb: 3 }}>
    <Typography
      sx={{
        fontWeight: 850,
        fontSize: { xs: 16, sm: 18 },
        color: "#111",
        mb: 0.8,
      }}
    >
      {title}
    </Typography>

    <Typography
      sx={{
        color: "#666",
        fontSize: { xs: 13, sm: 14 },
        lineHeight: 1.8,
      }}
    >
      {children}
    </Typography>
  </Box>
);

export default RefundPolicy;