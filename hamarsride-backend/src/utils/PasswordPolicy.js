/**
 * Password Policy Enforcement
 * Server-side password validation
 */

const { z } = require("zod");

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    return { valid: false, errors: ["Password is required"] };
  }
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  
  if (password.length > 128) {
    errors.push("Password must be less than 128 characters");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*...)");
  }
  
  // Check for common passwords (simplified list)
  const commonPasswords = [
    "password", "12345678", "123456789", "password123",
    "qwerty", "abc123", "1234567890", "password1"
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("Password is too common. Please choose a stronger password.");
  }
  
  // Check for sequential characters
  if (/(.)\1{2,}/.test(password)) {
    errors.push("Password must not contain repeated characters (e.g., aaa)");
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {{ valid: boolean, error: string|null }}
 */
const validateEmail = (email) => {
  if (!email) {
    return { valid: false, error: "Email is required" };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }
  
  return { valid: true, error: null };
};

/**
 * Validate phone number (Nigerian format)
 * @param {string} phone - Phone number to validate
 * @returns {{ valid: boolean, error: string|null }}
 */
const validatePhone = (phone) => {
  if (!phone) {
    return { valid: true, error: null }; // Phone is optional
  }
  
  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-()]/g, "");
  
  // Check for valid Nigerian phone formats
  const nigerianPhoneRegex = /^(\+234|234|0)(701|702|703|704|705|706|707|708|709|802|803|804|805|806|807|808|809|810|811|812|813|814|815|816|817|818|819|902|903|904|905|906|907|908|909)\d{7}$/;
  
  if (!nigerianPhoneRegex.test(cleaned)) {
    return { 
      valid: false, 
      error: "Invalid Nigerian phone number format" 
    };
  }
  
  return { valid: true, error: null };
};

/**
 * Validate amount (price/fee in kobo)
 * @param {number} amount - Amount in kobo
 * @param {Object} options - Validation options
 * @returns {{ valid: boolean, error: string|null }}
 */
const validateAmount = (amount, options = {}) => {
  const { 
    min = 0, 
    max = 100000000, // 1 million Naira
    required = true 
  } = options;
  
  if (required && (amount === undefined || amount === null)) {
    return { valid: false, error: "Amount is required" };
  }
  
  if (typeof amount !== "number" || !Number.isInteger(amount)) {
    return { valid: false, error: "Amount must be an integer" };
  }
  
  if (amount < min) {
    return { valid: false, error: `Amount must be at least ${min} kobo` };
  }
  
  if (amount > max) {
    return { valid: false, error: `Amount must not exceed ${max} kobo` };
  }
  
  return { valid: true, error: null };
};

/**
 * Validate order status transition
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - New order status
 * @returns {{ valid: boolean, error: string|null }}
 */
const validateStatusTransition = (currentStatus, newStatus) => {
  const allowedTransitions = {
    pending: ["accepted", "rejected", "cancelled"],
    accepted: ["picked_up", "rejected", "cancelled"],
    picked_up: ["processing", "cancelled"],
    processing: ["delivered", "cancelled"],
    delivered: [],
    rejected: [],
    cancelled: [],
  };
  
  const allowed = allowedTransitions[currentStatus] || [];
  
  if (!allowed.includes(newStatus)) {
    return { 
      valid: false, 
      error: `Cannot transition from ${currentStatus} to ${newStatus}` 
    };
  }
  
  return { valid: true, error: null };
};

// Export all validators
module.exports = {
  validatePassword,
  validateEmail,
  validatePhone,
  validateAmount,
  validateStatusTransition,
};
