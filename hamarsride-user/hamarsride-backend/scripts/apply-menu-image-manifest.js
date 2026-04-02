#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const prisma = require("../src/prisma");

const args = process.argv.slice(2);
const getArgValue = (name, fallback) => {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  return args[index + 1] ?? fallback;
};

const inputPath = getArgValue("--input", "generated/menu-images-manifest.json");

const normalizeEntries = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.items)) return raw.items;
  if (raw && Array.isArray(raw.images)) return raw.images;
  return null;
};

const run = async () => {
  try {
    const resolvedInput = path.resolve(inputPath);
    if (!fs.existsSync(resolvedInput)) {
      throw new Error(`Input manifest not found: ${resolvedInput}`);
    }

    const raw = JSON.parse(fs.readFileSync(resolvedInput, "utf8"));
    const entries = normalizeEntries(raw);
    if (!entries) {
      throw new Error("Invalid manifest format. Use an array or { items: [] } with menuItemId and image.");
    }

    const validEntries = entries.filter(
      (entry) =>
        entry &&
        typeof entry.menuItemId === "string" &&
        entry.menuItemId.trim() &&
        typeof entry.image === "string" &&
        entry.image.trim()
    );

    if (validEntries.length === 0) {
      throw new Error("No valid entries found. Each row needs menuItemId and image.");
    }

    let updated = 0;
    for (const entry of validEntries) {
      await prisma.menuItem.update({
        where: { id: entry.menuItemId },
        data: { image: entry.image.trim() },
      });
      updated += 1;
    }

    console.log(`Applied ${updated} image updates from ${resolvedInput}`);
  } catch (error) {
    console.error("Failed to apply menu image manifest.");
    console.error(error.message || error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

run();
