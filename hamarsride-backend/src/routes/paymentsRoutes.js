const express = require("express");
const { z } = require("zod");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const prisma = require("../prisma");
const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

const paymentSchema = z.object({
  orderId: z.string().min(1),
});

const uploadRoot = path.join(__dirname, "..", "..", "uploads", "payment-receipts");
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = [".png", ".jpg", ".jpeg", ".pdf"].includes(ext) ? ext : ".png";
    const id = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");
    cb(null, `${id}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype) return cb(new Error("Invalid receipt file."));
    const allowed = ["image/png", "image/jpeg", "application/pdf"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Receipt must be PNG, JPG, or PDF."));
    }
    return cb(null, true);
  },
});

router.use(requireAuth);

router.get("/instructions", (_req, res) => {
  const bankName = process.env.PAYMENT_BANK_NAME || "GTBank";
  const accountName = process.env.PAYMENT_ACCOUNT_NAME || "HAMARS RIDE LOGISTICS";
  const accountNumber = process.env.PAYMENT_ACCOUNT_NUMBER || "0123456789";

  return res.status(200).json({
    bankName,
    accountName,
    accountNumber,
  });
});

router.post("/", upload.single("receipt"), async (req, res, next) => {
  try {
    const { orderId } = paymentSchema.parse(req.body || {});

    if (!req.file) {
      return res.status(400).json({ error: "Receipt file is required." });
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    if (["delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({ error: "Payment not allowed for this order." });
    }

    const receiptUrl = `/uploads/payment-receipts/${req.file.filename}`;

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        orderId: order.id,
        amount: order.total,
        receiptUrl,
        status: "submitted",
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Payment submitted",
        message: `Payment submitted for order ${order.id}. Awaiting verification.`,
        type: "payment",
      },
    });

    return res.status(201).json({ payment });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
