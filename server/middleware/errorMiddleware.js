// Glyrus — errorMiddleware.js
const errorMiddleware = (
  error,
  req,
  res,
  next
) => {
  console.error(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
    error
  );

  if (res.headersSent) {
    return next(error);
  }

  if (
    error?.name === "ValidationError"
  ) {
    const errors = Object.values(
      error.errors || {}
    ).map((item) => ({
      field: item.path,
      message: item.message,
    }));

    return res.status(400).json({
      success: false,
      message:
        "Validation failed.",
      errors,
    });
  }

  if (
    error?.name === "CastError"
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid resource ID.",
    });
  }

  if (
    error?.name ===
    "JsonWebTokenError"
  ) {
    return res.status(401).json({
      success: false,
      message:
        "Invalid authentication token.",
    });
  }

  if (
    error?.name ===
    "TokenExpiredError"
  ) {
    return res.status(401).json({
      success: false,
      message:
        "Authentication token has expired.",
    });
  }

  if (
    error?.name === "MulterError"
  ) {
    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "File upload failed.",
    });
  }

  if (error?.code === 11000) {
    const fields = Object.keys(
      error.keyPattern || {}
    );

    return res.status(409).json({
      success: false,
      message:
        fields.length > 0
          ? `Duplicate value for: ${fields.join(
              ", "
            )}.`
          : "Duplicate record.",
      fields,
    });
  }

  const statusCode =
    Number(error?.statusCode) ||
    Number(error?.status) ||
    500;

  const safeStatus =
    statusCode >= 400 &&
    statusCode < 600
      ? statusCode
      : 500;

  return res
    .status(safeStatus)
    .json({
      success: false,
      message:
        safeStatus >= 500
          ? "Internal server error."
          : error?.message ||
            "Something went wrong.",
      ...(process.env.NODE_ENV !==
        "production" && {
        error: error?.stack,
      }),
    });
};

export default errorMiddleware;