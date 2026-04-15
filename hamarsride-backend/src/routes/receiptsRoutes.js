const express = require("express");
const { z } = require("zod");
const prisma = require("../prisma");
const requireAuth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

const generateReceiptNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RCP-${timestamp}-${random}`;
};

const createReceiptSchema = z.object({
  orderId: z.string().min(1),
});

router.use(requireAuth);

// Get receipt by order ID (for users)
router.get("/order/:orderId", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const receipt = await prisma.receipt.findFirst({
      where: {
        orderId: req.params.orderId,
        userId: user.id,
      },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!receipt) {
      return res.status(404).json({ error: "Receipt not found." });
    }

    return res.status(200).json({ receipt });
  } catch (error) {
    return next(error);
  }
});

// Get receipt by ID (for users)
router.get("/:id", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const receipt = await prisma.receipt.findFirst({
      where: {
        id: req.params.id,
        userId: user.id,
      },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!receipt) {
      return res.status(404).json({ error: "Receipt not found." });
    }

    return res.status(200).json({ receipt });
  } catch (error) {
    return next(error);
  }
});

// Create receipt (admin only)
router.post("/", requireRole("admin"), async (req, res, next) => {
  try {
    const payload = createReceiptSchema.parse(req.body);

    const admin = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!admin) {
      return res.status(404).json({ error: "Admin not found." });
    }

    const order = await prisma.order.findUnique({
      where: { id: payload.orderId },
      include: {
        items: true,
        user: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Check if receipt already exists for this order
    const existingReceipt = await prisma.receipt.findFirst({
      where: { orderId: order.id },
    });

    if (existingReceipt) {
      return res.status(400).json({ error: "Receipt already exists for this order." });
    }

    const receiptNumber = generateReceiptNumber();

    const receipt = await prisma.receipt.create({
      data: {
        orderId: order.id,
        userId: order.userId,
        receiptNumber,
        items: order.items.map((item) => ({
          name: item.name,
          qty: item.qty,
          price: item.price,
          total: item.price * item.qty,
        })),
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
        address: order.address,
        instruction: order.instruction,
        generatedBy: admin.id,
      },
      include: {
        order: {
          include: {
            items: true,
          },
        },
        user: true,
      },
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: "Receipt Generated",
        message: `Receipt ${receiptNumber} has been generated for your order.`,
        type: "receipt",
      },
    });

    return res.status(201).json({ receipt });
  } catch (error) {
    return next(error);
  }
});

// Get all receipts (admin only)
router.get("/", requireRole("admin"), async (req, res, next) => {
  try {
    const receipts = await prisma.receipt.findMany({
      include: {
        order: {
          include: {
            items: true,
          },
        },
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ receipts });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
