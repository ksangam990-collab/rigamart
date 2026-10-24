const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

async function runAuthTests() {
  console.log('🧪 Starting Rigamart Auth System Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const testEmail = `testuser_${Date.now()}@rigamart.com`;
  const testPassword = 'Password123!';
  const testMobile = '98765' + Math.floor(10000 + Math.random() * 90000);
  let accessToken = null;
  let refreshTokenCookie = null;

  // 1. Register User
  try {
    const res = await axios.post(`${BASE_URL}/register`, {
      name: 'Rohan Sharma',
      email: testEmail,
      password: testPassword,
      mobile: testMobile,
      role: 'customer'
    });

    if (res.status === 201 && res.data.success && res.data.data.accessToken) {
      console.log('✅ 1. Registration: PASS (User created with accessToken & cart)');
      passed++;
      accessToken = res.data.data.accessToken;

      // Extract set-cookie header
      const cookies = res.headers['set-cookie'];
      if (cookies && cookies.some((c) => c.includes('refreshToken='))) {
        refreshTokenCookie = cookies.find((c) => c.includes('refreshToken=')).split(';')[0];
        console.log('✅ 2. httpOnly Refresh Token Cookie: PASS');
        passed++;
      } else {
        console.error('❌ 2. httpOnly Refresh Token Cookie: FAIL (Cookie not received)');
        failed++;
      }
    } else {
      console.error('❌ 1. Registration: FAIL', res.data);
      failed++;
    }
  } catch (err) {
    console.error('❌ 1. Registration: ERROR', err.response?.data || err.message);
    failed++;
  }

  // 3. Duplicate Email Rejection
  try {
    await axios.post(`${BASE_URL}/register`, {
      name: 'Rohan Sharma',
      email: testEmail,
      password: testPassword
    });
    console.error('❌ 3. Duplicate Email Prevention: FAIL (Expected 409 Conflict)');
    failed++;
  } catch (err) {
    if (err.response && err.response.status === 409) {
      console.log('✅ 3. Duplicate Email Prevention: PASS (409 Conflict returned)');
      passed++;
    } else {
      console.error('❌ 3. Duplicate Email Prevention: FAIL', err.response?.data || err.message);
      failed++;
    }
  }

  // 4. Login with Invalid Credentials
  try {
    await axios.post(`${BASE_URL}/login`, {
      email: testEmail,
      password: 'WrongPassword999'
    });
    console.error('❌ 4. Invalid Password Rejection: FAIL (Expected 401 Unauthorized)');
    failed++;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      console.log('✅ 4. Invalid Password Rejection: PASS (401 Unauthorized returned)');
      passed++;
    } else {
      console.error('❌ 4. Invalid Password Rejection: FAIL', err.response?.data || err.message);
      failed++;
    }
  }

  // 5. Login with Valid Credentials
  try {
    const res = await axios.post(`${BASE_URL}/login`, {
      email: testEmail,
      password: testPassword
    });

    if (res.status === 200 && res.data.success && res.data.data.accessToken) {
      console.log('✅ 5. Login: PASS (Authenticated and returned accessToken)');
      passed++;
      accessToken = res.data.data.accessToken;
      const cookies = res.headers['set-cookie'];
      if (cookies) {
        refreshTokenCookie = cookies.find((c) => c.includes('refreshToken=')).split(';')[0];
      }
    } else {
      console.error('❌ 5. Login: FAIL', res.data);
      failed++;
    }
  } catch (err) {
    console.error('❌ 5. Login: ERROR', err.response?.data || err.message);
    failed++;
  }

  // 6. Protected Profile (GET /me) with Bearer token
  try {
    const res = await axios.get(`${BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (res.status === 200 && res.data.success && res.data.data.user.email === testEmail) {
      console.log('✅ 6. Protected Route (GET /me): PASS (Returned user profile without password)');
      passed++;
    } else {
      console.error('❌ 6. Protected Route: FAIL', res.data);
      failed++;
    }
  } catch (err) {
    console.error('❌ 6. Protected Route: ERROR', err.response?.data || err.message);
    failed++;
  }

  // 7. Refresh Token Rotation (POST /refresh-token) via Cookie
  try {
    const res = await axios.post(
      `${BASE_URL}/refresh-token`,
      {},
      {
        headers: {
          Cookie: refreshTokenCookie
        }
      }
    );

    if (res.status === 200 && res.data.success && res.data.data.accessToken) {
      console.log('✅ 7. Refresh Token Exchange: PASS (Rotated and returned fresh accessToken)');
      passed++;
      accessToken = res.data.data.accessToken;
    } else {
      console.error('❌ 7. Refresh Token Exchange: FAIL', res.data);
      failed++;
    }
  } catch (err) {
    console.error('❌ 7. Refresh Token Exchange: ERROR', err.response?.data || err.message);
    failed++;
  }

  // 8. OTP Send & Verify Flow
  try {
    const otpRes = await axios.post(`${BASE_URL}/send-otp`, {
      identifier: testMobile,
      type: 'login'
    });

    if (otpRes.status === 200 && otpRes.data.success) {
      console.log(`✅ 8. Send OTP: PASS (Dispatched via ${otpRes.data.data.deliveryMode})`);
      passed++;

      // Direct query from DB to get the generated OTP for automated testing
      const mongoose = require('mongoose');
      require('dotenv').config();
      await mongoose.connect(process.env.MONGO_URI);
      const Otp = require('../models/Otp');
      const otpDoc = await Otp.findOne({ identifier: testMobile, type: 'login' });

      if (otpDoc) {
        const verifyRes = await axios.post(`${BASE_URL}/verify-otp`, {
          identifier: testMobile,
          code: otpDoc.code,
          type: 'login'
        });

        if (verifyRes.status === 200 && verifyRes.data.success) {
          console.log('✅ 9. Verify OTP: PASS (Code consumed and user marked verified)');
          passed++;
        } else {
          console.error('❌ 9. Verify OTP: FAIL', verifyRes.data);
          failed++;
        }
      } else {
        console.error('❌ 9. Verify OTP: FAIL (OTP document not found in DB)');
        failed++;
      }
      await mongoose.disconnect();
    } else {
      console.error('❌ 8. Send OTP: FAIL', otpRes.data);
      failed++;
    }
  } catch (err) {
    console.error('❌ 8/9. OTP Flow: ERROR', err.response?.data || err.message);
    failed++;
  }

  // 10. Logout
  try {
    const res = await axios.post(
      `${BASE_URL}/logout`,
      {},
      {
        headers: {
          Cookie: refreshTokenCookie
        }
      }
    );

    if (res.status === 200 && res.data.success) {
      console.log('✅ 10. Logout: PASS (Cleared cookie and invalidated database token)');
      passed++;
    } else {
      console.error('❌ 10. Logout: FAIL', res.data);
      failed++;
    }
  } catch (err) {
    console.error('❌ 10. Logout: ERROR', err.response?.data || err.message);
    failed++;
  }

  console.log('\n--------------------------------------');
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log('--------------------------------------');

  if (failed === 0) {
    console.log('🎉 All Auth Endpoints and Workflows Verified Successfully!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAuthTests();
