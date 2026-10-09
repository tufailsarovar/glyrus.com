// Glyrus — validators.js
const isNonEmptyString = (
  value,
  maxLength = 500
) =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.trim().length <= maxLength;

const isValidEmail = (email) =>
  typeof email === "string" &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email.trim()
  );

const isValidMobile = (mobile) =>
  typeof mobile === "string" &&
  /^[6-9]\d{9}$/.test(
    mobile.replace(/\s+/g, "")
  );

const isValidPincode = (pincode) =>
  typeof pincode === "string" &&
  /^\d{6}$/.test(
    pincode.trim()
  );

const isValidObjectId = (id) =>
  typeof id === "string" &&
  /^[a-f\d]{24}$/i.test(id);

const isPositiveNumber = (value) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= 0;

export const validateEmail = (email) => {
  if (!isValidEmail(email)) {
    return "Please provide a valid email address.";
  }

  return null;
};

export const validateMobile = (mobile) => {
  if (!isValidMobile(mobile)) {
    return "Please provide a valid 10-digit mobile number.";
  }

  return null;
};

export const validatePincode = (pincode) => {
  if (!isValidPincode(pincode)) {
    return "Please provide a valid 6-digit pincode.";
  }

  return null;
};

export const validateObjectId = (id) => {
  if (!isValidObjectId(id)) {
    return "Invalid ID.";
  }

  return null;
};

export const validateProduct = (data = {}) => {
  const errors = {};

  if (
    !isNonEmptyString(data.title, 150)
  ) {
    errors.title =
      "Product title is required.";
  }

  if (
    !isNonEmptyString(
      data.description,
      3000
    )
  ) {
    errors.description =
      "Product description is required.";
  }

  if (
    data.price === undefined ||
    !isPositiveNumber(Number(data.price))
  ) {
    errors.price =
      "Product price must be a valid positive number.";
  }

  if (
    data.stock !== undefined &&
    (!Number.isInteger(
      Number(data.stock)
    ) ||
      Number(data.stock) < 0)
  ) {
    errors.stock =
      "Stock must be a non-negative integer.";
  }

  if (
    data.category !== undefined &&
    !isNonEmptyString(
      data.category,
      100
    )
  ) {
    errors.category =
      "Invalid product category.";
  }

  return errors;
};

export const validateAddress = (
  address = {}
) => {
  const errors = {};

  const requiredFields = [
    ["name", "Name"],
    ["email", "Email"],
    ["mobile", "Mobile"],
    ["house", "House/Flat"],
    ["street", "Street"],
    ["area", "Area"],
    ["city", "City"],
    ["state", "State"],
    ["pincode", "Pincode"],
  ];

  requiredFields.forEach(
    ([field, label]) => {
      if (
        !isNonEmptyString(
          address[field],
          250
        )
      ) {
        errors[field] =
          `${label} is required.`;
      }
    }
  );

  if (
    address.email &&
    !isValidEmail(address.email)
  ) {
    errors.email =
      "Please provide a valid email address.";
  }

  if (
    address.mobile &&
    !isValidMobile(address.mobile)
  ) {
    errors.mobile =
      "Please provide a valid 10-digit mobile number.";
  }

  if (
    address.pincode &&
    !isValidPincode(address.pincode)
  ) {
    errors.pincode =
      "Please provide a valid 6-digit pincode.";
  }

  return errors;
};

export const validateOrder = (
  data = {}
) => {
  const errors = {};

  if (
    !Array.isArray(data.items) ||
    data.items.length === 0
  ) {
    errors.items =
      "At least one product is required.";
  }

  const addressErrors =
    validateAddress(
      data.customer || data.address || {}
    );

  if (
    Object.keys(addressErrors).length > 0
  ) {
    errors.address = addressErrors;
  }

  const allowedPaymentMethods = [
    "COD",
    "RAZORPAY",
  ];

  if (
    data.paymentMethod &&
    !allowedPaymentMethods.includes(
      String(
        data.paymentMethod
      ).toUpperCase()
    )
  ) {
    errors.paymentMethod =
      "Invalid payment method.";
  }

  return errors;
};

export const validateContact = (
  data = {}
) => {
  const errors = {};

  if (
    !isNonEmptyString(
      data.name,
      100
    )
  ) {
    errors.name =
      "Name is required.";
  }

  if (!isValidEmail(data.email)) {
    errors.email =
      "Please provide a valid email address.";
  }

  if (
    data.mobile &&
    !isValidMobile(data.mobile)
  ) {
    errors.mobile =
      "Please provide a valid mobile number.";
  }

  if (
    !isNonEmptyString(
      data.message,
      3000
    )
  ) {
    errors.message =
      "Message is required.";
  }

  return errors;
};

export const validateNfcRequest = (
  data = {}
) => {
  const errors = {};

  if (
    !isNonEmptyString(
      data.name,
      100
    )
  ) {
    errors.name =
      "Name is required.";
  }

  if (!isValidEmail(data.email)) {
    errors.email =
      "Please provide a valid email address.";
  }

  if (!isValidMobile(data.mobile)) {
    errors.mobile =
      "Please provide a valid mobile number.";
  }

  if (
    !isNonEmptyString(
      data.requirement,
      3000
    )
  ) {
    errors.requirement =
      "Requirement is required.";
  }

  return errors;
};

export {
  isNonEmptyString,
  isValidEmail,
  isValidMobile,
  isValidPincode,
  isValidObjectId,
  isPositiveNumber,
};