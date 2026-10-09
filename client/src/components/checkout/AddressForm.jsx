// Glyrus — AddressForm.jsx
import React from "react";
import {
  HomeRounded,
  LocationCityRounded,
  PinDropRounded,
} from "@mui/icons-material";
import {
  Box,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const AddressForm = ({
  address = {},
  onChange,
  errors = {},
}) => {
  const values = {
    name: address.name || "",
    email: address.email || "",
    mobile: address.mobile || "",
    house: address.house || address.houseFlat || "",
    street: address.street || "",
    area: address.area || "",
    city: address.city || "",
    state: address.state || "",
    pincode: address.pincode || "",
  };

  const updateField = (field) => (event) => {
    const value = event.target.value;

    if (typeof onChange === "function") {
      onChange({
        ...values,
        [field]: value,
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
          sm: 2.3,
          md: 2.8,
        },
        borderRadius: {
          xs: "17px",
          sm: "21px",
          md: "24px",
        },
        border: "1px solid rgba(17,17,17,0.07)",
        backgroundColor: "#FFFFFF",
        boxShadow:
          "0 10px 32px rgba(17,17,17,0.055)",
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={{
          xs: 1.1,
          sm: 1.4,
        }}
      >
        <Box
          sx={{
            width: {
              xs: 40,
              sm: 46,
            },
            height: {
              xs: 40,
              sm: 46,
            },
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            borderRadius: {
              xs: "11px",
              sm: "13px",
            },
            color: "#111111",
            background:
              "linear-gradient(135deg, #FFD900 0%, #F1AA00 100%)",
          }}
        >
          <HomeRounded
            sx={{
              fontSize: {
                xs: 20,
                sm: 24,
              },
            }}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="h2"
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
            Delivery Details
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
            Enter the details where you want your order delivered.
          </Typography>
        </Box>
      </Stack>

      {/* Customer Information */}
      <Box sx={{ mt: { xs: 2.2, sm: 2.7, md: 3 } }}>
        <Typography
          sx={{
            mb: {
              xs: 1.2,
              sm: 1.5,
            },
            color: "#252525",
            fontSize: {
              xs: 12.5,
              sm: 13.5,
            },
            fontWeight: 800,
          }}
        >
          Customer Information
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
            },
            gap: {
              xs: 1.4,
              sm: 1.7,
            },
          }}
        >
          <TextField
            fullWidth
            label="Full Name"
            placeholder="Enter your full name"
            value={values.name}
            onChange={updateField("name")}
            error={Boolean(errors.name)}
            helperText={errors.name}
            autoComplete="name"
            sx={fieldStyles}
          />

          <TextField
            fullWidth
            type="email"
            label="Email Address"
            placeholder="you@example.com"
            value={values.email}
            onChange={updateField("email")}
            error={Boolean(errors.email)}
            helperText={errors.email}
            autoComplete="email"
            sx={fieldStyles}
          />

          <TextField
            fullWidth
            label="Mobile Number"
            placeholder="10-digit mobile number"
            value={values.mobile}
            onChange={(event) => {
              const value = event.target.value
                .replace(/\D/g, "")
                .slice(0, 10);

              if (typeof onChange === "function") {
                onChange({
                  ...values,
                  mobile: value,
                });
              }
            }}
            error={Boolean(errors.mobile)}
            helperText={errors.mobile}
            inputProps={{
              inputMode: "numeric",
              maxLength: 10,
            }}
            autoComplete="tel"
            sx={fieldStyles}
          />
        </Box>
      </Box>

      {/* Address */}
      <Box sx={{ mt: { xs: 2.3, sm: 2.8, md: 3.2 } }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.8}
          sx={{
            mb: {
              xs: 1.2,
              sm: 1.5,
            },
          }}
        >
          <PinDropRounded
            sx={{
              color: "#C28B00",
              fontSize: {
                xs: 18,
                sm: 20,
              },
            }}
          />

          <Typography
            sx={{
              color: "#252525",
              fontSize: {
                xs: 12.5,
                sm: 13.5,
              },
              fontWeight: 800,
            }}
          >
            Delivery Address
          </Typography>
        </Stack>

        <Stack
          spacing={{
            xs: 1.4,
            sm: 1.7,
          }}
        >
          <TextField
            fullWidth
            label="House / Flat / Building"
            placeholder="House no., flat no. or building name"
            value={values.house}
            onChange={updateField("house")}
            error={Boolean(errors.house)}
            helperText={errors.house}
            autoComplete="street-address"
            sx={fieldStyles}
          />

          <TextField
            fullWidth
            label="Street / Road"
            placeholder="Street or road name"
            value={values.street}
            onChange={updateField("street")}
            error={Boolean(errors.street)}
            helperText={errors.street}
            sx={fieldStyles}
          />

          <TextField
            fullWidth
            label="Area / Locality"
            placeholder="Area, locality or landmark"
            value={values.area}
            onChange={updateField("area")}
            error={Boolean(errors.area)}
            helperText={errors.area}
            sx={fieldStyles}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: {
                xs: 1.4,
                sm: 1.7,
              },
            }}
          >
            <TextField
              fullWidth
              label="City"
              placeholder="Enter city"
              value={values.city}
              onChange={updateField("city")}
              error={Boolean(errors.city)}
              helperText={errors.city}
              autoComplete="address-level2"
              sx={fieldStyles}
            />

            <TextField
              fullWidth
              select
              label="State"
              value={values.state}
              onChange={updateField("state")}
              error={Boolean(errors.state)}
              helperText={errors.state}
              autoComplete="address-level1"
              sx={fieldStyles}
            >
              <MenuItem value="">
                Select state
              </MenuItem>

              {INDIAN_STATES.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField
            fullWidth
            label="Pincode"
            placeholder="6-digit pincode"
            value={values.pincode}
            onChange={(event) => {
              const value = event.target.value
                .replace(/\D/g, "")
                .slice(0, 6);

              if (typeof onChange === "function") {
                onChange({
                  ...values,
                  pincode: value,
                });
              }
            }}
            error={Boolean(errors.pincode)}
            helperText={errors.pincode}
            inputProps={{
              inputMode: "numeric",
              maxLength: 6,
            }}
            autoComplete="postal-code"
            sx={fieldStyles}
          />
        </Stack>
      </Box>

      {/* Address Preview */}
      {Object.values(values).some(
        (value) =>
          typeof value === "string" &&
          value.trim()
      ) && (
        <Box
          sx={{
            mt: {
              xs: 2,
              sm: 2.5,
            },
            p: {
              xs: 1.3,
              sm: 1.6,
            },
            borderRadius: {
              xs: "12px",
              sm: "14px",
            },
            backgroundColor: "#FAFAFA",
            border:
              "1px solid rgba(17,17,17,0.06)",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.8}
          >
            <LocationCityRounded
              sx={{
                color: "#C28B00",
                fontSize: {
                  xs: 17,
                  sm: 19,
                },
              }}
            />

            <Typography
              sx={{
                color: "#333333",
                fontSize: {
                  xs: 10.5,
                  sm: 11.5,
                },
                fontWeight: 750,
              }}
            >
              Delivery information
            </Typography>
          </Stack>

          <Typography
            sx={{
              mt: 0.65,
              color: "#777777",
              fontSize: {
                xs: 10,
                sm: 11,
              },
              lineHeight: 1.55,
              wordBreak: "break-word",
            }}
          >
            {[
              values.house,
              values.street,
              values.area,
              values.city,
              values.state,
              values.pincode,
            ]
              .filter(Boolean)
              .join(", ")}
          </Typography>
        </Box>
      )}
    </MotionBox>
  );
};

const fieldStyles = {
  minWidth: 0,

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
      borderColor: "#E3A600",
      borderWidth: 1.5,
    },
  },

  "& .MuiFormHelperText-root": {
    mx: 0.3,
    mt: 0.5,
    fontSize: {
      xs: 9.5,
      sm: 10.5,
    },
    lineHeight: 1.35,
  },
};

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export default AddressForm;