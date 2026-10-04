const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes: verifies Bearer JWT token in Authorization header
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No bearer token provided.',
        data: null
      });
    }

    // Verify token validity
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB, excluding sensitive fields
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
        data: null
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
        data: null
      });
    }

    // Attach active user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please refresh your token.',
        data: null
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.',
      data: null
    });
  }
};

const { authorize } = require('./roleCheck');

module.exports = {
  protect,
  authorize
};
