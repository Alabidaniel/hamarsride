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

const businessListSchema = listSchema.extend({
  type: z.enum(["restaurant", "shop"]).optional(),
});

const userListSchema = listSchema.extend({
  role: z.enum(["customer", "rider", "admin"]).optional(),
});

const paymentsListSchema = listSchema.extend({
  status: z.enum(["submitted", "verified", "rejected"]).optional(),
});

const updatePaymentSchema = z.object({
  status: z.enum(["verified", "rejected"]),
});

const updateRestaurantSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(["restaurant", "shop"]).optional(),
  image: z.string().nullable().optional(),
  rating: z.coerce.number().min(0).max(5).nullable().optional(),
  time: z.string().nullable().optional(),
  fee: z.string().nullable().optional(),
  open: z.boolean().optional(),
});

router.use(requireAuth);
router.use(requireRole(["admin"]));

router.get("/overview", async (_req, res, next) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      rejectedOrders,
      inProgressOrders,
      deliveredOrders,
      totalUsers,
      totalRestaurants,
      totalShops,
      pendingPayments,
      verifiedPayments,
      revenueAgg,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.order.count({ where: { status: "rejected" } }),
      prisma.order.count({ where: { status: { in: ["accepted", "processing", "picked_up"] } } }),
      prisma.order.count({ where: { status: "delivered" } }),
      prisma.user.count(),
      prisma.restaurant.count({ where: { type: "restaurant" } }),
      prisma.restaurant.count({ where: { type: "shop" } }),
      prisma.payment.count({ where: { status: "submitted" } }),
      prisma.payment.count({ where: { status: "verified" } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "verified" } }),
    ]);

    return res.status(200).json({
      stats: {
        totalOrders,
        pendingOrders,
        rejectedOrders,
        inProgressOrders,
        deliveredOrders,
        totalUsers,
        totalRestaurants,
        totalShops,
        pendingPayments,
        verifiedPayments,
        totalRevenue: revenueAgg._sum.amount || 0,
      },
    });
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
        include: {
          _count: {
            select: { orders: true, addresses: true },
          },
        },
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
    const { q, type, page = 1, pageSize = 20 } = businessListSchema.parse(req.query);
    const skip = (page - 1) * pageSize;
    const where = {
      ...(q ? { name: { contains: q } } : {}),
      ...(type ? { type } : {}),
    };

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          _count: {
            select: { menuItems: true },
          },
        },
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

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: req.params.id },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found." });
    }

    const updated = await prisma.restaurant.update({
      where: { id: req.params.id },
      data,
    });

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
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: { order: true, user: true },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found." });
    }

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { status },
    });

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
