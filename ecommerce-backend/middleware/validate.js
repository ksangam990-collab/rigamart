/**
 * Input validation middlewares for authentication and user endpoints
 */

const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
const mobileRegex = /^[6-9]\d{9}$/;

const validateRegister = (req, res, next) => {
  const { name, email, password, mobile } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Name is required and must be at least 2 characters long',
      data: null
    });
  }

  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'A valid email address is required',
      data: null
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long',
      data: null
    });
  }

  if (mobile && !mobileRegex.test(mobile.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number must be a valid 10-digit Indian number',
      data: null
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'A valid email address is required',
      data: null
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required',
      data: null
    });
  }

  next();
};

const validateOtpRequest = (req, res, next) => {
  const { identifier } = req.body;

  if (!identifier) {
    return res.status(400).json({
      success: false,
      message: 'Identifier (email or 10-digit mobile number) is required',
      data: null
    });
  }

  const trimmed = identifier.trim();
  const isEmail = emailRegex.test(trimmed);
  const isMobile = mobileRegex.test(trimmed);

  if (!isEmail && !isMobile) {
    return res.status(400).json({
      success: false,
      message: 'Identifier must be a valid email or 10-digit Indian mobile number',
      data: null
    });
  }

  next();
};

const validateOtpVerify = (req, res, next) => {
  const { identifier, code } = req.body;

  if (!identifier || !code) {
    return res.status(400).json({
      success: false,
      message: 'Both identifier and OTP code are required',
      data: null
    });
  }

  if (!/^\d{6}$/.test(code.toString().trim())) {
    return res.status(400).json({
      success: false,
      message: 'OTP code must be a 6-digit number',
      data: null
    });
  }

  next();
};

const validateResetPassword = (req, res, next) => {
  const { identifier, code, newPassword } = req.body;

  if (!identifier || !code || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Identifier, OTP code, and new password are required',
      data: null
    });
  }

  if (!/^\d{6}$/.test(code.toString().trim())) {
    return res.status(400).json({
      success: false,
      message: 'OTP code must be a 6-digit number',
      data: null
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long',
      data: null
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateOtpRequest,
  validateOtpVerify,
  validateResetPassword
};
