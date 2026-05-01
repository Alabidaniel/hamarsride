/**
 * Rate Limiter Middleware
 * Per-user rate limiting with IP + userId combination
 */

const rateLimit = require("express-rate-limit");
const { prisma } = require("../prisma");

/**
 * Create a custom rate limiter with user identification
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Max requests per window
 * @param {string} options.message - Error message
 * @param {boolean} options.skipSuccessfulRequests - Skip successful requests
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = "Too many requests, please try again later.",
    skipSuccessfulRequests = false,
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skipSuccessfulRequests,
    keyGenerator: (req, res) => {
      // Use userId if available, otherwise fall back to IP
      const userId = req.user?.uid || req.user?.id;
      const ip = req.ip || req.connection?.remoteAddress;
      return userId ? `${userId}:${ip}` : ip;
    },
    handler: (req, res) => {
      const userId = req.user?.uid || "anonymous";
      console.warn(`Rate limit exceeded for user: ${userId}, IP: ${req.ip}`);
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000),
      });
    },
  });
};

// Specific rate limiters for different endpoints

// Strict rate limit for authentication endpoints
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests
  message: "Too many authentication attempts. Please try again in 15 minutes.",
});

// Rate limit for general API requests
const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many API requests.",
});

// Strict rate limit for order creation
const orderRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: "Too many orders placed. Please try again later.",
});

// Strict rate limit for payment submission
const paymentRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: "Too many payment submissions. Please try again later.",
});

// Strict rate limit for admin endpoints
const adminRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many admin requests.",
});

// Strict rate limit for cart operations
const cartRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: "Too many cart operations.",
});

/**
 * Dynamic rate limiter based on user role
 */
const dynamicRateLimiter = (req, res, next) => {
  const userRole = req.user?.role || "customer";
  
  // Stricter limits for customers, more lenient for admins
  const limits = {
    admin: { windowMs: 15 * 60 * 1000, max: 500 },
    rider: { windowMs: 15 * 60 * 1000, max: 200 },
    customer: { windowMs: 15 * 60 * 1000, max: 100 },
  };
  
  const config = limits[userRole] || limits.customer;
  
  const limiter = createRateLimiter(config);
  limiter(req, res, next);
};

module.exports = {
  createRateLimiter,
  authRateLimiter,
  apiRateLimiter,
  orderRateLimiter,
  paymentRateLimiter,
  adminRateLimiter,
  cartRateLimiter,
  dynamicRateLimiter,
};
