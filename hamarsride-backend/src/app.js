const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const addressesRoutes = require("./routes/addressesRoutes");
const restaurantsRoutes = require("./routes/restaurantsRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
const adminOrdersRoutes = require("./routes/adminOrdersRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationsRoutes = require("./routes/notificationsRoutes");
const cartRoutes = require("./routes/cartRoutes");
const paymentsRoutes = require("./routes/paymentsRoutes");
const receiptsRoutes = require("./routes/receiptsRoutes");

const errorHandler = require("./middleware/errorHandler");
const { initFirebase } = require("./config/firebase");

dotenv.config();
initFirebase();

const app = express();
app.set("trust proxy", 1);

// CORS
const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

const envOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

const allowedOrigins = envOrigins.length ? envOrigins : defaultOrigins;

const isLocalOrigin = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || isLocalOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  })
);

// Rate limit
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
  })
);

app.use(express.json({ limit: "1mb" }));

// uploads path
const uploadsDir =
  process.env.USER_UPLOADS_DIR ||
  path.join(__dirname, "..", "uploads");

// ✅ IMPORTANT FIX: serve BOTH routes
app.use("/uploads", express.static(uploadsDir));
app.use("/api/uploads", express.static(uploadsDir)); // 👈 FIX FOR YOUR ERROR

// health
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/me", profileRoutes);
app.use("/api/addresses", addressesRoutes);
app.use("/api/restaurants", restaurantsRoutes);
app.use("/api/shops", restaurantsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/admin/orders", adminOrdersRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/receipts", receiptsRoutes);

// error handler LAST
app.use(errorHandler);

module.exports = app;
