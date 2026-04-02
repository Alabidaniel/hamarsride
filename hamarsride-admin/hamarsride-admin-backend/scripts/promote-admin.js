const dotenv = require("dotenv");
dotenv.config();

const prisma = require("../src/prisma");

async function main() {
  const email = process.argv[2] || process.env.ADMIN_EMAIL;
  if (!email) {
    throw new Error("Provide an email: npm run admin:promote -- you@example.com");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    throw new Error(`No user found for ${email}. Login/signup first so profile is created.`);
  }

  const updated = await prisma.user.update({
    where: { id: existing.id },
    data: { role: "admin" },
  });

  console.log(`Promoted ${updated.email} to admin.`);
}

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
