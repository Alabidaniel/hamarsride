const express = require("express");
const prisma = require("../prisma");

const router = express.Router();
const WILLIAMS_IMAGE = "/uploads/williamgrills.png";
const ITEM7GO_IMAGE = "/uploads/item7.png";
const BIGGIS_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgp-vQ9SmbXDnbTqsg3Z_pCSpPgosMCDErIg&s";
const FOLA_PARFAIT_IMAGE = "/uploads/menu/fola-parfait-brand.svg";
const MIDE_PASTRIES_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQe9uXBgK3f5To0SyBtTjjxwGkdtiBtcflwHg&s";
const ESY_TASTIES_IMAGE = "/uploads/menu/esy-tasties-banner.svg";
const DELIGHT_RESTAURANT_IMAGE = "/uploads/menu/delight-restaurant-banner.svg";
const RICE_BEEF_IMAGE = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqNVyt4hnI9nY2fPBpI4pBesLYr0QZboZt0Q&s";
const RICE_CHICKEN_IMAGE = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqNVyt4hnI9nY2fPBpI4pBesLYr0QZboZt0Q&s";
const EXTRA_BEEF_IMAGE = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRZ2ku4Wix9c98qpOPb3hE8xCnISBb5myb5g&s";
const FOOD_MART_BANNER =
  "https://img.freepik.com/free-photo/fresh-vegetables-fruit-market-stall_1101-2560.jpg?semt=ais_hybrid&w=740&q=80";
const ONLINE_IMAGES = {
  shawarma:
    "https://images.pexels.com/photos/29306505/pexels-photo-29306505.jpeg?cs=srgb&dl=pexels-nano-erdozain-120534369-29306505.jpg&fm=jpg",
  margheritaPizza:
    "https://images.pexels.com/photos/32405090/pexels-photo-32405090.jpeg?cs=srgb&dl=pexels-philippe-alamazani-508356-32405090.jpg&fm=jpg",
  meatPizza:
    "https://images.pexels.com/photos/29268349/pexels-photo-29268349.jpeg?cs=srgb&dl=pexels-pexlao-29268349.jpg&fm=jpg",
  grilledFish:
    "https://images.pexels.com/photos/8352777/pexels-photo-8352777.jpeg?cs=srgb&dl=pexels-kindelmedia-8352777.jpg&fm=jpg",
  grilledMeat:
    "https://images.pexels.com/photos/14457206/pexels-photo-14457206.jpeg?cs=srgb&dl=pexels-valeriya-14457206.jpg&fm=jpg",
  grilledChicken:
    "https://images.pexels.com/photos/10559044/pexels-photo-10559044.jpeg?cs=srgb&dl=pexels-yelenaodintsova-10559044.jpg&fm=jpg",
  rice: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqNVyt4hnI9nY2fPBpI4pBesLYr0QZboZt0Q&s",
  water:
    "https://images.pexels.com/photos/1342529/pexels-photo-1342529.jpeg?cs=srgb&dl=pexels-enginakyurt-1342529.jpg&fm=jpg",
  maltDrink:
    "https://images.pexels.com/photos/616833/pexels-photo-616833.jpeg?cs=srgb&dl=pexels-janetrangdoan-616833.jpg&fm=jpg",
  soda:
    "https://images.pexels.com/photos/50593/coca-cola-can-coke-soft-drink-50593.jpeg?cs=srgb&dl=pexels-pixabay-50593.jpg&fm=jpg",
  coleslaw:
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?cs=srgb&dl=pexels-ella-olsson-572949-1640777.jpg&fm=jpg",
  egusi:
    "https://images.pexels.com/photos/35490114/pexels-photo-35490114.jpeg?cs=srgb&dl=pexels-anni-roenkae-1353711095-35490114.jpg&fm=jpg",
  chapman:
    "https://images.unsplash.com/photo-1551024709-8f23befc6c3f",
  spaghetti:
    "https://images.pexels.com/photos/17942061/pexels-photo-17942061.jpeg?auto=compress&cs=tinysrgb&w=1200",
  yamFries:
    "https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=1200",
  cocktail:
    "https://images.pexels.com/photos/2466320/pexels-photo-2466320.jpeg?auto=compress&cs=tinysrgb&w=1200",
  pastry:
    "https://images.pexels.com/photos/6941037/pexels-photo-6941037.jpeg?auto=compress&cs=tinysrgb&w=1200",
};

const getExactImage = (itemName, imageMap, fallbackImage) => imageMap[itemName] ?? fallbackImage;
const mapNamesToImage = (names, imageUrl) =>
  names.reduce((acc, name) => {
    acc[name] = imageUrl;
    return acc;
  }, {});

const SHOP_NAMES = new Set(["Vibrant Food Mart", "Shop With Rahma"]);
const getBusinessTypeForName = (name) => (SHOP_NAMES.has(name) ? "shop" : "restaurant");
const getRequestedBusinessType = (req) => (req.baseUrl.endsWith("/shops") ? "shop" : "restaurant");
const getBusinessLabel = (type) => (type === "shop" ? "Shop" : "Restaurant");
let seedRestaurantsPromise = null;

const seedRestaurantsInternal = async () => {
  const restaurants = [
    {
      name: "Williams Grill Place",
      type: "restaurant",
      image: WILLIAMS_IMAGE,
      rating: 4.7,
      time: "25-35 mins",
      fee: "N1000",
      open: true,
    },
    {
      name: "Biggi's Sumptuous Shawarma and Pizza",
      type: "restaurant",
      image: BIGGIS_IMAGE,
      rating: 4.8,
      time: "30-40 mins",
      fee: "N1000",
      open: true,
    },
    {
      name: "Item7go",
      type: "restaurant",
      image: ITEM7GO_IMAGE,
      rating: 4.6,
      time: "25-40 mins",
      fee: "N1000",
      open: true,
    },
    {
      name: "Hollar Lee Express Meal",
      type: "restaurant",
      image: ONLINE_IMAGES.rice,
      rating: 4.5,
      time: "25-40 mins",
      fee: "N1000",
      open: true,
    },
    {
      name: "Mide Pastries",
      type: "restaurant",
      image: MIDE_PASTRIES_IMAGE,
      rating: 4.5,
      time: "20-35 mins",
      fee: "N1000",
      open: true,
    },
    {
      name: "Fola Juice & Parfait",
      type: "restaurant",
      image: FOLA_PARFAIT_IMAGE,
      rating: 4.9,
      time: "20-30 mins",
      fee: "N1000",
      open: true,
    },
    {
      name: "Esy Tasties",
      type: "restaurant",
      image: ESY_TASTIES_IMAGE,
      rating: 4.6,
      time: "20-30 mins",
      fee: "N1000",
      open: true,
    },
    {
      name: "Delight Restaurant",
      type: "restaurant",
      image: DELIGHT_RESTAURANT_IMAGE,
      rating: 4.5,
      time: "20-35 mins",
      fee: "N1000",
      open: true,
    },
    {
      name: "Vibrant Food Mart",
      type: "shop",
      image: FOOD_MART_BANNER,
      rating: 4.6,
      time: "20-35 mins",
      fee: "N1000",
      open: true,
    },
    {
      name: "Shop With Rahma",
      type: "shop",
      image: ONLINE_IMAGES.rice,
      rating: 4.6,
      time: "20-35 mins",
      fee: "N1000",
      open: true,
    },
    {
      name: "Ibile Xpress (Go)",
      type: "restaurant",
      image: ONLINE_IMAGES.rice,
      rating: 4.5,
      time: "25-35 mins",
      fee: "N1000",
      open: true,
    },
    {
      name: "JJ Bistro",
      type: "restaurant",
      image: ONLINE_IMAGES.rice,
      rating: 4.6,
      time: "25-40 mins",
      fee: "N1000",
      open: true,
    },
    {
      name: "De Unique Kitchen",
      type: "restaurant",
      image: ONLINE_IMAGES.rice,
      rating: 4.5,
      time: "20-35 mins",
      fee: "N1000",
      open: true,
    },
    {
      name: "Daily Treat",
      type: "restaurant",
      image: ONLINE_IMAGES.rice,
      rating: 4.5,
      time: "20-35 mins",
      fee: "N1000",
      open: true,
    },
  ];

  for (const restaurant of restaurants) {
    const existingRestaurants = await prisma.restaurant.findMany({
      where: { name: restaurant.name },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    const [existing, ...duplicates] = existingRestaurants;

    if (existing) {
      await prisma.restaurant.update({
        where: { id: existing.id },
        data: restaurant,
      });

      if (duplicates.length > 0) {
        await prisma.restaurant.deleteMany({
          where: {
            id: { in: duplicates.map((entry) => entry.id) },
          },
        });
      }
      continue;
    }

    await prisma.restaurant.create({ data: restaurant });
  }
};

const seedRestaurants = async () => {
  if (!seedRestaurantsPromise) {
    seedRestaurantsPromise = seedRestaurantsInternal().finally(() => {
      seedRestaurantsPromise = null;
    });
  }

  return seedRestaurantsPromise;
};

const seedMenu = async (restaurant) => {
  const count = await prisma.menuItem.count({ where: { restaurantId: restaurant.id } });

  if (restaurant.name === "Williams Grill Place") {
    const williamsMenu = [
      { name: "Chicken Shawarma - Single Sausage", price: 3500 },
      { name: "Chicken Shawarma - Double Sausage", price: 4000 },
      { name: "Beef Shawarma - Single Sausage", price: 3500 },
      { name: "Beef Shawarma - Double Sausage", price: 4000 },
      { name: "Asun Shawarma - Single Sausage", price: 3000 },
      { name: "Asun Shawarma - Double Sausage", price: 3500 },
      { name: "Mixed Chicken & Beef Shawarma - Single Sausage", price: 4500 },
      { name: "Mixed Chicken & Beef Shawarma - Double Sausage", price: 5000 },
      { name: "Mixed Chicken & Asun Shawarma - Single Sausage", price: 4500 },
      { name: "Mixed Chicken & Asun Shawarma - Double Sausage", price: 5000 },
      { name: "Margherita Pizza - Small (8\")", price: 4500 },
      { name: "Margherita Pizza - Medium (10\")", price: 6500 },
      { name: "Margherita Pizza - Large (12\")", price: 8500 },
      { name: "Margherita Pizza - Extra Large (14\")", price: 10500 },
      { name: "Chicken Suya Pizza - Small (8\")", price: 6500 },
      { name: "Chicken Suya Pizza - Medium (10\")", price: 8500 },
      { name: "Chicken Suya Pizza - Large (12\")", price: 10500 },
      { name: "Chicken Suya Pizza - Extra Large (14\")", price: 12500 },
      { name: "Beef Suya Pizza - Small (8\")", price: 6500 },
      { name: "Beef Suya Pizza - Medium (10\")", price: 8500 },
      { name: "Beef Suya Pizza - Large (12\")", price: 10500 },
      { name: "Beef Suya Pizza - Extra Large (14\")", price: 12500 },
      { name: "Asun Pizza - Small (8\")", price: 6000 },
      { name: "Asun Pizza - Medium (10\")", price: 8000 },
      { name: "Asun Pizza - Large (12\")", price: 10000 },
      { name: "Asun Pizza - Extra Large (14\")", price: 12000 },
      { name: "Shawarma Pizza (Chicken/Beef) - Small (8\")", price: 6500 },
      { name: "Shawarma Pizza (Chicken/Beef) - Medium (10\")", price: 8500 },
      { name: "Shawarma Pizza (Chicken/Beef) - Large (12\")", price: 10500 },
      { name: "Shawarma Pizza (Chicken/Beef) - Extra Large (14\")", price: 12500 },
      { name: "Mixed Meat Pizza - Small", price: 7000 },
      { name: "Mixed Meat Pizza - Medium", price: 9000 },
      { name: "Mixed Meat Pizza - Large", price: 11000 },
      { name: "Mixed Meat Pizza - Extra Large", price: 13000 },
      { name: "BBQ Catfish - Small", price: 5000 },
      { name: "BBQ Catfish - Big", price: 7000 },
      { name: "Croacker BBQ - Small", price: 10000 },
      { name: "Asun Plate - Small", price: 3000 },
      { name: "Asun Plate - Medium", price: 4000 },
      { name: "Asun Plate - Large", price: 7000 },
      { name: "Extra Cheese", price: 1000 },
      { name: "Extra Chicken", price: 500 },
      { name: "Extra Beef", price: 500 },
      { name: "Extra Sausage", price: 500 },
      { name: "Extra Ham", price: 500 },
    ];
    const williamsImageMap = {
      ...mapNamesToImage(
        [
          "Chicken Shawarma - Single Sausage",
          "Chicken Shawarma - Double Sausage",
          "Beef Shawarma - Single Sausage",
          "Beef Shawarma - Double Sausage",
          "Asun Shawarma - Single Sausage",
          "Asun Shawarma - Double Sausage",
          "Mixed Chicken & Beef Shawarma - Single Sausage",
          "Mixed Chicken & Beef Shawarma - Double Sausage",
          "Mixed Chicken & Asun Shawarma - Single Sausage",
          "Mixed Chicken & Asun Shawarma - Double Sausage",
        ],
        ONLINE_IMAGES.shawarma
      ),
      ...mapNamesToImage(
        [
          "Margherita Pizza - Small (8\")",
          "Margherita Pizza - Medium (10\")",
          "Margherita Pizza - Large (12\")",
          "Margherita Pizza - Extra Large (14\")",
        ],
        ONLINE_IMAGES.margheritaPizza
      ),
      ...mapNamesToImage(
        [
          "Chicken Suya Pizza - Small (8\")",
          "Chicken Suya Pizza - Medium (10\")",
          "Chicken Suya Pizza - Large (12\")",
          "Chicken Suya Pizza - Extra Large (14\")",
          "Beef Suya Pizza - Small (8\")",
          "Beef Suya Pizza - Medium (10\")",
          "Beef Suya Pizza - Large (12\")",
          "Beef Suya Pizza - Extra Large (14\")",
          "Asun Pizza - Small (8\")",
          "Asun Pizza - Medium (10\")",
          "Asun Pizza - Large (12\")",
          "Asun Pizza - Extra Large (14\")",
          "Shawarma Pizza (Chicken/Beef) - Small (8\")",
          "Shawarma Pizza (Chicken/Beef) - Medium (10\")",
          "Shawarma Pizza (Chicken/Beef) - Large (12\")",
          "Shawarma Pizza (Chicken/Beef) - Extra Large (14\")",
          "Mixed Meat Pizza - Small",
          "Mixed Meat Pizza - Medium",
          "Mixed Meat Pizza - Large",
          "Mixed Meat Pizza - Extra Large",
          "Extra Cheese",
          "Extra Sausage",
          "Extra Ham",
        ],
        ONLINE_IMAGES.meatPizza
      ),
      ...mapNamesToImage(
        ["BBQ Catfish - Small", "BBQ Catfish - Big", "Croacker BBQ - Small"],
        ONLINE_IMAGES.grilledFish
      ),
      ...mapNamesToImage(["Asun Plate - Small", "Asun Plate - Medium", "Asun Plate - Large"], ONLINE_IMAGES.grilledMeat),
      ...mapNamesToImage(["Extra Beef"], EXTRA_BEEF_IMAGE),
      ...mapNamesToImage(["Extra Chicken"], ONLINE_IMAGES.grilledChicken),
    };

    if (count > 0) {
      const existingItems = await prisma.menuItem.findMany({
        where: { restaurantId: restaurant.id },
        select: { id: true, name: true },
      });

      await Promise.all(
        existingItems.map((item) =>
          prisma.menuItem.update({
            where: { id: item.id },
            data: { image: getExactImage(item.name, williamsImageMap, ONLINE_IMAGES.grilledMeat) },
          })
        )
      );
      return;
    }

    await prisma.menuItem.createMany({
      data: williamsMenu.map((item) => ({
        restaurantId: restaurant.id,
        ...item,
        image: getExactImage(item.name, williamsImageMap, ONLINE_IMAGES.grilledMeat),
      })),
    });
    return;
  }

  if (restaurant.name === "Biggi's Sumptuous Shawarma and Pizza") {
    const biggisMenu = [
      { name: "Chicken Shawarma - Single Sausage", price: 3000 },
      { name: "Chicken Shawarma - Double Sausages", price: 3500 },
      { name: "Chicken Shawarma - Three Sausages", price: 4000 },
      { name: "Chicken Shawarma - Four Sausages", price: 4500 },
      { name: "Chicken Shawarma - Without Sausage", price: 3500 },
      { name: "Beef Shawarma - Single Sausage", price: 3200 },
      { name: "Beef Shawarma - Double Sausages", price: 3800 },
      { name: "Beef Shawarma - Three Sausages", price: 4200 },
      { name: "Beef Shawarma - Four Sausages", price: 4500 },
      { name: "Chicken Pizza - Size 10", price: 12000 },
      { name: "Chicken Pizza - Size 12", price: 15000 },
      { name: "Chicken Pizza - Size 16", price: 20000 },
      { name: "Beef Pizza - Size 10", price: 13000 },
      { name: "Beef Pizza - Size 12", price: 16000 },
      { name: "Beef Pizza - Size 16", price: 22000 },
    ];
    const biggisImageMap = {
      ...mapNamesToImage(
        [
          "Chicken Shawarma - Single Sausage",
          "Chicken Shawarma - Double Sausages",
          "Chicken Shawarma - Three Sausages",
          "Chicken Shawarma - Four Sausages",
          "Chicken Shawarma - Without Sausage",
          "Beef Shawarma - Single Sausage",
          "Beef Shawarma - Double Sausages",
          "Beef Shawarma - Three Sausages",
          "Beef Shawarma - Four Sausages",
        ],
        ONLINE_IMAGES.shawarma
      ),
      ...mapNamesToImage(
        [
          "Chicken Pizza - Size 10",
          "Chicken Pizza - Size 12",
          "Chicken Pizza - Size 16",
          "Beef Pizza - Size 10",
          "Beef Pizza - Size 12",
          "Beef Pizza - Size 16",
        ],
        ONLINE_IMAGES.meatPizza
      ),
    };

    const existingItems = await prisma.menuItem.findMany({
      where: { restaurantId: restaurant.id },
      select: { id: true, name: true },
    });

    if (existingItems.length > 0) {
      const biggisByName = new Map(biggisMenu.map((item) => [item.name, item]));
      const existingByName = new Map(existingItems.map((item) => [item.name, item]));

      await Promise.all(
        existingItems.map((existingItem) => {
          const matchedItem = biggisByName.get(existingItem.name);
          if (matchedItem) {
            return prisma.menuItem.update({
              where: { id: existingItem.id },
              data: {
                price: matchedItem.price,
                image: getExactImage(matchedItem.name, biggisImageMap, ONLINE_IMAGES.meatPizza),
              },
            });
          }

          return prisma.menuItem.update({
            where: { id: existingItem.id },
            data: { image: ONLINE_IMAGES.meatPizza },
          });
        })
      );

      const missingItems = biggisMenu.filter((item) => !existingByName.has(item.name));
      if (missingItems.length > 0) {
        await prisma.menuItem.createMany({
          data: missingItems.map((item) => ({
            restaurantId: restaurant.id,
            ...item,
            image: getExactImage(item.name, biggisImageMap, ONLINE_IMAGES.meatPizza),
          })),
        });
      }
      return;
    }

    await prisma.menuItem.createMany({
      data: biggisMenu.map((item) => ({
        restaurantId: restaurant.id,
        ...item,
        image: getExactImage(item.name, biggisImageMap, ONLINE_IMAGES.meatPizza),
      })),
    });
    return;
  }

  if (restaurant.name === "Item7go") {
    const item7goCategoryData = [
      {
        name: "Rice Meals",
        items: [
          { name: "Rice + Chicken", prices: [3500, 4370] },
          { name: "Rice + Beef", prices: [2500, 3220] },
          { name: "Rice + Fish", prices: [3300, 4140] },
          { name: "Rice + Croaker Fish", prices: [4300, 5520] },
        ],
      },
      {
        name: "Extras",
        items: [
          { name: "Extra Chicken", price: 1700 },
          { name: "Extra Rice", price: 1000 },
          { name: "Extra Plantain", price: 500 },
          { name: "Extra Fish (Hake)", price: 1200 },
          { name: "Extra Beef", price: 400 },
        ],
      },
      {
        name: "Shawarma",
        items: [
          { name: "Beef Shawarma", prices: [3300, 4370] },
          { name: "Chicken Shawarma", prices: [3500, 4600] },
        ],
      },
      {
        name: "Combos",
        items: [
          { name: "Rice + Chicken + Coke", price: 5291 },
          { name: "Chicken Shawarma + Coke", price: 5536 },
          { name: "Beef Shawarma + Coke", price: 5291 },
        ],
      },
      {
        name: "Sides",
        items: [{ name: "Coleslaw", price: 700 }],
      },
      {
        name: "Drinks",
        items: [
          { name: "Water", price: 200 },
          { name: "Maltina", price: 800 },
          { name: "Soda (Fanta/Coke/Sprite)", price: 500 },
        ],
      },
    ];

    const item7goMenu = item7goCategoryData.flatMap((category) =>
      category.items.flatMap((item) => {
        if (Array.isArray(item.prices)) {
          return item.prices.map((price, index) => ({
            name: `${item.name} - Option ${index + 1}`,
            price,
          }));
        }

        return [{ name: item.name, price: item.price }];
      })
    );
    const item7goImageMap = {
      ...mapNamesToImage(
        [
          "Rice + Fish - Option 1",
          "Rice + Fish - Option 2",
          "Rice + Croaker Fish - Option 1",
          "Rice + Croaker Fish - Option 2",
          "Extra Rice",
          "Extra Plantain",
        ],
        ONLINE_IMAGES.rice
      ),
      ...mapNamesToImage(
        ["Rice + Chicken - Option 1", "Rice + Chicken - Option 2", "Rice + Chicken + Coke"],
        RICE_CHICKEN_IMAGE
      ),
      ...mapNamesToImage(["Rice + Beef - Option 1", "Rice + Beef - Option 2"], RICE_BEEF_IMAGE),
      ...mapNamesToImage(["Extra Chicken"], ONLINE_IMAGES.grilledChicken),
      ...mapNamesToImage(["Extra Beef"], EXTRA_BEEF_IMAGE),
      ...mapNamesToImage(["Extra Fish (Hake)"], ONLINE_IMAGES.grilledFish),
      ...mapNamesToImage(
        [
          "Beef Shawarma - Option 1",
          "Beef Shawarma - Option 2",
          "Chicken Shawarma - Option 1",
          "Chicken Shawarma - Option 2",
          "Chicken Shawarma + Coke",
          "Beef Shawarma + Coke",
        ],
        ONLINE_IMAGES.shawarma
      ),
      ...mapNamesToImage(["Coleslaw"], ONLINE_IMAGES.coleslaw),
      ...mapNamesToImage(["Water"], ONLINE_IMAGES.water),
      ...mapNamesToImage(["Maltina"], ONLINE_IMAGES.maltDrink),
      ...mapNamesToImage(["Soda (Fanta/Coke/Sprite)"], ONLINE_IMAGES.soda),
    };

    const existingItems = await prisma.menuItem.findMany({
      where: { restaurantId: restaurant.id },
      select: { id: true, name: true },
    });

    if (existingItems.length > 0) {
      const item7goByName = new Map(item7goMenu.map((item) => [item.name, item]));
      const existingByName = new Map(existingItems.map((item) => [item.name, item]));

      await Promise.all(
        existingItems.map((existingItem) => {
          const matchedItem = item7goByName.get(existingItem.name);
          if (matchedItem) {
            return prisma.menuItem.update({
              where: { id: existingItem.id },
              data: {
                price: matchedItem.price,
                image: getExactImage(matchedItem.name, item7goImageMap, ONLINE_IMAGES.rice),
              },
            });
          }

          return prisma.menuItem.update({
            where: { id: existingItem.id },
            data: { image: ONLINE_IMAGES.rice },
          });
        })
      );

      const missingItems = item7goMenu.filter((item) => !existingByName.has(item.name));
      if (missingItems.length > 0) {
        await prisma.menuItem.createMany({
          data: missingItems.map((item) => ({
            restaurantId: restaurant.id,
            ...item,
            image: getExactImage(item.name, item7goImageMap, ONLINE_IMAGES.rice),
          })),
        });
      }
      return;
    }

    await prisma.menuItem.createMany({
      data: item7goMenu.map((item) => ({
        restaurantId: restaurant.id,
        ...item,
        image: getExactImage(item.name, item7goImageMap, ONLINE_IMAGES.rice),
      })),
    });
    return;
  }

  if (restaurant.name === "Hollar Lee Express Meal") {
    const hollarMenu = [
      { name: "Spag and Turkey", price: 4000 },
      { name: "Spag with Two Turkey", price: 7000 },
      { name: "Spag with Middle Fish", price: 3000 },
      { name: "Spag with Fish Tail", price: 4000 },
      { name: "Spag with Asu", price: 7000 },
      { name: "Asu (only)", price: 4000 },
      { name: "Jollof Rice and Turkey", price: 4000 },
      { name: "Jollof Rice with Two Turkey", price: 7000 },
      { name: "Jollof Rice with Asu", price: 7000 },
      { name: "Jollof Rice with Middle Fish", price: 3000 },
      { name: "Jollof Rice with Fish Tail", price: 4000 },
      { name: "Yam Fries with Turkey", price: 4000 },
      { name: "Yam Fries with Two Turkey", price: 7000 },
      { name: "Yam Fries with Middle Fish", price: 3000 },
      { name: "Yam Fries with Fish Tail", price: 4000 },
      { name: "Cocktail and Mocktails", price: 3000 },
      { name: "Chapman", price: 2000 },
    ];
    const hollarImageMap = {
      ...mapNamesToImage(
        ["Spag and Turkey", "Spag with Two Turkey", "Spag with Middle Fish", "Spag with Fish Tail", "Spag with Asu"],
        ONLINE_IMAGES.spaghetti
      ),
      ...mapNamesToImage(["Asu (only)"], ONLINE_IMAGES.grilledMeat),
      ...mapNamesToImage(
        [
          "Jollof Rice and Turkey",
          "Jollof Rice with Two Turkey",
          "Jollof Rice with Asu",
          "Jollof Rice with Middle Fish",
          "Jollof Rice with Fish Tail",
        ],
        ONLINE_IMAGES.rice
      ),
      ...mapNamesToImage(
        [
          "Yam Fries with Turkey",
          "Yam Fries with Two Turkey",
          "Yam Fries with Middle Fish",
          "Yam Fries with Fish Tail",
        ],
        ONLINE_IMAGES.yamFries
      ),
      ...mapNamesToImage(["Cocktail and Mocktails"], ONLINE_IMAGES.cocktail),
      ...mapNamesToImage(["Chapman"], ONLINE_IMAGES.chapman),
    };

    const existingItems = await prisma.menuItem.findMany({
      where: { restaurantId: restaurant.id },
      select: { id: true, name: true },
    });

    if (existingItems.length > 0) {
      const hollarByName = new Map(hollarMenu.map((item) => [item.name, item]));
      const existingByName = new Map(existingItems.map((item) => [item.name, item]));

      await Promise.all(
        existingItems.map((existingItem) => {
          const matchedItem = hollarByName.get(existingItem.name);
          if (matchedItem) {
            return prisma.menuItem.update({
              where: { id: existingItem.id },
              data: {
                price: matchedItem.price,
                image: getExactImage(matchedItem.name, hollarImageMap, ONLINE_IMAGES.rice),
              },
            });
          }

          return prisma.menuItem.update({
            where: { id: existingItem.id },
            data: { image: ONLINE_IMAGES.rice },
          });
        })
      );

      const missingItems = hollarMenu.filter((item) => !existingByName.has(item.name));
      if (missingItems.length > 0) {
        await prisma.menuItem.createMany({
          data: missingItems.map((item) => ({
            restaurantId: restaurant.id,
            ...item,
            image: getExactImage(item.name, hollarImageMap, ONLINE_IMAGES.rice),
          })),
        });
      }
      return;
    }

    await prisma.menuItem.createMany({
      data: hollarMenu.map((item) => ({
        restaurantId: restaurant.id,
        ...item,
        image: getExactImage(item.name, hollarImageMap, ONLINE_IMAGES.rice),
      })),
    });
    return;
  }

  if (restaurant.name === "Mide Pastries") {
    const mideMenu = [
      { name: "Baked Fish Roll", price: 1000 },
      { name: "Sausage Roll", price: 1000 },
      { name: "Chicken Pie", price: 1500 },
      { name: "Chinchin (Mini Size)", price: 3000 },
      { name: "Chinchin (1ltr)", price: 7000 },
      { name: "Cake - 5 Inches Bento Cake", price: 12000 },
      { name: "Cake - 7 Inches 2 Layers", price: 40000 },
      { name: "Cake - 7 Inches 3 Layers", price: 55000 },
      { name: "Cake - 8 Inches 1 Layer", price: 30000 },
      { name: "Shawarma - Single Sausage", price: 3500 },
      { name: "Shawarma - Double Sausage", price: 4000 },
      { name: "Mocktail - 35cl", price: 1200 },
    ];
    const mideImageMap = {
      ...mapNamesToImage(
        [
          "Baked Fish Roll",
          "Sausage Roll",
          "Chicken Pie",
          "Chinchin (Mini Size)",
          "Chinchin (1ltr)",
          "Cake - 5 Inches Bento Cake",
          "Cake - 7 Inches 2 Layers",
          "Cake - 7 Inches 3 Layers",
          "Cake - 8 Inches 1 Layer",
        ],
        ONLINE_IMAGES.pastry
      ),
      ...mapNamesToImage(["Shawarma - Single Sausage", "Shawarma - Double Sausage"], ONLINE_IMAGES.shawarma),
      ...mapNamesToImage(["Mocktail - 35cl"], ONLINE_IMAGES.cocktail),
    };

    const existingItems = await prisma.menuItem.findMany({
      where: { restaurantId: restaurant.id },
      select: { id: true, name: true },
    });

    if (existingItems.length > 0) {
      const mideByName = new Map(mideMenu.map((item) => [item.name, item]));
      const existingByName = new Map(existingItems.map((item) => [item.name, item]));

      await Promise.all(
        existingItems.map((existingItem) => {
          const matchedItem = mideByName.get(existingItem.name);
          if (matchedItem) {
            return prisma.menuItem.update({
              where: { id: existingItem.id },
              data: {
                price: matchedItem.price,
                image: getExactImage(matchedItem.name, mideImageMap, ONLINE_IMAGES.pastry),
              },
            });
          }

          return prisma.menuItem.update({
            where: { id: existingItem.id },
            data: { image: ONLINE_IMAGES.pastry },
          });
        })
      );

      const missingItems = mideMenu.filter((item) => !existingByName.has(item.name));
      if (missingItems.length > 0) {
        await prisma.menuItem.createMany({
          data: missingItems.map((item) => ({
            restaurantId: restaurant.id,
            ...item,
            image: getExactImage(item.name, mideImageMap, ONLINE_IMAGES.pastry),
          })),
        });
      }
      return;
    }

    await prisma.menuItem.createMany({
      data: mideMenu.map((item) => ({
        restaurantId: restaurant.id,
        ...item,
        image: getExactImage(item.name, mideImageMap, ONLINE_IMAGES.pastry),
      })),
    });
    return;
  }

  if (restaurant.name === "Fola Juice & Parfait") {
    const folaMenu = [
      {
        name: "Standard Parfait - Midi Cup",
        description: "Apple, coconut, grape, granola and yogurt.",
        price: 3200,
      },
      {
        name: "Standard Parfait - Maxi Cup",
        description: "Apple, coconut, grape, granola and yogurt.",
        price: 4000,
      },
      {
        name: "Standard Parfait - Regular Bowl",
        description: "Apple, coconut, grape, granola and yogurt.",
        price: 5000,
      },
      {
        name: "Standard Parfait - 1 Litre Bowl",
        description: "Apple, coconut, grape, granola and yogurt.",
        price: 6000,
      },
      {
        name: "Exotic Parfait - Midi Cup",
        description: "Apple, coconut, grape, kiwi, strawberry, almond, raisin, granola and yogurt.",
        price: 4500,
      },
      {
        name: "Exotic Parfait - Maxi Cup",
        description: "Apple, coconut, grape, kiwi, strawberry, almond, raisin, granola and yogurt.",
        price: 5500,
      },
      {
        name: "Exotic Parfait - Regular Bowl",
        description: "Apple, coconut, grape, kiwi, strawberry, almond, raisin, granola and yogurt.",
        price: 7000,
      },
      {
        name: "Exotic Parfait - 1 Litre Bowl",
        description: "Apple, coconut, grape, kiwi, strawberry, almond, raisin, granola and yogurt.",
        price: 8500,
      },
      {
        name: "Yogurt - 500ML",
        description: "Fresh plain yogurt.",
        price: 2000,
      },
      {
        name: "Yogurt - 1 Litre",
        description: "Fresh plain yogurt.",
        price: 4000,
      },
      {
        name: "Extras - Almond, Raisin and Granola",
        description: "Extras available on request. Price was not listed on the flyer.",
        price: 0,
      },
    ];

    const existingItems = await prisma.menuItem.findMany({
      where: { restaurantId: restaurant.id },
      select: { id: true, name: true },
    });

    if (existingItems.length > 0) {
      const folaByName = new Map(folaMenu.map((item) => [item.name, item]));
      const existingByName = new Map(existingItems.map((item) => [item.name, item]));

      await Promise.all(
        existingItems.map((existingItem) => {
          const matchedItem = folaByName.get(existingItem.name);
          if (matchedItem) {
            return prisma.menuItem.update({
              where: { id: existingItem.id },
              data: {
                price: matchedItem.price,
                description: matchedItem.description,
                image: FOLA_PARFAIT_IMAGE,
              },
            });
          }

          return prisma.menuItem.update({
            where: { id: existingItem.id },
            data: { image: FOLA_PARFAIT_IMAGE },
          });
        })
      );

      const missingItems = folaMenu.filter((item) => !existingByName.has(item.name));
      if (missingItems.length > 0) {
        await prisma.menuItem.createMany({
          data: missingItems.map((item) => ({
            restaurantId: restaurant.id,
            ...item,
            image: FOLA_PARFAIT_IMAGE,
          })),
        });
      }
      return;
    }

    await prisma.menuItem.createMany({
      data: folaMenu.map((item) => ({
        restaurantId: restaurant.id,
        ...item,
        image: FOLA_PARFAIT_IMAGE,
      })),
    });
    return;
  }

  if (restaurant.name === "Esy Tasties") {
    const esyMenu = [
      {
        name: "Snack - Chin Chin (S/M/L)",
        description: "Available in small, medium, and large sizes. Price was not listed on the flyer.",
        price: 0,
      },
      {
        name: "Snack - Peanut (S/M/L)",
        description: "Available in small, medium, and large sizes. Price was not listed on the flyer.",
        price: 0,
      },
      {
        name: "Small Chops (Fridays) - Regular",
        description: "Friday small chops pack.",
        price: 1000,
      },
      {
        name: "Small Chops (Fridays) - With Meat",
        description: "Friday small chops pack with meat.",
        price: 1500,
      },
      {
        name: "Saturday Special - Roasted Yam/Plantain + Sauce",
        description: "Saturday special base served with sauce. Price was not listed on the flyer.",
        price: 0,
      },
      {
        name: "Saturday Special - Yam",
        description: "Add-on serving for Saturday special.",
        price: 100,
      },
      {
        name: "Saturday Special - Plantain",
        description: "Add-on serving for Saturday special.",
        price: 300,
      },
      {
        name: "Saturday Special - Pomo",
        description: "Add-on serving for Saturday special.",
        price: 100,
      },
    ];

    const existingItems = await prisma.menuItem.findMany({
      where: { restaurantId: restaurant.id },
      select: { id: true, name: true },
    });

    if (existingItems.length > 0) {
      const esyByName = new Map(esyMenu.map((item) => [item.name, item]));
      const existingByName = new Map(existingItems.map((item) => [item.name, item]));

      await Promise.all(
        existingItems.map((existingItem) => {
          const matchedItem = esyByName.get(existingItem.name);
          if (matchedItem) {
            return prisma.menuItem.update({
              where: { id: existingItem.id },
              data: {
                price: matchedItem.price,
                description: matchedItem.description,
                image: ESY_TASTIES_IMAGE,
              },
            });
          }

          return prisma.menuItem.update({
            where: { id: existingItem.id },
            data: { image: ESY_TASTIES_IMAGE },
          });
        })
      );

      const missingItems = esyMenu.filter((item) => !existingByName.has(item.name));
      if (missingItems.length > 0) {
        await prisma.menuItem.createMany({
          data: missingItems.map((item) => ({
            restaurantId: restaurant.id,
            ...item,
            image: ESY_TASTIES_IMAGE,
          })),
        });
      }
      return;
    }

    await prisma.menuItem.createMany({
      data: esyMenu.map((item) => ({
        restaurantId: restaurant.id,
        ...item,
        image: ESY_TASTIES_IMAGE,
      })),
    });
    return;
  }

  if (restaurant.name === "Delight Restaurant") {
    const delightMenu = [
      { name: "Staples - Jollof Rice", price: 500, description: "Staples price list item." },
      { name: "Staples - Fried Rice", price: 500, description: "Staples price list item." },
      { name: "Staples - White Rice", price: 500, description: "Staples price list item." },
      { name: "Staples - Asun Rice", price: 1500, description: "Staples price list item." },
      { name: "Staples - Jambalaya Rice", price: 1000, description: "Staples price list item." },
      {
        name: "Staples - Ofada Rice",
        price: 0,
        description: "Staples price list item. Price was not visible on the menu board.",
      },
      { name: "Staples - Village / Native Rice", price: 1000, description: "Staples price list item." },
      { name: "Staples - Brown Rice", price: 1200, description: "Staples price list item." },
      { name: "Staples - Coconut Rice", price: 1200, description: "Staples price list item." },
      { name: "Staples - Wache", price: 500, description: "Staples price list item." },
      { name: "Staples - Delightful Rice", price: 1200, description: "Staples price list item." },
      { name: "Staples - Porridge", price: 500, description: "Staples price list item." },
      { name: "Staples - Yamarita", price: 700, description: "Staples price list item." },
      { name: "Staples - Beans", price: 500, description: "Staples price list item." },
      { name: "Staples - Ewa Agonyin", price: 500, description: "Staples price list item." },
      { name: "Staples - Spag", price: 700, description: "Staples price list item." },
      { name: "Staples - Moin Moin", price: 1000, description: "Staples price list item." },
      { name: "Staples - Plantain", price: 700, description: "Staples price list item." },
      { name: "Staples - Crumbs", price: 1500, description: "Staples price list item." },
      { name: "Proteins - Beef", price: 1000, description: "Protein price list item." },
      { name: "Proteins - Chicken", price: 3000, description: "Protein price list item." },
      { name: "Proteins - Turkey", price: 6000, description: "Protein price list item." },
      { name: "Proteins - Titus", price: 2500, description: "Protein price list item." },
      { name: "Proteins - Kote", price: 2500, description: "Protein price list item." },
      { name: "Proteins - Croaker", price: 3500, description: "Protein price list item." },
      { name: "Proteins - Egg", price: 500, description: "Protein price list item." },
      { name: "Proteins - Assorted", price: 2000, description: "Protein price list item." },
      { name: "Proteins - Bokoto", price: 2000, description: "Protein price list item." },
      { name: "Proteins - Hake", price: 2500, description: "Protein price list item." },
      { name: "Proteins - Gizzard", price: 250, description: "Protein price list item." },
      { name: "Proteins - Buffalo Wings", price: 1000, description: "Protein price list item." },
      { name: "Proteins - Honey Wings", price: 1000, description: "Protein price list item." },
      { name: "Proteins - Ponmo", price: 500, description: "Protein price list item." },
      { name: "Proteins - Stick Meat", price: 1000, description: "Protein price list item." },
      {
        name: "Proteins - Peppered Snail",
        price: 0,
        description: "Protein price list item. Price was not visible on the menu board.",
      },
      {
        name: "Proteins - Panla",
        price: 0,
        description: "Protein price list item. Price was not visible on the menu board.",
      },
      { name: "Soup / Swallow - Poundo / Pounded Yam - Small", price: 700, description: "Soup / swallow price list item." },
      { name: "Soup / Swallow - Poundo / Pounded Yam - Large", price: 1000, description: "Soup / swallow price list item." },
      { name: "Soup / Swallow - Eba", price: 300, description: "Soup / swallow price list item." },
      { name: "Soup / Swallow - Amala", price: 300, description: "Soup / swallow price list item." },
      { name: "Soup / Swallow - Semo", price: 300, description: "Soup / swallow price list item." },
      { name: "Soup / Swallow - Coleslaw", price: 700, description: "Soup / swallow price list item." },
      { name: "Soup / Swallow - Egusi", price: 700, description: "Soup / swallow price list item." },
      { name: "Soup / Swallow - Efo Riro", price: 600, description: "Soup / swallow price list item." },
      { name: "Soup / Swallow - Ila", price: 600, description: "Soup / swallow price list item." },
      { name: "Soup / Swallow - Ewedu", price: 0, description: "Soup / swallow price list item. Listed as free on the menu board." },
      { name: "Soup / Swallow - Gbegiri", price: 0, description: "Soup / swallow price list item. Listed as free on the menu board." },
      { name: "Soup / Swallow - Edi Kai Kong", price: 1500, description: "Soup / swallow price list item." },
      { name: "Soup / Swallow - Ogbono", price: 700, description: "Soup / swallow price list item." },
      {
        name: "Soup / Swallow - Ofada Sauce",
        price: 0,
        description: "Soup / swallow price list item. Price was not visible on the menu board.",
      },
    ];

    const existingItems = await prisma.menuItem.findMany({
      where: { restaurantId: restaurant.id },
      select: { id: true, name: true },
    });

    if (existingItems.length > 0) {
      const delightByName = new Map(delightMenu.map((item) => [item.name, item]));
      const existingByName = new Map(existingItems.map((item) => [item.name, item]));

      await Promise.all(
        existingItems.map((existingItem) => {
          const matchedItem = delightByName.get(existingItem.name);
          if (matchedItem) {
            return prisma.menuItem.update({
              where: { id: existingItem.id },
              data: {
                price: matchedItem.price,
                description: matchedItem.description,
                image: DELIGHT_RESTAURANT_IMAGE,
              },
            });
          }

          return prisma.menuItem.update({
            where: { id: existingItem.id },
            data: { image: DELIGHT_RESTAURANT_IMAGE },
          });
        })
      );

      const missingItems = delightMenu.filter((item) => !existingByName.has(item.name));
      if (missingItems.length > 0) {
        await prisma.menuItem.createMany({
          data: missingItems.map((item) => ({
            restaurantId: restaurant.id,
            ...item,
            image: DELIGHT_RESTAURANT_IMAGE,
          })),
        });
      }
      return;
    }

    await prisma.menuItem.createMany({
      data: delightMenu.map((item) => ({
        restaurantId: restaurant.id,
        ...item,
        image: DELIGHT_RESTAURANT_IMAGE,
      })),
    });
    return;
  }

  if (restaurant.name === "Vibrant Food Mart") {
    const vibrantPackages = [
      {
        name: "Food Basket (N10,000)",
        price: 10000,
        items: [
          { name: "Foreign Rice", quantity: "1kg" },
          { name: "Garri", quantity: "1kg" },
          { name: "Semo", quantity: "500g" },
          { name: "Spaghetti", quantity: "2 pcs" },
          { name: "Sachet Custard", quantity: "3 pcs" },
          { name: "Hollandia Milk", quantity: "4 pcs" },
          { name: "Tomato Paste", quantity: "1 roll" },
          { name: "Sugar", quantity: "250g" },
        ],
      },
      {
        name: "Food Basket (N25,000)",
        price: 25000,
        items: [
          { name: "Foreign Rice", quantity: "2kg" },
          { name: "Garri", quantity: "1kg" },
          { name: "Semo", quantity: "1kg" },
          { name: "Groundnut Oil", quantity: "1L" },
          { name: "Palm Oil", quantity: "1L" },
          { name: "Spaghetti", quantity: "3 pcs" },
          { name: "Sachet Custard", quantity: "4 pcs" },
          { name: "Hollandia Milk", quantity: "1 roll" },
          { name: "Mini Paste", quantity: "2 pcs" },
          { name: "Tomato Paste", quantity: "1 roll" },
          { name: "Maggi", quantity: null },
          { name: "Salt", quantity: null },
        ],
      },
      {
        name: "Food Basket (N30,000)",
        price: 30000,
        items: [
          { name: "Foreign Rice", quantity: "5kg" },
          { name: "Garri", quantity: "2kg" },
          { name: "Semo", quantity: "1kg" },
          { name: "Groundnut Oil", quantity: "1L" },
          { name: "Palm Oil", quantity: "1L" },
          { name: "Spaghetti", quantity: "3 pcs" },
          { name: "Hollandia Milk", quantity: "1L" },
          { name: "Mini Paste", quantity: "2 pcs" },
          { name: "Tomato Paste", quantity: "1 roll" },
          { name: "Maggi", quantity: null },
          { name: "Salt", quantity: null },
        ],
      },
      {
        name: "Food Basket (N47,000)",
        price: 47000,
        items: [
          { name: "Foreign Rice", quantity: "5kg" },
          { name: "Garri", quantity: "2kg" },
          { name: "Semo", quantity: "1kg" },
          { name: "Honey Beans", quantity: "1kg" },
          { name: "Palm Oil", quantity: "1L" },
          { name: "Indomie Noodles", quantity: "1 carton" },
          { name: "Spaghetti", quantity: "3 pcs" },
          { name: "Custard", quantity: "400g" },
          { name: "Hollandia Milk", quantity: "1 roll" },
          { name: "Tomato Paste", quantity: "1 roll" },
          { name: "Maggi", quantity: null },
          { name: "Salt", quantity: null },
          { name: "Sugar", quantity: "250g" },
        ],
      },
      {
        name: "Food Basket (N105,000)",
        price: 105000,
        items: [
          { name: "Foreign Rice", quantity: "25kg" },
          { name: "Beans", quantity: "2kg" },
          { name: "Garri", quantity: "5kg" },
          { name: "Yam Flour (Elubo)", quantity: "5kg" },
          { name: "Noodles", quantity: "1 carton" },
          { name: "Palm Oil", quantity: "2L" },
          { name: "Groundnut Oil", quantity: "2L" },
          { name: "Semo", quantity: "2kg" },
          { name: "Beans Milo", quantity: null },
          { name: "Sachet Custard", quantity: "8 pcs" },
          { name: "Hollandia Milk", quantity: "2 rolls" },
          { name: "Maggi", quantity: null },
          { name: "Sugar", quantity: "250g" },
        ],
      },
    ];
    const vibrantMenu = vibrantPackages.map((pkg) => ({
      name: pkg.name,
      price: pkg.price,
      description: pkg.items
        .map((item) => (item.quantity ? `${item.name} (${item.quantity})` : item.name))
        .join(", "),
    }));

    const existingItems = await prisma.menuItem.findMany({
      where: { restaurantId: restaurant.id },
      select: { id: true, name: true },
    });

    if (existingItems.length > 0) {
      const vibrantByName = new Map(vibrantMenu.map((item) => [item.name, item]));
      const existingByName = new Map(existingItems.map((item) => [item.name, item]));

      await Promise.all(
        existingItems.map((existingItem) => {
          const matchedItem = vibrantByName.get(existingItem.name);
          if (matchedItem) {
            return prisma.menuItem.update({
              where: { id: existingItem.id },
              data: {
                price: matchedItem.price,
                description: matchedItem.description,
                image: ONLINE_IMAGES.rice,
              },
            });
          }

          return prisma.menuItem.update({
            where: { id: existingItem.id },
            data: { image: ONLINE_IMAGES.rice },
          });
        })
      );

      const missingItems = vibrantMenu.filter((item) => !existingByName.has(item.name));
      if (missingItems.length > 0) {
        await prisma.menuItem.createMany({
          data: missingItems.map((item) => ({
            restaurantId: restaurant.id,
            ...item,
            image: ONLINE_IMAGES.rice,
          })),
        });
      }
      return;
    }

    await prisma.menuItem.createMany({
      data: vibrantMenu.map((item) => ({
        restaurantId: restaurant.id,
        ...item,
        image: ONLINE_IMAGES.rice,
      })),
    });
    return;
  }

  if (restaurant.name === "Shop With Rahma") {
    const rahmaProducts = [
      {
        name: "Rice",
        variants: [
          { type: "Bag", price: 58000 },
          { type: "Mudu", price: 1900 },
          { type: "Quarter Bag", price: 14500 },
          { type: "Half Bag", price: 29000 },
        ],
      },
      {
        name: "Golden Penny Spaghetti",
        variants: [
          { type: "Pack", price: 19000 },
          { type: "Piece", price: 1000 },
        ],
      },
      {
        name: "Auntie B Semolina",
        variants: [
          { type: "10kg", price: 12000 },
          { type: "1kg", price: 1300 },
        ],
      },
      {
        name: "Golden Semovita",
        variants: [
          { type: "10kg", price: 14500 },
          { type: "1kg", price: 1600 },
        ],
      },
      {
        name: "Vegetable Oil",
        variants: [{ type: "Bottle", price: 1800 }],
      },
      {
        name: "Palm Oil",
        variants: [{ type: "Bottle", price: 1300 }],
      },
      {
        name: "Salt",
        variants: [
          { type: "Large", price: 500 },
          { type: "Medium", price: 250 },
          { type: "Small", price: 150 },
        ],
      },
      {
        name: "Curry",
        variants: [],
      },
      {
        name: "Thyme",
        variants: [],
      },
      {
        name: "Custard",
        variants: [
          { type: "Roll", price: 1400 },
          { type: "3in1 Roll", price: 2000 },
          { type: "1kg (3in1)", price: 6500 },
          { type: "1kg (Ordinary)", price: 5500 },
        ],
      },
      {
        name: "Indomie Noodles",
        variants: [{ type: "Carton", price: 9700 }],
      },
      {
        name: "Super Pack Noodles",
        variants: [{ type: "Carton", price: 15000 }],
      },
      {
        name: "Golden Noodles",
        variants: [{ type: "Carton", price: 8000 }],
      },
      {
        name: "Mimee Noodles",
        variants: [{ type: "Carton", price: 8000 }],
      },
      {
        name: "Minimie Noodles",
        variants: [{ type: "Carton", price: 8500 }],
      },
    ];

    const rahmaMenu = rahmaProducts.flatMap((product) =>
      product.variants.map((variant) => ({
        name: `${product.name} - ${variant.type}`,
        price: variant.price,
      }))
    );

    const existingItems = await prisma.menuItem.findMany({
      where: { restaurantId: restaurant.id },
      select: { id: true, name: true },
    });

    if (existingItems.length > 0) {
      const rahmaByName = new Map(rahmaMenu.map((item) => [item.name, item]));
      const existingByName = new Map(existingItems.map((item) => [item.name, item]));

      await Promise.all(
        existingItems.map((existingItem) => {
          const matchedItem = rahmaByName.get(existingItem.name);
          if (matchedItem) {
            return prisma.menuItem.update({
              where: { id: existingItem.id },
              data: {
                price: matchedItem.price,
                image: ONLINE_IMAGES.rice,
              },
            });
          }

          return prisma.menuItem.update({
            where: { id: existingItem.id },
            data: { image: ONLINE_IMAGES.rice },
          });
        })
      );

      const missingItems = rahmaMenu.filter((item) => !existingByName.has(item.name));
      if (missingItems.length > 0) {
        await prisma.menuItem.createMany({
          data: missingItems.map((item) => ({
            restaurantId: restaurant.id,
            ...item,
            image: ONLINE_IMAGES.rice,
          })),
        });
      }
      return;
    }

    await prisma.menuItem.createMany({
      data: rahmaMenu.map((item) => ({
        restaurantId: restaurant.id,
        ...item,
        image: ONLINE_IMAGES.rice,
      })),
    });
    return;
  }

  if (restaurant.name === "Ibile Xpress (Go)") {
    const ibileMenu = [
      {
        name: "Ofada Rice",
        price: 4000,
        description: "A plate contains Ofada rice, plantain, one egg, and one beef or assorted depending on choice.",
      },
      {
        name: "Wanche Rice",
        price: 4000,
        description: "A plate contains Wanke rice, plantain, one egg, and one beef or assorted depending on choice.",
      },
      { name: "Extra Rice", price: 600 },
      { name: "Egg", price: 500 },
      { name: "Fried Plantains", price: 500 },
      { name: "Assorted Meat", price: 500 },
      { name: "Beef", price: 500 },
      { name: "Ponmo", price: 500 },
    ];

    const ibileImageMap = {
      ...mapNamesToImage(["Ofada Rice", "Wanche Rice"], ONLINE_IMAGES.rice),
      ...mapNamesToImage(["Extra Rice"], ONLINE_IMAGES.rice),
      ...mapNamesToImage(["Egg"], ONLINE_IMAGES.grilledChicken),
      ...mapNamesToImage(["Fried Plantains"], ONLINE_IMAGES.yamFries),
      ...mapNamesToImage(["Assorted Meat", "Beef"], ONLINE_IMAGES.grilledMeat),
      ...mapNamesToImage(["Ponmo"], ONLINE_IMAGES.grilledMeat),
    };

    const existingItems = await prisma.menuItem.findMany({
      where: { restaurantId: restaurant.id },
      select: { id: true, name: true },
    });

    if (existingItems.length > 0) {
      const ibileByName = new Map(ibileMenu.map((item) => [item.name, item]));
      const existingByName = new Map(existingItems.map((item) => [item.name, item]));

      await Promise.all(
        existingItems.map((existingItem) => {
          const matchedItem = ibileByName.get(existingItem.name);
          if (matchedItem) {
            return prisma.menuItem.update({
              where: { id: existingItem.id },
              data: {
                price: matchedItem.price,
                description: matchedItem.description,
                image: getExactImage(matchedItem.name, ibileImageMap, ONLINE_IMAGES.rice),
              },
            });
          }

          return prisma.menuItem.update({
            where: { id: existingItem.id },
            data: { image: ONLINE_IMAGES.rice },
          });
        })
      );

      const missingItems = ibileMenu.filter((item) => !existingByName.has(item.name));
      if (missingItems.length > 0) {
        await prisma.menuItem.createMany({
          data: missingItems.map((item) => ({
            restaurantId: restaurant.id,
            ...item,
            image: getExactImage(item.name, ibileImageMap, ONLINE_IMAGES.rice),
          })),
        });
      }
      return;
    }

    await prisma.menuItem.createMany({
      data: ibileMenu.map((item) => ({
        restaurantId: restaurant.id,
        ...item,
        image: getExactImage(item.name, ibileImageMap, ONLINE_IMAGES.rice),
      })),
    });
    return;
  }

  if (restaurant.name === "JJ Bistro") {
    const jjMenu = [
      {
        name: "JJ Bistro Signature Jollof Rice - Without Chicken",
        price: 2000,
        description: "Rich, smoky, and perfectly spiced.",
      },
      {
        name: "JJ Bistro Signature Jollof Rice - With Chicken",
        price: 3000,
        description: "Rich, smoky, and perfectly spiced.",
      },
      {
        name: "Plain Rice & Chicken Stew",
        price: 3500,
        description: "Fluffy rice served with rich, savory chicken stew.",
      },
      {
        name: "Jollof Rice & Peppered Turkey (Full Plate)",
        price: 4500,
        description: "Our signature jollof paired with juicy, well-seasoned turkey.",
      },
      {
        name: "Basmati Fried Rice with Fried Chicken",
        price: 4500,
        description: "Fragrant basmati stir-fried with veggies, served with crispy fried chicken.",
      },
      {
        name: "Asun Rice (Basmati)",
        price: 5000,
        description: "Smoky basmati rice mixed with spicy tender asun.",
      },
      {
        name: "Rice & Beans Combo with Smoked Fish Stew & Boiled Egg",
        price: 4500,
        description: "Hearty rice and beans served with rich smoked fish stew and perfectly boiled egg.",
      },
      {
        name: "Asun",
        price: 5000,
        description: "Spicy, tender grilled goat meat bursting with flavor.",
      },
      {
        name: "Roasted Ponmo",
        price: 1800,
        description: "Smoky tender cow skin roasted to perfection.",
      },
      {
        name: "Loaded Noodles Special",
        price: 2500,
        description: "Noodles with fried egg and fresh veggies.",
      },
      {
        name: "Spaghetti Jollof",
        price: 2300,
        description: "Spaghetti in rich tomato sauce and spices.",
      },
      {
        name: "Macaroni Jollof",
        price: 2300,
        description: "Richly seasoned macaroni with juicy turkey cuts.",
      },
      {
        name: "Classic Sandwich",
        price: 2000,
        description: "Freshly made with tasty fillings and creamy spread.",
      },
      {
        name: "Vegetable Soup (Per Portion)",
        price: 2000,
      },
      {
        name: "Swallows (Amala, Eba, Semo, Poundo)",
        price: 500,
      },
      {
        name: "Swallow + Vegetable Soup Combo",
        price: 3000,
      },
      {
        name: "Ekuru Combo",
        price: 2500,
      },
      {
        name: "Catfish Pepper Soup",
        price: 9000,
        description: "Fresh catfish cooked in rich, spicy traditional pepper soup.",
      },
      {
        name: "Fried Egg",
        price: 900,
      },
      {
        name: "Sausage",
        price: 500,
      },
      {
        name: "Extra Chicken",
        price: 1500,
      },
      {
        name: "Soft Drink",
        price: 1000,
      },
      {
        name: "Water",
        price: 500,
      },
    ];

    const jjImageMap = {
      ...mapNamesToImage(
        [
          "JJ Bistro Signature Jollof Rice - Without Chicken",
          "JJ Bistro Signature Jollof Rice - With Chicken",
          "Plain Rice & Chicken Stew",
          "Jollof Rice & Peppered Turkey (Full Plate)",
          "Basmati Fried Rice with Fried Chicken",
          "Asun Rice (Basmati)",
          "Rice & Beans Combo with Smoked Fish Stew & Boiled Egg",
        ],
        ONLINE_IMAGES.rice
      ),
      ...mapNamesToImage(["Asun"], ONLINE_IMAGES.grilledMeat),
      ...mapNamesToImage(["Roasted Ponmo"], ONLINE_IMAGES.grilledMeat),
      ...mapNamesToImage(["Loaded Noodles Special", "Spaghetti Jollof", "Macaroni Jollof"], ONLINE_IMAGES.spaghetti),
      ...mapNamesToImage(["Classic Sandwich"], ONLINE_IMAGES.shawarma),
      ...mapNamesToImage(["Vegetable Soup (Per Portion)"], ONLINE_IMAGES.egusi),
      ...mapNamesToImage(["Swallows (Amala, Eba, Semo, Poundo)"], ONLINE_IMAGES.egusi),
      ...mapNamesToImage(["Swallow + Vegetable Soup Combo"], ONLINE_IMAGES.egusi),
      ...mapNamesToImage(["Ekuru Combo"], ONLINE_IMAGES.egusi),
      ...mapNamesToImage(["Catfish Pepper Soup"], ONLINE_IMAGES.grilledFish),
      ...mapNamesToImage(["Fried Egg"], ONLINE_IMAGES.grilledChicken),
      ...mapNamesToImage(["Sausage"], ONLINE_IMAGES.grilledMeat),
      ...mapNamesToImage(["Extra Chicken"], ONLINE_IMAGES.grilledChicken),
      ...mapNamesToImage(["Soft Drink"], ONLINE_IMAGES.soda),
      ...mapNamesToImage(["Water"], ONLINE_IMAGES.water),
    };

    const existingItems = await prisma.menuItem.findMany({
      where: { restaurantId: restaurant.id },
      select: { id: true, name: true },
    });

    if (existingItems.length > 0) {
      const jjByName = new Map(jjMenu.map((item) => [item.name, item]));
      const existingByName = new Map(existingItems.map((item) => [item.name, item]));

      await Promise.all(
        existingItems.map((existingItem) => {
          const matchedItem = jjByName.get(existingItem.name);
          if (matchedItem) {
            return prisma.menuItem.update({
              where: { id: existingItem.id },
              data: {
                price: matchedItem.price,
                description: matchedItem.description,
                image: getExactImage(matchedItem.name, jjImageMap, ONLINE_IMAGES.rice),
              },
            });
          }

          return prisma.menuItem.update({
            where: { id: existingItem.id },
            data: { image: ONLINE_IMAGES.rice },
          });
        })
      );

      const missingItems = jjMenu.filter((item) => !existingByName.has(item.name));
      if (missingItems.length > 0) {
        await prisma.menuItem.createMany({
          data: missingItems.map((item) => ({
            restaurantId: restaurant.id,
            ...item,
            image: getExactImage(item.name, jjImageMap, ONLINE_IMAGES.rice),
          })),
        });
      }
      return;
    }

    await prisma.menuItem.createMany({
      data: jjMenu.map((item) => ({
        restaurantId: restaurant.id,
        ...item,
        image: getExactImage(item.name, jjImageMap, ONLINE_IMAGES.rice),
      })),
    });
    return;
  }

  if (restaurant.name === "De Unique Kitchen") {
    const deUniqueMenu = [
      { name: "Jollof Rice", price: 400 },
      { name: "Fried Rice", price: 400 },
      { name: "White Rice", price: 400 },
      { name: "Yam Porridge", price: 400 },
      { name: "Beans", price: 300 },
      { name: "Spaghetti", price: 300 },
      { name: "Amala", price: 250 },
      { name: "Semo", price: 250 },
      { name: "Fufu", price: 200 },
      { name: "Eba", price: 200 },
      { name: "Pounded Yam", price: 400 },
      { name: "Goat Meat", price: 2000 },
      { name: "Chicken", price: 2000 },
      { name: "Beef", price: 200 },
      { name: "Ponmo", price: 200 },
      { name: "Titus Fish", price: 1000 },
      { name: "Turkey", price: 4000 },
    ];

    const deUniqueImageMap = {
      ...mapNamesToImage(["Jollof Rice", "Fried Rice", "White Rice"], ONLINE_IMAGES.rice),
      ...mapNamesToImage(["Yam Porridge"], ONLINE_IMAGES.yamFries),
      ...mapNamesToImage(["Beans"], ONLINE_IMAGES.egusi),
      ...mapNamesToImage(["Spaghetti"], ONLINE_IMAGES.spaghetti),
      ...mapNamesToImage(["Amala", "Semo", "Fufu", "Eba", "Pounded Yam"], ONLINE_IMAGES.egusi),
      ...mapNamesToImage(["Goat Meat", "Beef", "Ponmo"], ONLINE_IMAGES.grilledMeat),
      ...mapNamesToImage(["Chicken"], ONLINE_IMAGES.grilledChicken),
      ...mapNamesToImage(["Titus Fish"], ONLINE_IMAGES.grilledFish),
      ...mapNamesToImage(["Turkey"], ONLINE_IMAGES.grilledChicken),
    };

    const existingItems = await prisma.menuItem.findMany({
      where: { restaurantId: restaurant.id },
      select: { id: true, name: true },
    });

    if (existingItems.length > 0) {
      const deUniqueByName = new Map(deUniqueMenu.map((item) => [item.name, item]));
      const existingByName = new Map(existingItems.map((item) => [item.name, item]));

      await Promise.all(
        existingItems.map((existingItem) => {
          const matchedItem = deUniqueByName.get(existingItem.name);
          if (matchedItem) {
            return prisma.menuItem.update({
              where: { id: existingItem.id },
              data: {
                price: matchedItem.price,
                image: getExactImage(matchedItem.name, deUniqueImageMap, ONLINE_IMAGES.rice),
              },
            });
          }

          return prisma.menuItem.update({
            where: { id: existingItem.id },
            data: { image: ONLINE_IMAGES.rice },
          });
        })
      );

      const missingItems = deUniqueMenu.filter((item) => !existingByName.has(item.name));
      if (missingItems.length > 0) {
        await prisma.menuItem.createMany({
          data: missingItems.map((item) => ({
            restaurantId: restaurant.id,
            ...item,
            image: getExactImage(item.name, deUniqueImageMap, ONLINE_IMAGES.rice),
          })),
        });
      }
      return;
    }

    await prisma.menuItem.createMany({
      data: deUniqueMenu.map((item) => ({
        restaurantId: restaurant.id,
        ...item,
        image: getExactImage(item.name, deUniqueImageMap, ONLINE_IMAGES.rice),
      })),
    });
    return;
  }

  if (restaurant.name === "Daily Treat") {
    const dailyTreatMenu = [
      { name: "Jollof & fried rice with chicken", price: 3000 },
      { name: "Jollof & fried rice with turkey", price: 4000 },
      { name: "Jollof & fried rice with beef", price: 2000 },
      { name: "Stir fry spaghetti and chicken", price: 2700 },
      { name: "Stir fry spaghetti and turkey", price: 3500 },
    ];

    const dailyTreatImageMap = {
      ...mapNamesToImage(
        [
          "Jollof & fried rice with chicken",
          "Jollof & fried rice with turkey",
          "Jollof & fried rice with beef",
        ],
        ONLINE_IMAGES.rice
      ),
      ...mapNamesToImage(["Stir fry spaghetti and chicken", "Stir fry spaghetti and turkey"], ONLINE_IMAGES.spaghetti),
    };

    const existingItems = await prisma.menuItem.findMany({
      where: { restaurantId: restaurant.id },
      select: { id: true, name: true },
    });

    if (existingItems.length > 0) {
      const dailyTreatByName = new Map(dailyTreatMenu.map((item) => [item.name, item]));
      const existingByName = new Map(existingItems.map((item) => [item.name, item]));

      await Promise.all(
        existingItems.map((existingItem) => {
          const matchedItem = dailyTreatByName.get(existingItem.name);
          if (matchedItem) {
            return prisma.menuItem.update({
              where: { id: existingItem.id },
              data: {
                price: matchedItem.price,
                image: getExactImage(matchedItem.name, dailyTreatImageMap, ONLINE_IMAGES.rice),
              },
            });
          }

          return prisma.menuItem.update({
            where: { id: existingItem.id },
            data: { image: ONLINE_IMAGES.rice },
          });
        })
      );

      const missingItems = dailyTreatMenu.filter((item) => !existingByName.has(item.name));
      if (missingItems.length > 0) {
        await prisma.menuItem.createMany({
          data: missingItems.map((item) => ({
            restaurantId: restaurant.id,
            ...item,
            image: getExactImage(item.name, dailyTreatImageMap, ONLINE_IMAGES.rice),
          })),
        });
      }
      return;
    }

    await prisma.menuItem.createMany({
      data: dailyTreatMenu.map((item) => ({
        restaurantId: restaurant.id,
        ...item,
        image: getExactImage(item.name, dailyTreatImageMap, ONLINE_IMAGES.rice),
      })),
    });
    return;
  }

  if (count > 0) return;

  await prisma.menuItem.createMany({
    data: [
      {
        restaurantId: restaurant.id,
        name: "Jollof Rice & Chicken",
        description: "Smoky Nigerian jollof rice served with grilled chicken.",
        price: 2500,
        image: ONLINE_IMAGES.rice,
      },
      {
        restaurantId: restaurant.id,
        name: "Pounded Yam & Egusi",
        description: "Soft pounded yam served with rich egusi soup.",
        price: 3000,
        image: ONLINE_IMAGES.egusi,
      },
      {
        restaurantId: restaurant.id,
        name: "Chapman Drink",
        description: "Refreshing Nigerian Chapman cocktail.",
        price: 1000,
        image: ONLINE_IMAGES.chapman,
      },
    ],
  });
};

const getCategory = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes("basket")) return "Packages";
  if (lower.includes("mocktail")) return "Mocktail";
  if (lower.includes("cake")) return "Cakes";
  if (
    lower.includes("roll") ||
    lower.includes("pie") ||
    lower.includes("chinchin") ||
    lower.includes("pastry")
  ) {
    return "Pastries";
  }
  if (lower.startsWith("extra ")) return "Extras";
  if (lower.includes("shawarma")) return "Shawarma";
  if (lower.includes("pizza")) return "Pizza";
  if (
    lower.includes("bbq") ||
    lower.includes("barbeque") ||
    lower.includes("catfish") ||
    lower.includes("croacker")
  ) {
    return "Barbeque";
  }
  if (lower.includes("asun")) return "Asun";
  return "Other";
};

const getFolaCategory = (name) => {
  const lower = name.toLowerCase();
  if (lower.startsWith("standard parfait")) return "Standard Parfait";
  if (lower.startsWith("exotic parfait")) return "Exotic Parfait";
  if (lower.startsWith("yogurt")) return "Yogurt";
  if (lower.startsWith("extras")) return "Extras";
  return "Other";
};

const getEsyCategory = (name) => {
  const lower = name.toLowerCase();
  if (lower.startsWith("snack")) return "Snack";
  if (lower.startsWith("small chops")) return "Small Chops (Fridays)";
  if (lower.startsWith("saturday special")) return "Saturday Special";
  return "Other";
};

const getDelightCategory = (name) => {
  const lower = name.toLowerCase();
  if (lower.startsWith("staples")) return "Staples";
  if (lower.startsWith("proteins")) return "Proteins";
  if (lower.startsWith("soup / swallow")) return "Soup / Swallow";
  return "Other";
};

const getIbileCategory = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes("ofada rice") || lower.includes("wanche rice")) return "Rice Meals";
  if (lower.startsWith("extra ")) return "Extras";
  if (lower === "egg" || lower === "fried plantains") return "Sides";
  if (lower === "assorted meat" || lower === "beef" || lower === "ponmo") return "Proteins";
  return "Other";
};

const getJJBistroCategory = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes("jollof rice") || lower.includes("plain rice") || lower.includes("basmati") || lower.includes("asun rice") || lower.includes("rice & beans")) return "Rice Dishes";
  if (lower.includes("asun") || lower.includes("roasted ponmo")) return "Grills & Specials";
  if (lower.includes("noodles") || lower.includes("spaghetti") || lower.includes("macaroni")) return "Pasta & Noodles";
  if (lower.includes("sandwich")) return "Sandwiches";
  if (lower.includes("soup") || lower.includes("swallow") || lower.includes("ekuru")) return "Soups & Swallows";
  if (lower === "fried egg" || lower === "sausage" || lower === "extra chicken" || lower === "soft drink" || lower === "water") return "Add-Ons";
  return "Other";
};

const getDeUniqueCategory = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes("jollof rice") || lower.includes("fried rice") || lower.includes("white rice") || lower.includes("yam porridge")) return "Rice & Yam Dishes";
  if (lower === "beans" || lower === "spaghetti") return "Beans & Pasta";
  if (lower === "amala" || lower === "semo" || lower === "fufu" || lower === "eba" || lower === "pounded yam") return "Swallows";
  if (lower === "goat meat" || lower === "chicken" || lower === "beef" || lower === "ponmo" || lower === "titus fish" || lower === "turkey") return "Proteins";
  return "Other";
};

const getDailyTreatCategory = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes("jollof") || lower.includes("fried rice")) return "Rice Meals";
  if (lower.includes("spaghetti")) return "Pasta";
  return "Other";
};

const getItem7goCategory = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes("shawarma + coke") || lower.includes("rice + chicken + coke")) return "Combos";
  if (lower.startsWith("extra ")) return "Extras";
  if (lower.includes("shawarma")) return "Shawarma";
  if (lower.includes("water") || lower.includes("maltina") || lower.includes("soda")) return "Drinks";
  if (lower.includes("coleslaw")) return "Sides";
  if (lower.includes("rice +")) return "Rice Meals";
  return "Other";
};

const getHollarCategory = (name) => {
  const lower = name.toLowerCase();
  if (lower.startsWith("spag")) return "Spaghetti";
  if (lower.startsWith("jollof rice")) return "Jollof Rice";
  if (lower.startsWith("yam fries")) return "Yam Fries";
  if (lower.includes("cocktail") || lower.includes("chapman")) return "Drinks";
  if (lower.includes("asu")) return "Spaghetti";
  return "Other";
};

const getWilliamsCategory = (name) => {
  const lower = name.toLowerCase();
  if (lower.startsWith("extra ")) return "Extras";
  if (lower.includes("shawarma") && !lower.includes("pizza")) return "Shawarma";
  if (lower.includes("pizza")) return "Pizza";
  if (lower.includes("bbq") || lower.includes("barbeque") || lower.includes("catfish") || lower.includes("croacker")) {
    return "Barbeque";
  }
  if (lower.includes("asun")) return "Asun";
  return "Other";
};

const getMenuCategory = (restaurantName, itemName) => {
  if (restaurantName === "Vibrant Food Mart") {
    return "Packages";
  }
  if (restaurantName === "Shop With Rahma") {
    return "Groceries";
  }
  if (restaurantName === "Williams Grill Place") {
    return getWilliamsCategory(itemName);
  }
  if (restaurantName === "Item7go") {
    return getItem7goCategory(itemName);
  }
  if (restaurantName === "Hollar Lee Express Meal") {
    return getHollarCategory(itemName);
  }
  if (restaurantName === "Mide Pastries") {
    return getCategory(itemName);
  }
  if (restaurantName === "Fola Juice & Parfait") {
    return getFolaCategory(itemName);
  }
  if (restaurantName === "Esy Tasties") {
    return getEsyCategory(itemName);
  }
  if (restaurantName === "Delight Restaurant") {
    return getDelightCategory(itemName);
  }
  if (restaurantName === "Ibile Xpress (Go)") {
    return getIbileCategory(itemName);
  }
  if (restaurantName === "JJ Bistro") {
    return getJJBistroCategory(itemName);
  }
  if (restaurantName === "De Unique Kitchen") {
    return getDeUniqueCategory(itemName);
  }
  if (restaurantName === "Daily Treat") {
    return getDailyTreatCategory(itemName);
  }
  return getCategory(itemName);
};

const resolveBusinessType = (record) => record?.type ?? getBusinessTypeForName(record?.name ?? "");
const ensureBusinessType = (record, type) => record && resolveBusinessType(record) === type;

const sortCategoryEntries = (categoriesObj, restaurantName) => {
  const defaultOrder = ["Shawarma", "Pizza", "Barbeque", "Asun", "Extras", "Other"];
  const item7goOrder = ["Rice Meals", "Extras", "Shawarma", "Combos", "Sides", "Drinks", "Other"];
  const hollarOrder = ["Spaghetti", "Jollof Rice", "Yam Fries", "Drinks", "Other"];
  const mideOrder = ["Cakes", "Pastries", "Shawarma", "Mocktail", "Other"];
  const folaOrder = ["Standard Parfait", "Exotic Parfait", "Extras", "Yogurt", "Other"];
  const esyOrder = ["Snack", "Small Chops (Fridays)", "Saturday Special", "Other"];
  const delightOrder = ["Staples", "Proteins", "Soup / Swallow", "Other"];
  const vibrantOrder = ["Packages", "Other"];
  const rahmaOrder = ["Groceries", "Other"];
  const ibileOrder = ["Rice Meals", "Proteins", "Sides", "Extras", "Other"];
  const jjBistroOrder = ["Rice Dishes", "Grills & Specials", "Pasta & Noodles", "Sandwiches", "Soups & Swallows", "Add-Ons", "Other"];
  const deUniqueOrder = ["Rice & Yam Dishes", "Beans & Pasta", "Swallows", "Proteins", "Other"];
  const dailyTreatOrder = ["Rice Meals", "Pasta", "Other"];
  const preferredOrder =
    restaurantName === "Item7go"
      ? item7goOrder
      : restaurantName === "Hollar Lee Express Meal"
        ? hollarOrder
        : restaurantName === "Mide Pastries"
          ? mideOrder
          : restaurantName === "Fola Juice & Parfait"
            ? folaOrder
            : restaurantName === "Esy Tasties"
              ? esyOrder
              : restaurantName === "Delight Restaurant"
                ? delightOrder
        : restaurantName === "Vibrant Food Mart"
          ? vibrantOrder
          : restaurantName === "Shop With Rahma"
            ? rahmaOrder
            : restaurantName === "Ibile Xpress (Go)"
              ? ibileOrder
              : restaurantName === "JJ Bistro"
                ? jjBistroOrder
                : restaurantName === "De Unique Kitchen"
                  ? deUniqueOrder
                  : restaurantName === "Daily Treat"
                    ? dailyTreatOrder
        : defaultOrder;
  const entries = Object.entries(categoriesObj);
  entries.sort((a, b) => {
    const ai = preferredOrder.indexOf(a[0]);
    const bi = preferredOrder.indexOf(b[0]);
    const aRank = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
    const bRank = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
    if (aRank !== bRank) return aRank - bRank;
    return a[0].localeCompare(b[0]);
  });

  return entries.reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});
};

const toPublicUrl = (req, value) => {
  if (!value || typeof value !== "string") return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (!value.startsWith("/")) return value;
  return `${req.protocol}://${req.get("host")}${value}`;
};

const normalizeMenuItem = (restaurantName, item) => {
  const category = getMenuCategory(restaurantName, item.name);
  const separator = " - ";
  const splitIndex = item.name.indexOf(separator);
  const itemName = splitIndex > -1 ? item.name.slice(0, splitIndex).trim() : item.name;
  const variant = splitIndex > -1 ? item.name.slice(splitIndex + separator.length).trim() : null;

  return {
    id: item.id,
    category,
    item: itemName,
    variant,
    description: item.description ?? null,
    price: item.price,
    image: item.image,
    isOrderable: item.price > 0,
  };
};

const buildStructuredMenu = (normalizedItems) =>
  normalizedItems.reduce((acc, entry) => {
    if (!acc[entry.category]) acc[entry.category] = {};
    if (!acc[entry.category][entry.item]) acc[entry.category][entry.item] = [];
    acc[entry.category][entry.item].push({
      id: entry.id,
      variant: entry.variant,
      description: entry.description,
      price: entry.price,
      image: entry.image,
      isOrderable: entry.isOrderable,
    });
    return acc;
  }, {});

router.get("/", async (req, res, next) => {
  try {
    await seedRestaurants();
    const { q, open } = req.query;
    const type = getRequestedBusinessType(req);
    const where = {};

    if (q) {
      // MySQL collation is usually case-insensitive already
      where.name = { contains: String(q) };
    }

    if (open === "true") {
      where.open = true;
    }

    where.type = type;

    const restaurants = await prisma.restaurant.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const normalizedRestaurants = restaurants.map((restaurant) => ({
      ...restaurant,
      type: restaurant.type ?? getBusinessTypeForName(restaurant.name),
      currency: "NGN",
      image: toPublicUrl(req, restaurant.image),
    }));

    return res.status(200).json({
      type,
      businesses: normalizedRestaurants,
      shops: type === "shop" ? normalizedRestaurants : undefined,
      restaurants: type === "restaurant" ? normalizedRestaurants : undefined,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const type = getRequestedBusinessType(req);
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: req.params.id },
    });

    if (!ensureBusinessType(restaurant, type)) {
      return res.status(404).json({ error: `${getBusinessLabel(type)} not found.` });
    }

    return res.status(200).json({
      restaurant: {
        ...restaurant,
        type: resolveBusinessType(restaurant),
        currency: "NGN",
        image: toPublicUrl(req, restaurant.image),
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id/menu", async (req, res, next) => {
  try {
    const type = getRequestedBusinessType(req);
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: req.params.id },
    });

    if (!ensureBusinessType(restaurant, type)) {
      return res.status(404).json({ error: `${getBusinessLabel(type)} not found.` });
    }

    await seedMenu(restaurant);

    const items = await prisma.menuItem.findMany({
      where: {
        restaurantId: restaurant.id,
        price: { gt: 0 },
      },
      orderBy: { name: "asc" },
    });
    const itemsWithPublicImages = items.map((item) => ({
      ...item,
      image: toPublicUrl(req, item.image),
    }));

    const categories = itemsWithPublicImages.reduce((acc, item) => {
      const category = getMenuCategory(restaurant.name, item.name);
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});

    const normalizedItems = itemsWithPublicImages.map((item) => normalizeMenuItem(restaurant.name, item));
    const structuredMenu = buildStructuredMenu(normalizedItems);

    return res.status(200).json({
      currency: "NGN",
      items: itemsWithPublicImages,
      categories: sortCategoryEntries(categories, restaurant.name),
      normalizedItems,
      structuredMenu,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
