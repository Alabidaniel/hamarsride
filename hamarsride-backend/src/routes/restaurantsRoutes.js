const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

const seedRestaurants = async () => {
  const count = await prisma.restaurant.count();
  if (count > 0) return;

  await prisma.restaurant.createMany({
    data: [
      {
        name: "Mama Put Kitchen",
        image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800",
        rating: 4.6,
        time: "25-35 mins",
        fee: "₦800",
        open: true,
      },
      {
        name: "Suya Palace",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
        rating: 4.8,
        time: "20-30 mins",
        fee: "₦600",
        open: true,
      },
      {
        name: "Amala Express",
        image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800",
        rating: 4.3,
        time: "30-40 mins",
        fee: "₦1000",
        open: false,
      },
    ],
  });
};

const seedMenu = async (restaurantId) => {
  const count = await prisma.menuItem.count({ where: { restaurantId } });
  if (count > 0) return;

  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId,
        name: "Jollof Rice & Chicken",
        description: "Smoky Nigerian jollof rice served with grilled chicken.",
        price: 2500,
        image: "https://images.unsplash.com/photo-1604908176997-431e78a97e35",
      },
      {
        restaurantId,
        name: "Pounded Yam & Egusi",
        description: "Soft pounded yam served with rich egusi soup.",
        price: 3000,
        image: "https://images.unsplash.com/photo-1631515242808-497c3fbd397f",
      },
      {
        restaurantId,
        name: "Chapman Drink",
        description: "Refreshing Nigerian Chapman cocktail.",
        price: 1000,
        image: "https://images.unsplash.com/photo-1551024709-8f23befc6c3f",
      },
    ],
  });
};

router.get("/", async (_req, res, next) => {
  try {
    await seedRestaurants();
    const restaurants = await prisma.restaurant.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ restaurants });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: req.params.id },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found." });
    }

    return res.status(200).json({ restaurant });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id/menu", async (req, res, next) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: req.params.id },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found." });
    }

    await seedMenu(restaurant.id);

    const items = await prisma.menuItem.findMany({
      where: { restaurantId: restaurant.id },
    });

    return res.status(200).json({ items });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
