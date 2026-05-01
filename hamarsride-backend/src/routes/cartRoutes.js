/**
 * Cart Routes - Enhanced with One Restaurant Per Order
 * 
 * Endpoints:
 * - GET /api/cart - Get cart items
 * - POST /api/cart/items - Add item to cart
 * - PATCH /api/cart/items/:id - Update quantity
 * - DELETE /api/cart/items/:id - Remove item
 * - DELETE /api/cart/clear - Clear entire cart
 */

const express = require("express");
const { z } = require("zod");
const prisma = require("../prisma");
const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

// ============================================
// SCHEMAS
// ============================================

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

// ============================================
// MIDDLEWARE
// ============================================

router.use(requireAuth);

// ============================================
// UTILITIES
// ============================================

const mapCartItem = (item, restaurant = null) => {
  const result = {
    id: item.id,
    menuItemId: item.menuItemId,
    name: item.name,
    price: item.price,
    quantity: item.qty,
    image: item.image,
  };
  
  if (item.restaurantId) {
    result.restaurantId = item.restaurantId;
  }
  
  if (restaurant) {
    result.restaurant = {
      id: restaurant.id,
      name: restaurant.name,
    };
  }
  
  return result;
};

// ============================================
// ROUTES
// ============================================

/**
 * GET /api/cart
 * Get cart items with restaurant info
 */
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

    if (items.length === 0) {
      return res.status(200).json({ items: [], restaurant: null });
    }

    // Get restaurant info from first item (all should be same)
    const firstItem = items.find((item) => item.restaurantId);
    let restaurant = null;
    
    if (firstItem?.restaurantId) {
      restaurant = await prisma.restaurant.findUnique({
        where: { id: firstItem.restaurantId },
        select: {
          id: true,
          name: true,
          image: true,
          baseDeliveryFee: true,
          open: true,
        },
      });
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
    const deliveryFee = restaurant?.baseDeliveryFee || 100000;
    const total = subtotal + deliveryFee;

    return res.status(200).json({
      items: items.map((item) => mapCartItem(item, restaurant)),
      restaurant,
      summary: {
        itemCount: items.reduce((sum, item) => sum + item.qty, 0),
        subtotal,
        subtotalDisplay: (subtotal / 100).toFixed(2),
        deliveryFee,
        deliveryFeeDisplay: (deliveryFee / 100).toFixed(2),
        total,
        totalDisplay: (total / 100).toFixed(2),
      },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/cart/items
 * Add item to cart (enforces one restaurant per order)
 */
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
      restaurantId: null,
    };

    if (data.menuItemId) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: data.menuItemId },
        include: {
          restaurant: {
            select: { id: true, name: true, open: true, isActive: true },
          },
        },
      });

      if (!menuItem) {
        return res.status(404).json({ error: "Menu item not found." });
      }

      // Check if restaurant is active and open
      if (!menuItem.restaurant.isActive) {
        return res.status(400).json({
          error: "This restaurant is no longer active.",
        });
      }

      if (!menuItem.restaurant.open) {
        return res.status(400).json({
          error: "This restaurant is currently closed.",
        });
      }

      // Check item availability
      if (!menuItem.isAvailable) {
        return res.status(400).json({
          error: "This item is currently unavailable.",
        });
      }

      itemPayload = {
        name: menuItem.name,
        price: menuItem.price,
        image: menuItem.image ?? null,
        restaurantId: menuItem.restaurantId,
      };
    } else if (!itemPayload.name || itemPayload.price == null) {
      return res.status(400).json({ error: "Name and price are required." });
    }

    // ============================================
    // ONE RESTAURANT PER ORDER ENFORCEMENT
    // ============================================
    
    // Get user's current cart
    const existingCartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      select: { restaurantId: true, menuItemId: true },
    });

    if (existingCartItems.length > 0) {
      // Find current restaurant in cart
      const currentRestaurantId = existingCartItems.find(
        (item) => item.restaurantId
      )?.restaurantId;

      // If adding from a menu item, check restaurant match
      if (itemPayload.restaurantId && currentRestaurantId) {
        if (currentRestaurantId !== itemPayload.restaurantId) {
          // Get the restaurant names for the error message
          const currentRestaurant = await prisma.restaurant.findUnique({
            where: { id: currentRestaurantId },
            select: { name: true },
          });

          const newRestaurant = await prisma.restaurant.findUnique({
            where: { id: itemPayload.restaurantId },
            select: { name: true },
          });

          return res.status(400).json({
            error: "You can only order from one restaurant at a time.",
            code: "DIFFERENT_RESTAURANT",
            currentRestaurant: {
              id: currentRestaurantId,
              name: currentRestaurant?.name,
            },
            newRestaurant: {
              id: itemPayload.restaurantId,
              name: newRestaurant?.name,
            },
            message: `Clear cart to order from ${newRestaurant?.name}? Currently items from ${currentRestaurant?.name} in cart.`,
          });
        }
      }
    }

    // ============================================
    // ADD ITEM TO CART
    // ============================================

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

      return res.status(200).json({ item: mapCartItem(updated) });
    }

    const created = await prisma.cartItem.create({
      data: {
        userId: user.id,
        menuItemId: data.menuItemId ?? null,
        restaurantId: itemPayload.restaurantId,
        name: itemPayload.name,
        price: itemPayload.price,
        image: itemPayload.image,
        qty: quantity,
      },
    });

    return res.status(201).json({ item: mapCartItem(created) });
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
 * PATCH /api/cart/items/:id
 * Update item quantity
 */
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

    return res.status(200).json({ item: mapCartItem(updated) });
  } catch (error) {
    return next(error);
  }
});

/**
 * DELETE /api/cart/items/:id
 * Remove single item
 */
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

    return res.status(200).json({ message: "Item removed from cart." });
  } catch (error) {
    return next(error);
  }
});

/**
 * DELETE /api/cart/clear
 * Clear entire cart
 */
router.delete("/clear", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    await prisma.cartItem.deleteMany({
      where: { userId: user.id },
    });

    return res.status(200).json({
      message: "Cart cleared successfully.",
      cleared: true,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
