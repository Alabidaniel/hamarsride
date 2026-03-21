const express = require("express");
const { z } = require("zod");
const prisma = require("../prisma");
const requireAuth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

const listSchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

const userListSchema = listSchema.extend({
  role: z.enum(["customer", "rider", "admin"]).optional(),
});

const paymentsListSchema = listSchema.extend({
  status: z.enum(["submitted", "verified", "rejected"]).optional(),
});

const orderListSchema = listSchema.extend({
  status: z.enum(["pending", "accepted", "picked_up", "processing", "delivered", "cancelled"]).optional(),
  userId: z.string().optional(),
});

const orderStatusSchema = z.object({
  status: z.enum(["pending", "accepted", "picked_up", "processing", "delivered", "cancelled"]),
});

const updatePaymentSchema = z.object({
  status: z.enum(["verified", "rejected"]),
});

const updateRestaurantSchema = z.object({
  name: z.string().min(1).optional(),
  image: z.string().nullable().optional(),
  rating: z.coerce.number().min(0).max(5).nullable().optional(),
  time: z.string().nullable().optional(),
  fee: z.string().nullable().optional(),
  open: z.boolean().optional(),
});

const statusNotifications = {
  pending: {
    title: "Order pending",
    message: (orderId) => `Your order ${orderId} is pending and awaiting acceptance.`,
  },
  accepted: {
    title: "Order accepted",
    message: (orderId) => `Your order ${orderId} has been accepted.`,
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

router.get("/overview", async (_req, res, next) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      inProgressOrders,
      deliveredOrders,
      totalUsers,
      totalRestaurants,
      pendingPayments,
      verifiedPayments,
      revenueAgg,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.order.count({ where: { status: { in: ["accepted", "processing", "picked_up"] } } }),
      prisma.order.count({ where: { status: "delivered" } }),
      prisma.user.count(),
      prisma.restaurant.count(),
      prisma.payment.count({ where: { status: "submitted" } }),
      prisma.payment.count({ where: { status: "verified" } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "verified" } }),
    ]);

    return res.status(200).json({
      stats: {
        totalOrders,
        pendingOrders,
        inProgressOrders,
        deliveredOrders,
        totalUsers,
        totalRestaurants,
        pendingPayments,
        verifiedPayments,
        totalRevenue: revenueAgg._sum.amount || 0,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/orders", async (req, res, next) => {
  try {
    const { status, userId, page = 1, pageSize = 20 } = orderListSchema.parse(req.query);
    const skip = (page - 1) * pageSize;

    const where = {
      ...(status ? { status } : {}),
      ...(userId ? { userId } : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { items: true, user: true },
        skip,
        take: pageSize,
      }),
      prisma.order.count({ where }),
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

router.patch("/orders/:id/status", async (req, res, next) => {
  try {
    const { status } = orderStatusSchema.parse(req.body);

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: "Order not found." });

    const updated = await prisma.order.update({ where: { id: req.params.id }, data: { status } });

    if (order.status !== status && statusNotifications[status]) {
      const notice = statusNotifications[status];
      await prisma.notification.create({
        data: {
          userId: order.userId,
          title: notice.title,
          message: notice.message(updated.id),
          type: "order",
        },
      });
    }

    return res.status(200).json({ order: updated });
  } catch (error) {
    return next(error);
  }
});

router.get("/users", async (req, res, next) => {
  try {
    const { q, role, page = 1, pageSize = 20 } = userListSchema.parse(req.query);
    const skip = (page - 1) * pageSize;
    const where = {
      ...(role ? { role } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { email: { contains: q } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: { _count: { select: { orders: true, addresses: true } } },
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json({
      users,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/restaurants", async (req, res, next) => {
  try {
    const { q, page = 1, pageSize = 20 } = listSchema.parse(req.query);
    const skip = (page - 1) * pageSize;
    const where = q ? { name: { contains: q } } : {};

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: { _count: { select: { menuItems: true } } },
      }),
      prisma.restaurant.count({ where }),
    ]);

    return res.status(200).json({
      restaurants,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return next(error);
  }
});

router.patch("/restaurants/:id", async (req, res, next) => {
  try {
    const data = updateRestaurantSchema.parse(req.body);
    const restaurant = await prisma.restaurant.findUnique({ where: { id: req.params.id } });
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found." });

    const updated = await prisma.restaurant.update({ where: { id: req.params.id }, data });
    return res.status(200).json({ restaurant: updated });
  } catch (error) {
    return next(error);
  }
});

router.get("/payments", async (req, res, next) => {
  try {
    const { q, status, page = 1, pageSize = 20 } = paymentsListSchema.parse(req.query);
    const skip = (page - 1) * pageSize;

    const where = {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { order: { id: { contains: q } } },
              { user: { name: { contains: q } } },
              { user: { email: { contains: q } } },
            ],
          }
        : {}),
    };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: { user: true, order: true },
      }),
      prisma.payment.count({ where }),
    ]);

    return res.status(200).json({
      payments,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return next(error);
  }
});

router.patch("/payments/:id/status", async (req, res, next) => {
  try {
    const { status } = updatePaymentSchema.parse(req.body);

    const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
    if (!payment) return res.status(404).json({ error: "Payment not found." });

    const updated = await prisma.payment.update({ where: { id: payment.id }, data: { status } });

    await prisma.notification.create({
      data: {
        userId: payment.userId,
        title: status === "verified" ? "Payment verified" : "Payment rejected",
        message:
          status === "verified"
            ? `Your payment for order ${payment.orderId} has been verified.`
            : `Your payment for order ${payment.orderId} was rejected. Please upload a new receipt.`,
        type: "payment",
      },
    });

    return res.status(200).json({ payment: updated });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
