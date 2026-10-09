// Glyrus — server.js
import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(
        `Glyrus server running on port ${PORT}`
      );
    });

    const shutdown = async (signal) => {
      console.log(
        `\n${signal} received. Shutting down server...`
      );

      server.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
      });

      setTimeout(() => {
        console.error(
          "Forced shutdown after timeout."
        );
        process.exit(1);
      }, 10000).unref();
    };

    process.on("SIGTERM", () =>
      shutdown("SIGTERM")
    );

    process.on("SIGINT", () =>
      shutdown("SIGINT")
    );
  } catch (error) {
    console.error(
      "Failed to start Glyrus server:",
      error
    );

    process.exit(1);
  }
};

process.on("unhandledRejection", (reason) => {
  console.error(
    "Unhandled Promise Rejection:",
    reason
  );
});

process.on("uncaughtException", (error) => {
  console.error(
    "Uncaught Exception:",
    error
  );

  process.exit(1);
});

startServer();