const crypto = require('crypto');
const axios = require('axios');

/**
 * Generate a cryptographically secure 6-digit numeric OTP
 */
const generateNumericOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Send OTP via Fast2SMS (with robust console fallback for local development)
 * @param {string} mobile - 10 digit Indian mobile number
 * @param {string} otp - 6 digit OTP string
 */
const sendSmsOtp = async (mobile, otp) => {
  const apiKey = process.env.FAST2SMS_API_KEY;

  // If apiKey is missing or set to dummy value, fallback to console log
  if (!apiKey || apiKey === 'dummy_fast2sms_key' || apiKey.startsWith('dummy')) {
    console.log(`\n==================================================`);
    console.log(`📱 [DEV OTP FALLBACK] SMS to +91-${mobile}`);
    console.log(`🔑 Verification Code: ${otp}`);
    console.log(`⏳ Valid for 5 minutes.`);
    console.log(`==================================================\n`);
    return { success: true, mode: 'console_fallback' };
  }

  try {
    const response = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        variables_values: otp,
        route: 'otp',
        numbers: mobile
      },
      {
        headers: {
          authorization: apiKey
        }
      }
    );

    if (response.data && response.data.return) {
      return { success: true, mode: 'sms_gateway', data: response.data };
    } else {
      console.warn('⚠️ Fast2SMS gateway returned warning. Falling back to console:', response.data);
      console.log(`📱 [DEV OTP FALLBACK] Code for +91-${mobile}: ${otp}`);
      return { success: true, mode: 'console_fallback' };
    }
  } catch (error) {
    console.error('❌ Fast2SMS Gateway error:', error.response?.data || error.message);
    console.log(`📱 [DEV OTP FALLBACK] Code for +91-${mobile}: ${otp}`);
    // Don't fail customer experience in development
    return { success: true, mode: 'console_fallback' };
  }
};

module.exports = {
  generateNumericOtp,
  sendSmsOtp
};
