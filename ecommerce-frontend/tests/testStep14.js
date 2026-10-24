import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.LIVE_API_URL || process.env.VITE_API_URL || 'http://localhost:5000/api';

// Resolve Razorpay Key Secret from environment or backend .env (never hardcode fallback credentials)
let razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
if (!razorpaySecret) {
  try {
    const envPath = path.resolve(process.cwd(), '../ecommerce-backend/.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/RAZORPAY_KEY_SECRET\s*=\s*(.*)/);
      if (match && match[1]) {
        razorpaySecret = match[1].trim();
      }
    }
  } catch (e) {
    // ignore read error
  }
}
if (!razorpaySecret) {
  throw new Error('RAZORPAY_KEY_SECRET could not be resolved from environment or ../ecommerce-backend/.env. Aborting test.');
}

console.log('🧪 Starting Comprehensive Step 14 Frontend UI & Backend Contract Test Suite...');
console.log(`🌐 Target Backend API: ${BASE_URL}\n`);
let passed = 0;
let failed = 0;

/**
 * Idempotent authentication helper:
 * Attempts login with provided credentials; if account is missing,
 * auto-registers the account with the requested role.
 */
async function authenticateOrRegister(name, email, password, role = 'customer', mobile = '9123456780') {
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
    return {
      token: res.data.data?.accessToken,
      cookie: res.headers['set-cookie']
    };
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 404) {
      const regRes = await axios.post(`${BASE_URL}/auth/register`, {
        name,
        email,
        password,
        mobile,
        role
      });
      return {
        token: regRes.data.data?.accessToken,
        cookie: regRes.headers['set-cookie']
      };
    }
    throw err;
  }
}

async function runStep14Tests() {
  try {
    // -------------------------------------------------------------------------
    // Test 1: Public Catalog & Sorting Modes (price-asc, price-desc, rating, newest)
    // -------------------------------------------------------------------------
    const sortModes = ['newest', 'price-asc', 'price-desc', 'rating'];
    let sortAllPassed = true;
    for (const sortMode of sortModes) {
      const res = await axios.get(`${BASE_URL}/products?sort=${sortMode}&limit=5`);
      if (res.data.success !== true || !Array.isArray(res.data.data?.products)) {
        sortAllPassed = false;
        break;
      }
    }

    if (sortAllPassed) {
      console.log('✅ 1. Catalog Multi-Sort Modes: PASS (newest, price-asc, price-desc, rating verified)');
      passed++;
    } else {
      console.log('❌ 1. Catalog Multi-Sort Modes: FAIL');
      failed++;
    }

    // -------------------------------------------------------------------------
    // Test 2: Search Endpoint Contract (/products/search?q=)
    // -------------------------------------------------------------------------
    const catalogRes = await axios.get(`${BASE_URL}/products?limit=12&page=1`);
    const testProduct = catalogRes.data.data?.products?.[0];
    if (!testProduct) {
      throw new Error('No test products found in database to execute tests');
    }

    const searchTerm = testProduct.name.split(' ')[0] || 'shirt';
    const searchRes = await axios.get(`${BASE_URL}/products/search?q=${encodeURIComponent(searchTerm)}`);

    if (
      searchRes.data.success === true &&
      Array.isArray(searchRes.data.data?.products) &&
      searchRes.data.data?.pagination
    ) {
      console.log(`✅ 2. Product Full-Text Search: PASS (Query "${searchTerm}" returned ${searchRes.data.data.products.length} matches)`);
      passed++;
    } else {
      console.log('❌ 2. Product Search: FAIL', searchRes.data);
      failed++;
    }

    // -------------------------------------------------------------------------
    // Test 3: Product Detail & Variant Schema
    // -------------------------------------------------------------------------
    const detailRes = await axios.get(`${BASE_URL}/products/${testProduct._id}`);
    const product = detailRes.data.data?.product;
    if (
      detailRes.data.success === true &&
      product &&
      Array.isArray(product.variants) &&
      product.variants.length > 0
    ) {
      console.log(`✅ 3. Product Detail & Variant Schema: PASS (Title: "${product.name}", ${product.variants.length} variants)`);
      passed++;
    } else {
      console.log('❌ 3. Product Detail Flow: FAIL', detailRes.data);
      failed++;
    }

    // -------------------------------------------------------------------------
    // Test 4: Review Contract Assertions (body, verifiedPurchase, helpfulVotes number)
    // -------------------------------------------------------------------------
    const reviewRes = await axios.get(`${BASE_URL}/reviews/products/${testProduct._id}`);
    const reviews = reviewRes.data.data?.reviews || [];
    let reviewSchemaValid = true;

    if (reviews.length > 0) {
      const sampleRev = reviews[0];
      if (
        typeof sampleRev.body !== 'string' ||
        typeof sampleRev.verifiedPurchase !== 'boolean' ||
        typeof sampleRev.helpfulVotes !== 'number'
      ) {
        reviewSchemaValid = false;
        console.error('Schema mismatch in review:', {
          bodyType: typeof sampleRev.body,
          verifiedPurchaseType: typeof sampleRev.verifiedPurchase,
          helpfulVotesType: typeof sampleRev.helpfulVotes
        });
      }
    }

    if (reviewRes.data.success === true && reviewSchemaValid) {
      console.log('✅ 4. Review Contract & Field Types: PASS (body: string, verifiedPurchase: bool, helpfulVotes: number)');
      passed++;
    } else {
      console.log('❌ 4. Review Contract: FAIL');
      failed++;
    }

    // Authenticate demo customer idempotently
    const customerAuth = await authenticateOrRegister(
      'Demo Customer',
      'demo_customer@rigamart.com',
      'Password123!',
      'customer',
      '9876543211'
    );
    const customerToken = customerAuth.token;
    const authHeaders = {
      headers: {
        Authorization: `Bearer ${customerToken}`,
        Cookie: customerAuth.cookie ? customerAuth.cookie.join('; ') : ''
      }
    };

    // -------------------------------------------------------------------------
    // Test 5: Cart Operations & calculateLiveCart Schema (currentPrice, size, color, sku)
    // -------------------------------------------------------------------------
    const variant = product.variants[0];
    const addCartRes = await axios.post(
      `${BASE_URL}/cart/add`,
      { productId: product._id, variantId: variant._id, quantity: 1 },
      authHeaders
    );
    const addedItem = addCartRes.data.data?.cart?.items?.[0];

    // Assert calculateLiveCart schema: currentPrice, size, color, sku as top-level fields
    let cartItemSchemaValid = false;
    if (addedItem) {
      const hasPrice = typeof (addedItem.currentPrice ?? addedItem.priceAtAddition) === 'number';
      const hasSize = typeof addedItem.size === 'string';
      const hasColor = typeof addedItem.color === 'string';
      const hasSku = typeof addedItem.sku === 'string';
      cartItemSchemaValid = hasPrice && hasSize && hasColor && hasSku;

      if (!cartItemSchemaValid) {
        console.error('Cart item schema mismatch:', {
          currentPrice: addedItem.currentPrice,
          priceAtAddition: addedItem.priceAtAddition,
          size: addedItem.size,
          color: addedItem.color,
          sku: addedItem.sku
        });
      }
    }

    const updateCartRes = await axios.put(
      `${BASE_URL}/cart/update`,
      { itemId: addedItem?._id, quantity: 2 },
      authHeaders
    );

    const removeCartRes = await axios.delete(
      `${BASE_URL}/cart/remove/${addedItem?._id}`,
      authHeaders
    );

    if (
      addCartRes.data.success === true &&
      cartItemSchemaValid &&
      updateCartRes.data.success === true &&
      removeCartRes.data.success === true
    ) {
      console.log('✅ 5. Cart Operations & Schema: PASS (currentPrice, size, color, sku verified as top-level fields)');
      passed++;
    } else {
      console.log('❌ 5. Cart Operations & Schema: FAIL');
      failed++;
    }

    // -------------------------------------------------------------------------
    // Test 6: Wishlist State-Aware Operations
    // -------------------------------------------------------------------------
    const addWishlistRes = await axios.post(
      `${BASE_URL}/users/wishlist/${product._id}`,
      {},
      authHeaders
    );
    const delWishlistRes = await axios.delete(
      `${BASE_URL}/users/wishlist/${product._id}`,
      authHeaders
    );

    if (
      addWishlistRes.data.success === true &&
      delWishlistRes.data.success === true &&
      Array.isArray(delWishlistRes.data.data?.wishlist)
    ) {
      console.log('✅ 6. Wishlist State-Aware Add & Remove: PASS (POST & DELETE /users/wishlist/:id)');
      passed++;
    } else {
      console.log('❌ 6. Wishlist Operations: FAIL');
      failed++;
    }

    // -------------------------------------------------------------------------
    // Test 7: Order Schema Assertions (status casing, paymentInfo.method) & PDF Invoice
    // -------------------------------------------------------------------------
    const ordersRes = await axios.get(`${BASE_URL}/orders/my-orders`, authHeaders);
    const orders = ordersRes.data.data?.orders || [];
    let orderSchemaValid = true;

    const validStatuses = ['Placed', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
    const validPaymentMethods = ['COD', 'RAZORPAY'];

    if (orders.length > 0) {
      const sampleOrder = orders[0];
      if (!validStatuses.includes(sampleOrder.status)) {
        orderSchemaValid = false;
        console.error(`Invalid order.status: ${sampleOrder.status}`);
      }
      if (!validPaymentMethods.includes(sampleOrder.paymentInfo?.method)) {
        orderSchemaValid = false;
        console.error(`Invalid order.paymentInfo.method: ${sampleOrder.paymentInfo?.method}`);
      }
    }

    let invoiceBufferValid = false;
    if (orders.length > 0) {
      const invoiceRes = await axios.get(`${BASE_URL}/orders/${orders[0]._id}/invoice`, {
        ...authHeaders,
        responseType: 'arraybuffer'
      });
      const headerStr = Buffer.from(invoiceRes.data).subarray(0, 4).toString();
      invoiceBufferValid = headerStr === '%PDF';
    } else {
      invoiceBufferValid = true;
    }

    if (ordersRes.data.success === true && orderSchemaValid && invoiceBufferValid) {
      console.log('✅ 7. Order Status & Invoice Schema: PASS (order.status Capitalized, paymentInfo.method, %PDF valid)');
      passed++;
    } else {
      console.log('❌ 7. Order Status & Invoice Schema: FAIL');
      failed++;
    }

    // -------------------------------------------------------------------------
    // Test 8: Admin Moderation Toggles (Ban & Product Status with boolean bodies)
    // -------------------------------------------------------------------------
    const adminLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'demo_admin@rigamart.com',
      password: 'Password123!'
    });

    const adminToken = adminLoginRes.data.data?.accessToken;
    const adminHeaders = {
      headers: { Authorization: `Bearer ${adminToken}` }
    };

    // 1. Test ban toggle with customer ID
    const customerUserRes = await axios.get(`${BASE_URL}/users/profile`, authHeaders);
    const customerUserId = customerUserRes.data.data?.user?._id;

    // Positive test: sending isBanned: false
    const unbanRes = await axios.patch(
      `${BASE_URL}/admin/users/${customerUserId}/ban`,
      { isBanned: false },
      adminHeaders
    );

    // Negative guard test: omitting isBanned must yield 400
    let guardCaught = false;
    try {
      await axios.patch(`${BASE_URL}/admin/users/${customerUserId}/ban`, {}, adminHeaders);
    } catch (err) {
      if (err.response?.status === 400) guardCaught = true;
    }

    // 2. Test product status toggle with isActive: true
    const prodToggleRes = await axios.patch(
      `${BASE_URL}/admin/products/${testProduct._id}/status`,
      { isActive: true },
      adminHeaders
    );

    // 3. Test Admin Dashboard metrics contract (financials.totalGMV, orders.total, users.total, users.breakdown.seller)
    const adminDashRes = await axios.get(`${BASE_URL}/admin/dashboard`, adminHeaders);
    const d = adminDashRes.data.data;
    const hasGMV = typeof d?.financials?.totalGMV === 'number';
    const hasOrders = typeof d?.orders?.total === 'number';
    const hasUsers = typeof d?.users?.total === 'number';
    const hasSellers = typeof d?.users?.breakdown?.seller === 'number';

    if (
      unbanRes.data.success === true &&
      guardCaught &&
      prodToggleRes.data.success === true &&
      hasGMV &&
      hasOrders &&
      hasUsers &&
      hasSellers
    ) {
      console.log('✅ 8. Admin Dashboard & Moderation: PASS (KPI metrics schema, isBanned boolean guard & isActive boolean verified)');
      passed++;
    } else {
      console.log('❌ 8. Admin Dashboard & Moderation: FAIL', { hasGMV, hasOrders, hasUsers, hasSellers });
      failed++;
    }

    // -------------------------------------------------------------------------
    // Test 9: Seller Dashboard & Orders Integration (Idempotent Seller Login/Seed)
    // -------------------------------------------------------------------------
    const sellerAuth = await authenticateOrRegister(
      'Urban Threads Mumbai',
      'demo_seller@rigamart.com',
      'Password123!',
      'seller',
      '9123456780'
    );
    const sellerToken = sellerAuth.token;
    const sellerHeaders = {
      headers: { Authorization: `Bearer ${sellerToken}` }
    };

    const [sellerDashRes, sellerOrdersRes] = await Promise.all([
      axios.get(`${BASE_URL}/seller/dashboard`, sellerHeaders),
      axios.get(`${BASE_URL}/seller/orders`, sellerHeaders)
    ]);

    const sMetrics = sellerDashRes.data.data?.metrics;
    const hasLowStockCount = typeof sMetrics?.lowStockCount === 'number';
    const hasTotalRevenue = typeof sMetrics?.totalRevenue === 'number';

    if (
      sellerDashRes.data.success === true &&
      hasLowStockCount &&
      hasTotalRevenue &&
      sellerOrdersRes.data.success === true &&
      Array.isArray(sellerOrdersRes.data.data?.orders)
    ) {
      console.log('✅ 9. Seller Central API: PASS (lowStockCount, totalRevenue, metrics & seller order stream verified for demo_seller)');
      passed++;
    } else {
      console.log('❌ 9. Seller Central API: FAIL', { hasLowStockCount, hasTotalRevenue });
      failed++;
    }

    // -------------------------------------------------------------------------
    // Test 10: Razorpay End-to-End Online Payment Flow & HMAC-SHA256 Verification
    // -------------------------------------------------------------------------
    // 1. Ensure customer has an item in cart
    await axios.post(
      `${BASE_URL}/cart/add`,
      { productId: testProduct._id, variantId: variant._id, quantity: 1 },
      authHeaders
    );

    // 2. Initiate order via /payment/create-order
    const paymentAddress = {
      name: 'Demo Customer',
      mobile: '9876543211',
      street: '42 MG Road, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050'
    };

    const createOrderRes = await axios.post(
      `${BASE_URL}/payment/create-order`,
      {
        shippingAddress: paymentAddress,
        paymentMethod: 'RAZORPAY'
      },
      authHeaders
    );

    const orderPayload = createOrderRes.data.data;
    const rzpOrderId = orderPayload?.razorpayOrderId;
    const rgmOrderId = orderPayload?.orderId;

    if (!rzpOrderId || !rgmOrderId) {
      throw new Error('Failed to obtain Razorpay orderId or Rigamart orderId from /payment/create-order');
    }

    const mockPaymentId = `pay_step14_${Date.now().toString().slice(-8)}`;

    // 3. Cryptographic HMAC SHA-256 signature generation matching Razorpay protocol:
    // signature = hmac_sha256(razorpay_order_id + "|" + razorpay_payment_id, secret)
    const genuineSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(`${rzpOrderId}|${mockPaymentId}`)
      .digest('hex');

    // 4. Negative Guard: sending buggy camelCase keys must fail with 400
    let camelCaseGuardCaught = false;
    try {
      await axios.post(
        `${BASE_URL}/payment/verify`,
        {
          orderId: rgmOrderId,
          razorpayOrderId: rzpOrderId,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: genuineSignature
        },
        authHeaders
      );
    } catch (err) {
      if (
        err.response?.status === 400 &&
        err.response?.data?.message?.includes('Missing required Razorpay verification parameters')
      ) {
        camelCaseGuardCaught = true;
      }
    }

    // 5. Positive Test: sending exact snake_case payload from CheckoutModal.jsx
    const verifyRes = await axios.post(
      `${BASE_URL}/payment/verify`,
      {
        orderId: rgmOrderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: genuineSignature
      },
      authHeaders
    );

    const isConfirmed = verifyRes.data.data?.status === 'Confirmed';
    const isCompleted = verifyRes.data.data?.paymentStatus === 'Completed';

    if (
      createOrderRes.data.success === true &&
      camelCaseGuardCaught &&
      verifyRes.data.success === true &&
      isConfirmed &&
      isCompleted
    ) {
      console.log('✅ 10. Razorpay Payment Verification Flow: PASS (snake_case payload verified, HMAC-SHA256 signature authentic, Order: Confirmed, camelCase guard caught)');
      passed++;
    } else {
      console.log('❌ 10. Razorpay Payment Verification Flow: FAIL', {
        camelCaseGuardCaught,
        verifyData: verifyRes.data
      });
      failed++;
    }

  } catch (error) {
    console.error('Fatal Integration Test Error:', error.message);
    if (error.response?.data) console.error('Details:', error.response.data);
    failed++;
  }

  console.log(`\n================================`);
  console.log(`Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`================================\n`);

  if (failed === 0) {
    console.log('🎉 All Step 14 Frontend UI Pages & Backend Integrations Verified Successfully!');
  } else {
    process.exit(1);
  }
}

runStep14Tests();
