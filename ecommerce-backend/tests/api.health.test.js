const request = require('supertest');
const app = require('../server');

describe('Rigamart Backend API Health & Security Suite', () => {
  it('GET / - should return HTTP 200 with online welcome message and docs pointer', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Welcome to Rigamart');
    expect(res.body.data.documentation).toBe('/api/health');
  });

  it('GET /api/health - should return HTTP 200 with health metadata', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
    expect(res.body.data.timestamp).toBeDefined();
    expect(res.body.data.environment).toBeDefined();
  });

  it('GET /api/unknown-endpoint-xyz - should return HTTP 404 for unmapped endpoints', async () => {
    const res = await request(app).get('/api/unknown-endpoint-xyz');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('Security Headers - should include Helmet security headers', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-dns-prefetch-control']).toBeDefined();
    expect(res.headers['x-frame-options']).toBeDefined();
  });
});
