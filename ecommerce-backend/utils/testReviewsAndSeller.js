const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';

async function runReviewsAndSellerTests() {
  console.log('🧪 Starting Rigamart Reviews & Ratings + Seller Dashboard Test Suite...\n');
  let passed = 0;
  let failed = 0;

  await mongoose.connect(process.env.MONGO_URI);
  const User = require('../models/User');
  const Category = require('../models/Category');
  const Product = require('../models/Product');
  const Order = require('../models/Order');
  const Review = require('../models/Review');
  const { generateAccessToken } = require('./generateToken');

  const uniqueSuffix = Date.now().toString().slice(-6);

  // 1. Setup Users: Customer A (verified buyer), Customer B (unverified buyer), Seller, Other Seller
  const customerA = await User.create({
    name: 'Verified Customer A',
    email: `cust_a_${uniqueSuffix}@rigamart.com`,
    password: 'Password123!',
    role: 'customer'
  });
  const tokenA = generateAccessToken(customerA._id, 'customer');

  const customerB = await User.create({
    name: 'Customer B',
    email: `cust_b_${uniqueSuffix}@rigamart.com`,
    password: 'Password123!',
    role: 'customer'
  });
  const tokenB = generateAccessToken(customerB._id, 'customer');

  const seller = await User.create({
    name: 'Top Brand Seller',
    email: `seller_${uniqueSuffix}@rigamart.com`,
    password: 'Password123!',
    role: 'seller'
  });
  const sellerToken = generateAccessToken(seller._id, 'seller');

  const otherSeller = await User.create({
    name: 'Other Rogue Seller',
    email: `rogue_${uniqueSuffix}@rigamart.com`,
    password: 'Password123!',
    role: 'seller'
  });
  const otherSellerToken = generateAccessToken(otherSeller._id, 'seller');

  // 2. Setup Category & Product
  const category = await Category.create({
    name: `Electronics ${uniqueSuffix}`,
    slug: `electronics-${uniqueSuffix}`
  });

  const product = await Product.create({
    name: `Wireless Noise-Cancelling Headphones ${uniqueSuffix}`,
    description: 'Studio-quality wireless over-ear headphones with ANC.',
    category: category._id,
    seller: seller._id,
    images: [{ public_id: `hp_img_${uniqueSuffix}`, url: 'https://sample.url/hp.jpg', isPrimary: true }],
    variants: [
      {
        sku: `ANC-BLK-${uniqueSuffix}`,
        size: 'Standard',
        color: 'Matte Black',
        price: 3999,
        mrp: 6999,
        stock: 3 // Low stock trigger (<= 5)
      },
      {
        sku: `ANC-SLV-${uniqueSuffix}`,
        size: 'Standard',
        color: 'Silver',
        price: 3999,
        mrp: 6999,
        stock: 20
      }
    ],
    basePrice: 3999
  });

  const variantBlack = product.variants[0];

  // 3. Create a DELIVERED order for Customer A to verify purchase badge
  const deliveredOrder = await Order.create({
    orderNumber: `ORD-DELIV-${uniqueSuffix}`,
    user: customerA._id,
    items: [
      {
        product: product._id,
        name: product.name,
        image: product.images[0].url,
        variantId: variantBlack._id,
        sku: variantBlack.sku,
        size: variantBlack.size,
        color: variantBlack.color,
        price: 3999,
        quantity: 1,
        seller: seller._id
      }
    ],
    shippingAddress: {
      name: 'Verified Customer A',
      mobile: '9876543210',
      street: '12 Marine Drive',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400020'
    },
    paymentInfo: {
      method: 'RAZORPAY',
      status: 'Completed',
      razorpayOrderId: 'order_test_123',
      razorpayPaymentId: 'pay_test_123',
      paidAt: new Date()
    },
    status: 'Delivered',
    itemsPrice: 3999,
    shippingPrice: 0,
    taxPrice: 0,
    totalAmount: 3999,
    deliveredAt: new Date()
  });

  let reviewA = null;
  let reviewB = null;

  try {
    // =========================================================================
    // STEP 9 TESTS: REVIEWS & RATINGS
    // =========================================================================

    // -------------------------------------------------------------
    // Test 1: Verified Buyer Review Creation
    // -------------------------------------------------------------
    try {
      const res = await axios.post(
        `${BASE_URL}/reviews/products/${product._id}`,
        {
          rating: 5,
          title: 'Outstanding sound quality!',
          body: 'The active noise cancellation is flawless. Battery lasts 30+ hours easily.',
          images: [{ public_id: 'rev_img_1', url: 'https://sample.url/customer_unboxing.jpg' }]
        },
        { headers: { Authorization: `Bearer ${tokenA}` } }
      );

      reviewA = res.data.data.review;

      if (
        res.status === 201 &&
        res.data.success &&
        reviewA.verifiedPurchase === true &&
        reviewA.rating === 5 &&
        res.data.data.productStats.avgRating === 5 &&
        res.data.data.productStats.numReviews === 1
      ) {
        console.log('✅ 1. Verified Buyer Review Creation: PASS (verifiedPurchase=true, avgRating=5.0)');
        passed++;
      } else {
        console.log('❌ 1. Verified Buyer Review Creation: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.log('❌ 1. Verified Buyer Review Creation: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 2: Unverified Buyer Review & Dynamic Rating Recalculation
    // -------------------------------------------------------------
    try {
      // Customer B never ordered this product
      const res = await axios.post(
        `${BASE_URL}/reviews/products/${product._id}`,
        {
          rating: 3,
          title: 'Decent, but a bit heavy',
          body: 'Sound is good but the clamping force is slightly tight on long sessions.'
        },
        { headers: { Authorization: `Bearer ${tokenB}` } }
      );

      reviewB = res.data.data.review;

      // Average of 5 and 3 = 4.0
      if (
        res.status === 201 &&
        reviewB.verifiedPurchase === false &&
        res.data.data.productStats.avgRating === 4 &&
        res.data.data.productStats.numReviews === 2
      ) {
        console.log('✅ 2. Unverified Buyer & Dynamic Aggregation: PASS (verifiedPurchase=false, avgRating=4.0)');
        passed++;
      } else {
        console.log('❌ 2. Unverified Buyer Review: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.log('❌ 2. Unverified Buyer Review: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 3: Duplicate Review Prevention on Same Product
    // -------------------------------------------------------------
    try {
      await axios.post(
        `${BASE_URL}/reviews/products/${product._id}`,
        {
          rating: 4,
          title: 'Second review attempt',
          body: 'Trying to review twice.'
        },
        { headers: { Authorization: `Bearer ${tokenA}` } }
      );
      console.log('❌ 3. Duplicate Review Prevention: FAIL (Should have rejected)');
      failed++;
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('✅ 3. Duplicate Review Prevention: PASS (400 Bad Request as expected)');
        passed++;
      } else {
        console.log('❌ 3. Duplicate Review Prevention: FAIL -', err.response?.data || err.message);
        failed++;
      }
    }

    // -------------------------------------------------------------
    // Test 4: Product Reviews Listing & Ratings Breakdown
    // -------------------------------------------------------------
    try {
      // Also verifies nested routing /api/products/:productId/reviews
      const res = await axios.get(`${BASE_URL}/products/${product._id}/reviews`);

      const summary = res.data.data.summary;
      if (
        res.status === 200 &&
        res.data.data.reviews.length === 2 &&
        summary.totalReviews === 2 &&
        summary.avgRating === 4 &&
        summary.breakdown[5] === 1 &&
        summary.breakdown[3] === 1 &&
        summary.percentages[5] === 50
      ) {
        console.log('✅ 4. Reviews Breakdown & UI Percentages: PASS (5★: 50%, 3★: 50%, total: 2)');
        passed++;
      } else {
        console.log('❌ 4. Reviews Breakdown: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.log('❌ 4. Reviews Breakdown: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 5: Helpful Voting & Toggle
    // -------------------------------------------------------------
    try {
      // Step A: Customer B upvotes Customer A's review
      const resVoteOn = await axios.put(
        `${BASE_URL}/reviews/${reviewA._id}/vote`,
        {},
        { headers: { Authorization: `Bearer ${tokenB}` } }
      );

      // Step B: Customer B votes again to toggle off
      const resVoteOff = await axios.put(
        `${BASE_URL}/reviews/${reviewA._id}/vote`,
        {},
        { headers: { Authorization: `Bearer ${tokenB}` } }
      );

      if (
        resVoteOn.data.data.helpfulVotes === 1 &&
        resVoteOn.data.data.hasVoted === true &&
        resVoteOff.data.data.helpfulVotes === 0 &&
        resVoteOff.data.data.hasVoted === false
      ) {
        console.log('✅ 5. Helpful Voting & Toggle: PASS (1 vote -> 0 votes on toggle)');
        passed++;
      } else {
        console.log('❌ 5. Helpful Voting: FAIL', { resVoteOn: resVoteOn.data, resVoteOff: resVoteOff.data });
        failed++;
      }
    } catch (err) {
      console.log('❌ 5. Helpful Voting: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 6: Self-Voting Prevention Guard
    // -------------------------------------------------------------
    try {
      await axios.put(
        `${BASE_URL}/reviews/${reviewA._id}/vote`,
        {},
        { headers: { Authorization: `Bearer ${tokenA}` } }
      );
      console.log('❌ 6. Self-Voting Guard: FAIL (Customer voted on own review)');
      failed++;
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('✅ 6. Self-Voting Guard: PASS (Blocked author self-voting)');
        passed++;
      } else {
        console.log('❌ 6. Self-Voting Guard: FAIL -', err.response?.data || err.message);
        failed++;
      }
    }

    // -------------------------------------------------------------
    // Test 7: Update Review & Re-Aggregate Rating
    // -------------------------------------------------------------
    try {
      // Customer B upgrades review from 3 stars to 5 stars
      const res = await axios.put(
        `${BASE_URL}/reviews/${reviewB._id}`,
        {
          rating: 5,
          title: 'Burn-in made them sound amazing!',
          body: 'After 20 hours of break-in, the soundstage opened up completely.'
        },
        { headers: { Authorization: `Bearer ${tokenB}` } }
      );

      // Now both reviews are 5 stars -> avgRating = 5.0
      if (
        res.data.success &&
        res.data.data.review.rating === 5 &&
        res.data.data.productStats.avgRating === 5
      ) {
        console.log('✅ 7. Review Update & Rating Re-computation: PASS (avgRating updated to 5.0)');
        passed++;
      } else {
        console.log('❌ 7. Review Update: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.log('❌ 7. Review Update: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 8: Delete Review & Re-Aggregate Rating
    // -------------------------------------------------------------
    try {
      const res = await axios.delete(`${BASE_URL}/reviews/${reviewB._id}`, {
        headers: { Authorization: `Bearer ${tokenB}` }
      });

      if (
        res.data.success &&
        res.data.data.productStats.numReviews === 1 &&
        res.data.data.productStats.avgRating === 5
      ) {
        console.log('✅ 8. Review Deletion & Recalculation: PASS (numReviews decremented to 1)');
        passed++;
      } else {
        console.log('❌ 8. Review Deletion: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.log('❌ 8. Review Deletion: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // =========================================================================
    // STEP 10 TESTS: SELLER DASHBOARD
    // =========================================================================

    // -------------------------------------------------------------
    // Test 9: Seller Overview Dashboard Metrics (GET /api/seller/dashboard)
    // -------------------------------------------------------------
    try {
      const res = await axios.get(`${BASE_URL}/seller/dashboard`, {
        headers: { Authorization: `Bearer ${sellerToken}` }
      });

      const metrics = res.data.data.metrics;
      const lowStockAlerts = res.data.data.lowStockAlerts;

      if (
        res.status === 200 &&
        res.data.success &&
        metrics.totalRevenue >= 3999 && // From delivered order
        metrics.totalProducts >= 1 &&
        metrics.deliveredOrders >= 1 &&
        lowStockAlerts.length >= 1 &&
        lowStockAlerts[0].stock === 3 // variantBlack stock is 3
      ) {
        console.log(`✅ 9. Seller Dashboard Metrics: PASS (Revenue: Rs. ${metrics.totalRevenue}, LowStock alerts: ${lowStockAlerts.length})`);
        passed++;
      } else {
        console.log('❌ 9. Seller Dashboard Metrics: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.log('❌ 9. Seller Dashboard Metrics: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 10: Seller Sales Analytics (GET /api/seller/analytics)
    // -------------------------------------------------------------
    try {
      const res = await axios.get(`${BASE_URL}/seller/analytics?range=30d`, {
        headers: { Authorization: `Bearer ${sellerToken}` }
      });

      const data = res.data.data;
      if (
        res.status === 200 &&
        Array.isArray(data.timeline) &&
        data.timeline.length >= 1 &&
        Array.isArray(data.topProducts) &&
        data.topProducts.length >= 1 &&
        data.topProducts[0].name.includes('Headphones')
      ) {
        console.log(`✅ 10. Seller Analytics & Top Products: PASS (Top Product: ${data.topProducts[0].name})`);
        passed++;
      } else {
        console.log('❌ 10. Seller Analytics: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.log('❌ 10. Seller Analytics: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 11: Seller Products & Low Stock Filter (GET /api/seller/products?lowStock=true)
    // -------------------------------------------------------------
    try {
      const res = await axios.get(`${BASE_URL}/seller/products?lowStock=true`, {
        headers: { Authorization: `Bearer ${sellerToken}` }
      });

      if (
        res.status === 200 &&
        Array.isArray(res.data.data.products) &&
        res.data.data.products.length >= 1 &&
        res.data.data.products[0].isLowStock === true
      ) {
        console.log(`✅ 11. Seller Products & Low Stock Filter: PASS (Found ${res.data.data.products.length} low-stock products)`);
        passed++;
      } else {
        console.log('❌ 11. Seller Products Filter: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.log('❌ 11. Seller Products Filter: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 12: Quick Variant Restocking (PATCH /api/seller/products/:id/variants/:varId/stock)
    // -------------------------------------------------------------
    try {
      const res = await axios.patch(
        `${BASE_URL}/seller/products/${product._id}/variants/${variantBlack._id}/stock`,
        { stock: 50 },
        { headers: { Authorization: `Bearer ${sellerToken}` } }
      );

      if (
        res.status === 200 &&
        res.data.success &&
        res.data.data.previousStock === 3 &&
        res.data.data.newStock === 50
      ) {
        console.log('✅ 12. Quick Variant Restocking: PASS (Stock updated 3 -> 50)');
        passed++;
      } else {
        console.log('❌ 12. Quick Variant Restocking: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.log('❌ 12. Quick Variant Restocking: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 13: Product Ownership Guard (Other seller cannot restock)
    // -------------------------------------------------------------
    try {
      await axios.patch(
        `${BASE_URL}/seller/products/${product._id}/variants/${variantBlack._id}/stock`,
        { stock: 100 },
        { headers: { Authorization: `Bearer ${otherSellerToken}` } }
      );
      console.log('❌ 13. Seller Product Ownership Guard: FAIL (Rogue seller modified product)');
      failed++;
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('✅ 13. Seller Product Ownership Guard: PASS (403 Forbidden as expected)');
        passed++;
      } else {
        console.log('❌ 13. Seller Product Ownership Guard: FAIL -', err.response?.data || err.message);
        failed++;
      }
    }

  } finally {
    console.log('\n🧹 Cleaning up test documents...');
    if (reviewA) await Review.findByIdAndDelete(reviewA._id);
    if (reviewB) await Review.findByIdAndDelete(reviewB._id);
    await Order.findByIdAndDelete(deliveredOrder._id);
    await Product.findByIdAndDelete(product._id);
    await Category.findByIdAndDelete(category._id);
    await User.deleteMany({
      _id: { $in: [customerA._id, customerB._id, seller._id, otherSeller._id] }
    });
    await mongoose.connection.close();
  }

  console.log(`\n================================`);
  console.log(`Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`================================\n`);

  if (failed === 0) {
    console.log('🎉 All Step 9 (Reviews) & Step 10 (Seller Dashboard) Tests Passed Successfully!');
  } else {
    process.exit(1);
  }
}

runReviewsAndSellerTests().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
