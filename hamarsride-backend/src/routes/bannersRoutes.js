/**
 * Public Banners Routes
 * Mounted at: /api/banners
 *
 * - GET /  => active banners (optionally within date range)
 */

const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const now = new Date();

    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
        AND: [
          {
            OR: [{ endDate: null }, { endDate: { gte: now } }],
          },
        ],
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: {
        restaurant: { select: { id: true, name: true, type: true } },
      },
    });

    return res.status(200).json({ banners });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

