const express = require("express");
const { z } = require("zod");
const prisma = require("../prisma");
const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

const addressSchema = z.object({
  label: z.string().min(1),
  details: z.string().min(1),
  notes: z.string().optional(),
  isDefault: z.boolean().optional(),
});

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ addresses });
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = addressSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        label: data.label,
        details: data.details,
        notes: data.notes,
        isDefault: data.isDefault || false,
      },
    });

    return res.status(201).json({ address });
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const data = addressSchema.partial().parse(req.body);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.updateMany({
      where: { id: req.params.id, userId: user.id },
      data,
    });

    if (address.count === 0) {
      return res.status(404).json({ error: "Address not found." });
    }

    const updated = await prisma.address.findUnique({ where: { id: req.params.id } });
    return res.status(200).json({ address: updated });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const result = await prisma.address.deleteMany({
      where: { id: req.params.id, userId: user.id },
    });
    if (result.count === 0) {
      return res.status(404).json({ error: "Address not found." });
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
