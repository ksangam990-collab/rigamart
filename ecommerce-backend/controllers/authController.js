const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Otp = require('../models/Otp');
const {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenCookieOptions
} = require('../utils/generateToken');
const { generateNumericOtp, sendSmsOtp } = require('../utils/otp');

/**
 * Helper to strip sensitive fields from user object before sending response
 */
const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete user.password;
  delete user.refreshToken;
  return user;
};

/**
 * @desc    Register a new customer or seller
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password, mobile, role } = req.body;

    // Prevent unauthorized privilege escalation to admin via registration
    const assignedRole = role === 'seller' ? 'seller' : 'customer';

    // Check if email already registered
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
        data: null
      });
    }

    // Check if mobile already in use (if provided)
    if (mobile) {
      const existingMobile = await User.findOne({ mobile: mobile.trim() });
      if (existingMobile) {
        return res.status(409).json({
          success: false,
          message: 'This mobile number is already linked to another account.',
          data: null
        });
      }
    }

    // Create user (password is automatically hashed by User pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      mobile: mobile ? mobile.trim() : undefined,
      role: assignedRole
    });

    // Create initial persistent empty cart for the new user
    await Cart.create({
      user: user._id,
      items: []
    });

    // Generate JWT tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token on user document for rotation validation
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Set refresh token in secure httpOnly cookie
    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: sanitizeUser(user),
        accessToken
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Registration failed: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Authenticate user & issue tokens
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password explicitly selected
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password +refreshToken');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        data: null
      });
    }

    // Check if user is suspended/banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
        data: null
      });
    }

    // Verify password hash
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        data: null
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Persist refresh token for rotation
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Set refresh token in secure httpOnly cookie
    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: sanitizeUser(user),
        accessToken
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Login failed: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Logout user & invalidate refresh token
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
      } catch (e) {
        // Token might be expired, continue clearing cookie
      }
    }

    // Clear the httpOnly cookie
    res.clearCookie('refreshToken', getRefreshTokenCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Logout failed: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Exchange refresh token for new access token (with token rotation)
 * @route   POST /api/auth/refresh-token
 * @access  Public (via httpOnly cookie)
 */
const refreshToken = async (req, res) => {
  try {
    const incomingToken = req.cookies.refreshToken;

    if (!incomingToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided. Please log in again.',
        data: null
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(incomingToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired or invalid. Please log in again.',
        data: null
      });
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
        data: null
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended.',
        data: null
      });
    }

    // Detect Token Reuse / Breach: If cookie token doesn't match DB token, revoke access
    if (user.refreshToken !== incomingToken) {
      user.refreshToken = null;
      await user.save({ validateBeforeSave: false });
      res.clearCookie('refreshToken', getRefreshTokenCookieOptions());

      return res.status(403).json({
        success: false,
        message: 'Suspicious session detected. All sessions revoked. Please log in again.',
        data: null
      });
    }

    // Rotate tokens
    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Access token refreshed successfully.',
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Token refresh failed: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Generate and send 6-digit OTP
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
const sendOtp = async (req, res) => {
  try {
    const { identifier, type = 'login' } = req.body;
    const cleanId = identifier.trim().toLowerCase();

    // Invalidate existing pending OTP for this identifier and type
    await Otp.deleteMany({ identifier: cleanId, type });

    const code = generateNumericOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await Otp.create({
      identifier: cleanId,
      code,
      type,
      expiresAt
    });

    // Send SMS (or print to server console if in dev fallback)
    const result = await sendSmsOtp(cleanId, code);

    res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${identifier}`,
      data: {
        identifier: cleanId,
        expiresInSeconds: 300,
        deliveryMode: result.mode
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to send OTP: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Verify 6-digit OTP code
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOtp = async (req, res) => {
  try {
    const { identifier, code, type = 'login' } = req.body;
    const cleanId = identifier.trim().toLowerCase();

    const otpRecord = await Otp.findOne({
      identifier: cleanId,
      code: code.toString().trim(),
      type
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.',
        data: null
      });
    }

    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new code.',
        data: null
      });
    }

    // OTP is valid - consume it immediately
    await Otp.deleteOne({ _id: otpRecord._id });

    // If user exists, mark as verified
    await User.findOneAndUpdate(
      { $or: [{ email: cleanId }, { mobile: cleanId }] },
      { isVerified: true }
    );

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      data: {
        verified: true,
        identifier: cleanId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `OTP verification failed: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Initiate password reset via OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    const cleanId = identifier.trim().toLowerCase();

    const user = await User.findOne({
      $or: [{ email: cleanId }, { mobile: cleanId }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered account found with that email or mobile number.',
        data: null
      });
    }

    // Invalidate existing reset OTPs
    await Otp.deleteMany({ identifier: cleanId, type: 'reset-password' });

    const code = generateNumericOtp();
    await Otp.create({
      identifier: cleanId,
      code,
      type: 'reset-password',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    const result = await sendSmsOtp(cleanId, code);

    res.status(200).json({
      success: true,
      message: 'Password reset OTP has been dispatched.',
      data: {
        identifier: cleanId,
        deliveryMode: result.mode
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to process password reset request: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Reset password using verified OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const { identifier, code, newPassword } = req.body;
    const cleanId = identifier.trim().toLowerCase();

    const otpRecord = await Otp.findOne({
      identifier: cleanId,
      code: code.toString().trim(),
      type: 'reset-password'
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP for password reset.',
        data: null
      });
    }

    const user = await User.findOne({
      $or: [{ email: cleanId }, { mobile: cleanId }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
        data: null
      });
    }

    // Update password (triggers User pre-save bcrypt hash)
    user.password = newPassword;
    user.refreshToken = null; // Revoke all sessions on password reset
    await user.save();

    // Consume the OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to reset password: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private (Bearer token)
 */
const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully.',
      data: {
        user: sanitizeUser(req.user)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve profile: ${error.message}`,
      data: null
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  getMe
};
