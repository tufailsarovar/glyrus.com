// Glyrus — ProductCustomization.jsx
import React from "react";
import {
  CheckCircleRounded,
  PaletteRounded,
  TextFieldsRounded,
} from "@mui/icons-material";
import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const ProductCustomization = ({
  customization = {},
  onChange,
  errors = {},
}) => {
  const values = {
    businessName: customization.businessName || "",
    logoText: customization.logoText || "",
    color: customization.color || "",
    customText: customization.customText || "",
    notes: customization.notes || "",
  };

  const handleChange = (field) => (event) => {
    if (typeof onChange === "function") {
      onChange({
        ...values,
        [field]: event.target.value,
      });
    }
  };

  return (
    <MotionBox
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
      }}
      sx={{
        width: "100%",
        minWidth: 0,
        p: {
          xs: 1.7,
          sm: 2.2,
          md: 2.8,
        },
        borderRadius: {
          xs: "17px",
          sm: "21px",
          md: "24px",
        },
        border: "1px solid rgba(17,17,17,0.07)",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 10px 32px rgba(17,17,17,0.055)",
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        spacing={{
          xs: 1.1,
          sm: 1.4,
        }}
        alignItems="center"
      >
        <Box
          sx={{
            width: {
              xs: 40,
              sm: 45,
            },
            height: {
              xs: 40,
              sm: 45,
            },
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            borderRadius: {
              xs: "11px",
              sm: "13px",
            },
            color: "#111111",
            background: "linear-gradient(135deg, #FFD900 0%, #F1AA00 100%)",
          }}
        >
          <PaletteRounded
            sx={{
              fontSize: {
                xs: 20,
                sm: 23,
              },
            }}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="h3"
            sx={{
              color: "#171717",
              fontSize: {
                xs: 15,
                sm: 17,
                md: 18,
              },
              fontWeight: 850,
              lineHeight: 1.25,
            }}
          >
            Customize Your Product
          </Typography>

          <Typography
            sx={{
              mt: 0.3,
              color: "#7A7A7A",
              fontSize: {
                xs: 10.5,
                sm: 11.5,
                md: 12.5,
              },
              lineHeight: 1.5,
            }}
          >
            Add your business details and customization requirements.
          </Typography>
        </Box>
      </Stack>

      {/* Form */}
      <Stack
        spacing={{
          xs: 1.5,
          sm: 1.8,
          md: 2,
        }}
        sx={{
          mt: {
            xs: 2.2,
            sm: 2.6,
            md: 3,
          },
        }}
      >
        <TextField
          fullWidth
          label="Business Name"
          placeholder="Enter your business name"
          value={values.businessName}
          onChange={handleChange("businessName")}
          error={Boolean(errors.businessName)}
          helperText={
            errors.businessName || "Name that should appear on the product."
          }
          InputProps={{
            startAdornment: (
              <TextFieldsRounded
                sx={{
                  mr: 1,
                  color: "#B28A18",
                  fontSize: 20,
                }}
              />
            ),
          }}
          sx={fieldStyles}
        />

        <TextField
          fullWidth
          label="Logo / Brand Text"
          placeholder="e.g. Glyrus"
          value={values.logoText}
          onChange={handleChange("logoText")}
          error={Boolean(errors.logoText)}
          helperText={
            errors.logoText || "Optional brand name or text for customization."
          }
          sx={fieldStyles}
        />

        <FormControl fullWidth error={Boolean(errors.color)} sx={fieldStyles}>
          <InputLabel>Preferred Color</InputLabel>

          <Select
            value={values.color}
            label="Preferred Color"
            onChange={handleChange("color")}
          >
            <MenuItem value="">
              <em>Select a color</em>
            </MenuItem>
            <MenuItem value="Black">Black</MenuItem>
            <MenuItem value="White">White</MenuItem>
            <MenuItem value="Gold">Gold</MenuItem>
            <MenuItem value="Yellow">Yellow</MenuItem>
            <MenuItem value="Silver">Silver</MenuItem>
            <MenuItem value="Custom">Custom Color</MenuItem>
          </Select>

          <FormHelperText>
            {errors.color || "Choose the preferred product color."}
          </FormHelperText>
        </FormControl>

        <TextField
          fullWidth
          multiline
          minRows={3}
          maxRows={6}
          label="Custom Text"
          placeholder="Enter any text you want on the product"
          value={values.customText}
          onChange={handleChange("customText")}
          error={Boolean(errors.customText)}
          helperText={
            errors.customText || "Optional. Leave empty if not required."
          }
          sx={fieldStyles}
        />

        <TextField
          fullWidth
          multiline
          minRows={3}
          maxRows={7}
          label="Additional Requirements"
          placeholder="Tell us anything else about your customization..."
          value={values.notes}
          onChange={handleChange("notes")}
          error={Boolean(errors.notes)}
          helperText={
            errors.notes ||
            "Mention specific design, printing, or customization instructions."
          }
          sx={fieldStyles}
        />
      </Stack>

      {/* Confirmation */}
      <Box
        sx={{
          mt: {
            xs: 1.8,
            sm: 2.2,
          },
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          p: {
            xs: 1.2,
            sm: 1.5,
          },
          borderRadius: {
            xs: "12px",
            sm: "14px",
          },
          backgroundColor: "rgba(255,208,0,0.075)",
          border: "1px solid rgba(241,170,0,0.14)",
        }}
      >
        <CheckCircleRounded
          sx={{
            flexShrink: 0,
            mt: 0.05,
            color: "#D79A00",
            fontSize: {
              xs: 18,
              sm: 20,
            },
          }}
        />

        <Typography
          sx={{
            color: "#6E5A25",
            fontSize: {
              xs: 10.5,
              sm: 11.5,
              md: 12,
            },
            lineHeight: 1.55,
          }}
        >
          Please make sure your customization details are correct before placing
          the order.
        </Typography>
      </Box>
    </MotionBox>
  );
};

const fieldStyles = {
  "& .MuiInputLabel-root": {
    fontSize: {
      xs: 12,
      sm: 13,
    },
  },

  "& .MuiInputBase-root": {
    borderRadius: {
      xs: "11px",
      sm: "13px",
    },
    fontSize: {
      xs: 12,
      sm: 13,
    },
    backgroundColor: "#FFFFFF",
  },

  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "rgba(17,17,17,0.11)",
    },

    "&:hover fieldset": {
      borderColor: "rgba(17,17,17,0.22)",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#E5A800",
      borderWidth: 1.5,
    },
  },

  "& .MuiFormHelperText-root": {
    mx: 0.3,
    mt: 0.55,
    fontSize: {
      xs: 9.5,
      sm: 10.5,
    },
    lineHeight: 1.4,
  },
};

export default ProductCustomization;
