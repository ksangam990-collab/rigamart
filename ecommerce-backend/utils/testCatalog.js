const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';

async function runCatalogTests() {
  console.log('🧪 Starting Rigamart Category & Product Catalog Test Suite...\n');
  let passed = 0;
  let failed = 0;

  // Connect to DB directly to create admin and seller accounts for testing
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('../models/User');
  const Category = require('../models/Category');
  const Product = require('../models/Product');
  const { generateAccessToken } = require('./generateToken');

  const uniqueSuffix = Date.now().toString().slice(-6);

  // 1. Setup Test Users
  const adminUser = await User.create({
    name: 'Admin Test',
    email: `admin_${uniqueSuffix}@rigamart.com`,
    password: 'Password123!',
    role: 'admin'
  });
  const adminToken = generateAccessToken(adminUser._id, 'admin');

  const seller1User = await User.create({
    name: 'Seller One',
    email: `seller1_${uniqueSuffix}@rigamart.com`,
    password: 'Password123!',
    role: 'seller'
  });
  const seller1Token = generateAccessToken(seller1User._id, 'seller');

  const seller2User = await User.create({
    name: 'Seller Two',
    email: `seller2_${uniqueSuffix}@rigamart.com`,
    password: 'Password123!',
    role: 'seller'
  });
  const seller2Token = generateAccessToken(seller2User._id, 'seller');

  const customerUser = await User.create({
    name: 'Customer Test',
    email: `customer_${uniqueSuffix}@rigamart.com`,
    password: 'Password123!',
    role: 'customer'
  });
  const customerToken = generateAccessToken(customerUser._id, 'customer');

  let parentCatId = null;
  let childCatId = null;
  let testProductId = null;

  try {
    // Test 1: Customer blocked from creating category (403)
    try {
      await axios.post(
        `${BASE_URL}/categories`,
        { name: `Hacked Category ${uniqueSuffix}` },
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );
      console.error('❌ 1. Role Authorization (Category Create): FAIL (Customer should be 403)');
      failed++;
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('✅ 1. Role Authorization: PASS (Customer rejected with 403 Forbidden)');
        passed++;
      } else {
        console.error('❌ 1. Role Authorization: FAIL', err.response?.data || err.message);
        failed++;
      }
    }

    // Test 2: Admin creates parent category ("Electronics")
    try {
      const res = await axios.post(
        `${BASE_URL}/categories`,
        { name: `Electronics ${uniqueSuffix}` },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      if (res.status === 201 && res.data.success) {
        parentCatId = res.data.data.category._id;
        console.log('✅ 2. Create Parent Category: PASS (Created by Admin)');
        passed++;
      } else {
        console.error('❌ 2. Create Parent Category: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.error('❌ 2. Create Parent Category: ERROR', err.response?.data || err.message);
      failed++;
    }

    // Test 3: Admin creates child subcategory ("Smartphones") linked to parent
    try {
      const res = await axios.post(
        `${BASE_URL}/categories`,
        {
          name: `Smartphones ${uniqueSuffix}`,
          parent: parentCatId
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      if (res.status === 201 && res.data.success && res.data.data.category.parent === parentCatId) {
        childCatId = res.data.data.category._id;
        console.log('✅ 3. Create Child Subcategory: PASS (Hierarchical link established)');
        passed++;
      } else {
        console.error('❌ 3. Create Child Subcategory: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.error('❌ 3. Create Child Subcategory: ERROR', err.response?.data || err.message);
      failed++;
    }

    // Test 4: Retrieve Category Tree (?tree=true)
    try {
      const res = await axios.get(`${BASE_URL}/categories?tree=true`);
      if (res.status === 200 && res.data.success) {
        const parentInTree = res.data.data.categories.find((c) => c._id.toString() === parentCatId.toString());
        if (parentInTree && parentInTree.children.some((c) => c._id.toString() === childCatId.toString())) {
          console.log('✅ 4. Nested Category Tree: PASS (Parent-child hierarchy structured)');
          passed++;
        } else {
          console.error('❌ 4. Nested Category Tree: FAIL (Child missing in tree structure)');
          failed++;
        }
      } else {
        console.error('❌ 4. Nested Category Tree: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.error('❌ 4. Nested Category Tree: ERROR', err.response?.data || err.message);
      failed++;
    }

    // Test 5: Customer blocked from creating product (403)
    try {
      await axios.post(
        `${BASE_URL}/products`,
        { name: 'Unauthorized Product' },
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );
      console.error('❌ 5. Seller Role Check on Product Create: FAIL (Customer should be 403)');
      failed++;
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('✅ 5. Seller Role Check: PASS (Customer rejected from creating products)');
        passed++;
      } else {
        console.error('❌ 5. Seller Role Check: FAIL', err.response?.data || err.message);
        failed++;
      }
    }

    // Test 6: Seller 1 creates product with variants
    try {
      const res = await axios.post(
        `${BASE_URL}/products`,
        {
          name: `Rigamart Pro Phone ${uniqueSuffix}`,
          description: 'Flagship smartphone featuring AMOLED 120Hz display and 50MP Sony sensor camera.',
          brand: 'Rigamart Select',
          category: childCatId,
          images: [
            {
              public_id: 'sample_phone_1',
              url: 'https://res.cloudinary.com/demo/image/upload/sample_phone.jpg',
              isPrimary: true
            }
          ],
          variants: [
            {
              sku: `PHONE-128-${uniqueSuffix}`,
              size: '128GB',
              color: 'Midnight Black',
              price: 19999,
              mrp: 24999,
              stock: 50
            },
            {
              sku: `PHONE-256-${uniqueSuffix}`,
              size: '256GB',
              color: 'Midnight Black',
              price: 22999,
              mrp: 27999,
              stock: 20
            }
          ],
          tags: ['smartphone', 'amoled', 'flagship']
        },
        { headers: { Authorization: `Bearer ${seller1Token}` } }
      );

      if (res.status === 201 && res.data.success && res.data.data.product.basePrice === 19999) {
        testProductId = res.data.data.product._id;
        console.log('✅ 6. Product Creation: PASS (Seller created product, basePrice auto-computed to ₹19,999)');
        passed++;
      } else {
        console.error('❌ 6. Product Creation: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.error('❌ 6. Product Creation: ERROR', err.response?.data || err.message);
      failed++;
    }

    // Test 7: Seller 2 cannot update Seller 1's product (403 Ownership check)
    try {
      await axios.put(
        `${BASE_URL}/products/${testProductId}`,
        { name: 'Malicious Title Hijack' },
        { headers: { Authorization: `Bearer ${seller2Token}` } }
      );
      console.error('❌ 7. Cross-Seller Isolation: FAIL (Seller 2 modified Seller 1 product)');
      failed++;
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('✅ 7. Cross-Seller Isolation: PASS (Seller 2 blocked with 403 Forbidden)');
        passed++;
      } else {
        console.error('❌ 7. Cross-Seller Isolation: FAIL', err.response?.data || err.message);
        failed++;
      }
    }

    // Test 8: Filter by Parent Category includes child category product
    try {
      const res = await axios.get(`${BASE_URL}/products?category=${parentCatId}`);
      if (
        res.status === 200 &&
        res.data.success &&
        res.data.data.products.some((p) => p._id.toString() === testProductId.toString())
      ) {
        console.log('✅ 8. Hierarchical Category Filter: PASS (Products in child category resolved by parent ID)');
        passed++;
      } else {
        console.error('❌ 8. Hierarchical Category Filter: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.error('❌ 8. Hierarchical Category Filter: ERROR', err.response?.data || err.message);
      failed++;
    }

    // Test 9: Price Filter and Pagination Meta
    try {
      const res = await axios.get(`${BASE_URL}/products?minPrice=15000&maxPrice=21000&sort=price-asc`);
      if (
        res.status === 200 &&
        res.data.success &&
        res.data.data.pagination.currentPage === 1 &&
        res.data.data.products.some((p) => p._id.toString() === testProductId.toString())
      ) {
        console.log('✅ 9. Price Range & Pagination Meta: PASS (basePrice filter and pagination envelope valid)');
        passed++;
      } else {
        console.error('❌ 9. Price Range & Pagination Meta: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.error('❌ 9. Price Range & Pagination Meta: ERROR', err.response?.data || err.message);
      failed++;
    }

    // Test 10: Product Search (Full-text / Fuzzy Regex)
    try {
      const res = await axios.get(`${BASE_URL}/products/search?q=AMOLED`);
      if (
        res.status === 200 &&
        res.data.success &&
        res.data.data.products.some((p) => p._id.toString() === testProductId.toString())
      ) {
        console.log('✅ 10. Product Search: PASS (Indexed keyword matched product description)');
        passed++;
      } else {
        console.error('❌ 10. Product Search: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.error('❌ 10. Product Search: ERROR', err.response?.data || err.message);
      failed++;
    }
  } finally {
    // Cleanup test documents safely
    if (testProductId) await Product.findByIdAndDelete(testProductId);
    if (childCatId) await Category.findByIdAndDelete(childCatId);
    if (parentCatId) await Category.findByIdAndDelete(parentCatId);
    await User.deleteMany({
      _id: { $in: [adminUser._id, seller1User._id, seller2User._id, customerUser._id] }
    });
    await mongoose.disconnect();
  }

  console.log('\n--------------------------------------');
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log('--------------------------------------');

  if (failed === 0) {
    console.log('🎉 All Category & Product Catalog Tests Passed Successfully!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runCatalogTests();
