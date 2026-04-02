const express = require("express");
const { z } = require("zod");
const prisma = require("../prisma");
const requireAuth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

const listSchema = z.object({
  status: z.string().optional(),
  userId: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

const orderStatusSchema = z.object({
  status: z.enum(["pending", "accepted", "picked_up", "processing", "delivered", "rejected", "cancelled"]),
  rejectionReason: z.string().trim().min(1).optional(),
}).superRefine((data, ctx) => {
  if (data.status === "rejected" && !data.rejectionReason) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["rejectionReason"],
      message: "Rejection reason is required.",
    });
  }
});

const progressingStatuses = new Set(["accepted", "picked_up", "processing", "delivered"]);

const statusNotifications = {
  pending: {
    title: "Order pending",
    message: (orderId) => `Your order ${orderId} is pending and awaiting acceptance.`,
  },
  accepted: {
    title: "Order accepted",
    message: (orderId) => `Your order ${orderId} has been accepted.`,
  },
  rejected: {
    title: "Order rejected",
    message: (orderId, reason) =>
      `Your order ${orderId} was rejected${reason ? `: ${reason}` : "."}`,
  },
  picked_up: {
    title: "Order picked up",
    message: (orderId) => `Your order ${orderId} has been picked up by the rider.`,
  },
  processing: {
    title: "Order processing",
    message: (orderId) => `Your order ${orderId} is being prepared.`,
  },
  delivered: {
    title: "Order delivered",
    message: (orderId) => `Your order ${orderId} has been delivered. Enjoy!`,
  },
  cancelled: {
    title: "Order cancelled",
    message: (orderId) => `Your order ${orderId} was cancelled.`,
  },
};

router.use(requireAuth);
router.use(requireRole(["admin"]));

router.get("/", async (req, res, next) => {
  try {
    const { status, userId, page = 1, pageSize = 20 } = listSchema.parse(req.query);
    const skip = (page - 1) * pageSize;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          ...(status ? { status } : {}),
          ...(userId ? { userId } : {}),
        },
        orderBy: { createdAt: "desc" },
        include: { items: true, user: true },
        skip,
        take: pageSize,
      }),
      prisma.order.count({
        where: {
          ...(status ? { status } : {}),
          ...(userId ? { userId } : {}),
        },
      }),
    ]);

    return res.status(200).json({
      orders,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const { status, rejectionReason } = orderStatusSchema.parse(req.body);

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    if (progressingStatuses.has(status)) {
      const payment = await prisma.payment.findFirst({
        where: {
          orderId: order.id,
          status: { in: ["submitted", "verified"] },
        },
        select: { id: true },
      });

      if (!payment) {
        return res.status(409).json({
          error: "Order must remain incomplete until customer payment is submitted.",
        });
      }
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status,
        rejectionReason: status === "rejected" ? rejectionReason : null,
      },
    });

    if (order.status !== status && statusNotifications[status]) {
      const notice = statusNotifications[status];
      await prisma.notification.create({
        data: {
          userId: order.userId,
          title: notice.title,
          message: notice.message(updated.id, rejectionReason),
          type: "order",
        },
      });
    }

    return res.status(200).json({ order: updated });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
