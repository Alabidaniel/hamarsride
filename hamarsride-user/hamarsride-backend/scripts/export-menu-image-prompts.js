#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const prisma = require("../src/prisma");

const DEFAULT_OUTPUT = "generated/menu-image-prompts.json";
const DEFAULT_CONFIG = "generated/menu-image-config.json";

const args = process.argv.slice(2);
const getArgValue = (name, fallback) => {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  return args[index + 1] ?? fallback;
};

const outputPath = getArgValue("--output", DEFAULT_OUTPUT);
const configPath = getArgValue("--config", DEFAULT_CONFIG);

const splitItemName = (name) => {
  const separator = " - ";
  const idx = name.indexOf(separator);
  if (idx === -1) return { item: name, variant: null };
  return {
    item: name.slice(0, idx).trim(),
    variant: name.slice(idx + separator.length).trim(),
  };
};

const isGroceryStore = (restaurantName) =>
  restaurantName === "Shop With Rahma" || restaurantName === "Vibrant Food Mart";

const buildPrompt = ({ restaurantName, itemName, variant, styleMode, currency, price }) => {
  const core =
    styleMode === "grocery"
      ? [
          "Photorealistic product photo for an online grocery menu.",
          `Product: ${itemName}.`,
          variant ? `Variant: ${variant}.` : null,
          "One clear package or portion only, centered, front-facing.",
          "Plain clean background, soft natural lighting, sharp focus, no hands, no people, no logos unless on product packaging.",
          "Square composition for app menu thumbnail.",
        ]
      : [
          "Photorealistic plated food photo for a delivery app menu.",
          `Dish: ${itemName}.`,
          variant ? `Variant: ${variant}.` : null,
          "Single hero serving, centered composition, slight top-front camera angle.",
          "Clean neutral background with soft natural shadows and appetizing color.",
          "No people, no text overlay, no watermark, no extra props.",
          "Square composition for app menu thumbnail.",
        ];

  core.push(`Brand context: ${restaurantName}.`);
  core.push(`Price context: ${currency}${price}.`);
  core.push("High detail, realistic texture, true-to-life color.");

  return core.filter(Boolean).join(" ");
};

const defaultConfig = {
  version: 1,
  model: "gpt-image-1.5",
  imageSize: "1024x1024",
  quality: "high",
  background: "clean-neutral",
  lighting: "soft-natural",
  cameraAngle: "slight-top-front",
  composition: "single-subject-centered",
  negativePrompt:
    "blurry, watermark, logo overlay, text overlay, people, hands, cluttered background, duplicate plates, distorted packaging",
  outputNotes: "Use one image per menu item and keep style consistent across all restaurants.",
};

const run = async () => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      orderBy: { name: "asc" },
      include: {
        menuItems: {
          orderBy: { name: "asc" },
          select: { id: true, name: true, price: true, image: true },
        },
      },
    });

    const prompts = restaurants.flatMap((restaurant) =>
      restaurant.menuItems.map((menuItem) => {
        const { item, variant } = splitItemName(menuItem.name);
        const styleMode = isGroceryStore(restaurant.name) ? "grocery" : "food";
        return {
          menuItemId: menuItem.id,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          originalName: menuItem.name,
          itemName: item,
          variant,
          price: menuItem.price,
          currency: "NGN",
          styleMode,
          existingImage: menuItem.image,
          prompt: buildPrompt({
            restaurantName: restaurant.name,
            itemName: item,
            variant,
            styleMode,
            currency: "NGN",
            price: menuItem.price,
          }),
        };
      })
    );

    const resolvedOutput = path.resolve(outputPath);
    const resolvedConfig = path.resolve(configPath);
    fs.mkdirSync(path.dirname(resolvedOutput), { recursive: true });
    fs.mkdirSync(path.dirname(resolvedConfig), { recursive: true });

    fs.writeFileSync(
      resolvedOutput,
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          restaurants: restaurants.length,
          menuItems: prompts.length,
          prompts,
        },
        null,
        2
      )}\n`,
      "utf8"
    );
    fs.writeFileSync(`${resolvedConfig}`, `${JSON.stringify(defaultConfig, null, 2)}\n`, "utf8");

    console.log(`Wrote prompts to ${resolvedOutput}`);
    console.log(`Wrote config  to ${resolvedConfig}`);
    console.log(`Total prompts: ${prompts.length}`);
  } catch (error) {
    console.error("Failed to export menu image prompts.");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

run();
