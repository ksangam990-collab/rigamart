const Razorpay = require('razorpay');
const crypto = require('crypto');

/**
 * Initialize Razorpay SDK client with test/live credentials
 */
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Create a Razorpay Order
 * @param {number} amountInRupees - Order total in INR (will be converted to paise)
 * @param {string} receipt - Unique order receipt reference
 * @param {object} notes - Optional metadata attached to payment
 * @returns {Promise<object>} Razorpay Order object
 */
const createRazorpayOrder = async (amountInRupees, receipt, notes = {}) => {
  const options = {
    amount: Math.round(amountInRupees * 100), // Convert INR to Paise (smallest sub-unit)
    currency: 'INR',
    receipt: receipt.slice(0, 40), // Razorpay limits receipt to 40 characters
    notes
  };

  return await razorpayInstance.orders.create(options);
};

/**
 * Verify cryptographic HMAC SHA-256 signature returned by Razorpay Checkout
 * @param {string} orderId - razorpay_order_id
 * @param {string} paymentId - razorpay_payment_id
 * @param {string} signature - razorpay_signature
 * @returns {boolean} true if signature matches and is authentic
 */
const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

/**
 * Verify Webhook signature from Razorpay
 * @param {string} body - Raw stringified JSON body
 * @param {string} signature - x-razorpay-signature header
 * @returns {boolean}
 */
const verifyWebhookSignature = (body, signature) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(typeof body === 'string' ? body : JSON.stringify(body))
    .digest('hex');

  return expectedSignature === signature;
};

module.exports = {
  razorpayInstance,
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyWebhookSignature
};
