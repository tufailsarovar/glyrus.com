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
  LocalShippingRounded,
  LocationOnRounded,
  ScheduleRounded,
} from "@mui/icons-material";

const ShippingPolicy = () => {
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
              <LocalShippingRounded />
            </Box>

            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: 25, sm: 32 },
                }}
              >
                Shipping Policy
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

          <InfoCard
            icon={<ScheduleRounded />}
            title="Processing"
          >
            Orders are processed after successful order placement and
            payment confirmation where applicable.
          </InfoCard>

          <InfoCard
            icon={<LocalShippingRounded />}
            title="Shipping Charges"
          >
            Applicable shipping charges are displayed during checkout before
            the order is placed. Promotional or free-shipping conditions may
            apply to eligible orders.
          </InfoCard>

          <InfoCard
            icon={<LocationOnRounded />}
            title="Delivery Address"
          >
            Customers are responsible for providing a complete and accurate
            delivery address, including contact details required for
            successful delivery.
          </InfoCard>

          <Section title="1. Delivery Timeline">
            Estimated delivery times may vary depending on the destination,
            product availability, courier service, weekends, public
            holidays, and other operational conditions.
          </Section>

          <Section title="2. Tracking">
            Where tracking information is available, customers can use the
            tracking number provided after the order has been processed and
            shipped.
          </Section>

          <Section title="3. Delayed Deliveries">
            Although we work to deliver orders within the estimated period,
            delays can occur because of courier operations, weather,
            transportation issues, incorrect addresses, or circumstances
            outside our control.
          </Section>

          <Section title="4. Failed Delivery">
            If delivery cannot be completed because of an incorrect address,
            unavailable recipient, refusal, or repeated delivery attempts,
            additional action may be required before the order can be
            delivered again.
          </Section>

          <Section title="5. Damaged Package">
            If a package appears visibly damaged when delivered, customers
            should document the condition and contact support as soon as
            possible.
          </Section>

          <Section title="6. Contact">
            For shipping-related questions, please contact Glyrus through
            the support information available on the website.
          </Section>
        </Paper>
      </Container>
    </Box>
  );
};

const InfoCard = ({ icon, title, children }) => (
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

export default ShippingPolicy;