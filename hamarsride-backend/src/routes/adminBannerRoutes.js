/**
 * Admin Banner Routes
 * Full CRUD for banner management (ADMIN only)
 *
 * Mounted at: /api/admin/banners
 *
 * Endpoints:
 * - GET    /               List all banners
 * - POST   /               Create banner (supports multipart upload)
 * - PATCH  /:id            Update banner (supports multipart upload)
 * - POST   /:id/toggle     Toggle active/inactive
 * - DELETE /:id            Delete banner (and uploaded image if local)
 */

const express = require("express");
const { z } = require("zod");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");

const prisma = require("../prisma");
const requireAuth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole");
const { createAuditLog } = require("../utils/auditLog");

const router = express.Router();

const uploadRoot = path.join(__dirname, "..", "..", "uploads", "banners");
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
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed."));
    }
    return cb(null, true);
  },
});

const getClientIp = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "unknown"
  );
};

const toJsonSafe = (value) => {
  try {
    return value ? JSON.parse(JSON.stringify(value)) : value;
  } catch (_e) {
    return null;
  }
};

const createBannerSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().optional(),
    targetType: z.enum(["restaurant", "promo"]).default("promo"),
    restaurantId: z.string().optional(),
    linkUrl: z.string().url().optional(),
    isActive: z.coerce.boolean().optional().default(true),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    priority: z.coerce.number().int().min(0).optional().default(0),
    imageUrl: z.string().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.targetType === "restaurant" && !data.restaurantId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["restaurantId"],
        message: "restaurantId is required when targetType=restaurant.",
      });
    }

    if (data.targetType === "promo" && !data.linkUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["linkUrl"],
        message: "linkUrl is required when targetType=promo.",
      });
    }
    if (data.startDate) {
      const d = new Date(data.startDate);
      if (Number.isNaN(d.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["startDate"],
          message: "startDate must be a valid date string.",
        });
      }
    }

    if (data.endDate) {
      const d = new Date(data.endDate);
      if (Number.isNaN(d.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "endDate must be a valid date string.",
        });
      }
    }
  });

const updateBannerSchema = z
  .object({
    title: z.string().min(1).optional(),
    subtitle: z.string().optional(),
    targetType: z.enum(["restaurant", "promo"]).optional(),
    restaurantId: z.string().nullable().optional(),
    linkUrl: z.string().url().nullable().optional(),
    isActive: z.coerce.boolean().optional(),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    priority: z.coerce.number().int().min(0).optional(),
    imageUrl: z.string().min(1).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.targetType === "restaurant" && data.restaurantId === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["restaurantId"],
        message: "restaurantId cannot be null when targetType=restaurant.",
      });
    }

    if (data.targetType === "promo" && data.linkUrl === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["linkUrl"],
        message: "linkUrl cannot be null when targetType=promo.",
      });
    }
    if (data.startDate) {
      const d = new Date(data.startDate);
      if (Number.isNaN(d.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["startDate"],
          message: "startDate must be a valid date string.",
        });
      }
    }

    if (data.endDate) {
      const d = new Date(data.endDate);
      if (Number.isNaN(d.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "endDate must be a valid date string.",
        });
      }
    }
  });

router.use(requireAuth);
router.use(requireRole(["admin"]));

router.get("/", async (_req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: {
        restaurant: { select: { id: true, name: true, type: true } },
      },
    });

    return res.status(200).json({ banners });
  } catch (error) {
    return next(error);
  }
});

router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    const parsedBody = req.body || {};
    const data = createBannerSchema.parse(parsedBody);

    let imageUrl = data.imageUrl?.trim() || null;
    if (req.file) {
      imageUrl = `/uploads/banners/${req.file.filename}`;
    }

    if (!imageUrl) {
      return res.status(400).json({ error: "Banner image is required (upload or imageUrl)." });
    }

    if (data.restaurantId) {
      const restaurantExists = await prisma.restaurant.findUnique({
        where: { id: data.restaurantId },
        select: { id: true },
      });
      if (!restaurantExists) {
        return res.status(404).json({ error: "Target restaurant not found." });
      }
    }

    const banner = await prisma.banner.create({
      data: {
        title: data.title.trim(),
        subtitle: data.subtitle?.trim() || null,
        imageUrl,
        restaurantId: data.targetType === "restaurant" ? data.restaurantId : null,
        linkUrl: data.targetType === "promo" ? data.linkUrl : null,
        isActive: data.isActive,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        priority: data.priority,
      },
      include: { restaurant: { select: { id: true, name: true, type: true } } },
    });

    await createAuditLog({
      adminId: req.dbUser?.id,
      action: "UPLOAD",
      entityType: "banner",
      entityId: banner.id,
      afterData: toJsonSafe(banner),
      details: { created: true },
      ipAddress: getClientIp(req),
      userAgent: req.headers["user-agent"],
    });

    return res.status(201).json({ banner, message: "Banner created successfully." });
  } catch (error) {
    if (error?.name === "ZodError") {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      });
    }
    return next(error);
  }
});

router.patch("/:id", upload.single("image"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = updateBannerSchema.parse(req.body || {});

    const existing = await prisma.banner.findUnique({
      where: { id },
      include: { restaurant: { select: { id: true, name: true, type: true } } },
    });

    if (!existing) {
      return res.status(404).json({ error: "Banner not found." });
    }

    let imageUrl = data.imageUrl === undefined ? existing.imageUrl : data.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/banners/${req.file.filename}`;
    }

    const updateData = {
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.subtitle !== undefined ? { subtitle: data.subtitle?.trim() || null } : {}),
      ...(imageUrl !== undefined ? { imageUrl: imageUrl || existing.imageUrl } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      ...(data.startDate !== undefined ? { startDate: data.startDate ? new Date(data.startDate) : null } : {}),
      ...(data.endDate !== undefined ? { endDate: data.endDate ? new Date(data.endDate) : null } : {}),
      ...(data.priority !== undefined ? { priority: data.priority } : {}),
    };

    // Target logic
    if (data.targetType === "restaurant") {
      if (!data.restaurantId) {
        return res.status(400).json({ error: "restaurantId is required when targetType=restaurant." });
      }

      const restaurantExists = await prisma.restaurant.findUnique({
        where: { id: data.restaurantId },
        select: { id: true },
      });
      if (!restaurantExists) {
        return res.status(404).json({ error: "Target restaurant not found." });
      }

      updateData.restaurantId = data.restaurantId;
      updateData.linkUrl = null;
    } else if (data.targetType === "promo") {
      if (!data.linkUrl) {
        return res.status(400).json({ error: "linkUrl is required when targetType=promo." });
      }
      updateData.linkUrl = data.linkUrl;
      updateData.restaurantId = null;
    } else {
      if (data.restaurantId !== undefined) updateData.restaurantId = data.restaurantId || null;
      if (data.linkUrl !== undefined) updateData.linkUrl = data.linkUrl || null;
    }

    const updated = await prisma.banner.update({
      where: { id },
      data: updateData,
      include: { restaurant: { select: { id: true, name: true, type: true } } },
    });

    // If image changed and old image was local, attempt cleanup
    if (req.file && existing.imageUrl?.startsWith("/uploads/banners/")) {
      const oldFilename = existing.imageUrl.replace("/uploads/banners/", "");
      const oldPath = path.join(uploadRoot, oldFilename);
      fs.unlink(oldPath, () => {});
    }

    await createAuditLog({
      adminId: req.dbUser?.id,
      action: "UPDATE",
      entityType: "banner",
      entityId: id,
      beforeData: toJsonSafe(existing),
      afterData: toJsonSafe(updated),
      details: { changedFields: Object.keys(updateData) },
      ipAddress: getClientIp(req),
      userAgent: req.headers["user-agent"],
    });

    return res.status(200).json({ banner: updated, message: "Banner updated successfully." });
  } catch (error) {
    if (error?.name === "ZodError") {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      });
    }
    return next(error);
  }
});

router.post("/:id/toggle", async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Banner not found." });
    }

    const updated = await prisma.banner.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    await createAuditLog({
      adminId: req.dbUser?.id,
      action: "TOGGLE",
      entityType: "banner",
      entityId: id,
      beforeData: toJsonSafe(existing),
      afterData: toJsonSafe(updated),
      details: { previous: existing.isActive, current: updated.isActive },
      ipAddress: getClientIp(req),
      userAgent: req.headers["user-agent"],
    });

    return res.status(200).json({ banner: updated });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Banner not found." });
    }

    await prisma.banner.delete({ where: { id } });

    if (existing.imageUrl?.startsWith("/uploads/banners/")) {
      const filename = existing.imageUrl.replace("/uploads/banners/", "");
      const filePath = path.join(uploadRoot, filename);
      fs.unlink(filePath, () => {});
    }

    await createAuditLog({
      adminId: req.dbUser?.id,
      action: "DELETE",
      entityType: "banner",
      entityId: id,
      beforeData: toJsonSafe(existing),
      details: { deleted: true },
      ipAddress: getClientIp(req),
      userAgent: req.headers["user-agent"],
    });

    return res.status(200).json({ message: "Banner deleted successfully.", deletedId: id });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
