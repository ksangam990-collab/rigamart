const rateLimit = require('express-rate-limit');

/**
 * Global rate limiter: prevents aggressive automated DDoS and scraping
 * 150 requests per minute per IP address
 */
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please slow down and try again.',
    data: null
  }
});

/**
 * Strict authentication rate limiter: prevents brute-force credential stuffing
 * 10 login / register attempts per 15 minutes per IP address
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP address. Please try again after 15 minutes.',
    data: null
  }
});

/**
 * Sensitive operation limiter: OTP / Password resets
 * 5 requests per 15 minutes per IP address
 */
const sensitiveOpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many security code requests from this IP. Please try again after 15 minutes.',
    data: null
  }
});

module.exports = {
  globalLimiter,
  authLimiter,
  sensitiveOpLimiter
};
