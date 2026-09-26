const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';

async function runOrderTests() {
  console.log('🧪 Starting Rigamart Order Management & Invoice PDF Test Suite...\n');
  let passed = 0;
  let failed = 0;

  await mongoose.connect(process.env.MONGO_URI);
  const User = require('../models/User');
  const Category = require('../models/Category');
  const Product = require('../models/Product');
  const Order = require('../models/Order');
  const { generateAccessToken } = require('./generateToken');

  const uniqueSuffix = Date.now().toString().slice(-6);

  // 1. Setup Customer, Seller, and Admin users
  const customer = await User.create({
    name: 'Order Customer',
    email: `ord_cust_${uniqueSuffix}@rigamart.com`,
    password: 'Password123!',
    role: 'customer'
  });
  const customerToken = generateAccessToken(customer._id, 'customer');

  const otherCustomer = await User.create({
    name: 'Other Customer',
    email: `other_cust_${uniqueSuffix}@rigamart.com`,
    password: 'Password123!',
    role: 'customer'
  });
  const otherCustomerToken = generateAccessToken(otherCustomer._id, 'customer');

  const seller = await User.create({
    name: 'Order Seller',
    email: `ord_seller_${uniqueSuffix}@rigamart.com`,
    password: 'Password123!',
    role: 'seller'
  });
  const sellerToken = generateAccessToken(seller._id, 'seller');

  const admin = await User.create({
    name: 'Order Admin',
    email: `ord_admin_${uniqueSuffix}@rigamart.com`,
    password: 'Password123!',
    role: 'admin'
  });
  const adminToken = generateAccessToken(admin._id, 'admin');

  // 2. Setup Category and Product with variants
  const category = await Category.create({
    name: `Fashion ${uniqueSuffix}`,
    slug: `fashion-${uniqueSuffix}`
  });

  const product = await Product.create({
    name: `Linen Casual Shirt ${uniqueSuffix}`,
    description: '100% breathable organic linen shirt.',
    category: category._id,
    seller: seller._id,
    images: [{ public_id: `shirt_img_${uniqueSuffix}`, url: 'https://sample.url/shirt.jpg', isPrimary: true }],
    variants: [
      {
        sku: `SHIRT-M-${uniqueSuffix}`,
        size: 'M',
        color: 'Navy Blue',
        price: 1299,
        mrp: 2499,
        stock: 15
      },
      {
        sku: `SHIRT-L-${uniqueSuffix}`,
        size: 'L',
        color: 'Navy Blue',
        price: 1299,
        mrp: 2499,
        stock: 10
      }
    ],
    basePrice: 1299
  });

  const variantM = product.variants[0];
  const initialStockM = variantM.stock; // 15

  const testAddress = {
    name: 'Order Customer',
    mobile: '9876543210',
    street: '123 Baker Street',
    landmark: 'Near City Mall',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001'
  };

  // Helper to create an order directly in DB for testing
  const createMockOrder = async (override = {}) => {
    const orderNum = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    return await Order.create({
      orderNumber: orderNum,
      user: customer._id,
      items: [
        {
          product: product._id,
          name: product.name,
          image: product.images[0].url,
          variantId: variantM._id,
          sku: variantM.sku,
          size: variantM.size,
          color: variantM.color,
          price: variantM.price,
          quantity: 2,
          seller: seller._id
        }
      ],
      shippingAddress: testAddress,
      paymentInfo: {
        method: 'COD',
        status: 'Pending'
      },
      status: 'Placed',
      itemsPrice: 2598,
      shippingPrice: 0,
      taxPrice: 0,
      totalAmount: 2598,
      ...override
    });
  };

  let testOrder1 = null;
  let testOrder2 = null;

  try {
    testOrder1 = await createMockOrder();
    testOrder2 = await createMockOrder();

    // -------------------------------------------------------------
    // Test 1: Get Customer Order History (GET /api/orders/my-orders)
    // -------------------------------------------------------------
    try {
      const res = await axios.get(`${BASE_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });

      if (
        res.status === 200 &&
        res.data.success &&
        Array.isArray(res.data.data.orders) &&
        res.data.data.orders.length >= 2 &&
        res.data.data.pagination
      ) {
        console.log(`✅ 1. Customer Order History: PASS (Found ${res.data.data.orders.length} orders)`);
        passed++;
      } else {
        console.log('❌ 1. Customer Order History: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.log('❌ 1. Customer Order History: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 2: Get Single Order by Mongo ID & OrderNumber (GET /api/orders/:id)
    // -------------------------------------------------------------
    try {
      const resById = await axios.get(`${BASE_URL}/orders/${testOrder1._id}`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      const resByNum = await axios.get(`${BASE_URL}/orders/${testOrder1.orderNumber}`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });

      if (
        resById.data.success &&
        resById.data.data.order._id === testOrder1._id.toString() &&
        resByNum.data.success &&
        resByNum.data.data.order.orderNumber === testOrder1.orderNumber
      ) {
        console.log(`✅ 2. Order Retrieval by ID & OrderNumber: PASS (${testOrder1.orderNumber})`);
        passed++;
      } else {
        console.log('❌ 2. Order Retrieval by ID & OrderNumber: FAIL');
        failed++;
      }
    } catch (err) {
      console.log('❌ 2. Order Retrieval: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 3: Unauthorized Access Guard (Other Customer cannot view order)
    // -------------------------------------------------------------
    try {
      await axios.get(`${BASE_URL}/orders/${testOrder1._id}`, {
        headers: { Authorization: `Bearer ${otherCustomerToken}` }
      });
      console.log('❌ 3. Unauthorized Order Access Guard: FAIL (Access should have been denied)');
      failed++;
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('✅ 3. Unauthorized Order Access Guard: PASS (403 Forbidden as expected)');
        passed++;
      } else {
        console.log('❌ 3. Unauthorized Order Access Guard: FAIL -', err.response?.data || err.message);
        failed++;
      }
    }

    // -------------------------------------------------------------
    // Test 4: Cancel Order & Restore Inventory (PUT /api/orders/:id/cancel)
    // -------------------------------------------------------------
    try {
      // First decrement stock to simulate order checkout decrement
      await Product.findOneAndUpdate(
        { _id: product._id, 'variants._id': variantM._id },
        { $inc: { 'variants.$.stock': -2 } }
      );
      const stockBeforeCancel = (await Product.findById(product._id)).variants[0].stock; // 13

      const res = await axios.put(
        `${BASE_URL}/orders/${testOrder1._id}/cancel`,
        { reason: 'Customer changed mind' },
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );

      const updatedProduct = await Product.findById(product._id);
      const stockAfterCancel = updatedProduct.variants[0].stock; // Should be restored back to 15

      if (
        res.data.success &&
        res.data.data.order.status === 'Cancelled' &&
        stockAfterCancel === stockBeforeCancel + 2
      ) {
        console.log(`✅ 4. Customer Cancel & Stock Restoration: PASS (Stock restored ${stockBeforeCancel} -> ${stockAfterCancel})`);
        passed++;
      } else {
        console.log('❌ 4. Customer Cancel & Stock Restoration: FAIL', res.data, { stockBeforeCancel, stockAfterCancel });
        failed++;
      }
    } catch (err) {
      console.log('❌ 4. Customer Cancel: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 5: Reject Duplicate Cancellation on Already Cancelled Order
    // -------------------------------------------------------------
    try {
      await axios.put(
        `${BASE_URL}/orders/${testOrder1._id}/cancel`,
        { reason: 'Cancel again' },
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );
      console.log('❌ 5. Duplicate Cancel Guard: FAIL (Should reject already cancelled order)');
      failed++;
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('✅ 5. Duplicate Cancel Guard: PASS (400 Bad Request as expected)');
        passed++;
      } else {
        console.log('❌ 5. Duplicate Cancel Guard: FAIL -', err.response?.data || err.message);
        failed++;
      }
    }

    // -------------------------------------------------------------
    // Test 6: Seller View Orders (GET /api/orders/seller/orders)
    // -------------------------------------------------------------
    try {
      const res = await axios.get(`${BASE_URL}/orders/seller/orders`, {
        headers: { Authorization: `Bearer ${sellerToken}` }
      });

      if (
        res.data.success &&
        Array.isArray(res.data.data.orders) &&
        res.data.data.orders.length > 0 &&
        res.data.data.orders[0].sellerItems
      ) {
        console.log(`✅ 6. Seller Orders Retrieval: PASS (Found ${res.data.data.orders.length} orders with seller breakdown)`);
        passed++;
      } else {
        console.log('❌ 6. Seller Orders Retrieval: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.log('❌ 6. Seller Orders Retrieval: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 7: State Machine Guard - Reject Invalid Jump (Placed -> Delivered)
    // -------------------------------------------------------------
    try {
      await axios.put(
        `${BASE_URL}/orders/seller/${testOrder2._id}/status`,
        { status: 'Delivered' },
        { headers: { Authorization: `Bearer ${sellerToken}` } }
      );
      console.log('❌ 7. Invalid State Transition Guard: FAIL (Should not allow Placed -> Delivered)');
      failed++;
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('✅ 7. Invalid State Transition Guard: PASS (Blocked invalid status jump)');
        passed++;
      } else {
        console.log('❌ 7. Invalid State Transition Guard: FAIL -', err.response?.data || err.message);
        failed++;
      }
    }

    // -------------------------------------------------------------
    // Test 8: Seller Status Progression (Placed -> Confirmed -> Shipped -> Delivered)
    // -------------------------------------------------------------
    try {
      // Step A: Placed -> Confirmed
      const resConfirmed = await axios.put(
        `${BASE_URL}/orders/seller/${testOrder2._id}/status`,
        { status: 'Confirmed', comment: 'Inventory packed and labeled' },
        { headers: { Authorization: `Bearer ${sellerToken}` } }
      );

      // Step B: Confirmed -> Shipped
      const resShipped = await axios.put(
        `${BASE_URL}/orders/seller/${testOrder2._id}/status`,
        { status: 'Shipped', comment: 'Handed over to BlueDart courier' },
        { headers: { Authorization: `Bearer ${sellerToken}` } }
      );

      // Step C: Shipped -> Delivered
      const resDelivered = await axios.put(
        `${BASE_URL}/orders/seller/${testOrder2._id}/status`,
        { status: 'Delivered', comment: 'Delivered to customer' },
        { headers: { Authorization: `Bearer ${sellerToken}` } }
      );

      const deliveredOrder = resDelivered.data.data.order;

      if (
        resConfirmed.data.success &&
        resShipped.data.success &&
        resDelivered.data.success &&
        deliveredOrder.status === 'Delivered' &&
        deliveredOrder.deliveredAt &&
        deliveredOrder.paymentInfo.status === 'Completed' // COD auto-marked Completed on delivery
      ) {
        console.log('✅ 8. Order Status Progression (Placed->Confirmed->Shipped->Delivered): PASS');
        passed++;
      } else {
        console.log('❌ 8. Order Status Progression: FAIL', resDelivered.data);
        failed++;
      }
    } catch (err) {
      console.log('❌ 8. Order Status Progression: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 9: Customer Return Request on Delivered Order (PUT /api/orders/:id/return)
    // -------------------------------------------------------------
    try {
      const res = await axios.put(
        `${BASE_URL}/orders/${testOrder2._id}/return`,
        { reason: 'Size did not fit comfortably' },
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );

      if (res.data.success && res.data.data.order.status === 'Returned') {
        console.log('✅ 9. Customer Return on Delivered Order: PASS');
        passed++;
      } else {
        console.log('❌ 9. Customer Return: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.log('❌ 9. Customer Return: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 10: Admin Retrieve All Platform Orders (GET /api/orders/admin/all)
    // -------------------------------------------------------------
    try {
      const res = await axios.get(`${BASE_URL}/orders/admin/all`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (
        res.data.success &&
        Array.isArray(res.data.data.orders) &&
        res.data.data.pagination
      ) {
        console.log(`✅ 10. Admin All Orders Retrieval: PASS (${res.data.data.orders.length} total orders across platform)`);
        passed++;
      } else {
        console.log('❌ 10. Admin All Orders: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.log('❌ 10. Admin All Orders: FAIL -', err.response?.data || err.message);
      failed++;
    }

    // -------------------------------------------------------------
    // Test 11: Tax Invoice PDF Generation (GET /api/orders/:id/invoice)
    // -------------------------------------------------------------
    try {
      const res = await axios.get(`${BASE_URL}/orders/${testOrder2._id}/invoice`, {
        headers: { Authorization: `Bearer ${customerToken}` },
        responseType: 'arraybuffer'
      });

      const contentType = res.headers['content-type'];
      const buffer = Buffer.from(res.data);
      const isPdfHeader = buffer.slice(0, 5).toString('ascii') === '%PDF-';

      if (
        res.status === 200 &&
        contentType === 'application/pdf' &&
        isPdfHeader &&
        buffer.length > 1000
      ) {
        console.log(`✅ 11. PDF Tax Invoice Stream: PASS (${buffer.length} bytes, valid %PDF- header)`);
        passed++;
      } else {
        console.log('❌ 11. PDF Tax Invoice: FAIL', { contentType, isPdfHeader, length: buffer.length });
        failed++;
      }
    } catch (err) {
      console.log('❌ 11. PDF Tax Invoice: FAIL -', err.response?.data || err.message);
      failed++;
    }

  } finally {
    // Cleanup generated test data
    console.log('\n🧹 Cleaning up generated test documents...');
    if (testOrder1) await Order.findByIdAndDelete(testOrder1._id);
    if (testOrder2) await Order.findByIdAndDelete(testOrder2._id);
    await Product.findByIdAndDelete(product._id);
    await Category.findByIdAndDelete(category._id);
    await User.deleteMany({
      _id: { $in: [customer._id, otherCustomer._id, seller._id, admin._id] }
    });
    await mongoose.connection.close();
  }

  console.log(`\n================================`);
  console.log(`Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`================================\n`);

  if (failed === 0) {
    console.log('🎉 All Order Management & Invoice PDF Tests Passed Successfully!');
  } else {
    process.exit(1);
  }
}

runOrderTests().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
