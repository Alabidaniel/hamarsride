const express = require("express");
const prisma = require("../prisma");

const router = express.Router();
const WILLIAMS_IMAGE = "/uploads/williamgrills.png";
const ITEM7GO_IMAGE = "/uploads/item7.png";
const BIGGIS_IMAGE = WILLIAMS_IMAGE;
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
  rice: "https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?cs=srgb&dl=pexels-chanwalrus-723198.jpg&fm=jpg",
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
};

const getExactImage = (itemName, imageMap, fallbackImage) => imageMap[itemName] ?? fallbackImage;
const mapNamesToImage = (names, imageUrl) =>
  names.reduce((acc, name) => {
    acc[name] = imageUrl;
    return acc;
  }, {});

const seedRestaurants = async () => {
  const restaurants = [
    {
      name: "Williams Grill Place",
      image: WILLIAMS_IMAGE,
      rating: 4.7,
      time: "25-35 mins",
      fee: "N1000",
      open: true,
    },
    {
      name: "Biggi's Sumptuous Shawarma and Pizza",
      image: BIGGIS_IMAGE,
      rating: 4.8,
      time: "30-40 mins",
      fee: "N1200",
      open: true,
    },
    {
      name: "Item7go",
      image: ITEM7GO_IMAGE,
      rating: 4.6,
      time: "25-40 mins",
      fee: "N1000",
      open: true,
    },
    {
      name: "Hollar Lee Express Meal",
      image: ONLINE_IMAGES.rice,
      rating: 4.5,
      time: "25-40 mins",
      fee: "N1000",
      open: true,
    },
  ];

  for (const restaurant of restaurants) {
    const existing = await prisma.restaurant.findFirst({
      where: { name: restaurant.name },
      select: { id: true },
    });

    if (existing) {
      await prisma.restaurant.update({
        where: { id: existing.id },
        data: restaurant,
      });
      continue;
    }

    await prisma.restaurant.create({ data: restaurant });
  }
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
      ...mapNamesToImage(["Asun Plate - Small", "Asun Plate - Medium", "Asun Plate - Large", "Extra Beef"], ONLINE_IMAGES.grilledMeat),
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
          "Rice + Chicken - Option 1",
          "Rice + Chicken - Option 2",
          "Rice + Beef - Option 1",
          "Rice + Beef - Option 2",
          "Rice + Fish - Option 1",
          "Rice + Fish - Option 2",
          "Rice + Croaker Fish - Option 1",
          "Rice + Croaker Fish - Option 2",
          "Extra Rice",
          "Extra Plantain",
          "Rice + Chicken + Coke",
        ],
        ONLINE_IMAGES.rice
      ),
      ...mapNamesToImage(["Extra Chicken"], ONLINE_IMAGES.grilledChicken),
      ...mapNamesToImage(["Extra Beef"], ONLINE_IMAGES.grilledMeat),
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
  if (restaurantName === "Williams Grill Place") {
    return getWilliamsCategory(itemName);
  }
  if (restaurantName === "Item7go") {
    return getItem7goCategory(itemName);
  }
  if (restaurantName === "Hollar Lee Express Meal") {
    return getHollarCategory(itemName);
  }
  return getCategory(itemName);
};

const sortCategoryEntries = (categoriesObj, restaurantName) => {
  const defaultOrder = ["Shawarma", "Pizza", "Barbeque", "Asun", "Extras", "Other"];
  const item7goOrder = ["Rice Meals", "Extras", "Shawarma", "Combos", "Sides", "Drinks", "Other"];
  const hollarOrder = ["Spaghetti", "Jollof Rice", "Yam Fries", "Drinks", "Other"];
  const preferredOrder =
    restaurantName === "Item7go"
      ? item7goOrder
      : restaurantName === "Hollar Lee Express Meal"
        ? hollarOrder
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
    price: item.price,
    image: item.image,
  };
};

const buildStructuredMenu = (normalizedItems) =>
  normalizedItems.reduce((acc, entry) => {
    if (!acc[entry.category]) acc[entry.category] = {};
    if (!acc[entry.category][entry.item]) acc[entry.category][entry.item] = [];
    acc[entry.category][entry.item].push({
      id: entry.id,
      variant: entry.variant,
      price: entry.price,
      image: entry.image,
    });
    return acc;
  }, {});

router.get("/", async (req, res, next) => {
  try {
    await seedRestaurants();
    const { q, open } = req.query;
    const where = {};

    if (q) {
      // MySQL collation is usually case-insensitive already
      where.name = { contains: String(q) };
    }

    if (open === "true") {
      where.open = true;
    }

    const restaurants = await prisma.restaurant.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const normalizedRestaurants = restaurants.map((restaurant) => ({
      ...restaurant,
      currency: "NGN",
      image: toPublicUrl(req, restaurant.image),
    }));

    return res.status(200).json({ restaurants: normalizedRestaurants });
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

    return res.status(200).json({
      restaurant: {
        ...restaurant,
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
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: req.params.id },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found." });
    }

    await seedMenu(restaurant);

    const items = await prisma.menuItem.findMany({
      where: { restaurantId: restaurant.id },
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
