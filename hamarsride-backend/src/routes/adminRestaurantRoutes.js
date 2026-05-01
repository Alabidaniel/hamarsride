/**
 * Admin Restaurant Routes
 * Full CRUD for restaurant management
 * 
 * Endpoints:
 * - GET /api/admin/restaurants - List all restaurants (paginated)
 * - GET /api/admin/restaurants/:id - Get single restaurant
 * - POST /api/admin/restaurants - Create restaurant
 * - PATCH /api/admin/restaurants/:id - Update restaurant
 * - DELETE /api/admin/restaurants/:id - Delete restaurant
 * - GET /api/admin/restaurants/:id/menu - Get restaurant menu items
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

const createRestaurantSchema = z.object({
  name: z.string().min(1, "Restaurant name is required"),
  description: z.string().optional(),
  descriptionShort: z.string().optional(),
  type: z.enum(["restaurant", "shop"]).default("restaurant"),
  image: z.string().url().optional().or(z.literal("")),
  rating: z.number().min(0).max(5).optional(),
  time: z.string().optional(),
  fee: z.string().optional(),
  open: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  baseDeliveryFee: z.number().int().min(0).optional().default(100000),
});

const updateRestaurantSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  descriptionShort: z.string().optional(),
  type: z.enum(["restaurant", "shop"]).optional(),
  image: z.string().url().optional().or(z.literal("")),
  rating: z.number().min(0).max(5).nullable().optional(),
  time: z.string().optional(),
  fee: z.string().optional(),
  open: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  baseDeliveryFee: z.number().int().min(0).optional(),
});

const listQuerySchema = z.object({
  q: z.string().optional(),
  type: z.enum(["restaurant", "shop"]).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// ============================================
// MIDDLEWARE
// ============================================

router.use(requireAuth);
router.use(requireRole(["admin"]));

// ============================================
// UTILITIES
// ============================================

/**
 * Get client IP address from request
 */
const getClientIp = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "unknown"
  );
};

/**
 * Format restaurant for response
 */
const formatRestaurant = (restaurant) => {
  if (!restaurant) return null;
  
  return {
    ...restaurant,
    // Convert kobo to naira for display
    baseDeliveryFeeDisplay: restaurant.baseDeliveryFee 
      ? (restaurant.baseDeliveryFee / 100).toFixed(2) 
      : "0.00",
  };
};

// ============================================
// ROUTES
// ============================================

/**
 * GET /api/admin/restaurants
 * List all restaurants (paginated, searchable)
 */
router.get("/", async (req, res, next) => {
  try {
    const { q, type, isFeatured, isActive, page, pageSize } = listQuerySchema.parse(req.query);
    const skip = (page - 1) * pageSize;

    const where = {};
    
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
      ];
    }
    
    if (type) where.type = type;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (isActive !== undefined) where.isActive = isActive;

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          _count: {
            select: { menuItems: true, banners: true },
          },
        },
      }),
      prisma.restaurant.count({ where }),
    ]);

    return res.status(200).json({
      restaurants: restaurants.map(formatRestaurant),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors,
      });
    }
    return next(error);
  }
});

/**
 * GET /api/admin/restaurants/:id
 * Get single restaurant with menu count
 */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        _count: {
          select: { menuItems: true, banners: true },
        },
        menuItems: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            price: true,
            isAvailable: true,
            category: true,
          },
        },
      },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found." });
    }

    return res.status(200).json({
      restaurant: formatRestaurant(restaurant),
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/admin/restaurants
 * Create new restaurant
 */
router.post("/", async (req, res, next) => {
  try {
    const data = createRestaurantSchema.parse(req.body);
    const adminId = req.dbUser?.id;

    // Check for duplicate name
    const existing = await prisma.restaurant.findFirst({
      where: { name: { equals: data.name, mode: "insensitive" } },
    });

    if (existing) {
      return res.status(409).json({
        error: "Restaurant with this name already exists.",
      });
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        descriptionShort: data.descriptionShort?.trim() || null,
        type: data.type,
        image: data.image || null,
        rating: data.rating || null,
        time: data.time?.trim() || null,
        fee: data.fee?.trim() || null,
        open: data.open,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        baseDeliveryFee: data.baseDeliveryFee,
      },
    });

    // Audit log
    await createAuditLog({
      adminId,
      action: "CREATE",
      entityType: "restaurant",
      entityId: restaurant.id,
      details: { name: restaurant.name, type: restaurant.type },
      ipAddress: getClientIp(req),
    });

    return res.status(201).json({
      restaurant: formatRestaurant(restaurant),
      message: "Restaurant created successfully.",
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
 * PATCH /api/admin/restaurants/:id
 * Update restaurant
 */
router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = updateRestaurantSchema.parse(req.body);
    const adminId = req.dbUser?.id;

    const existing = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Restaurant not found." });
    }

    // Check name uniqueness if name is being changed
    if (data.name && data.name !== existing.name) {
      const duplicate = await prisma.restaurant.findFirst({
        where: {
          name: { equals: data.name, mode: "insensitive" },
          id: { not: id },
        },
      });

      if (duplicate) {
        return res.status(409).json({
          error: "Restaurant with this name already exists.",
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.descriptionShort !== undefined) updateData.descriptionShort = data.descriptionShort?.trim() || null;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.image !== undefined) updateData.image = data.image || null;
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.time !== undefined) updateData.time = data.time?.trim() || null;
    if (data.fee !== undefined) updateData.fee = data.fee?.trim() || null;
    if (data.open !== undefined) updateData.open = data.open;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.baseDeliveryFee !== undefined) updateData.baseDeliveryFee = data.baseDeliveryFee;

    const updated = await prisma.restaurant.update({
      where: { id },
      data: updateData,
    });

    // Audit log
    await createAuditLog({
      adminId,
      action: "UPDATE",
      entityType: "restaurant",
      entityId: id,
      details: { changes: Object.keys(updateData) },
      ipAddress: getClientIp(req),
    });

    return res.status(200).json({
      restaurant: formatRestaurant(updated),
      message: "Restaurant updated successfully.",
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
 * DELETE /api/admin/restaurants/:id
 * Delete restaurant (soft delete by setting isActive=false, or hard delete with query param)
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { hard } = req.query;
    const adminId = req.dbUser?.id;

    const existing = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        _count: {
          select: { menuItems: true, orders: true },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ error: "Restaurant not found." });
    }

    // Check if restaurant has active orders
    if (existing.orders && existing._count.orders > 0) {
      return res.status(409).json({
        error: "Cannot delete restaurant with active orders. Please complete or cancel all orders first.",
      });
    }

    if (hard === "true") {
      // Hard delete - remove menu items first
      await prisma.menuItem.deleteMany({
        where: { restaurantId: id },
      });

      await prisma.restaurant.delete({
        where: { id },
      });

      // Audit log
      await createAuditLog({
        adminId,
        action: "DELETE",
        entityType: "restaurant",
        entityId: id,
        details: { name: existing.name, hardDelete: true },
        ipAddress: getClientIp(req),
      });

      return res.status(200).json({
        message: "Restaurant deleted permanently.",
      });
    }

    // Soft delete
    await prisma.restaurant.update({
      where: { id },
      data: { isActive: false },
    });

    // Audit log
    await createAuditLog({
      adminId,
      action: "DELETE",
      entityType: "restaurant",
      entityId: id,
      details: { name: existing.name, hardDelete: false },
      ipAddress: getClientIp(req),
    });

    return res.status(200).json({
      message: "Restaurant deleted (soft delete).",
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/admin/restaurants/:id/menu
 * Get restaurant menu items (paginated)
 */
router.get("/:id/menu", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 50, category, isAvailable, q } = req.query;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found." });
    }

    const where = { restaurantId: id };
    
    if (category) where.category = category;
    if (isAvailable !== undefined) where.isAvailable = isAvailable === "true";
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take: parseInt(pageSize),
      }),
      prisma.menuItem.count({ where }),
    ]);

    // Get unique categories for filtering
    // NOTE: Avoid Prisma `distinct` here because some generated clients (out of sync)
    // can reject scalar enums at runtime.
    const categoryRows = await prisma.menuItem.findMany({
      where: {
        restaurantId: id,
        category: { not: null },
      },
      select: { category: true },
    });
    const categories = Array.from(
      new Set(categoryRows.map((row) => row.category).filter(Boolean))
    );

    return res.status(200).json({
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
      },
      menuItems: items.map((item) => ({
        ...item,
        // Calculate final price server-side
        finalPrice: item.discountPercentage > 0
          ? item.price - Math.floor(item.price * item.discountPercentage / 100)
          : item.price,
        // Format for display
        priceDisplay: (item.price / 100).toFixed(2),
        finalPriceDisplay: (
          (item.price - Math.floor(item.price * item.discountPercentage / 100)) / 100
        ).toFixed(2),
        discountPercentage: item.discountPercentage || 0,
      })),
      categories,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      total,
      totalPages: Math.ceil(total / parseInt(pageSize)),
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
