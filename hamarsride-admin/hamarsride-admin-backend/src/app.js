const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationsRoutes = require("./routes/notificationsRoutes");
const receiptsRoutes = require("./routes/receiptsRoutes");
const errorHandler = require("./middleware/errorHandler");
const { initFirebase } = require("./config/firebase");

dotenv.config();
initFirebase();

const app = express();
app.set("trust proxy", 1);

const defaultOrigins = ["http://localhost:5174"];
const allowedOrigins = (process.env.CORS_ORIGINS || defaultOrigins.join(","))
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const uploadsDir =
  process.env.ADMIN_UPLOADS_DIR ||
  path.resolve(__dirname, "..", "uploads");

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin not allowed"));
    },
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(uploadsDir));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/health", (_req, res) => {
  return res.status(200).json({ status: "ok", service: "hamarsride-admin-backend" });
});

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/receipts", receiptsRoutes);

app.use(errorHandler);

module.exports = app;
