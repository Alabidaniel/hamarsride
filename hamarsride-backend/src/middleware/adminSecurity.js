/**
 * Admin IP Whitelist Middleware
 * Restricts admin routes to approved IP addresses
 */

const { prisma } = require("../prisma");

/**
 * Get client IP address from request
 */
const getClientIp = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "unknown"
  );
};

/**
 * Convert IP to integer for CIDR matching
 */
const ipToInt = (ip) => {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
};

/**
 * Match IP against CIDR range
 */
const cidrMatch = (ip, cidr) => {
  const [range, bits] = cidr.split("/");
  const mask = ~(2 ** (32 - parseInt(bits))) >>> 0;
  
  const ipInt = ipToInt(ip);
  const rangeInt = ipToInt(range);
  
  return (ipInt & mask) === (rangeInt & mask);
};

/**
 * Check if IP is in whitelist
 */
const isIpWhitelisted = (ip, whitelist) => {
  if (!whitelist || whitelist.length === 0) {
    return true; // No whitelist = allow all
  }
  
  const normalizedIp = ip.trim();
  
  return whitelist.some((allowed) => {
    // Handle CIDR notation
    if (allowed.includes("/")) {
      return cidrMatch(normalizedIp, allowed);
    }
    return normalizedIp === allowed;
  });
};

/**
 * Admin IP whitelist middleware factory
 */
const adminIpWhitelist = (req, res, next) => {
  // Get whitelist from environment
  const whitelistEnv = process.env.ADMIN_IP_WHITELIST || "";
  const whitelist = whitelistEnv
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean);
  
  const clientIp = getClientIp(req);
  
  // Skip check if no whitelist configured
  if (whitelist.length === 0) {
    return next();
  }
  
  // Check if IP is whitelisted
  if (!isIpWhitelisted(clientIp, whitelist)) {
    console.warn(`Admin access denied for IP: ${clientIp}`);
    return res.status(403).json({
      error: "Access denied. Your IP is not authorized.",
    });
  }
  
  next();
};

/**
 * Middleware to check admin role AND IP whitelist
 */
const requireAdminSecurity = (req, res, next) => {
  // First check role (from requireRole middleware)
  // Then check IP whitelist
  return adminIpWhitelist(req, res, next);
};

module.exports = {
  getClientIp,
  isIpWhitelisted,
  adminIpWhitelist,
  requireAdminSecurity,
  cidrMatch,
  ipToInt,
};
