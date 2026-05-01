/**
 * Input Sanitization Middleware
 * Sanitizes user input to prevent XSS and injection attacks
 */

/**
 * Sanitize a string value - basic HTML entity escaping
 */
const sanitizeString = (value) => {
  if (typeof value !== "string") return value;
  
  // Trim whitespace
  let sanitized = value.trim();
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");
  
  // Basic escape for XSS prevention - encode known dangerous chars
  // Using simple replaces that avoid special characters issues
  sanitized = sanitized.split("&").join("&amp;");
  sanitized = sanitized.split("<").join("<").split(">").join(">");
  
  return sanitized;
};

/**
 * Sanitize an object recursively
 */
const sanitizeObject = (obj, allowedFields) => {
  if (!obj || typeof obj !== "object") return obj;
  
  const sanitized = {};
  const entries = Object.entries(obj);
  
  for (let i = 0; i < entries.length; i++) {
    const key = entries[i][0];
    const value = entries[i][1];
    
    // If allowedFields specified, only include those fields
    if (allowedFields && allowedFields.indexOf(key) === -1) {
      continue;
    }
    
    if (value === null || value === undefined) {
      sanitized[key] = value;
    } else if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => {
        if (typeof item === "object") {
          return sanitizeObject(item);
        }
        return sanitizeString(item);
      });
    } else if (typeof value === "object") {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Create middleware to sanitize request body
 */
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
};

/**
 * Create middleware to sanitize query parameters
 */
const sanitizeQuery = (req, res, next) => {
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeObject(req.query);
  }
  next();
};

/**
 * Create middleware to sanitize specific fields only
 */
const sanitizeFields = (fields) => {
  return (req, res, next) => {
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeObject(req.body, fields);
    }
    next();
  };
};

/**
 * SQL injection patterns to detect
 */
const sqlInjectionPatterns = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
  /(--|\/\*|\*\/|;--)/,
  /(EXEC|EXECUTE| xp_| sp_)/i,
  /(%27|%22|%23)/,
  /(0x[0-9a-fA-F]+)/,
];

/**
 * Check for SQL injection patterns
 */
const containsSqlInjection = (value) => {
  if (typeof value !== "string") return false;
  
  return sqlInjectionPatterns.some((pattern) => {
    return pattern.test(value);
  });
};

/**
 * Middleware to detect SQL injection attempts
 */
const detectSqlInjection = (req, res, next) => {
  const checkValue = (value) => {
    if (typeof value === "string" && containsSqlInjection(value)) {
      let truncated = value;
      if (value.length > 50) {
        truncated = value.substring(0, 50) + "...";
      }
      console.warn("SQL injection attempt detected: " + truncated);
      return true;
    }
    if (typeof value === "object") {
      const values = Object.values(value);
      return values.some(checkValue);
    }
    return false;
  };
  
  if (checkValue(req.body) || checkValue(req.query)) {
    return res.status(400).json({
      error: "Invalid input detected.",
    });
  }
  
  next();
};

/**
 * NoSQL injection patterns to detect
 */
const nosqlInjectionPatterns = [
  /\$where/i,
  /\$gt/i,
  /\$lt/i,
  /\$ne/i,
  /\$or/i,
  /\$and/i,
  /\$nor/i,
  /\$regex/i,
  /\$text/i,
  /\$search/i,
];

/**
 * Check for NoSQL injection patterns
 */
const containsNoSqlInjection = (value) => {
  if (typeof value !== "string") return false;
  
  return nosqlInjectionPatterns.some((pattern) => {
    return pattern.test(value);
  });
};

/**
 * Middleware to detect NoSQL injection attempts
 */
const detectNoSqlInjection = (req, res, next) => {
  const checkValue = (value) => {
    if (typeof value === "string" && containsNoSqlInjection(value)) {
      let truncated = value;
      if (value.length > 50) {
        truncated = value.substring(0, 50) + "...";
      }
      console.warn("NoSQL injection attempt detected: " + truncated);
      return true;
    }
    return false;
  };
  
  if (checkValue(req.body) || checkValue(req.query)) {
    return res.status(400).json({
      error: "Invalid input detected.",
    });
  }
  
  next();
};

module.exports = {
  sanitizeString,
  sanitizeObject,
  sanitizeBody,
  sanitizeQuery,
  sanitizeFields,
  detectSqlInjection,
  detectNoSqlInjection,
  containsSqlInjection,
  containsNoSqlInjection,
};
