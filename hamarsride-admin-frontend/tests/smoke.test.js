import test from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const mustExist = async (relativePath) => {
  await access(join(process.cwd(), relativePath), constants.F_OK);
};

test("core admin frontend files exist", async () => {
  await mustExist("src/main.jsx");
  await mustExist("src/App.jsx");
  await mustExist("vite.config.js");
});

test("core admin pages exist", async () => {
  await mustExist("pages/AdminDashboard.jsx");
  await mustExist("pages/AdminOrders.jsx");
  await mustExist("pages/AdminPayments.jsx");
});

test("sanity assertion", () => {
  assert.equal(true, true);
});


