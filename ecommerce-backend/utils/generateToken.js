const jwt = require('jsonwebtoken');

/**
 * Generate short-lived Access Token (15 minutes)
 * Transmitted in Authorization: Bearer <token>
 */
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

/**
 * Generate long-lived Refresh Token (7 days)
 * Transmitted in secure, httpOnly cookie
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Cookie options for setting httpOnly refresh token
 */
const getRefreshTokenCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? 'none' : 'lax', // 'lax' permits localhost cross-port cookie sharing
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenCookieOptions
};
