const nodemailer = require('nodemailer');
require('dotenv').config();

const gmailUser = process.env.GMAIL_USER;
// Clean whitespace from Gmail App Password if present
const gmailPass = (process.env.GMAIL_PASS || '').replace(/\s+/g, '');

const isConfigured = Boolean(gmailUser && gmailPass && gmailPass !== 'dummy_gmail_app_password');

// Create reusable Nodemailer transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: gmailUser,
    pass: gmailPass
  },
  // Ensure fast timeout handling if network is disrupted
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000
});

/**
 * Diagnostic helper to verify SMTP connection status
 */
const verifyEmailConfig = async () => {
  if (!isConfigured) {
    console.log('⚠️ [EMAIL] GMAIL_USER or GMAIL_PASS not fully configured. Using console fallback for emails.');
    return false;
  }

  try {
    await transporter.verify();
    console.log(`✅ [EMAIL] Gmail SMTP Connected & Ready: ${gmailUser}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ [EMAIL] Gmail SMTP Verification Failed: ${error.message}`);
    return false;
  }
};

module.exports = {
  transporter,
  isConfigured,
  verifyEmailConfig
};
