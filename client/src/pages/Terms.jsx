import React from "react";
import {
  Box,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { GavelRounded } from "@mui/icons-material";

const Terms = () => {
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
              <GavelRounded />
            </Box>

            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: 25, sm: 32 },
                }}
              >
                Terms & Conditions
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

          <Typography paragraph>
            By accessing or using the Glyrus website, you agree to comply
            with these Terms & Conditions. Please read them carefully before
            placing an order.
          </Typography>

          <Section title="1. Use of Website">
            You agree to use this website only for lawful purposes and not
            to misuse, disrupt, damage, or attempt to gain unauthorized
            access to any part of the website or its services.
          </Section>

          <Section title="2. Products">
            Product descriptions, images, specifications, prices, and
            availability may be updated from time to time. We aim to keep
            product information accurate but do not guarantee that every
            displayed detail will always be error-free.
          </Section>

          <Section title="3. Orders">
            When you place an order, you are responsible for providing
            accurate contact and delivery information. Glyrus reserves the
            right to cancel or reject an order where necessary.
          </Section>

          <Section title="4. Pricing">
            Product prices are displayed on the website. Prices may change
            without prior notice. The price applicable at the time of a
            successfully placed order will generally apply to that order.
          </Section>

          <Section title="5. Payments">
            Payments may be processed through supported third-party payment
            providers. Customers must provide valid information required to
            complete the transaction.
          </Section>

          <Section title="6. Delivery">
            Delivery timelines are estimates and may be affected by
            location, courier operations, weather, holidays, or other
            circumstances outside our control.
          </Section>

          <Section title="7. Intellectual Property">
            Website content, branding, graphics, text, logos, designs, and
            other materials belonging to Glyrus may not be copied,
            reproduced, or commercially used without appropriate permission.
          </Section>

          <Section title="8. Limitation of Liability">
            Glyrus will make reasonable efforts to provide reliable services
            but will not be responsible for indirect losses caused by events
            beyond reasonable control.
          </Section>

          <Section title="9. Changes to Terms">
            We may update these Terms & Conditions when necessary. Continued
            use of the website after an update constitutes acceptance of the
            updated terms.
          </Section>

          <Section title="10. Contact">
            If you have questions regarding these Terms & Conditions, please
            contact Glyrus through the contact details available on our
            website.
          </Section>
        </Paper>
      </Container>
    </Box>
  );
};

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

export default Terms;