/**
 * Search Routes
 * Global search across restaurants and menu items
 * 
 * Endpoint:
 * - GET /api/search?q=keyword - Search restaurants and menu items
 */

const express = require("express");
const { z } = require("zod");
const prisma = require("../prisma");

const router = express.Router();

// ============================================
// SCHEMA
// ============================================

const searchSchema = z.object({
  q: z.string().min(1, "Search query is required"),
  type: z.enum(["restaurants", "menu", "all"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

// ============================================
// UTILITIES
// ============================================

const formatRestaurant = (restaurant) => ({
  id: restaurant.id,
  name: restaurant.name,
  type: restaurant.type,
  image: restaurant.image,
  rating: restaurant.rating,
  time: restaurant.time,
  fee: restaurant.fee,
  open: restaurant.open,
  isFeatured: restaurant.isFeatured,
  isActive: restaurant.isActive,
});

const formatMenuItem = (item) => {
  const finalPrice = item.discountPercentage > 0
    ? item.price - Math.floor(item.price * item.discountPercentage / 100)
    : item.price;
    
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    category: item.category,
    price: item.price,
    finalPrice,
    priceDisplay: (item.price / 100).toFixed(2),
    finalPriceDisplay: (finalPrice / 100).toFixed(2),
    image: item.image,
    isAvailable: item.isAvailable,
    isFeatured: item.isFeatured,
    isCombo: item.isCombo,
    discountPercentage: item.discountPercentage,
    restaurant: item.restaurant ? {
      id: item.restaurant.id,
      name: item.restaurant.name,
      type: item.restaurant.type,
    } : null,
  };
};

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * GET /api/search
 * Global search
 */
router.get("/", async (req, res, next) => {
  try {
    const { q, type, page, pageSize } = searchSchema.parse(req.query);
    const skip = (page - 1) * pageSize;
    
    // MySQL uses case-insensitive collation by default
    const searchTerm = { contains: q };

    const results = {
      restaurants: [],
      menuItems: [],
      total: 0,
    };

    // Search restaurants if type is "restaurants" or "all"
    if (type === "restaurants" || type === "all") {
      const [restaurants, totalRestaurants] = await Promise.all([
        prisma.restaurant.findMany({
          where: {
            isActive: true,
            OR: [
              { name: searchTerm },
              { description: searchTerm },
            ],
          },
          orderBy: { isFeatured: "desc" },
          skip,
          take: pageSize,
          select: {
            id: true,
            name: true,
            type: true,
            image: true,
            rating: true,
            time: true,
            fee: true,
            open: true,
            isFeatured: true,
            isActive: true,
          },
        }),
        prisma.restaurant.count({
          where: {
            isActive: true,
            OR: [
              { name: searchTerm },
              { description: searchTerm },
            ],
          },
        }),
      ]);

      results.restaurants = restaurants;
      if (type === "restaurants") {
        results.total = totalRestaurants;
      }
    }

    // Search menu items if type is "menu" or "all"
    if (type === "menu" || type === "all") {
      const [menuItems, totalMenuItems] = await Promise.all([
        prisma.menuItem.findMany({
          where: {
            isAvailable: true,
            OR: [
              { name: searchTerm },
              { description: searchTerm },
              { category: searchTerm },
            ],
          },
          orderBy: { isFeatured: "desc" },
          skip: type === "menu" ? skip : skip,
          take: type === "menu" ? pageSize : pageSize,
          include: {
            restaurant: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        }),
        prisma.menuItem.count({
          where: {
            isAvailable: true,
            OR: [
              { name: searchTerm },
              { description: searchTerm },
              { category: searchTerm },
            ],
          },
        }),
      ]);

      results.menuItems = menuItems.map(formatMenuItem);
      if (type === "menu") {
        results.total = totalMenuItems;
      }
    }

    if (type === "all") {
      results.total = results.restaurants.length + results.menuItems.length;
    }

    return res.status(200).json({
      ...results,
      query: q,
      page,
      pageSize,
      hasMore: results.total > page * pageSize,
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

module.exports = router;
