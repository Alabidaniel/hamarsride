const express = require("express");
const { z } = require("zod");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const prisma = require("../prisma");
const { getAuth } = require("../config/firebase");
const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  altPhone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  photoUrl: z.string().min(1).optional(),
});

const passwordSchema = z.object({
  newPassword: z.string().min(6),
  currentPassword: z.string().min(1),
});

const uploadRoot = path.join(__dirname, "..", "..", "uploads", "profile-photos");
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = [".png", ".jpg", ".jpeg", ".webp"].includes(ext) ? ext : ".jpg";
    const id = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");
    cb(null, `${id}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed."));
    }
    return cb(null, true);
  },
});

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
});

router.patch("/", async (req, res, next) => {
  try {
    const data = updateSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name ?? user.name,
        phone: data.phone ?? user.phone,
        altPhone: data.altPhone ?? user.altPhone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : user.dateOfBirth,
        gender: data.gender ?? user.gender,
        photoUrl: data.photoUrl ?? user.photoUrl,
        email: req.user.email ?? user.email,
      },
    });

    return res.status(200).json({ user: updated });
  } catch (error) {
    return next(error);
  }
});

router.post("/password", async (req, res, next) => {
  try {
    const data = passwordSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const auth = getAuth();
    await auth.updateUser(req.user.uid, { password: data.newPassword });

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    return next(error);
  }
});

router.delete("/", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const auth = getAuth();
    await auth.deleteUser(req.user.uid);

    if (user.photoUrl && user.photoUrl.startsWith("/uploads/profile-photos/")) {
      const filename = user.photoUrl.replace("/uploads/profile-photos/", "");
      const filePath = path.join(uploadRoot, filename);
      fs.unlink(filePath, () => {});
    }

    await prisma.$transaction([
      prisma.payment.deleteMany({ where: { userId: user.id } }),
      prisma.orderItem.deleteMany({
        where: {
          order: {
            userId: user.id,
          },
        },
      }),
      prisma.order.deleteMany({ where: { userId: user.id } }),
      prisma.address.deleteMany({ where: { userId: user.id } }),
      prisma.notification.deleteMany({ where: { userId: user.id } }),
      prisma.cartItem.deleteMany({ where: { userId: user.id } }),
      prisma.user.delete({ where: { id: user.id } }),
    ]);

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.post("/photo", upload.single("photo"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No photo uploaded." });
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const photoUrl = `/uploads/profile-photos/${req.file.filename}`;
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        photoUrl,
        email: req.user.email ?? user.email,
      },
    });

    return res.status(200).json({ user: updated });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
