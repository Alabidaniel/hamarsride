#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const getArgValue = (name, fallback) => {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  return args[index + 1] ?? fallback;
};

const inputPath = path.resolve(getArgValue("--input", "generated/menu-image-prompts.json"));
const outputManifestPath = path.resolve(getArgValue("--output", "generated/menu-images-manifest.json"));
const uploadsDir = path.resolve(getArgValue("--uploads", "uploads/menu"));

const escapeXml = (text) =>
  String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const themeFor = (restaurantName) => {
  if (restaurantName === "Shop With Rahma") {
    return { bg1: "#14532d", bg2: "#16a34a", accent: "#d9f99d", icon: "SHOP" };
  }
  if (restaurantName === "Vibrant Food Mart") {
    return { bg1: "#78350f", bg2: "#ea580c", accent: "#ffedd5", icon: "MART" };
  }
  return { bg1: "#0f172a", bg2: "#0369a1", accent: "#e0f2fe", icon: "FOOD" };
};

const buildSvg = ({ restaurantName, itemName, variant, price }) => {
  const theme = themeFor(restaurantName);
  const title = variant ? `${itemName} (${variant})` : itemName;
  const subtitle = `${restaurantName}  |  NGN${price}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bg1}" />
      <stop offset="100%" stop-color="${theme.bg2}" />
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)" />
  <rect x="72" y="72" width="880" height="880" rx="36" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" />
  <text x="116" y="190" fill="${theme.accent}" font-family="Segoe UI, Arial, sans-serif" font-size="44" font-weight="700">${escapeXml(
    theme.icon
  )}</text>
  <text x="116" y="360" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="64" font-weight="700">${escapeXml(
    title
  )}</text>
  <text x="116" y="430" fill="#e2e8f0" font-family="Segoe UI, Arial, sans-serif" font-size="30">${escapeXml(subtitle)}</text>
</svg>
`;
};

const splitItemName = (name) => {
  const separator = " - ";
  const idx = name.indexOf(separator);
  if (idx === -1) return { item: name, variant: null };
  return {
    item: name.slice(0, idx).trim(),
    variant: name.slice(idx + separator.length).trim(),
  };
};

const run = async () => {
  if (!fs.existsSync(inputPath)) {
    console.error(`Prompt input not found: ${inputPath}`);
    process.exit(1);
  }

  const payload = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const promptRows = Array.isArray(payload) ? payload : payload.prompts;
  if (!Array.isArray(promptRows) || promptRows.length === 0) {
    console.error("No prompts found in input file.");
    process.exit(1);
  }

  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.mkdirSync(path.dirname(outputManifestPath), { recursive: true });

  const manifest = [];
  for (const row of promptRows) {
    if (!row.menuItemId) continue;
    const { item, variant } = splitItemName(row.originalName || row.itemName || "Menu Item");
    const svg = buildSvg({
      restaurantName: row.restaurantName || "Restaurant",
      itemName: item,
      variant,
      price: row.price || 0,
    });
    const filename = `${row.menuItemId}.svg`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, svg, "utf8");
    manifest.push({
      menuItemId: row.menuItemId,
      image: `/uploads/menu/${filename}`,
    });
  }

  fs.writeFileSync(
    outputManifestPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        provider: "local-svg",
        totalGenerated: manifest.length,
        items: manifest,
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  console.log(`Saved manifest: ${outputManifestPath}`);
  console.log(`Generated local SVGs: ${manifest.length}`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
