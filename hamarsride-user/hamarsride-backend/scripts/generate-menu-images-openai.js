#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const args = process.argv.slice(2);
const getArgValue = (name, fallback) => {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  return args[index + 1] ?? fallback;
};

const inputPath = path.resolve(getArgValue("--input", "generated/menu-image-prompts.json"));
const outputManifestPath = path.resolve(getArgValue("--output", "generated/menu-images-manifest.json"));
const uploadsDir = path.resolve(getArgValue("--uploads", "uploads/menu"));
const limitRaw = getArgValue("--limit", null);
const limit = limitRaw ? Number(limitRaw) : null;
const model = getArgValue("--model", "gpt-image-1");
const size = getArgValue("--size", "1024x1024");
const quality = getArgValue("--quality", "high");
const providerArg = getArgValue("--provider", "auto");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateImageOpenAI = async (prompt, apiKey) => {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      size,
      quality,
      response_format: "b64_json",
    }),
  });

  const json = await response.json();
  if (!response.ok) {
    const message = json?.error?.message || `HTTP ${response.status}`;
    throw new Error(message);
  }

  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) throw new Error("No image data returned by OpenAI.");
  return Buffer.from(b64, "base64");
};

const generateImagePollinations = async (prompt) => {
  const encodedPrompt = encodeURIComponent(prompt);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=42&model=flux`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Pollinations HTTP ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const run = async () => {
  const apiKey = process.env.OPENAI_API_KEY;
  const provider =
    providerArg === "auto" ? (apiKey ? "openai" : "pollinations") : providerArg.toLowerCase();
  if (provider === "openai" && !apiKey) {
    console.error("OPENAI_API_KEY is missing for provider=openai.");
    process.exit(1);
  }

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

  const rows = limit ? promptRows.slice(0, limit) : promptRows;
  const manifest = [];
  const failures = [];

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const menuItemId = row.menuItemId;
    const prompt = row.prompt;
    if (!menuItemId || !prompt) {
      failures.push({ menuItemId, error: "Missing menuItemId or prompt." });
      continue;
    }

    const filename = `${menuItemId}.png`;
    const filePath = path.join(uploadsDir, filename);
    const publicImagePath = `/uploads/menu/${filename}`;

    try {
      const imageBuffer =
        provider === "openai"
          ? await generateImageOpenAI(prompt, apiKey)
          : await generateImagePollinations(prompt);
      fs.writeFileSync(filePath, imageBuffer);
      manifest.push({ menuItemId, image: publicImagePath });
      console.log(`[${i + 1}/${rows.length}] OK (${provider}) ${row.restaurantName} :: ${row.originalName}`);
      await sleep(250);
    } catch (error) {
      failures.push({ menuItemId, error: error.message });
      console.error(`[${i + 1}/${rows.length}] FAIL ${row.restaurantName} :: ${row.originalName} -> ${error.message}`);
      await sleep(600);
    }
  }

  fs.writeFileSync(
    outputManifestPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        provider,
        model,
        size,
        quality,
        totalRequested: rows.length,
        totalGenerated: manifest.length,
        totalFailed: failures.length,
        items: manifest,
        failures,
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  console.log(`Saved manifest: ${outputManifestPath}`);
  console.log(`Generated: ${manifest.length}, Failed: ${failures.length}`);
  if (manifest.length === 0) process.exit(1);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
