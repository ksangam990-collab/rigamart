const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';

async function runCartWishlistTests() {
  console.log('🧪 Starting Rigamart Cart, Wishlist & Address Test Suite...\n');
  let passed = 0;
  let failed = 0;

  await mongoose.connect(process.env.MONGO_URI);
  const User = require('../models/User');
  const Category = require('../models/Category');
  const Product = require('../models/Product');
  const Cart = require('../models/Cart');
  const { generateAccessToken } = require('./generateToken');

  const uniqueSuffix = Date.now().toString().slice(-6);

  // 1. Setup test customer and seller
  const customer = await User.create({
    name: 'Cart Customer',
    email: `cart_cust_${uniqueSuffix}@rigamart.com`,
    password: 'Password123!',
    role: 'customer'
  });
  const customerToken = generateAccessToken(customer._id, 'customer');

  const seller = await User.create({
    name: 'Cart Seller',
    email: `cart_seller_${uniqueSuffix}@rigamart.com`,
    password: 'Password123!',
    role: 'seller'
  });

  const category = await Category.create({
    name: `Fashion ${uniqueSuffix}`,
    slug: `fashion-${uniqueSuffix}`
  });

  const product = await Product.create({
    name: `Cotton Slim Shirt ${uniqueSuffix}`,
    description: '100% Breathable cotton casual shirt.',
    category: category._id,
    seller: seller._id,
    images: [{ public_id: 'sample_id', url: 'https://sample.url/img.jpg', isPrimary: true }],
    variants: [
      {
        sku: `SHIRT-M-${uniqueSuffix}`,
        size: 'M',
        color: 'Navy Blue',
        price: 999,
        mrp: 1999,
        stock: 5 // Low stock to test boundary check
      },
      {
        sku: `SHIRT-L-${uniqueSuffix}`,
        size: 'L',
        color: 'Navy Blue',
        price: 999,
        mrp: 1999,
        stock: 20
      }
    ],
    basePrice: 999
  });

  const variantM = product.variants[0];
  let createdCartItemId = null;
  let createdAddressId = null;

  try {
    // Test 1: Fetch Empty Initial Cart
    try {
      const res = await axios.get(`${BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });

      if (res.status === 200 && res.data.success && res.data.data.cart.items.length === 0) {
        console.log('✅ 1. Get Initial Cart: PASS (Empty cart initialized with summary envelope)');
        passed++;
      } else {
        console.error('❌ 1. Get Initial Cart: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.error('❌ 1. Get Initial Cart: ERROR', err.response?.data || err.message);
      failed++;
    }

    // Test 2: Add Item to Cart
    try {
      const res = await axios.post(
        `${BASE_URL}/cart/add`,
        {
          productId: product._id,
          variantId: variantM._id,
          quantity: 2
        },
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );

      if (
        res.status === 200 &&
        res.data.success &&
        res.data.data.cart.items.length === 1 &&
        res.data.data.cart.summary.itemsPrice === 1998
      ) {
        createdCartItemId = res.data.data.cart.items[0]._id;
        console.log('✅ 2. Add to Cart: PASS (2 units of Variant M added, subtotal: ₹1998)');
        passed++;
      } else {
        console.error('❌ 2. Add to Cart: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.error('❌ 2. Add to Cart: ERROR', err.response?.data || err.message);
      failed++;
    }

    // Test 3: Insufficient Stock Rejection
    try {
      await axios.post(
        `${BASE_URL}/cart/add`,
        {
          productId: product._id,
          variantId: variantM._id,
          quantity: 10 // stock is only 5
        },
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );
      console.error('❌ 3. Inventory Stock Boundary: FAIL (Should reject quantity exceeding stock)');
      failed++;
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('✅ 3. Inventory Stock Boundary: PASS (Prevented adding beyond available stock)');
        passed++;
      } else {
        console.error('❌ 3. Inventory Stock Boundary: FAIL', err.response?.data || err.message);
        failed++;
      }
    }

    // Test 4: Update Cart Item Quantity
    try {
      const res = await axios.put(
        `${BASE_URL}/cart/update`,
        {
          itemId: createdCartItemId,
          quantity: 3
        },
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );

      if (
        res.status === 200 &&
        res.data.success &&
        res.data.data.cart.items[0].quantity === 3 &&
        res.data.data.cart.summary.itemsPrice === 2997
      ) {
        console.log('✅ 4. Update Cart Quantity: PASS (Quantity updated to 3, live subtotal: ₹2997)');
        passed++;
      } else {
        console.error('❌ 4. Update Cart Quantity: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.error('❌ 4. Update Cart Quantity: ERROR', err.response?.data || err.message);
      failed++;
    }

    // Test 5: Add Product to Wishlist
    try {
      const res = await axios.post(
        `${BASE_URL}/users/wishlist/${product._id}`,
        {},
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );

      if (
        res.status === 200 &&
        res.data.success &&
        res.data.data.wishlist.some((p) => p._id.toString() === product._id.toString())
      ) {
        console.log('✅ 5. Add to Wishlist: PASS (Product added to customer wishlist)');
        passed++;
      } else {
        console.error('❌ 5. Add to Wishlist: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.error('❌ 5. Add to Wishlist: ERROR', err.response?.data || err.message);
      failed++;
    }

    // Test 6: Retrieve Populated Wishlist
    try {
      const res = await axios.get(`${BASE_URL}/users/wishlist`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });

      if (
        res.status === 200 &&
        res.data.success &&
        res.data.data.wishlist.some((p) => p.name.includes('Cotton Slim Shirt'))
      ) {
        console.log('✅ 6. Get Wishlist: PASS (Populated with product details and prices)');
        passed++;
      } else {
        console.error('❌ 6. Get Wishlist: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.error('❌ 6. Get Wishlist: ERROR', err.response?.data || err.message);
      failed++;
    }

    // Test 7: Add Shipping Address
    try {
      const res = await axios.post(
        `${BASE_URL}/users/address`,
        {
          name: 'Rohan Sharma',
          mobile: '9876543210',
          street: '12th Cross, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038',
          landmark: 'Opposite Metro Pillar 42',
          isDefault: true
        },
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );

      if (
        res.status === 201 &&
        res.data.success &&
        res.data.data.addresses.length > 0 &&
        res.data.data.addresses[0].isDefault === true
      ) {
        createdAddressId = res.data.data.addresses[0]._id;
        console.log('✅ 7. Add Address: PASS (Saved with valid PIN code and marked as default)');
        passed++;
      } else {
        console.error('❌ 7. Add Address: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.error('❌ 7. Add Address: ERROR', err.response?.data || err.message);
      failed++;
    }

    // Test 8: Remove Address
    try {
      const res = await axios.delete(`${BASE_URL}/users/address/${createdAddressId}`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });

      if (res.status === 200 && res.data.success && res.data.data.addresses.length === 0) {
        console.log('✅ 8. Remove Address: PASS (Address subdocument removed)');
        passed++;
      } else {
        console.error('❌ 8. Remove Address: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.error('❌ 8. Remove Address: ERROR', err.response?.data || err.message);
      failed++;
    }

    // Test 9: Remove from Wishlist
    try {
      const res = await axios.delete(`${BASE_URL}/users/wishlist/${product._id}`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });

      if (
        res.status === 200 &&
        res.data.success &&
        !res.data.data.wishlist.some((p) => p._id.toString() === product._id.toString())
      ) {
        console.log('✅ 9. Remove from Wishlist: PASS (Product removed from wishlist)');
        passed++;
      } else {
        console.error('❌ 9. Remove from Wishlist: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.error('❌ 9. Remove from Wishlist: ERROR', err.response?.data || err.message);
      failed++;
    }

    // Test 10: Clear Entire Cart
    try {
      const res = await axios.delete(`${BASE_URL}/cart/clear`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });

      if (res.status === 200 && res.data.success && res.data.data.cart.items.length === 0) {
        console.log('✅ 10. Clear Cart: PASS (All cart items cleared, total items: 0)');
        passed++;
      } else {
        console.error('❌ 10. Clear Cart: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.error('❌ 10. Clear Cart: ERROR', err.response?.data || err.message);
      failed++;
    }
  } finally {
    // Cleanup test data
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
    console.log('🎉 All Cart, Wishlist & Address Tests Passed Successfully!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runCartWishlistTests();
