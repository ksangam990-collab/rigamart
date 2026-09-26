const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';

async function runUploadTests() {
  console.log('🧪 Starting Rigamart Cloudinary Image Upload Test Suite...\n');
  let passed = 0;
  let failed = 0;

  await mongoose.connect(process.env.MONGO_URI);
  const User = require('../models/User');
  const { generateAccessToken } = require('./generateToken');

  const uniqueSuffix = Date.now().toString().slice(-6);

  // Setup test users
  const sellerUser = await User.create({
    name: 'Seller Upload Tester',
    email: `seller_upload_${uniqueSuffix}@rigamart.com`,
    password: 'Password123!',
    role: 'seller'
  });
  const sellerToken = generateAccessToken(sellerUser._id, 'seller');

  const customerUser = await User.create({
    name: 'Customer Upload Tester',
    email: `customer_upload_${uniqueSuffix}@rigamart.com`,
    password: 'Password123!',
    role: 'customer'
  });
  const customerToken = generateAccessToken(customerUser._id, 'customer');

  const testPublicIds = [];

  // Valid 1x1 transparent PNG buffer
  const samplePngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  const pngBuffer = Buffer.from(samplePngBase64, 'base64');

  try {
    // Test 1: Customer blocked from uploading images (403)
    try {
      const formData = new FormData();
      const blob = new Blob([pngBuffer], { type: 'image/png' });
      formData.append('image', blob, 'test.png');

      await axios.post(`${BASE_URL}/upload/single`, formData, {
        headers: {
          Authorization: `Bearer ${customerToken}`
        }
      });
      console.error('❌ 1. Role Authorization: FAIL (Customer should be rejected with 403)');
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

    // Test 2: File Filter rejects non-image formats (e.g. text/plain)
    try {
      const formData = new FormData();
      const textBlob = new Blob(['Not an image'], { type: 'text/plain' });
      formData.append('image', textBlob, 'malicious.txt');

      await axios.post(`${BASE_URL}/upload/single`, formData, {
        headers: {
          Authorization: `Bearer ${sellerToken}`
        }
      });
      console.error('❌ 2. Mime Type Validation: FAIL (Text file should be rejected)');
      failed++;
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('✅ 2. Mime Type Validation: PASS (Non-image file rejected with 400 Bad Request)');
        passed++;
      } else {
        console.error('❌ 2. Mime Type Validation: FAIL', err.response?.data || err.message);
        failed++;
      }
    }

    // Test 3: Seller uploads single image to Cloudinary
    try {
      const formData = new FormData();
      const blob = new Blob([pngBuffer], { type: 'image/png' });
      formData.append('image', blob, 'category-banner.png');
      formData.append('folder', 'rigamart/test_uploads');

      const res = await axios.post(`${BASE_URL}/upload/single`, formData, {
        headers: {
          Authorization: `Bearer ${sellerToken}`
        }
      });

      if (
        res.status === 200 &&
        res.data.success &&
        res.data.data.public_id &&
        res.data.data.url.includes('cloudinary.com')
      ) {
        testPublicIds.push(res.data.data.public_id);
        console.log(`✅ 3. Single Image Upload: PASS (Uploaded to Cloudinary: ${res.data.data.public_id})`);
        passed++;
      } else {
        console.error('❌ 3. Single Image Upload: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.error('❌ 3. Single Image Upload: ERROR', err.response?.data || err.message);
      failed++;
    }

    // Test 4: Seller uploads multiple images (gallery)
    try {
      const formData = new FormData();
      const blob1 = new Blob([pngBuffer], { type: 'image/png' });
      const blob2 = new Blob([pngBuffer], { type: 'image/png' });
      formData.append('images', blob1, 'product-front.png');
      formData.append('images', blob2, 'product-back.png');
      formData.append('folder', 'rigamart/test_uploads');

      const res = await axios.post(`${BASE_URL}/upload/multiple`, formData, {
        headers: {
          Authorization: `Bearer ${sellerToken}`
        }
      });

      if (
        res.status === 200 &&
        res.data.success &&
        Array.isArray(res.data.data.images) &&
        res.data.data.images.length === 2
      ) {
        res.data.data.images.forEach((img) => testPublicIds.push(img.public_id));
        console.log(`✅ 4. Multiple Image Upload: PASS (Uploaded 2 images concurrently)`);
        passed++;
      } else {
        console.error('❌ 4. Multiple Image Upload: FAIL', res.data);
        failed++;
      }
    } catch (err) {
      console.error('❌ 4. Multiple Image Upload: ERROR', err.response?.data || err.message);
      failed++;
    }

    // Test 5: Delete uploaded test images from Cloudinary
    try {
      if (testPublicIds.length > 0) {
        const targetId = testPublicIds[0];
        const res = await axios.delete(
          `${BASE_URL}/upload/${encodeURIComponent(targetId)}`,
          {
            headers: {
              Authorization: `Bearer ${sellerToken}`
            }
          }
        );

        if (res.status === 200 && res.data.success) {
          console.log(`✅ 5. Cloudinary Asset Deletion: PASS (Destroyed ${targetId})`);
          passed++;
        } else {
          console.error('❌ 5. Cloudinary Asset Deletion: FAIL', res.data);
          failed++;
        }
      }
    } catch (err) {
      console.error('❌ 5. Cloudinary Asset Deletion: ERROR', err.response?.data || err.message);
      failed++;
    }
  } finally {
    // Delete any remaining uploaded test images
    const { deleteFromCloudinary } = require('../config/cloudinary');
    for (const pid of testPublicIds) {
      try {
        await deleteFromCloudinary(pid);
      } catch (e) {
        // ignore
      }
    }

    // Cleanup test users
    await User.deleteMany({
      _id: { $in: [sellerUser._id, customerUser._id] }
    });
    await mongoose.disconnect();
  }

  console.log('\n--------------------------------------');
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log('--------------------------------------');

  if (failed === 0) {
    console.log('🎉 Cloudinary Image Upload System Verified Successfully!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runUploadTests();
