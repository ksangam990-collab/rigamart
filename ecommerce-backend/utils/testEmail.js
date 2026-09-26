const mongoose = require('mongoose');
require('dotenv').config();

const { transporter, isConfigured, verifyEmailConfig } = require('../config/nodemailer');
const {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail
} = require('../utils/emailService');

async function runEmailTests() {
  console.log('🧪 Starting Rigamart Transactional Email & Gmail SMTP Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const targetInbox = process.env.GMAIL_USER;
  console.log(`📬 Real Recipient Inbox: ${targetInbox}\n`);

  if (!isConfigured) {
    console.error('❌ GMAIL_USER and GMAIL_PASS are not configured in .env!');
    process.exit(1);
  }

  // Realistic mock order object for live templating
  const sampleOrder = {
    _id: new mongoose.Types.ObjectId(),
    orderNumber: `RGM-${Date.now().toString().slice(-8)}`,
    items: [
      {
        name: 'Apple AirPods Pro (2nd Gen) with MagSafe Case (USB-C)',
        size: 'Standard',
        color: 'Glossy White',
        price: 24900,
        quantity: 1
      },
      {
        name: 'Spigen Ultra Hybrid Matte Shockproof Protective Case',
        size: 'AirPods Pro 2',
        color: 'Crystal Clear',
        price: 1499,
        quantity: 1
      }
    ],
    itemsPrice: 26399,
    shippingPrice: 0, // Free shipping
    taxPrice: 0,
    totalAmount: 26399,
    shippingAddress: {
      name: 'Rigamart Customer',
      mobile: '9876543210',
      street: 'Plot 42, Bandra Kurla Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400051'
    },
    paymentInfo: {
      method: 'RAZORPAY',
      status: 'Completed',
      razorpayPaymentId: 'pay_live_test_987123',
      paidAt: new Date()
    },
    status: 'Placed',
    createdAt: new Date()
  };

  try {
    // -------------------------------------------------------------
    // Test 1: SMTP Transporter Handshake & Authentication
    // -------------------------------------------------------------
    try {
      const isConnected = await verifyEmailConfig();
      if (isConnected) {
        console.log('✅ 1. SMTP Transporter Handshake: PASS (Authenticated with smtp.gmail.com:465)');
        passed++;
      } else {
        console.log('❌ 1. SMTP Transporter Handshake: FAIL (Could not verify SMTP)');
        failed++;
      }
    } catch (err) {
      console.log('❌ 1. SMTP Transporter Handshake: FAIL -', err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 2: Send Real Order Confirmation Email to User's Inbox
    // -------------------------------------------------------------
    try {
      console.log(`📤 Sending live Order Confirmation email to ${targetInbox}...`);
      const result = await sendOrderConfirmationEmail(sampleOrder, targetInbox);

      if (result && result.success && result.messageId) {
        console.log(`✅ 2. Real Order Confirmation Delivery: PASS (MessageId: ${result.messageId})`);
        passed++;
      } else {
        console.log('❌ 2. Real Order Confirmation Delivery: FAIL', result);
        failed++;
      }
    } catch (err) {
      console.log('❌ 2. Real Order Confirmation Delivery: FAIL -', err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 3: Send Real Order Shipped Notification to User's Inbox
    // -------------------------------------------------------------
    try {
      console.log(`📤 Sending live Order Shipped email to ${targetInbox}...`);
      const result = await sendOrderShippedEmail(sampleOrder, targetInbox, {
        courier: 'BlueDart Express Air',
        trackingNumber: 'BLUEDART-88912304'
      });

      if (result && result.success && result.messageId) {
        console.log(`✅ 3. Real Order Shipped Delivery: PASS (MessageId: ${result.messageId})`);
        passed++;
      } else {
        console.log('❌ 3. Real Order Shipped Delivery: FAIL', result);
        failed++;
      }
    } catch (err) {
      console.log('❌ 3. Real Order Shipped Delivery: FAIL -', err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 4: Send Real Order Delivered Notification to User's Inbox
    // -------------------------------------------------------------
    try {
      console.log(`📤 Sending live Order Delivered email to ${targetInbox}...`);
      const result = await sendOrderDeliveredEmail(sampleOrder, targetInbox);

      if (result && result.success && result.messageId) {
        console.log(`✅ 4. Real Order Delivered Delivery: PASS (MessageId: ${result.messageId})`);
        passed++;
      } else {
        console.log('❌ 4. Real Order Delivered Delivery: FAIL', result);
        failed++;
      }
    } catch (err) {
      console.log('❌ 4. Real Order Delivered Delivery: FAIL -', err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 5: Send Real Order Cancellation Alert to User's Inbox
    // -------------------------------------------------------------
    try {
      console.log(`📤 Sending live Order Cancelled email to ${targetInbox}...`);
      const result = await sendOrderCancelledEmail(
        sampleOrder,
        targetInbox,
        'Customer requested cancellation before courier dispatch.'
      );

      if (result && result.success && result.messageId) {
        console.log(`✅ 5. Real Order Cancelled Delivery: PASS (MessageId: ${result.messageId})`);
        passed++;
      } else {
        console.log('❌ 5. Real Order Cancelled Delivery: FAIL', result);
        failed++;
      }
    } catch (err) {
      console.log('❌ 5. Real Order Cancelled Delivery: FAIL -', err.message);
      failed++;
    }

  } catch (globalErr) {
    console.error('Fatal Email Test Error:', globalErr);
  }

  console.log(`\n================================`);
  console.log(`Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`================================\n`);

  if (failed === 0) {
    console.log(`🎉 All Transactional Emails Successfully Delivered to ${targetInbox}!`);
  } else {
    process.exit(1);
  }
}

runEmailTests().catch((err) => {
  console.error('Fatal Email Test Runner Error:', err);
  process.exit(1);
});
