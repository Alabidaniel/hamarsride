const express = require("express");
const { z } = require("zod");
const prisma = require("../prisma");
const { getAuth } = require("../config/firebase");

const router = express.Router();

const registerSchema = z.object({
  idToken: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().optional(),
  altPhone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
});

const loginSchema = z.object({
  idToken: z.string().min(1),
});

const resetSchema = z.object({
  email: z.string().email(),
});

async function verifyToken(idToken) {
  const auth = getAuth();
  return auth.verifyIdToken(idToken);
}

router.post("/register", async (req, res, next) => {
  try {
    const { idToken, name, phone, altPhone, dateOfBirth, gender } = registerSchema.parse(req.body);
    const decoded = await verifyToken(idToken);

    if (!decoded.email) {
      return res.status(400).json({ error: "Firebase user has no email." });
    }

    const existing = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
    });

    if (existing) {
      return res.status(200).json({ user: existing, created: false });
    }

    const user = await prisma.user.create({
      data: {
        firebaseUid: decoded.uid,
        name: name.trim(),
        email: decoded.email,
        phone: phone ? phone.trim() : null,
        altPhone: altPhone ? altPhone.trim() : null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender ? gender.trim() : null,
        role: "customer",
      },
    });

    return res.status(201).json({ user, created: true });
  } catch (error) {
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { idToken } = loginSchema.parse(req.body);
    let decoded;
    try {
      decoded = await verifyToken(idToken);
    } catch (error) {
      console.error("Login token verification failed:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      return res.status(401).json({
        error: error.message || "Firebase token verification failed.",
      });
    }

    if (!decoded.email) {
      return res.status(400).json({ error: "Firebase user has no email." });
    }

    let synced;
    try {
      let user = await prisma.user.findUnique({
        where: { firebaseUid: decoded.uid },
      });

      if (!user) {
        const matchingEmailUser = await prisma.user.findUnique({
          where: { email: decoded.email },
        });

        if (matchingEmailUser) {
          user = await prisma.user.update({
            where: { id: matchingEmailUser.id },
            data: {
              firebaseUid: decoded.uid,
              email: decoded.email,
              name: matchingEmailUser.name || decoded.name || decoded.email.split("@")[0],
            },
          });
        } else {
          user = await prisma.user.create({
            data: {
              firebaseUid: decoded.uid,
              name: decoded.name || decoded.email.split("@")[0],
              email: decoded.email,
              role: "customer",
            },
          });
        }
      }

      synced =
        decoded.email && decoded.email !== user.email
          ? await prisma.user.update({
              where: { id: user.id },
              data: { email: decoded.email },
            })
          : user;
    } catch (error) {
      console.error("Login user sync failed:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      return res.status(500).json({
        error: error.message || "Backend login sync failed.",
      });
    }

    return res.status(200).json({ user: synced });
  } catch (error) {
    return next(error);
  }
});

router.post("/password-reset", async (req, res, next) => {
  try {
    resetSchema.parse(req.body);
    return res.status(200).json({ message: "Password reset handled by Firebase client." });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
