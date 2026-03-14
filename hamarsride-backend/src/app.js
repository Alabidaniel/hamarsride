const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const addressesRoutes = require("./routes/addressesRoutes");
const restaurantsRoutes = require("./routes/restaurantsRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
const adminOrdersRoutes = require("./routes/adminOrdersRoutes");
const notificationsRoutes = require("./routes/notificationsRoutes");
const errorHandler = require("./middleware/errorHandler");
const { initFirebase } = require("./config/firebase");

dotenv.config();
initFirebase();

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/me", profileRoutes);
app.use("/addresses", addressesRoutes);
app.use("/restaurants", restaurantsRoutes);
app.use("/orders", ordersRoutes);
app.use("/admin/orders", adminOrdersRoutes);
app.use("/notifications", notificationsRoutes);

app.use(errorHandler);

module.exports = app;
