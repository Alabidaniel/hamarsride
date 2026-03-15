const express = require("express");
const { z } = require("zod");
const prisma = require("../prisma");
const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

const addItemSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().int().nonnegative().optional(),
  quantity: z.number().int().positive().optional(),
  image: z.string().url().optional(),
  menuItemId: z.string().optional(),
});

const updateQtySchema = z.object({
  quantity: z.number().int().nonnegative(),
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

    const items = await prisma.cartItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const mapped = items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.qty,
      image: item.image,
    }));

    return res.status(200).json({ items: mapped });
  } catch (error) {
    return next(error);
  }
});

router.post("/items", async (req, res, next) => {
  try {
    const data = addItemSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const quantity = data.quantity ?? 1;

    let itemPayload = {
      name: data.name,
      price: data.price,
      image: data.image ?? null,
    };

    if (data.menuItemId) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: data.menuItemId },
      });

      if (!menuItem) {
        return res.status(404).json({ error: "Menu item not found." });
      }

      itemPayload = {
        name: menuItem.name,
        price: menuItem.price,
        image: menuItem.image ?? null,
      };
    } else if (!itemPayload.name || itemPayload.price == null) {
      return res.status(400).json({ error: "Name and price are required." });
    }

    let existing = null;
    if (data.menuItemId) {
      existing = await prisma.cartItem.findFirst({
        where: {
          userId: user.id,
          menuItemId: data.menuItemId,
        },
      });
    }

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { qty: existing.qty + quantity },
      });

      return res.status(200).json({
        item: {
          id: updated.id,
          name: updated.name,
          price: updated.price,
          quantity: updated.qty,
          image: updated.image,
        },
      });
    }

    const created = await prisma.cartItem.create({
      data: {
        userId: user.id,
        menuItemId: data.menuItemId ?? null,
        name: itemPayload.name,
        price: itemPayload.price,
        image: itemPayload.image,
        qty: quantity,
      },
    });

    return res.status(201).json({
      item: {
        id: created.id,
        name: created.name,
        price: created.price,
        quantity: created.qty,
        image: created.image,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.patch("/items/:id", async (req, res, next) => {
  try {
    const { quantity } = updateQtySchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: req.params.id, userId: user.id },
    });

    if (!item) {
      return res.status(404).json({ error: "Cart item not found." });
    }

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
      return res.status(204).send();
    }

    const updated = await prisma.cartItem.update({
      where: { id: item.id },
      data: { qty: quantity },
    });

    return res.status(200).json({
      item: {
        id: updated.id,
        name: updated.name,
        price: updated.price,
        quantity: updated.qty,
        image: updated.image,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.delete("/items/:id", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const result = await prisma.cartItem.deleteMany({
      where: { id: req.params.id, userId: user.id },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: "Cart item not found." });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
