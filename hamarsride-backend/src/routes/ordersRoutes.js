const express = require("express");
const { z } = require("zod");
const prisma = require("../prisma");
const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

const orderItemSchema = z.object({
  name: z.string().min(1),
  qty: z.number().int().positive(),
  price: z.number().int().positive(),
});

const orderSchema = z.object({
  address: z.string().min(1),
  instruction: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
  deliveryFee: z.number().int().nonnegative(),
});

const createNotification = async ({ userId, title, message, type }) => {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
    },
  });
};

const blockedCancelStatuses = new Set(["picked_up", "delivered", "rejected", "cancelled"]);

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const status = req.query.status;
    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    const mapped = orders.map((order) => ({
      id: order.id,
      status: order.status,
      pickup: order.pickup,
      dropoff: order.dropoff,
      rejectionReason: order.rejectionReason,
      summary: order.items.map((item) => item.name).join(", "),
      createdAt: order.createdAt,
    }));

    return res.status(200).json({ orders: mapped });
  } catch (error) {
    return next(error);
  }
});

router.get("/active", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const order = await prisma.order.findFirst({
      where: {
        userId: user.id,
        status: { in: ["pending", "accepted", "picked_up", "processing", "rejected"] },
      },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    if (!order) {
      return res.status(200).json({ order: null });
    }

    return res.status(200).json({ order });
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const payload = orderSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const subtotal = payload.items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
    const total = subtotal + payload.deliveryFee;

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: "pending",
        address: payload.address,
        instruction: payload.instruction,
        deliveryFee: payload.deliveryFee,
        subtotal,
        total,
        items: {
          create: payload.items.map((item) => ({
            name: item.name,
            qty: item.qty,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });

    await prisma.cartItem.deleteMany({
      where: { userId: user.id },
    });

    await createNotification({
      userId: user.id,
      title: "Order pending",
      message: `Your order ${order.id} is pending and awaiting acceptance.`,
      type: "order",
    });

    return res.status(201).json({ order });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: user.id },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    return res.status(200).json({ order });
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/cancel", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.role !== "customer") {
      return res.status(403).json({ error: "Only customers can cancel orders." });
    }

    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: user.id },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    if (blockedCancelStatuses.has(order.status)) {
      return res.status(409).json({
        error: "Order can no longer be cancelled after pickup or delivery.",
      });
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: "cancelled" },
    });

    await createNotification({
      userId: user.id,
      title: "Order cancelled",
      message: `Your order ${updated.id} was cancelled.`,
      type: "order",
    });

    return res.status(200).json({ order: updated });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

