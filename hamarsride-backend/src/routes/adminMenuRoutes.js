const express = require("express");
const { z } = require("zod");
const prisma = require("../prisma");
const requireAuth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

// Schemas
const createMenuItemSchema = z.object({
  restaurantId: z.string().min(1, "Restaurant ID is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  image: z.string().url().optional(),
  price: z.number().int().positive("Price must be a positive integer (in kobo)"),
});

const updateMenuItemSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  image: z.string().url().nullable().optional(),
  price: z.number().int().positive("Price must be a positive integer (in kobo)").optional(),
});

// Apply auth and role middleware
router.use(requireAuth);
router.use(requireRole(["admin"]));

/**
 * GET /api/admin/restaurants/:id/menu
 * Return all menu items for a specific restaurant
 */
router.get("/restaurants/:id/menu", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found." });
    }

    // Get all menu items for the restaurant
    const menuItems = await prisma.menuItem.findMany({
      where: { restaurantId: id },
      orderBy: { name: "asc" },
    });

    return res.status(200).json({
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        type: restaurant.type,
      },
      menuItems,
      total: menuItems.length,
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/admin/menu
 * Create a new menu item
 */
router.post("/menu", async (req, res, next) => {
  try {
    const data = createMenuItemSchema.parse(req.body);

    // Verify restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: data.restaurantId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found." });
    }

    // Create the menu item
    const menuItem = await prisma.menuItem.create({
      data: {
        restaurantId: data.restaurantId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        image: data.image || null,
        price: data.price,
      },
    });

    return res.status(201).json({ menuItem });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    return next(error);
  }
});

/**
 * PATCH /api/admin/menu/:id
 * Update a menu item
 */
router.patch("/menu/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = updateMenuItemSchema.parse(req.body);

    // Check if menu item exists
    const existingItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        restaurant: {
          select: { id: true, name: true },
        },
      },
    });

    if (!existingItem) {
      return res.status(404).json({ error: "Menu item not found." });
    }

    // Build update data
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.price !== undefined) updateData.price = data.price;

    // Update the menu item
    const updated = await prisma.menuItem.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({ menuItem: updated });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    return next(error);
  }
});

/**
 * DELETE /api/admin/menu/:id
 * Delete a menu item
 */
router.delete("/menu/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if menu item exists
    const existingItem = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return res.status(404).json({ error: "Menu item not found." });
    }

    // Delete the menu item
    await prisma.menuItem.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Menu item deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
