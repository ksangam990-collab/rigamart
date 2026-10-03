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
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateOtpRequest,
  validateOtpVerify,
  validateResetPassword
} = require('../middleware/validate');

// Public authentication routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/google', googleAuth); // Google OAuth & One-Tap Sign In
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/send-otp', validateOtpRequest, sendOtp);
router.post('/verify-otp', validateOtpVerify, verifyOtp);
router.post('/forgot-password', validateOtpRequest, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);

// Protected user routes
router.get('/me', protect, getMe);

module.exports = router;
