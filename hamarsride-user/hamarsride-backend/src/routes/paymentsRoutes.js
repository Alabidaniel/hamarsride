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
  orderId: z.string().min(1).optional(),
  orderData: z.object({
    address: z.string().min(1),
    instruction: z.string().optional(),
    items: z.array(z.object({
      name: z.string().min(1),
      qty: z.number().int().positive(),
      price: z.number().int().positive(),
    })).min(1),
    deliveryFee: z.number().int().nonnegative(),
  }).optional(),
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
  const bankName = process.env.PAYMENT_BANK_NAME || "OPay";
  const accountName = process.env.PAYMENT_ACCOUNT_NAME || "HAMARS RIDES AND TRANSPORT SERVICES";
  const accountNumber = process.env.PAYMENT_ACCOUNT_NUMBER || "6115535987";

  return res.status(200).json({
    bankName,
    accountName,
    accountNumber,
  });
});

router.post("/", upload.single("receipt"), async (req, res, next) => {
  try {
    let parsedBody = req.body || {};
    
    // Parse orderData if it's a JSON string (from FormData)
    if (typeof parsedBody.orderData === "string") {
      try {
        parsedBody.orderData = JSON.parse(parsedBody.orderData);
      } catch (e) {
        return res.status(400).json({ error: "Invalid orderData format." });
      }
    }
    
    const { orderId, orderData } = paymentSchema.parse(parsedBody);

    if (!req.file) {
      return res.status(400).json({ error: "Receipt file is required." });
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    let order;

    // If orderData is provided, create a new order with payment
    if (orderData) {
      const subtotal = orderData.items.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      );
      const total = subtotal + orderData.deliveryFee;

      order = await prisma.order.create({
        data: {
          userId: user.id,
          status: "pending",
          address: orderData.address,
          instruction: orderData.instruction,
          deliveryFee: orderData.deliveryFee,
          subtotal,
          total,
          items: {
            create: orderData.items.map((item) => ({
              name: item.name,
              qty: item.qty,
              price: item.price,
            })),
          },
        },
        include: { items: true },
      });

      // Clear the cart after order creation
      await prisma.cartItem.deleteMany({
        where: { userId: user.id },
      });
    } else if (orderId) {
      // If orderId is provided, use existing order
      order = await prisma.order.findFirst({
        where: { id: orderId, userId: user.id },
      });

      if (!order) {
        return res.status(404).json({ error: "Order not found." });
      }

      if (["delivered", "cancelled"].includes(order.status)) {
        return res.status(400).json({ error: "Payment not allowed for this order." });
      }
    } else {
      return res.status(400).json({ error: "Either orderId or orderData is required." });
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

    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: { id: true },
    });

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          title: "New payment submitted",
          message: `${user.email} submitted payment for order ${order.id}.`,
          type: "admin_payment_submitted",
        })),
      });
    }

    return res.status(201).json({ payment, order });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
