const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { getRefreshTokenCookieOptions } = require('./generateToken');

const BASE_URL = process.env.LIVE_API_URL || process.env.API_URL || 'http://localhost:5000/api';

async function runDeploymentPreflight() {
  console.log('🧪 Starting Rigamart Step 15 Production Deployment Preflight Test Suite...');
  console.log(`🌐 Target Backend API: ${BASE_URL}`);
  console.log(`🌐 Target Client Origin: ${process.env.LIVE_CLIENT_URL || 'https://rigamart-frontend.vercel.app'}\n`);
  let passed = 0;
  let failed = 0;

  try {
    // -------------------------------------------------------------------------
    // Test 1: Frontend Production Artifacts (Vite build dist)
    // -------------------------------------------------------------------------
    const distPath = path.resolve(__dirname, '../../ecommerce-frontend/dist');
    const indexHtmlPath = path.join(distPath, 'index.html');

    if (fs.existsSync(indexHtmlPath)) {
      const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
      if (htmlContent.includes('id="root"') && htmlContent.includes('<script type="module"')) {
        console.log('✅ 1. Frontend Production Build Artifacts: PASS (dist/index.html exists and contains valid SPA bundle)');
        passed++;
      } else {
        console.error('❌ 1. Frontend Build: FAIL (index.html missing root mount or script tags)');
        failed++;
      }
    } else {
      console.error('❌ 1. Frontend Build: FAIL (dist/index.html not found. Run "npm run build" first)');
      failed++;
    }

    // -------------------------------------------------------------------------
    // Test 2: Vercel SPA Routing Configuration (vercel.json)
    // -------------------------------------------------------------------------
    const vercelJsonPath = path.resolve(__dirname, '../../ecommerce-frontend/vercel.json');
    if (fs.existsSync(vercelJsonPath)) {
      try {
        const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
        const hasRewrite = vercelConfig.rewrites?.some(
          (r) => r.source === '/(.*)' && r.destination === '/index.html'
        );
        if (hasRewrite) {
          console.log('✅ 2. Vercel SPA Routing: PASS (vercel.json correctly rewrites all paths to /index.html)');
          passed++;
        } else {
          console.error('❌ 2. Vercel Routing: FAIL (Missing rewrite rule in vercel.json)');
          failed++;
        }
      } catch (err) {
        console.error('❌ 2. Vercel Routing: FAIL (Invalid JSON syntax in vercel.json)', err.message);
        failed++;
      }
    } else {
      console.error('❌ 2. Vercel Routing: FAIL (vercel.json does not exist)');
      failed++;
    }

    // -------------------------------------------------------------------------
    // Test 3: Render Blueprint Configuration (render.yaml)
    // -------------------------------------------------------------------------
    const renderYamlPath = path.resolve(__dirname, '../render.yaml');
    if (fs.existsSync(renderYamlPath)) {
      const renderContent = fs.readFileSync(renderYamlPath, 'utf8');
      const hasWebService = renderContent.includes('type: web');
      const hasNpmInstall = renderContent.includes('buildCommand: npm install');
      const hasNpmStart = renderContent.includes('startCommand: npm start');
      const hasHealthCheck = renderContent.includes('healthCheckPath: /api/health');

      if (hasWebService && hasNpmInstall && hasNpmStart && hasHealthCheck) {
        console.log('✅ 3. Render Infrastructure as Code: PASS (render.yaml blueprint specifies build, start & health check)');
        passed++;
      } else {
        console.error('❌ 3. Render Blueprint: FAIL (Missing required blueprint fields)');
        failed++;
      }
    } else {
      console.error('❌ 3. Render Blueprint: FAIL (render.yaml does not exist)');
      failed++;
    }

    // -------------------------------------------------------------------------
    // Test 4: Live Health Check & MongoDB Readiness (/api/health)
    // -------------------------------------------------------------------------
    const healthRes = await axios.get(`${BASE_URL}/health`);
    if (
      healthRes.status === 200 &&
      healthRes.data.success === true &&
      healthRes.data.data?.status === 'healthy' &&
      healthRes.data.data?.database === 'connected'
    ) {
      console.log('✅ 4. Backend Health & Database Readiness: PASS (status: healthy, database: connected)');
      passed++;
    } else {
      console.error('❌ 4. Backend Health Check: FAIL', healthRes.data);
      failed++;
    }

    // -------------------------------------------------------------------------
    // Test 5: Vercel Domain Cross-Origin (CORS) Simulation (*.vercel.app)
    // -------------------------------------------------------------------------
    const vercelOrigin = process.env.LIVE_CLIENT_URL || 'https://rigamart-frontend.vercel.app';
    const corsRes = await axios.get(`${BASE_URL}/health`, {
      headers: {
        Origin: vercelOrigin
      }
    });

    const returnedCorsOrigin = corsRes.headers['access-control-allow-origin'];
    const allowsCredentials = corsRes.headers['access-control-allow-credentials'];

    if (returnedCorsOrigin === vercelOrigin && allowsCredentials === 'true') {
      console.log(`✅ 5. Vercel Production CORS: PASS (Origin "${vercelOrigin}" permitted with credentials)`);
      passed++;
    } else {
      console.error('❌ 5. Vercel CORS: FAIL', {
        returnedCorsOrigin,
        allowsCredentials
      });
      failed++;
    }

    // -------------------------------------------------------------------------
    // Test 6: Untrusted Origin CORS Guard (Negative test)
    // -------------------------------------------------------------------------
    let untrustedBlocked = false;
    try {
      await axios.get(`${BASE_URL}/health`, {
        headers: {
          Origin: 'https://malicious-phishing-domain.com'
        }
      });
    } catch (err) {
      if (err.response?.status === 500 || err.response?.data?.message?.includes('CORS')) {
        untrustedBlocked = true;
      }
    }

    if (untrustedBlocked) {
      console.log('✅ 6. Untrusted Origin Guard: PASS (Blocked unauthorized cross-origin requests)');
      passed++;
    } else {
      console.error('❌ 6. Untrusted Origin Guard: FAIL (Unauthorized origin was permitted)');
      failed++;
    }

    // -------------------------------------------------------------------------
    // Test 7: Production Cross-Domain Cookie Security Contract
    // -------------------------------------------------------------------------
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const prodCookieOptions = getRefreshTokenCookieOptions();
    process.env.NODE_ENV = originalNodeEnv;

    if (
      prodCookieOptions.httpOnly === true &&
      prodCookieOptions.secure === true &&
      prodCookieOptions.sameSite === 'none' &&
      prodCookieOptions.maxAge === 7 * 24 * 60 * 60 * 1000
    ) {
      console.log('✅ 7. Production Cookie Security: PASS (httpOnly: true, secure: true, sameSite: "none", 7-day TTL)');
      passed++;
    } else {
      console.error('❌ 7. Production Cookie Security: FAIL', prodCookieOptions);
      failed++;
    }

    // -------------------------------------------------------------------------
    // Test 8: Self-Ping Keep-Alive Heartbeat Module
    // -------------------------------------------------------------------------
    const keepAliveModulePath = path.resolve(__dirname, 'keepAlive.js');
    if (fs.existsSync(keepAliveModulePath)) {
      const { initKeepAlive } = require('./keepAlive');
      if (typeof initKeepAlive === 'function') {
        console.log('✅ 8. Keep-Alive Heartbeat Engine: PASS (initKeepAlive export verified for Render free tier)');
        passed++;
      } else {
        console.error('❌ 8. Keep-Alive Engine: FAIL (initKeepAlive is not a function)');
        failed++;
      }
    } else {
      console.error('❌ 8. Keep-Alive Engine: FAIL (keepAlive.js not found)');
      failed++;
    }

    // -------------------------------------------------------------------------
    // Test 9: Environment Variable Template Parity (.env.example)
    // -------------------------------------------------------------------------
    const backendEnvEx = fs.readFileSync(path.resolve(__dirname, '../.env.example'), 'utf8');
    const frontendEnvEx = fs.readFileSync(path.resolve(__dirname, '../../ecommerce-frontend/.env.example'), 'utf8');

    const requiredBackendKeys = [
      'PORT',
      'MONGO_URI',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
      'GMAIL_USER',
      'GMAIL_PASS',
      'RAZORPAY_KEY_ID',
      'RAZORPAY_KEY_SECRET',
      'CLIENT_URL'
    ];

    const requiredFrontendKeys = [
      'VITE_API_URL',
      'VITE_RAZORPAY_KEY_ID',
      'VITE_CLOUDINARY_CLOUD_NAME'
    ];

    const backendAllKeysPresent = requiredBackendKeys.every((k) => backendEnvEx.includes(k));
    const frontendAllKeysPresent = requiredFrontendKeys.every((k) => frontendEnvEx.includes(k));

    if (backendAllKeysPresent && frontendAllKeysPresent) {
      console.log('✅ 9. Environment Template Parity: PASS (All required production keys documented in .env.example)');
      passed++;
    } else {
      console.error('❌ 9. Environment Template Parity: FAIL', {
        backendAllKeysPresent,
        frontendAllKeysPresent
      });
      failed++;
    }

  } catch (error) {
    console.error('Fatal Deployment Preflight Error:', error.message);
    if (error.response?.data) console.error('Details:', error.response.data);
    failed++;
  }

  console.log(`\n================================`);
  console.log(`Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`================================\n`);

  if (failed === 0) {
    console.log('🎉 All Step 15 Production Deployment Preflight Checks Passed Successfully!');
  } else {
    process.exit(1);
  }
}

runDeploymentPreflight();
