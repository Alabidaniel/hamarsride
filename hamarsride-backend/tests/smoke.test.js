const test = require("node:test");
const assert = require("node:assert/strict");
const { access } = require("node:fs/promises");
const { constants } = require("node:fs");
const { join } = require("node:path");

const mustExist = async (relativePath) => {
  await access(join(process.cwd(), relativePath), constants.F_OK);
};

test("backend entry files exist", async () => {
  await mustExist("src/server.js");
  await mustExist("src/app.js");
  await mustExist("prisma/schema.prisma");
});

test("core routes exist", async () => {
  await mustExist("src/routes/authRoutes.js");
  await mustExist("src/routes/ordersRoutes.js");
  await mustExist("src/routes/paymentsRoutes.js");
});

test("sanity assertion", () => {
  assert.equal(true, true);
});
