/**
 * HamarsRide Backend Application
 * Main Express server configuration
 */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Import routes
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const addressesRoutes = require("./routes/addressesRoutes");
const restaurantsRoutes = require("./routes/restaurantsRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
const searchRoutes = require("./routes/searchRoutes");
const notificationsRoutes = require("./routes/notificationsRoutes");
const cartRoutes = require("./routes/cartRoutes");
const paymentsRoutes = require("./routes/paymentsRoutes");
const receiptsRoutes = require("./routes/receiptsRoutes");
const bannersRoutes = require("./routes/bannersRoutes");

// Admin routes
const adminRoutes = require("./routes/adminRoutes");
const adminOrdersRoutes = require("./routes/adminOrdersRoutes");
const adminRestaurantRoutes = require("./routes/adminRestaurantRoutes");
const adminMenuItemRoutes = require("./routes/adminMenuItemRoutes");
const adminMenuRoutes = require("./routes/adminMenuRoutes");
const adminBannerRoutes = require("./routes/adminBannerRoutes");
const adminAnalyticsRoutes = require("./routes/adminAnalyticsRoutes");

// Middleware
const errorHandler = require("./middleware/errorHandler");
const { initFirebase } = require("./config/firebase");

// Load environment variables
// Use override=true to avoid stale machine-level env vars (especially DATABASE_URL)
// taking precedence over this repo's checked-in .env during local development.
dotenv.config({ override: true });

// Initialize Firebase
initFirebase();

const app = express();
app.set("trust proxy", 1);

// ============================================
// CORS CONFIGURATION
// ============================================

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

// ============================================
// RATE LIMITING
// ============================================

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  })
);

// ============================================
// BODY PARSING
// ============================================

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ============================================
// STATIC FILES
// ============================================

const uploadsDir =
  process.env.USER_UPLOADS_DIR ||
  path.join(__dirname, "..", "uploads");

// Serve uploaded files at multiple paths for compatibility
app.use("/uploads", express.static(uploadsDir));
app.use("/api/uploads", express.static(uploadsDir));

// ============================================
// HEALTH CHECK
// ============================================

app.get("/health", (_req, res) => {
  res.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// PUBLIC API ROUTES
// ============================================

// Authentication
app.use("/api/auth", authRoutes);

// User profile
app.use("/api/me", profileRoutes);

// Addresses
app.use("/api/addresses", addressesRoutes);

// Restaurants & Shops (public)
app.use("/api/restaurants", restaurantsRoutes);
app.use("/api/shops", restaurantsRoutes);

// Orders (customer)
app.use("/api/orders", ordersRoutes);

// Search
app.use("/api/search", searchRoutes);

// Notifications
app.use("/api/notifications", notificationsRoutes);

// Cart
app.use("/api/cart", cartRoutes);

// Payments
app.use("/api/payments", paymentsRoutes);

// Receipts
app.use("/api/receipts", receiptsRoutes);

// Public banners
app.use("/api/banners", bannersRoutes);

// ============================================
// ADMIN API ROUTES
// ============================================

// Core admin routes
app.use("/api/admin", adminRoutes);

// Admin orders (protected)
app.use("/api/admin/orders", adminOrdersRoutes);

// Admin restaurants (full CRUD)
app.use("/api/admin/restaurants", adminRestaurantRoutes);

// Admin menu items
app.use("/api/admin", adminMenuItemRoutes);

// Legacy admin menu routes
app.use("/api/admin/menu", adminMenuRoutes);

// Admin banners
app.use("/api/admin/banners", adminBannerRoutes);

// Admin analytics
app.use("/api/admin/analytics", adminAnalyticsRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found." });
});

// Global error handler (LAST)
app.use(errorHandler);

module.exports = app;
