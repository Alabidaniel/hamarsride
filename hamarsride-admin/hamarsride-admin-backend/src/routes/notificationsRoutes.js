const express = require("express");
const { z } = require("zod");
const prisma = require("../prisma");
const requireAuth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

const markReadSchema = z.object({
  id: z.string().min(1),
});

router.use(requireAuth);
router.use(requireRole(["admin"]));

router.get("/", async (_req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const unreadCount = await prisma.notification.count({ where: { isRead: false } });

    return res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id/read", async (req, res, next) => {
  try {
    const { id } = markReadSchema.parse(req.params);

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return res.status(404).json({ error: "Notification not found." });

    const updated = await prisma.notification.update({ where: { id }, data: { isRead: true } });
    return res.status(200).json({ notification: updated });
  } catch (error) {
    return next(error);
  }
});

router.post("/mark-all-read", async (_req, res, next) => {
  try {
    const result = await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });

    return res.status(200).json({ updated: result.count });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
