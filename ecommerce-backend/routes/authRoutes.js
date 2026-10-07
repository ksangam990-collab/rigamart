const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleAuth,
  logout,
  refreshToken,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  getMe,
  loginWithMobileOtp
} = require('../controllers/authController');
const { authLimiter, sensitiveOpLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateOtpRequest,
  validateOtpVerify,
  validateResetPassword
} = require('../middleware/validate');

// Public authentication routes with strict rate limiting & brute-force protection
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/google', authLimiter, googleAuth); // Google OAuth & One-Tap Sign In
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/send-otp', sensitiveOpLimiter, validateOtpRequest, sendOtp);
router.post('/verify-otp', sensitiveOpLimiter, validateOtpVerify, verifyOtp);
router.post('/verify-mobile-otp', authLimiter, loginWithMobileOtp);
router.post('/forgot-password', sensitiveOpLimiter, validateOtpRequest, forgotPassword);
router.post('/reset-password', sensitiveOpLimiter, validateResetPassword, resetPassword);

// Protected user routes
router.get('/me', protect, getMe);

module.exports = router;
