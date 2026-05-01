/**
 * Admin Analytics Routes
 * Mounted at: /api/admin/analytics
 * ADMIN only.
 *
 * Endpoints:
 * - GET /overview?days=30
 */

const express = require("express");
const { z } = require("zod");
const prisma = require("../prisma");
const requireAuth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

const overviewQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional().default(30),
});

const normalizeName = (value = "") => String(value).trim().toLowerCase();

const startOfDayUtcForLagos = (date = new Date()) => {
  // Africa/Lagos is UTC+1 year-round.
  const lagosOffsetMinutes = 60;
  const utc = new Date(date.getTime());
  const utcMinutes = utc.getUTCMinutes();
  utc.setUTCMinutes(utcMinutes + lagosOffsetMinutes);
  utc.setUTCHours(0, 0, 0, 0);
  utc.setUTCMinutes(utc.getUTCMinutes() - lagosOffsetMinutes);
  return utc;
};

const startOfWeekUtcForLagos = (date = new Date()) => {
  const start = startOfDayUtcForLagos(date);
  // ISO week starts Monday. Convert current day in Lagos to offset.
  const lagosOffsetMinutes = 60;
  const local = new Date(start.getTime());
  local.setUTCMinutes(local.getUTCMinutes() + lagosOffsetMinutes);
  const day = local.getUTCDay(); // 0=Sun .. 6=Sat, but in "local" space
  const isoDay = day === 0 ? 7 : day; // 1..7
  local.setUTCDate(local.getUTCDate() - (isoDay - 1));
  local.setUTCHours(0, 0, 0, 0);
  local.setUTCMinutes(local.getUTCMinutes() - lagosOffsetMinutes);
  return local;
};

const toISODate = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

router.use(requireAuth);
router.use(requireRole(["admin"]));

router.get("/overview", async (req, res, next) => {
  try {
    const { days } = overviewQuerySchema.parse(req.query);
    const now = new Date();

    const startToday = startOfDayUtcForLagos(now);
    const startWeek = startOfWeekUtcForLagos(now);
    const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      ordersToday,
      ordersThisWeek,
      revenueAgg,
      verifiedPaymentsSince,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: startToday } } }),
      prisma.order.count({ where: { createdAt: { gte: startWeek } } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "verified" } }),
      prisma.payment.findMany({
        where: { status: "verified", createdAt: { gte: since } },
        select: { amount: true, createdAt: true, orderId: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: since } },
        select: { id: true, createdAt: true, items: { select: { name: true, qty: true, price: true } } },
        orderBy: { createdAt: "desc" },
        take: 300,
      }),
    ]);

    // Revenue chart (payments) - last N days
    const revenueByDay = new Map();
    for (const p of verifiedPaymentsSince) {
      const dayKey = toISODate(p.createdAt);
      if (!dayKey) continue;
      revenueByDay.set(dayKey, (revenueByDay.get(dayKey) || 0) + (p.amount || 0));
    }

    const revenueSeries = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = toISODate(d);
      revenueSeries.push({
        date: key,
        revenue: revenueByDay.get(key) || 0,
      });
    }

    // Top items (from OrderItem snapshots)
    const itemAgg = new Map();
    const uniqueItemNames = new Set();
    for (const order of recentOrders) {
      for (const item of order.items || []) {
        const name = String(item.name || "").trim();
        if (!name) continue;
        uniqueItemNames.add(name);
        const normalized = normalizeName(name);
        const entry = itemAgg.get(normalized) || { name, qty: 0, revenue: 0 };
        entry.qty += item.qty || 0;
        entry.revenue += (item.price || 0) * (item.qty || 0);
        itemAgg.set(normalized, entry);
      }
    }

    // Attempt to map items -> restaurant for "top restaurants"
    const menuMatches =
      uniqueItemNames.size > 0
        ? await prisma.menuItem.findMany({
            where: { name: { in: Array.from(uniqueItemNames) } },
            select: {
              name: true,
              restaurant: { select: { id: true, name: true, type: true } },
            },
          })
        : [];

    const restaurantsByItemName = menuMatches.reduce((acc, match) => {
      const key = normalizeName(match.name);
      if (!acc[key]) acc[key] = [];
      if (!acc[key].some((r) => r.id === match.restaurant.id)) {
        acc[key].push(match.restaurant);
      }
      return acc;
    }, {});

    const restaurantAgg = new Map();
    for (const [normalized, entry] of itemAgg.entries()) {
      const restaurants = restaurantsByItemName[normalized] || [];
      const chosen = restaurants[0] || null;
      if (!chosen) continue;
      const current = restaurantAgg.get(chosen.id) || {
        restaurantId: chosen.id,
        name: chosen.name,
        type: chosen.type,
        orders: 0,
        revenue: 0,
      };
      // We can't reliably count distinct orders per restaurant with snapshot-only data,
      // so we treat "orders" as total items sold (qty) to give a useful ranking.
      current.orders += entry.qty;
      current.revenue += entry.revenue;
      restaurantAgg.set(chosen.id, current);
    }

    const topSellingItems = Array.from(itemAgg.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const topRestaurants = Array.from(restaurantAgg.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return res.status(200).json({
      summary: {
        totalOrders,
        totalRevenue: revenueAgg._sum.amount || 0,
        ordersToday,
        ordersThisWeek,
      },
      topRestaurants,
      topSellingItems,
      revenueChart: revenueSeries,
      meta: {
        days,
        timezone: "Africa/Lagos",
      },
    });
  } catch (error) {
    if (error?.name === "ZodError") {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    return next(error);
  }
});

module.exports = router;

