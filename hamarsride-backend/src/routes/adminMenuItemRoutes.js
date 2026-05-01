/**
 * Admin Menu Item Routes
 * Full CRUD for menu item management
 * 
 * Endpoints:
 * - POST /api/admin/restaurants/:restaurantId/menu - Create menu item
 * - PATCH /api/admin/menu/:menuItemId - Update menu item
 * - DELETE /api/admin/menu/:menuItemId - Delete menu item
 * - POST /api/admin/menu/:menuItemId/toggle - Toggle availability
 */

const express = require("express");
const { z } = require("zod");
const prisma = require("../prisma");
const requireAuth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole");
const { createAuditLog } = require("../utils/auditLog");

const router = express.Router();

// ============================================
// SCHEMAS
// ============================================

const createMenuItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  price: z.number().int().min(0, "Price must be at least 0"),
  image: z.string().url().optional().or(z.literal("")),
  category: z.string().optional(),
  isAvailable: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  isCombo: z.boolean().optional().default(false),
  discountPercentage: z.number().int().min(0).max(100).optional().default(0),
});

const updateMenuItemSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().int().min(0).optional(),
  image: z.string().url().optional().or(z.literal("")),
  category: z.string().optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isCombo: z.boolean().optional(),
  discountPercentage: z.number().int().min(0).max(100).optional(),
});

// ============================================
// MIDDLEWARE
// ============================================

router.use(requireAuth);
router.use(requireRole(["admin"]));

// ============================================
// UTILITIES
// ============================================

const getClientIp = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "unknown"
  );
};

const formatMenuItem = (item) => {
  if (!item) return null;
  
  const finalPrice = item.discountPercentage > 0
    ? item.price - Math.floor(item.price * item.discountPercentage / 100)
    : item.price;
  
  return {
    ...item,
    finalPrice,
    priceDisplay: (item.price / 100).toFixed(2),
    finalPriceDisplay: (finalPrice / 100).toFixed(2),
    hasDiscount: item.discountPercentage > 0,
  };
};

// ============================================
// ROUTES
// ============================================

/**
 * POST /api/admin/restaurants/:restaurantId/menu
 * Create new menu item
 */
router.post("/restaurants/:restaurantId/menu", async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const data = createMenuItemSchema.parse(req.body);
    const adminId = req.dbUser?.id;

    // Check restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found." });
    }

    // Check for duplicate name within restaurant
    const existing = await prisma.menuItem.findFirst({
      where: {
        restaurantId,
        name: { equals: data.name, mode: "insensitive" },
      },
    });

    if (existing) {
      return res.status(409).json({
        error: "Menu item with this name already exists in this restaurant.",
      });
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        restaurantId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        price: data.price, // Already in kobo from frontend
        image: data.image || null,
        category: data.category?.trim() || null,
        isAvailable: data.isAvailable,
        isFeatured: data.isFeatured,
        isCombo: data.isCombo,
        discountPercentage: data.discountPercentage || 0,
      },
    });

    // Audit log
    await createAuditLog({
      adminId,
      action: "CREATE",
      entityType: "menuItem",
      entityId: menuItem.id,
      details: {
        name: menuItem.name,
        restaurantId,
        restaurantName: restaurant.name,
        price: menuItem.price,
      },
      ipAddress: getClientIp(req),
    });

    return res.status(201).json({
      menuItem: formatMenuItem(menuItem),
      message: "Menu item created successfully.",
    });
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
 * PATCH /api/admin/menu/:menuItemId
 * Update menu item
 */
router.patch("/menu/:menuItemId", async (req, res, next) => {
  try {
    const { menuItemId } = req.params;
    const data = updateMenuItemSchema.parse(req.body);
    const adminId = req.dbUser?.id;

    const existing = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: { restaurant: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Menu item not found." });
    }

    // Prepare update data
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.image !== undefined) updateData.image = data.image || null;
    if (data.category !== undefined) updateData.category = data.category?.trim() || null;
    if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.isCombo !== undefined) updateData.isCombo = data.isCombo;
    if (data.discountPercentage !== undefined) updateData.discountPercentage = data.discountPercentage;

    const updated = await prisma.menuItem.update({
      where: { id: menuItemId },
      data: updateData,
    });

    // Audit log
    await createAuditLog({
      adminId,
      action: "UPDATE",
      entityType: "menuItem",
      entityId: menuItemId,
      details: {
        changes: Object.keys(updateData),
        restaurantName: existing.restaurant.name,
      },
      ipAddress: getClientIp(req),
    });

    return res.status(200).json({
      menuItem: formatMenuItem(updated),
      message: "Menu item updated successfully.",
    });
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
 * DELETE /api/admin/menu/:menuItemId
 * Delete menu item
 */
router.delete("/menu/:menuItemId", async (req, res, next) => {
  try {
    const { menuItemId } = req.params;
    const { hard } = req.query;
    const adminId = req.dbUser?.id;

    const existing = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: { restaurant: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Menu item not found." });
    }

    if (hard === "true") {
      // Hard delete
      await prisma.menuItem.delete({
        where: { id: menuItemId },
      });

      // Audit log
      await createAuditLog({
        adminId,
        action: "DELETE",
        entityType: "menuItem",
        entityId: menuItemId,
        details: {
          name: existing.name,
          restaurantName: existing.restaurant.name,
          hardDelete: true,
        },
        ipAddress: getClientIp(req),
      });

      return res.status(200).json({
        message: "Menu item deleted permanently.",
      });
    }

    // Soft delete (toggle availability)
    await prisma.menuItem.update({
      where: { id: menuItemId },
      data: { isAvailable: false },
    });

    // Audit log
    await createAuditLog({
      adminId,
      action: "DELETE",
      entityType: "menuItem",
      entityId: menuItemId,
      details: {
        name: existing.name,
        restaurantName: existing.restaurant.name,
        hardDelete: false,
      },
      ipAddress: getClientIp(req),
    });

    return res.status(200).json({
      message: "Menu item deleted (unavailable).",
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/admin/menu/:menuItemId/toggle
 * Toggle menu item availability
 */
router.post("/menu/:menuItemId/toggle", async (req, res, next) => {
  try {
    const { menuItemId } = req.params;
    const adminId = req.dbUser?.id;

    const existing = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Menu item not found." });
    }

    const updated = await prisma.menuItem.update({
      where: { id: menuItemId },
      data: { isAvailable: !existing.isAvailable },
    });

    // Audit log
    await createAuditLog({
      adminId,
      action: "TOGGLE",
      entityType: "menuItem",
      entityId: menuItemId,
      details: {
        previous: existing.isAvailable,
        current: updated.isAvailable,
      },
      ipAddress: getClientIp(req),
    });

    return res.status(200).json({
      menuItem: formatMenuItem(updated),
      message: updated.isAvailable
        ? "Menu item is now available."
        : "Menu item is now unavailable.",
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/admin/menu/bulk
 * Bulk create menu items
 */
router.post("/menu/bulk", async (req, res, next) => {
  try {
    const { restaurantId, items } = req.body;
    
    if (!restaurantId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "restaurantId and items array are required.",
      });
    }

    const adminId = req.dbUser?.id;

    // Check restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found." });
    }

    // Validate and create items
    const createdItems = [];
    const errors = [];

    for (const itemData of items) {
      try {
        const valid = createMenuItemSchema.parse(itemData);
        
        const menuItem = await prisma.menuItem.create({
          data: {
            restaurantId,
            name: valid.name.trim(),
            description: valid.description?.trim() || null,
            price: valid.price,
            image: valid.image || null,
            category: valid.category?.trim() || null,
            isAvailable: valid.isAvailable,
            isFeatured: valid.isFeatured,
            isCombo: valid.isCombo,
            discountPercentage: valid.discountPercentage || 0,
          },
        });
        
        createdItems.push(formatMenuItem(menuItem));
      } catch (err) {
        if (err.name === "ZodError") {
          errors.push({
            item: itemData.name || "Unknown",
            errors: err.errors,
          });
        } else {
          errors.push({
            item: itemData.name || "Unknown",
            error: err.message,
          });
        }
      }
    }

    // Audit log if any items created
    if (createdItems.length > 0) {
      await createAuditLog({
        adminId,
        action: "CREATE",
        entityType: "menuItem",
        details: {
          restaurantId,
          restaurantName: restaurant.name,
          count: createdItems.length,
        },
        ipAddress: getClientIp(req),
      });
    }

    return res.status(201).json({
      created: createdItems.length,
      errors: errors.length,
      items: createdItems,
      errorDetails: errors,
      message: `${createdItems.length} menu items created.`,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
