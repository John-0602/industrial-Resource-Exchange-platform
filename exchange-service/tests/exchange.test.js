process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'super_secret_jwt_key_for_irep_platform_2025';
process.env.RESOURCE_SERVICE_URL = 'http://localhost:5098';
process.env.SERVICE_API_KEY = 'internal_shared_microservice_secret_token_college_2025';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const { connectDB, disconnectDB } = require('../src/config/db');
const app = require('../server');
const Requirement = require('../src/models/Requirement');
const Exchange = require('../src/models/Exchange');

describe('Industrial Exchange & Matching Service Tests', () => {
  let mockResourceServer;
  let mockResource = {
    _id: '67bbf0011122334455667788',
    title: 'Clean Cotton Comber Noil Bales',
    materialCategory: 'Textile and fabric waste',
    condition: 'Grade A - Clean, Baled, Dry',
    totalQuantity: 6000,
    availableQuantity: 6000,
    reservedQuantity: 0,
    unit: 'kg',
    indicativePrice: 65,
    currency: 'INR',
    pickupLocation: { city: 'Coimbatore', state: 'Tamil Nadu' },
    supplier: {
      id: 'company_apex_11',
      name: 'Apex Textiles Ltd.',
      email: 'karthik@apextextiles.com'
    }
  };

  let receiverToken;
  let supplierToken;
  let requirementId;
  let createdExchangeId;

  before(async () => {
    receiverToken = jwt.sign(
      {
        id: 'company_sahyadri_22',
        name: 'Sahyadri Eco-Board Solutions',
        email: 'mahesh@sahyadriboards.com',
        role: 'company'
      },
      process.env.JWT_SECRET
    );

    supplierToken = jwt.sign(
      {
        id: 'company_apex_11',
        name: 'Apex Textiles Ltd.',
        email: 'karthik@apextextiles.com',
        role: 'company'
      },
      process.env.JWT_SECRET
    );

    // Mock Resource Service on port 5098
    mockResourceServer = http.createServer((req, res) => {
      if (req.method === 'GET' && req.url.startsWith('/api/resources/matches')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, data: [mockResource] }));
      }

      if (req.method === 'GET' && req.url.startsWith('/api/resources/')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, data: mockResource }));
      }

      if (req.method === 'PATCH' && req.url.includes('/reserve')) {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          const parsed = JSON.parse(body || '{}');
          if (parsed.action === 'reserve') {
            mockResource.availableQuantity -= parsed.quantity;
            mockResource.reservedQuantity += parsed.quantity;
          } else if (parsed.action === 'release') {
            mockResource.availableQuantity += parsed.quantity;
            mockResource.reservedQuantity -= parsed.quantity;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, data: mockResource }));
        });
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Not found' }));
    });

    await new Promise(resolve => mockResourceServer.listen(5098, resolve));
    await connectDB();
    await Requirement.deleteMany({});
    await Exchange.deleteMany({});
  });

  after(async () => {
    await Requirement.deleteMany({});
    await Exchange.deleteMany({});
    await disconnectDB();
    if (mockResourceServer) {
      await new Promise(resolve => mockResourceServer.close(resolve));
    }
  });

  test('GET /health returns 200 and OK status', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.service, 'exchange-service');
  });

  test('POST /api/requirements creates material procurement requirement', async () => {
    const res = await request(app)
      .post('/api/requirements')
      .set('Authorization', `Bearer ${receiverToken}`)
      .send({
        title: 'Need 2000 kg cotton cutting waste',
        materialCategory: 'Textile and fabric waste',
        specifications: 'Clean white cotton trimmings for acoustic board manufacturing',
        requiredQuantity: 2000,
        unit: 'kg',
        acceptableCondition: 'Clean, Baled',
        deliveryLocation: { city: 'Coimbatore', state: 'Tamil Nadu' },
        maxBudget: 70
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.requiredQuantity, 2000);
    requirementId = res.body.data._id;
  });

  test('GET /api/matches/:requirementId computes circular compatibility scores over REST', async () => {
    const res = await request(app)
      .get(`/api/matches/${requirementId}`)
      .set('Authorization', `Bearer ${receiverToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.length >= 1);
    assert.ok(res.body.data[0].compatibilityScore >= 70);
    assert.equal(res.body.data[0].compatibilityTier, 'Excellent Match');
    assert.ok(res.body.data[0].explanations.length > 0);
  });

  test('POST /api/exchanges validates quantity & creates proposal', async () => {
    const res = await request(app)
      .post('/api/exchanges')
      .set('Authorization', `Bearer ${receiverToken}`)
      .send({
        resourceId: mockResource._id,
        requestedQuantity: 2000,
        proposedPricePerUnit: 64,
        proposalMessage: 'Procurement proposal for 2000 kg cotton noil'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.requestedQuantity, 2000);
    assert.equal(res.body.data.status, 'Pending');
    createdExchangeId = res.body.data._id;
  });

  test('POST /api/exchanges rejects requesting own material', async () => {
    const res = await request(app)
      .post('/api/exchanges')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({
        resourceId: mockResource._id,
        requestedQuantity: 500,
        proposalMessage: 'Self request attempt'
      });

    assert.equal(res.status, 400);
  });

  test('PATCH /api/exchanges/:id/status (Accepted) triggers REST quantity reservation', async () => {
    const res = await request(app)
      .patch(`/api/exchanges/${createdExchangeId}/status`)
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({
        status: 'Accepted',
        note: 'Proposal accepted. Ready for pickup.'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'Accepted');

    // Confirm mock resource available quantity decreased by 2000
    assert.equal(mockResource.availableQuantity, 4000);
    assert.equal(mockResource.reservedQuantity, 2000);
  });
});
