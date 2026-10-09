import React from "react";
import { Box, Container, Paper, Typography } from "@mui/material";

const PrivacyPolicy = () => {
  return (
    <Box
      sx={{
        minHeight: "70vh",
        backgroundColor: "#fafafa",
        py: { xs: 4, sm: 6 },
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 5 },
            borderRadius: { xs: 2, sm: 3 },
            border: "1px solid #eeeeee",
            backgroundColor: "#ffffff",
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 26, sm: 36 },
              fontWeight: 900,
              color: "#111111",
              mb: 1,
            }}
          >
            Privacy Policy
          </Typography>

          <Typography
            sx={{
              color: "#888888",
              fontSize: 12,
              mb: 3,
            }}
          >
            Last updated: October 2026
          </Typography>

          <Typography sx={{ color: "#555", lineHeight: 1.8, mb: 3 }}>
            At Glyrus, we respect your privacy and are committed to
            protecting the personal information you provide while using
            our website and services.
          </Typography>

          <PolicySection
            title="1. Information We Collect"
            text="We may collect your name, email address, phone number, delivery address, order details, and information submitted through our contact or request forms."
          />

          <PolicySection
            title="2. How We Use Your Information"
            text="Your information may be used to process orders, arrange delivery, provide customer support, communicate about your orders, respond to requests, improve our website, and maintain service security."
          />

          <PolicySection
            title="3. Payment Information"
            text="Payments may be processed through third-party payment providers. Glyrus does not intentionally store complete card, UPI, or other sensitive payment credentials on its own servers."
          />

          <PolicySection
            title="4. Cookies"
            text="Our website may use cookies or similar technologies to maintain functionality, improve the user experience, and understand how visitors interact with the website."
          />

          <PolicySection
            title="5. Data Protection"
            text="We take reasonable technical and organizational measures to protect information against unauthorized access, misuse, loss, or disclosure."
          />

          <PolicySection
            title="6. Third-Party Services"
            text="We may use trusted third-party services for payments, hosting, analytics, communication, shipping, and other operational requirements."
          />

          <PolicySection
            title="7. Your Rights"
            text="You may contact us regarding your personal information, request corrections, or ask questions about how your information is being used."
          />

          <PolicySection
            title="8. Policy Updates"
            text="We may update this Privacy Policy from time to time. Changes will be reflected on this page with an updated date."
          />

          <PolicySection
            title="9. Contact Us"
            text="For privacy-related questions, please contact Glyrus through the contact information provided on our website."
          />
        </Paper>
      </Container>
    </Box>
  );
};

const PolicySection = ({ title, text }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        component="h2"
        sx={{
          fontSize: { xs: 16, sm: 19 },
          fontWeight: 800,
          color: "#111111",
          mb: 0.8,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          fontSize: { xs: 13, sm: 14 },
          lineHeight: 1.8,
          color: "#666666",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

export default PrivacyPolicy;