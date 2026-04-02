const dotenv = require("dotenv");
dotenv.config();

const prisma = require("../src/prisma");
const { getAuth } = require("../src/config/firebase");

function parseInput() {
  const email = process.argv[2] || process.env.ADMIN_EMAIL;
  const password = process.argv[3] || process.env.ADMIN_PASSWORD;
  const name = process.argv[4] || process.env.ADMIN_NAME || "HamarsRide Admin";

  if (!email) {
    throw new Error("Provide an email: npm run admin:create -- you@example.com StrongPass123");
  }
  if (!password || password.length < 6) {
    throw new Error("Provide a password (min 6 chars): npm run admin:create -- you@example.com StrongPass123");
  }

  return { email, password, name };
}

async function getOrCreateFirebaseUser(auth, { email, password, name }) {
  try {
    const existing = await auth.getUserByEmail(email);
    const updated = await auth.updateUser(existing.uid, {
      password,
      displayName: name,
      emailVerified: true,
    });
    return { user: updated, created: false };
  } catch (error) {
    if (error.code !== "auth/user-not-found") {
      throw error;
    }

    const created = await auth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: true,
    });
    return { user: created, created: true };
  }
}

async function upsertAdminProfile({ uid, email, name }) {
  const byUid = await prisma.user.findUnique({
    where: { firebaseUid: uid },
  });

  if (byUid) {
    return prisma.user.update({
      where: { id: byUid.id },
      data: {
        email,
        name: byUid.name || name,
        role: "admin",
      },
    });
  }

  const byEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: {
        firebaseUid: uid,
        name: byEmail.name || name,
        role: "admin",
      },
    });
  }

  return prisma.user.create({
    data: {
      firebaseUid: uid,
      email,
      name,
      role: "admin",
    },
  });
}

async function main() {
  const input = parseInput();
  const auth = getAuth();

  const { user, created } = await getOrCreateFirebaseUser(auth, input);
  const profile = await upsertAdminProfile({
    uid: user.uid,
    email: input.email,
    name: input.name,
  });

  console.log(created ? `Created Firebase user ${input.email}.` : `Updated Firebase user ${input.email}.`);
  console.log(`Admin profile ready for ${profile.email} (role: ${profile.role}).`);
}

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
