const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  handleWebhook
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Customer checkout routes
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

// Webhook endpoint (Razorpay calls this directly)
router.post('/webhook', handleWebhook);

module.exports = router;
