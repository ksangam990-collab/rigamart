const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';

async function runAdminTests() {
  console.log('🧪 Starting Rigamart Admin Panel & Platform Controls Test Suite...\n');
  let passed = 0;
  let failed = 0;

  await mongoose.connect(process.env.MONGO_URI);
  const User = require('../models/User');
  const Category = require('../models/Category');
  const Product = require('../models/Product');
  const Order = require('../models/Order');
  const { generateAccessToken } = require('./generateToken');

  const uniqueSuffix = Date.now().toString().slice(-6);

  // 1. Setup Admin, Customer, and Seller
  const admin = await User.create({
    name: 'Platform Super Admin',
    email: `adm_super_${uniqueSuffix}@rigamart.com`,
    password: 'Password123!',
    role: 'admin'
  });
  const adminToken = generateAccessToken(admin._id, 'admin');

  const customer = await User.create({
    name: 'Regular Customer',
    email: `adm_cust_${uniqueSuffix}@rigamart.com`,
    password: 'Password123!',
    role: 'customer'
  });
  const customerToken = generateAccessToken(customer._id, 'customer');

  const seller = await User.create({
    name: 'Marketplace Seller',
    email: `adm_sell_${uniqueSuffix}@rigamart.com`,
    password: 'Password123!',
    role: 'seller'
  });
  const sellerToken = generateAccessToken(seller._id, 'seller');

  // 2. Setup Category, Product & Sample Order
  const category = await Category.create({
    name: `Appliances ${uniqueSuffix}`,
    slug: `appliances-${uniqueSuffix}`
  });

  const product = await Product.create({
    name: `Smart Robotic Vacuum Cleaner ${uniqueSuffix}`,
    description: 'Autonomous LiDAR navigation robot vacuum.',
    category: category._id,
    seller: seller._id,
    images: [{ public_id: `vac_img_${uniqueSuffix}`, url: 'https://sample.url/vac.jpg', isPrimary: true }],
    variants: [
      {
        sku: `VAC-PRO-${uniqueSuffix}`,
        size: 'Pro',
        color: 'Space Gray',
        price: 18999,
        mrp: 29999,
        stock: 10
      }
    ],
    basePrice: 18999,
    isActive: true
  });

  const variant = product.variants[0];

  const testOrder = await Order.create({
    orderNumber: `ORD-ADMIN-${uniqueSuffix}`,
    user: customer._id,
    items: [
      {
        product: product._id,
        name: product.name,
        image: product.images[0].url,
        variantId: variant._id,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        price: 18999,
        quantity: 1,
        seller: seller._id
      }
    ],
    shippingAddress: {
      name: 'Regular Customer',
      mobile: '9876543210',
      street: '45 Park Street',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700016'
    },
    paymentInfo: {
      method: 'RAZORPAY',
      status: 'Completed',
      paidAt: new Date()
    },
    status: 'Delivered',
    itemsPrice: 18999,
    shippingPrice: 0,
    taxPrice: 0,
    totalAmount: 18999,
    deliveredAt: new Date()
  });

  // Second order in Placed status for cancellation test
  const placedOrder = await Order.create({
    orderNumber: `ORD-PLACED-${uniqueSuffix}`,
    user: customer._id,
    items: [
      {
        product: product._id,
        name: product.name,
        image: product.images[0].url,
        variantId: variant._id,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        price: 18999,
        quantity: 1,
        seller: seller._id
      }
    ],
    shippingAddress: {
      name: 'Regular Customer',
      mobile: '9876543210',
      street: '45 Park Street',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700016'
    },
    paymentInfo: {
      method: 'COD',
      status: 'Pending'
    },
    status: 'Placed',
    itemsPrice: 18999,
    shippingPrice: 0,
    taxPrice: 0,
    totalAmount: 18999
  });

  try {
    // -------------------------------------------------------------
    // Test 1: Role Authorization Guard (Customer cannot access Admin panel)
    // -------------------------------------------------------------
    try {
      await axios.get(`${BASE_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      console.log('❌ 1. Admin Role Guard: FAIL (Customer was allowed access)');
      failed++;
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('✅ 1. Admin Role Guard: PASS (403 Forbidden as expected)');
        passed++;
      } else {
        console.log('❌ 1. Admin Role Guard: FAIL -', err.response?.data || err.message);
        failed++;
      }
    }

    // -------------------------------------------------------------
    // Test 2: Platform Overview KPIs (GET /api/admin/dashboard)
    // -------------------------------------------------------------
    try {
      const res = await axios.get(`${BASE_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      const data = res.data.data;
      if (
        res.status === 200 &&
        res.data.success &&
        data.financials.totalGMV >= 18999 &&
        data.users.total >= 3 &&
        data.catalog.totalProducts >= 1 &&
        Array.isArray(data.recentActivity.orders)
      ) {
        console.log(`✅ 2. Platform KPIs & GMV: PASS (Total GMV: Rs. ${data.financials.totalGMV}, Users: ${data.users.total})`);
        passed++;
      } else {
        console.log('❌ 2. Platform KPIs: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.log('❌ 2. Platform KPIs: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 3: Platform Sales Analytics (GET /api/admin/analytics?range=30d)
    // -------------------------------------------------------------
    try {
      const res = await axios.get(`${BASE_URL}/admin/analytics?range=30d`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      const data = res.data.data;
      if (
        res.status === 200 &&
        Array.isArray(data.timeline) &&
        Array.isArray(data.topSellers) &&
        Array.isArray(data.paymentDistribution)
      ) {
        console.log(`✅ 3. Sales Analytics & Top Sellers: PASS (Timeline entries: ${data.timeline.length}, Payment methods: ${data.paymentDistribution.length})`);
        passed++;
      } else {
        console.log('❌ 3. Sales Analytics: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.log('❌ 3. Sales Analytics: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 4: Paginated Users Listing & Search Filter (GET /api/admin/users)
    // -------------------------------------------------------------
    try {
      const res = await axios.get(`${BASE_URL}/admin/users?search=Regular`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (
        res.status === 200 &&
        Array.isArray(res.data.data.users) &&
        res.data.data.users.length >= 1 &&
        res.data.data.users[0].email === customer.email
      ) {
        console.log(`✅ 4. Users Listing & Search: PASS (Found user: ${customer.email})`);
        passed++;
      } else {
        console.log('❌ 4. Users Listing: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.log('❌ 4. Users Listing: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 5: Single User Details & Spending Analytics (GET /api/admin/users/:id)
    // -------------------------------------------------------------
    try {
      const res = await axios.get(`${BASE_URL}/admin/users/${customer._id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (
        res.status === 200 &&
        res.data.data.user._id === customer._id.toString() &&
        res.data.data.stats.ordersCount >= 1 &&
        res.data.data.stats.totalSpent >= 18999
      ) {
        console.log(`✅ 5. User Deep Dive & Spending: PASS (Total Spent: Rs. ${res.data.data.stats.totalSpent})`);
        passed++;
      } else {
        console.log('❌ 5. User Deep Dive: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.log('❌ 5. User Deep Dive: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 6: User Ban & Instant Authorization Revocation
    // -------------------------------------------------------------
    try {
      // Step A: Admin bans the customer
      const resBan = await axios.patch(
        `${BASE_URL}/admin/users/${customer._id}/ban`,
        { isBanned: true },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      // Step B: Customer attempts to access protected endpoint with existing JWT
      let customerBlocked = false;
      try {
        await axios.get(`${BASE_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${customerToken}` }
        });
      } catch (custErr) {
        if (custErr.response?.status === 403 && custErr.response?.data.message.includes('suspended')) {
          customerBlocked = true;
        }
      }

      if (resBan.data.success && resBan.data.data.isBanned === true && customerBlocked) {
        console.log('✅ 6. User Ban & Session Termination: PASS (Account suspended, access immediately revoked)');
        passed++;
      } else {
        console.log('❌ 6. User Ban: FAIL', { resBan: resBan.data, customerBlocked });
        failed++;
      }
    } catch (err) {
      console.log('❌ 6. User Ban: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 7: User Reinstatement / Unban
    // -------------------------------------------------------------
    try {
      const resUnban = await axios.patch(
        `${BASE_URL}/admin/users/${customer._id}/ban`,
        { isBanned: false },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      // Customer should be able to access protected endpoint again
      const resProfile = await axios.get(`${BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });

      if (
        resUnban.data.success &&
        resUnban.data.data.isBanned === false &&
        resProfile.status === 200
      ) {
        console.log('✅ 7. User Reinstatement / Unban: PASS (Account reinstated successfully)');
        passed++;
      } else {
        console.log('❌ 7. User Reinstatement: FAIL', resUnban.data);
        failed++;
      }
    } catch (err) {
      console.log('❌ 7. User Reinstatement: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 8: Self-Ban Prevention Guard
    // -------------------------------------------------------------
    try {
      await axios.patch(
        `${BASE_URL}/admin/users/${admin._id}/ban`,
        { isBanned: true },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      console.log('❌ 8. Self-Ban Guard: FAIL (Admin banned self)');
      failed++;
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('✅ 8. Self-Ban Guard: PASS (Blocked admin from banning self)');
        passed++;
      } else {
        console.log('❌ 8. Self-Ban Guard: FAIL -', err.response?.data || err.message);
        failed++;
      }
    }

    // -------------------------------------------------------------
    // Test 9: Role Promotion / Elevation (Customer -> Seller)
    // -------------------------------------------------------------
    try {
      const res = await axios.patch(
        `${BASE_URL}/admin/users/${customer._id}/role`,
        { role: 'seller' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      if (res.data.success && res.data.data.newRole === 'seller') {
        console.log('✅ 9. Role Promotion: PASS (Customer elevated to Seller)');
        passed++;
      } else {
        console.log('❌ 9. Role Promotion: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.log('❌ 9. Role Promotion: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 10: Self-Demotion Guard
    // -------------------------------------------------------------
    try {
      await axios.patch(
        `${BASE_URL}/admin/users/${admin._id}/role`,
        { role: 'customer' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      console.log('❌ 10. Self-Demotion Guard: FAIL (Admin demoted self)');
      failed++;
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('✅ 10. Self-Demotion Guard: PASS (Blocked admin from demoting self)');
        passed++;
      } else {
        console.log('❌ 10. Self-Demotion Guard: FAIL -', err.response?.data || err.message);
        failed++;
      }
    }

    // -------------------------------------------------------------
    // Test 11: Platform Catalog Listing for Admin (GET /api/admin/products)
    // -------------------------------------------------------------
    try {
      const res = await axios.get(`${BASE_URL}/admin/products`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (
        res.status === 200 &&
        Array.isArray(res.data.data.products) &&
        res.data.data.products.length >= 1 &&
        res.data.data.products[0].totalStock !== undefined
      ) {
        console.log(`✅ 11. Admin Platform Catalog: PASS (Enriched ${res.data.data.products.length} products with stock totals)`);
        passed++;
      } else {
        console.log('❌ 11. Admin Platform Catalog: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.log('❌ 11. Admin Platform Catalog: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 12: Product Moderation / Deactivation & Catalog Sync
    // -------------------------------------------------------------
    try {
      // Step A: Admin deactivates product
      const resDeactivate = await axios.patch(
        `${BASE_URL}/admin/products/${product._id}/status`,
        { isActive: false, reason: 'Pending policy review' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      // Step B: Public catalog query should omit the deactivated product
      const resPublicCatalog = await axios.get(`${BASE_URL}/products`);
      const isPresentInPublic = resPublicCatalog.data.data.products.some(
        (p) => p._id.toString() === product._id.toString()
      );

      if (
        resDeactivate.data.success &&
        resDeactivate.data.data.isActive === false &&
        !isPresentInPublic
      ) {
        console.log('✅ 12. Product Moderation & Public Sync: PASS (Product deactivated, hidden from public store)');
        passed++;
      } else {
        console.log('❌ 12. Product Moderation: FAIL', { resDeactivate: resDeactivate.data, isPresentInPublic });
        failed++;
      }
    } catch (err) {
      console.log('❌ 12. Product Moderation: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 13: Order Status Override & Inventory Restoration
    // -------------------------------------------------------------
    try {
      // Simulate inventory decrement when order was placed (variant stock: 10 -> 9)
      await Product.findOneAndUpdate(
        { _id: product._id, 'variants._id': variant._id },
        { $inc: { 'variants.$.stock': -1 } }
      );
      const stockBeforeCancel = (await Product.findById(product._id)).variants[0].stock; // 9

      const res = await axios.patch(
        `${BASE_URL}/admin/orders/${placedOrder._id}/status`,
        {
          status: 'Cancelled',
          reason: 'Customer payment suspected fraudulent by fraud prevention team'
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      const stockAfterCancel = (await Product.findById(product._id)).variants[0].stock; // Should be 10

      if (
        res.data.success &&
        res.data.data.order.status === 'Cancelled' &&
        stockAfterCancel === stockBeforeCancel + 1
      ) {
        console.log(`✅ 13. Admin Order Override & Stock Restoration: PASS (Stock restored ${stockBeforeCancel} -> ${stockAfterCancel})`);
        passed++;
      } else {
        console.log('❌ 13. Admin Order Override: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.log('❌ 13. Admin Order Override: FAIL -', err.response?.data || err.message);
      failed++;
    }

  } finally {
    console.log('\n🧹 Cleaning up test documents...');
    await Order.findByIdAndDelete(testOrder._id);
    await Order.findByIdAndDelete(placedOrder._id);
    await Product.findByIdAndDelete(product._id);
    await Category.findByIdAndDelete(category._id);
    await User.deleteMany({
      _id: { $in: [admin._id, customer._id, seller._id] }
    });
    await mongoose.connection.close();
  }

  console.log(`\n================================`);
  console.log(`Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`================================\n`);

  if (failed === 0) {
    console.log('🎉 All Admin Panel & Platform Controls Tests Passed Successfully!');
  } else {
    process.exit(1);
  }
}

runAdminTests().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
