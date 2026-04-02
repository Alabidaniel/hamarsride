const express = require("express");
const { z } = require("zod");
const prisma = require("../prisma");
const { getAuth } = require("../config/firebase");

const router = express.Router();

const loginSchema = z.object({
  idToken: z.string().min(1),
});

router.post("/login", async (req, res, next) => {
  try {
    const { idToken } = loginSchema.parse(req.body);
    const decoded = await getAuth().verifyIdToken(idToken);

    let user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
    });

    if (!user && decoded.email) {
      const byEmail = await prisma.user.findUnique({
        where: { email: decoded.email },
      });

      if (byEmail) {
        user = await prisma.user.update({
          where: { id: byEmail.id },
          data: { firebaseUid: decoded.uid },
        });
      }
    }

    if (!user) {
      return res.status(404).json({ error: "User profile not found." });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required." });
    }

    const synced = decoded.email && decoded.email !== user.email
      ? await prisma.user.update({ where: { id: user.id }, data: { email: decoded.email } })
      : user;

    return res.status(200).json({ user: synced });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
