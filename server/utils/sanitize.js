// Glyrus — sanitize.js
const sanitizeString = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value
    .replace(/<[^>]*>/g, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim();
};

const sanitizeObject = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) =>
      sanitizeObject(item)
    );
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    const sanitized = {};

    Object.entries(value).forEach(
      ([key, item]) => {
        // Prevent MongoDB operator injection.
        if (
          key.startsWith("$") ||
          key.includes(".")
        ) {
          return;
        }

        sanitized[key] =
          sanitizeObject(item);
      }
    );

    return sanitized;
  }

  return sanitizeString(value);
};

export const sanitizeBody = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  next();
};

export const sanitizeValue = (value) =>
  sanitizeObject(value);

export default sanitizeObject;