const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const User = require('../models/User');
const { applyCoupon, getActiveCoupons } = require('../controllers/couponController');

async function runCouponTests() {
  console.log('🧪 Starting Rigamart Coupon & Promo Code Engine Test Suite...\n');
  let passed = 0;
  let failed = 0;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.\n');

    const uniqueSuffix = Date.now().toString().slice(-6);

    // 1. Model Unit Tests: Percentage discount and Cap
    console.log('Test 1: Percentage discount calculation with cap');
    const percentCoupon = new Coupon({
      code: `TESTPCT_${uniqueSuffix}`,
      description: '20% off up to 200',
      discountType: 'percentage',
      discountValue: 20,
      maxDiscount: 200,
      minCartValue: 500,
      expiryDate: new Date(Date.now() + 86400000)
    });
    await percentCoupon.save();

    const discount1 = percentCoupon.calculateDiscount(800); // 20% of 800 is 160 (<= 200)
    const discount2 = percentCoupon.calculateDiscount(2000); // 20% of 2000 is 400 (capped at 200)
    const discount3 = percentCoupon.calculateDiscount(400); // Below minCartValue 500 -> 0

    if (discount1 === 160 && discount2 === 200 && discount3 === 0) {
      console.log('  ✅ Percentage discount & cap calculation correct: 160, 200, 0');
      passed++;
    } else {
      console.error(`  ❌ Failed: expected 160, 200, 0, got ${discount1}, ${discount2}, ${discount3}`);
      failed++;
    }

    // 2. Model Unit Tests: Flat discount
    console.log('\nTest 2: Flat discount calculation');
    const flatCoupon = new Coupon({
      code: `TESTFLAT_${uniqueSuffix}`,
      description: 'Flat 75 off',
      discountType: 'flat',
      discountValue: 75,
      minCartValue: 300,
      expiryDate: new Date(Date.now() + 86400000)
    });
    await flatCoupon.save();

    const flatDiscount1 = flatCoupon.calculateDiscount(500); // 75
    const flatDiscount2 = flatCoupon.calculateDiscount(50); // Below minCartValue -> 0
    if (flatDiscount1 === 75 && flatDiscount2 === 0) {
      console.log('  ✅ Flat discount calculation correct: 75, 0');
      passed++;
    } else {
      console.error(`  ❌ Failed: expected 75, 0, got ${flatDiscount1}, ${flatDiscount2}`);
      failed++;
    }

    // 3. Controller Test: getActiveCoupons
    console.log('\nTest 3: getActiveCoupons controller');
    const mockRes1 = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(data) { this.data = data; return this; }
    };
    await getActiveCoupons({}, mockRes1);
    if (mockRes1.statusCode === 200 && Array.isArray(mockRes1.data.data.coupons) && mockRes1.data.data.coupons.length > 0) {
      console.log(`  ✅ Successfully returned ${mockRes1.data.data.coupons.length} active coupons`);
      passed++;
    } else {
      console.error('  ❌ Failed to fetch active coupons');
      failed++;
    }

    // 4. Controller Test: applyCoupon - invalid code
    console.log('\nTest 4: applyCoupon with non-existent code');
    const mockRes2 = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(data) { this.data = data; return this; }
    };
    await applyCoupon({ body: { code: 'NONEXISTENT_CODE_XYZ', itemsPrice: 1000 } }, mockRes2);
    if (mockRes2.statusCode === 404) {
      console.log('  ✅ Correctly rejected invalid code with 404');
      passed++;
    } else {
      console.error(`  ❌ Failed: expected 404, got ${mockRes2.statusCode}`);
      failed++;
    }

    // 5. Controller Test: applyCoupon - below minCartValue
    console.log('\nTest 5: applyCoupon below minimum cart value');
    const mockRes3 = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(data) { this.data = data; return this; }
    };
    await applyCoupon({ body: { code: percentCoupon.code, itemsPrice: 300 } }, mockRes3);
    if (mockRes3.statusCode === 400 && mockRes3.data.data.requiredMore > 0) {
      console.log(`  ✅ Correctly returned 400 with required ₹${mockRes3.data.data.requiredMore} more`);
      passed++;
    } else {
      console.error(`  ❌ Failed: expected 400, got ${mockRes3.statusCode}`);
      failed++;
    }

    // 6. Controller Test: applyCoupon - successful apply
    console.log('\nTest 6: applyCoupon with valid cart amount');
    const mockRes4 = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(data) { this.data = data; return this; }
    };
    await applyCoupon({ body: { code: percentCoupon.code, itemsPrice: 1000 } }, mockRes4);
    if (mockRes4.statusCode === 200 && mockRes4.data.data.discountAmount === 200 && mockRes4.data.data.finalPrice === 800) {
      console.log('  ✅ Correctly calculated discount: ₹200 off, final items price: ₹800');
      passed++;
    } else {
      console.error(`  ❌ Failed: expected 200 discount & 800 final, got ${JSON.stringify(mockRes4.data)}`);
      failed++;
    }

    // 7. Order Model Schema Verification: discountPrice and coupon fields
    console.log('\nTest 7: Order model persistence with discountPrice & coupon');
    const testUser = await User.create({
      name: `Coupon Test User ${uniqueSuffix}`,
      email: `coupon_test_${uniqueSuffix}@rigamart.com`,
      password: 'Password123!',
      role: 'customer'
    });

    const testOrder = await Order.create({
      orderNumber: `RGM-CPN-${uniqueSuffix}`,
      user: testUser._id,
      items: [
        {
          product: new mongoose.Types.ObjectId(),
          name: 'Test Item',
          image: 'https://example.com/test.jpg',
          variantId: new mongoose.Types.ObjectId(),
          sku: `SKU-${uniqueSuffix}`,
          size: 'M',
          color: 'Blue',
          price: 1000,
          quantity: 1,
          seller: testUser._id
        }
      ],
      shippingAddress: {
        name: 'Tester',
        mobile: '9876543210',
        street: '123 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      },
      paymentInfo: {
        method: 'COD',
        status: 'Pending'
      },
      itemsPrice: 1000,
      shippingPrice: 0,
      taxPrice: 0,
      discountPrice: 200,
      coupon: {
        code: percentCoupon.code,
        discount: 200
      },
      totalAmount: 800
    });

    if (testOrder.discountPrice === 200 && testOrder.coupon.code === percentCoupon.code && testOrder.totalAmount === 800) {
      console.log('  ✅ Order successfully saved with discountPrice: 200, coupon code, and totalAmount: 800');
      passed++;
    } else {
      console.error('  ❌ Order model failed to save coupon fields properly');
      failed++;
    }

    // Clean up test documents
    await Coupon.deleteMany({ code: { $in: [percentCoupon.code, flatCoupon.code] } });
    await Order.deleteOne({ _id: testOrder._id });
    await User.deleteOne({ _id: testUser._id });
    console.log('\n🧹 Test artifacts cleaned up successfully.');

    console.log(`\n========================================`);
    console.log(`Test Results: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Test execution error:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

runCouponTests();
