const prisma = require("../prisma");

const requireRole = (roles = []) => async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebaseUid: req.user.uid } });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: "Access denied." });
    }

    req.dbUser = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = requireRole;
