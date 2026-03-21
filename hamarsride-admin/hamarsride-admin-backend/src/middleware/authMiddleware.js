const { getAuth } = require("../config/firebase");

const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Missing authorization token." });
    }

    const decoded = await getAuth().verifyIdToken(token);
    req.user = decoded;
    return next();
  } catch (_error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

module.exports = requireAuth;
