const axios = require('axios');
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';

async function runPaymentTests() {
  console.log('🧪 Starting Rigamart Razorpay & COD Payment Test Suite...\n');
  let passed = 0;
  let failed = 0;

  await mongoose.connect(process.env.MONGO_URI);
  const User = require('../models/User');
  const Category = require('../models/Category');
  const Product = require('../models/Product');
  const Cart = require('../models/Cart');
  const Order = require('../models/Order');
  const { generateAccessToken } = require('./generateToken');

  const uniqueSuffix = Date.now().toString().slice(-6);

  // Setup test customer and seller
  const customer = await User.create({
    name: 'Payment Customer',
    email: `pay_cust_${uniqueSuffix}@rigamart.com`,
    password: 'Password123!',
    role: 'customer'
  });
  const customerToken = generateAccessToken(customer._id, 'customer');

  const seller = await User.create({
    name: 'Payment Seller',
    email: `pay_seller_${uniqueSuffix}@rigamart.com`,
    password: 'Password123!',
    role: 'seller'
  });

  const category = await Category.create({
    name: `Footwear ${uniqueSuffix}`,
    slug: `footwear-${uniqueSuffix}`
  });

  const product = await Product.create({
    name: `Running Shoes ${uniqueSuffix}`,
    description: 'High performance running sneakers.',
    category: category._id,
    seller: seller._id,
    images: [{ public_id: 'shoe_id', url: 'https://sample.url/shoe.jpg', isPrimary: true }],
    variants: [
      {
        sku: `SHOE-8-${uniqueSuffix}`,
        size: 'UK 8',
        color: 'All Black',
        price: 1499,
        mrp: 2999,
        stock: 20
      },
      {
        sku: `SHOE-9-${uniqueSuffix}`,
        size: 'UK 9',
        color: 'All Black',
        price: 1499,
        mrp: 2999,
        stock: 15
      }
    ],
    basePrice: 1499
  });

  const variant8 = product.variants[0];
  const variant9 = product.variants[1];

  const testShippingAddress = {
    name: 'Payment Customer',
    mobile: '9876543210',
    street: 'Plot 88, Sector 14',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122001'
  };

  let razorpayOrderId = null;
  let rigamartOrderId = null;

  try {
    // 1. Add item to cart
    await axios.post(
      `${BASE_URL}/cart/add`,
      { productId: product._id, variantId: variant8._id, quantity: 1 },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );

    // Test 1: Create Razorpay Order via Checkout
    try {
      const res = await axios.post(
        `${BASE_URL}/payment/create-order`,
        {
          shippingAddress: testShippingAddress,
          paymentMethod: 'RAZORPAY'
        },
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );

      if (
        res.status === 200 &&
        res.data.success &&
        res.data.data.razorpayOrderId.startsWith('order_') &&
        res.data.data.amount === 149900 // 1499 INR in paise
      ) {
        razorpayOrderId = res.data.data.razorpayOrderId;
        rigamartOrderId = res.data.data.orderId;
        console.log(`✅ 1. Create Razorpay Order: PASS (Order: ${razorpayOrderId}, Amount: ₹1499 / 149900 paise)`);
        passed++;
      } else {
        console.error('❌ 1. Create Razorpay Order: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.error('❌ 1. Create Razorpay Order: ERROR', err.response?.data || err.message);
      failed++;
    }

    // Test 2: Tampered / Invalid Signature Rejection
    try {
      await axios.post(
        `${BASE_URL}/payment/verify`,
        {
          orderId: rigamartOrderId,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: 'pay_fake123456789',
          razorpay_signature: 'fake_tampered_signature_hash'
        },
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );
      console.error('❌ 2. Signature Fraud Guard: FAIL (Should reject fake signature)');
      failed++;
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('✅ 2. Signature Fraud Guard: PASS (Tampered signature rejected with 400 Bad Request)');
        passed++;
      } else {
        console.error('❌ 2. Signature Fraud Guard: FAIL', err.response?.data || err.message);
        failed++;
      }
    }

    // Test 3: Valid Cryptographic HMAC SHA-256 Signature Verification
    try {
      const mockPaymentId = `pay_test_${Date.now().toString().slice(-8)}`;
      // Generate genuine HMAC SHA-256 signature matching backend secret
      const genuineSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${mockPaymentId}`)
        .digest('hex');

      const res = await axios.post(
        `${BASE_URL}/payment/verify`,
        {
          orderId: rigamartOrderId,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: genuineSignature
        },
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );

      if (
        res.status === 200 &&
        res.data.success &&
        res.data.data.status === 'Confirmed' &&
        res.data.data.paymentStatus === 'Completed'
      ) {
        console.log('✅ 3. Valid Signature Verification: PASS (Payment verified, Order status: Confirmed)');
        passed++;

        // Verify inventory was decremented
        const updatedProduct = await Product.findById(product._id);
        const updatedVariant = updatedProduct.variants.id(variant8._id);
        if (updatedVariant.stock === 19) {
          console.log('✅ 4. Stock Decrement on Payment: PASS (Variant stock decremented from 20 -> 19)');
          passed++;
        } else {
          console.error(`❌ 4. Stock Decrement on Payment: FAIL (Expected 19, got ${updatedVariant.stock})`);
          failed++;
        }

        // Verify cart was cleared
        const userCart = await Cart.findOne({ user: customer._id });
        if (userCart.items.length === 0) {
          console.log('✅ 5. Cart Auto-Clear on Checkout: PASS (Customer cart cleared)');
          passed++;
        } else {
          console.error('❌ 5. Cart Auto-Clear on Checkout: FAIL');
          failed++;
        }
      } else {
        console.error('❌ 3. Valid Signature Verification: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.error('❌ 3/4/5. Signature Verification Flow: ERROR', err.response?.data || err.message);
      failed++;
    }

    // Test 6: Cash On Delivery (COD) Checkout Flow
    try {
      // Add another item to cart
      await axios.post(
        `${BASE_URL}/cart/add`,
        { productId: product._id, variantId: variant9._id, quantity: 2 },
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );

      const res = await axios.post(
        `${BASE_URL}/payment/create-order`,
        {
          shippingAddress: testShippingAddress,
          paymentMethod: 'COD'
        },
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );

      if (
        res.status === 201 &&
        res.data.success &&
        res.data.data.paymentMethod === 'COD' &&
        res.data.data.status === 'Placed'
      ) {
        console.log('✅ 6. Cash on Delivery (COD): PASS (Placed COD order with stock decrement & cart cleared)');
        passed++;

        // Check stock decremented
        const updatedProduct = await Product.findById(product._id);
        const updatedVariant = updatedProduct.variants.id(variant9._id);
        if (updatedVariant.stock === 13) {
          console.log('✅ 7. COD Inventory Decrement: PASS (Variant stock decremented 15 -> 13)');
          passed++;
        } else {
          console.error(`❌ 7. COD Inventory Decrement: FAIL (Expected 13, got ${updatedVariant.stock})`);
          failed++;
        }
      } else {
        console.error('❌ 6. Cash on Delivery: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.error('❌ 6. Cash on Delivery: ERROR', err.response?.data || err.message);
      failed++;
    }

    // Test 8: Razorpay Webhook Simulation
    try {
      const webhookPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: `pay_hook_${Date.now().toString().slice(-8)}`,
              order_id: razorpayOrderId,
              status: 'captured'
            }
          }
        }
      };

      const webhookBody = JSON.stringify(webhookPayload);
      const webhookSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(webhookBody)
        .digest('hex');

      const res = await axios.post(`${BASE_URL}/payment/webhook`, webhookPayload, {
        headers: {
          'x-razorpay-signature': webhookSignature,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 200 && res.data.status === 'ok') {
        console.log('✅ 8. Razorpay Webhook Handler: PASS (Captured event validated and processed)');
        passed++;
      } else {
        console.error('❌ 8. Razorpay Webhook Handler: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.error('❌ 8. Razorpay Webhook Handler: ERROR', err.response?.data || err.message);
      failed++;
    }
  } finally {
    // Cleanup test data
    await Order.deleteMany({ user: customer._id });
    await Cart.deleteOne({ user: customer._id });
    await Product.findByIdAndDelete(product._id);
    await Category.findByIdAndDelete(category._id);
    await User.deleteMany({ _id: { $in: [customer._id, seller._id] } });
    await mongoose.disconnect();
  }

  console.log('\n--------------------------------------');
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log('--------------------------------------');

  if (failed === 0) {
    console.log('🎉 All Razorpay & COD Payment Tests Passed Successfully!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runPaymentTests();
