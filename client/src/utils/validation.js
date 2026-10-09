// Glyrus — validation.js
export const isRequired = (value) => {
  return String(value ?? "").trim().length > 0;
};

export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email ?? "").trim()
  );
};

export const isValidMobile = (mobile) => {
  return /^[6-9]\d{9}$/.test(
    String(mobile ?? "").trim()
  );
};

export const isValidPincode = (pincode) => {
  return /^\d{6}$/.test(
    String(pincode ?? "").trim()
  );
};

export const isValidUrl = (url) => {
  try {
    const value = String(url ?? "").trim();

    if (!value) return false;

    const parsed = new URL(value);

    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export const validateRequiredFields = (
  values = {},
  fields = []
) => {
  const errors = {};

  fields.forEach((field) => {
    const value = values?.[field];

    if (!isRequired(value)) {
      errors[field] = `${formatFieldName(field)} is required`;
    }
  });

  return errors;
};

export const validateEmailField = (
  value,
  fieldName = "email"
) => {
  if (!isRequired(value)) {
    return `${formatFieldName(fieldName)} is required`;
  }

  if (!isValidEmail(value)) {
    return "Enter a valid email address";
  }

  return "";
};

export const validateMobileField = (
  value,
  fieldName = "mobile"
) => {
  if (!isRequired(value)) {
    return `${formatFieldName(fieldName)} is required`;
  }

  if (!isValidMobile(value)) {
    return "Enter a valid 10-digit mobile number";
  }

  return "";
};

export const validatePincodeField = (
  value,
  fieldName = "pincode"
) => {
  if (!isRequired(value)) {
    return `${formatFieldName(fieldName)} is required`;
  }

  if (!isValidPincode(value)) {
    return "Enter a valid 6-digit pincode";
  }

  return "";
};

export const validateAddress = (address = {}) => {
  const errors = {};

  const requiredFields = [
    "name",
    "email",
    "mobile",
    "houseFlat",
    "street",
    "area",
    "city",
    "state",
    "pincode",
  ];

  requiredFields.forEach((field) => {
    if (!isRequired(address[field])) {
      errors[field] = `${formatFieldName(field)} is required`;
    }
  });

  if (
    isRequired(address.email) &&
    !isValidEmail(address.email)
  ) {
    errors.email = "Enter a valid email address";
  }

  if (
    isRequired(address.mobile) &&
    !isValidMobile(address.mobile)
  ) {
    errors.mobile = "Enter a valid 10-digit mobile number";
  }

  if (
    isRequired(address.pincode) &&
    !isValidPincode(address.pincode)
  ) {
    errors.pincode = "Enter a valid 6-digit pincode";
  }

  return errors;
};

export const validateContactForm = (values = {}) => {
  const errors = {};

  if (!isRequired(values.name)) {
    errors.name = "Name is required";
  }

  if (!isRequired(values.email)) {
    errors.email = "Email is required";
  } else if (!isValidEmail(values.email)) {
    errors.email = "Enter a valid email address";
  }

  if (values.mobile && !isValidMobile(values.mobile)) {
    errors.mobile = "Enter a valid 10-digit mobile number";
  }

  if (!isRequired(values.message)) {
    errors.message = "Message is required";
  }

  return errors;
};

export const validateRequestForm = (values = {}) => {
  const errors = {};

  if (!isRequired(values.name)) {
    errors.name = "Name is required";
  }

  if (!isRequired(values.email)) {
    errors.email = "Email is required";
  } else if (!isValidEmail(values.email)) {
    errors.email = "Enter a valid email address";
  }

  if (!isRequired(values.mobile)) {
    errors.mobile = "Mobile number is required";
  } else if (!isValidMobile(values.mobile)) {
    errors.mobile = "Enter a valid 10-digit mobile number";
  }

  if (!isRequired(values.requirement)) {
    errors.requirement = "Please describe what you need";
  }

  return errors;
};

export const validateProduct = (product = {}) => {
  const errors = {};

  if (!isRequired(product.name || product.title)) {
    errors.name = "Product name is required";
  }

  if (!isRequired(product.description)) {
    errors.description = "Product description is required";
  }

  const price = Number(product.price);

  if (
    product.price === undefined ||
    product.price === null ||
    product.price === ""
  ) {
    errors.price = "Price is required";
  } else if (!Number.isFinite(price) || price < 0) {
    errors.price = "Enter a valid price";
  }

  if (
    product.discountPrice !== undefined &&
    product.discountPrice !== null &&
    product.discountPrice !== ""
  ) {
    const discountPrice = Number(product.discountPrice);

    if (
      !Number.isFinite(discountPrice) ||
      discountPrice < 0
    ) {
      errors.discountPrice = "Enter a valid discount price";
    }
  }

  return errors;
};

export const formatFieldName = (fieldName = "") => {
  return String(fieldName)
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (character) => character.toUpperCase());
};

export default {
  isRequired,
  isValidEmail,
  isValidMobile,
  isValidPincode,
  isValidUrl,
  validateRequiredFields,
  validateEmailField,
  validateMobileField,
  validatePincodeField,
  validateAddress,
  validateContactForm,
  validateRequestForm,
  validateProduct,
  formatFieldName,
};