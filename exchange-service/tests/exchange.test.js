const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'super_secret_jwt_key_for_resource_service_college_2025';
process.env.RESOURCE_SERVICE_URL = 'http://localhost:5099';
process.env.SERVICE_API_KEY = 'internal_shared_microservice_secret_token_college_2025';

const { connectDB, disconnectDB } = require('../src/config/db');
const app = require('../server');
const Exchange = require('../src/models/Exchange');

describe('Exchange Service & Inter-Service REST API Tests', () => {
  let mockResourceServer;
  let mockResource = {
    _id: '67aef0011122334455667788',
    title: 'Digital Signal Processing Reference Book',
    category: 'Textbooks',
    listingType: 'Lend',
    condition: 'Good',
    imageUrl: 'https://example.com/dsp.jpg',
    lendingDuration: '14 days',
    availabilityStatus: 'available',
    owner: {
      id: 'student_rahul_123',
      name: 'Rahul Verma',
      email: 'rahul.verma@apex.edu'
    }
  };

  let priyaToken;
  let rahulToken;
  let createdExchangeId;

  before(async () => {
    // Generate JWT tokens for test students
    priyaToken = jwt.sign(
      {
        id: 'student_priya_456',
        name: 'Priya Sharma',
        email: 'priya.sharma@apex.edu',
        collegeName: 'Apex Engineering Institute',
        department: 'CSE'
      },
      process.env.JWT_SECRET
    );

    rahulToken = jwt.sign(
      {
        id: 'student_rahul_123',
        name: 'Rahul Verma',
        email: 'rahul.verma@apex.edu',
        collegeName: 'Apex Engineering Institute',
        department: 'ECE'
      },
      process.env.JWT_SECRET
    );

    // Spin up Mock Resource Service on port 5099 to test genuine HTTP REST communication
    mockResourceServer = http.createServer((req, res) => {
      // Endpoint: GET /api/resources/:id
      if (req.method === 'GET' && req.url.startsWith('/api/resources/')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, data: mockResource }));
      }

      // Endpoint: PATCH /api/resources/:id/availability
      if (req.method === 'PATCH' && req.url.includes('/availability')) {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          const parsed = JSON.parse(body || '{}');
          mockResource.availabilityStatus = parsed.availabilityStatus;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, data: mockResource }));
        });
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Mock endpoint not found' }));
    });

    await new Promise(resolve => mockResourceServer.listen(5099, resolve));

    // Connect to isolated Exchange DB
    await connectDB();
    await Exchange.deleteMany({});
  });

  after(async () => {
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
    assert.equal(res.body.status, 'OK');
  });

  test('POST /api/exchanges rejects student requesting own resource', async () => {
    // Rahul owns the mock resource, so requesting as Rahul must fail with 400
    const res = await request(app)
      .post('/api/exchanges')
      .set('Authorization', `Bearer ${rahulToken}`)
      .send({
        resourceId: mockResource._id,
        requestMessage: 'I want my own book'
      });

    assert.equal(res.status, 400);
    assert.match(res.body.message, /cannot create an exchange request for your own/i);
  });

  test('POST /api/exchanges successfully queries Resource Service over REST and creates request', async () => {
    const res = await request(app)
      .post('/api/exchanges')
      .set('Authorization', `Bearer ${priyaToken}`)
      .send({
        resourceId: mockResource._id,
        requestMessage: 'Hi Rahul, I need this DSP textbook for our mid-semester examination.',
        durationRequested: '10 days'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.resourceTitle, 'Digital Signal Processing Reference Book');
    assert.equal(res.body.data.status, 'Pending');
    assert.equal(res.body.data.ownerId, 'student_rahul_123');
    assert.equal(res.body.data.requesterId, 'student_priya_456');
    createdExchangeId = res.body.data._id;
  });

  test('POST /api/exchanges prevents duplicate pending requests from same student', async () => {
    const res = await request(app)
      .post('/api/exchanges')
      .set('Authorization', `Bearer ${priyaToken}`)
      .send({
        resourceId: mockResource._id,
        requestMessage: 'Duplicate request attempt'
      });

    assert.equal(res.status, 400);
    assert.match(res.body.message, /already have an active pending request/i);
  });

  test('GET /api/exchanges/sent retrieves requests sent by student', async () => {
    const res = await request(app)
      .get('/api/exchanges/sent')
      .set('Authorization', `Bearer ${priyaToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 1);
    assert.equal(res.body.data[0]._id, createdExchangeId);
  });

  test('GET /api/exchanges/received retrieves requests received by owner', async () => {
    const res = await request(app)
      .get('/api/exchanges/received')
      .set('Authorization', `Bearer ${rahulToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 1);
    assert.equal(res.body.data[0]._id, createdExchangeId);
  });

  test('PATCH /api/exchanges/:id/status rejects unauthorized status update by requester', async () => {
    const res = await request(app)
      .patch(`/api/exchanges/${createdExchangeId}/status`)
      .set('Authorization', `Bearer ${priyaToken}`)
      .send({ status: 'Approved' });

    assert.equal(res.status, 403);
  });

  test('PATCH /api/exchanges/:id/status allows owner to Approve and triggers Resource Service availability update', async () => {
    const res = await request(app)
      .patch(`/api/exchanges/${createdExchangeId}/status`)
      .set('Authorization', `Bearer ${rahulToken}`)
      .send({ status: 'Approved', note: 'Approved! You can collect it at ECE lab.' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'Approved');

    // Confirm that Resource Service mock received the PATCH availability call and updated status to reserved
    assert.equal(mockResource.availabilityStatus, 'reserved');
  });

  test('PATCH /api/exchanges/:id/cancel restores availability when approved request is cancelled', async () => {
    const res = await request(app)
      .patch(`/api/exchanges/${createdExchangeId}/cancel`)
      .set('Authorization', `Bearer ${priyaToken}`)
      .send({ reason: 'I found another copy, cancelling request.' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'Cancelled');

    // Confirm availability was restored on Resource Service
    assert.equal(mockResource.availabilityStatus, 'available');
  });
});
