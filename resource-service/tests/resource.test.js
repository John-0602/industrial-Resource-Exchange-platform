process.env.NODE_ENV = 'test';
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { connectDB, disconnectDB } = require('../src/config/db');
const app = require('../server');
const User = require('../src/models/User');
const Resource = require('../src/models/Resource');

describe('Resource Service API Integration Tests', () => {
  let priyaToken;
  let priyaId;
  let rahulToken;
  let rahulId;
  let createdResourceId;

  before(async () => {
    // Ensure in-memory or configured DB is connected
    await connectDB();
    await User.deleteMany({});
    await Resource.deleteMany({});
  });

  after(async () => {
    await User.deleteMany({});
    await Resource.deleteMany({});
    await disconnectDB();
  });

  test('GET /health returns 200 and healthy status', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.service, 'resource-service');
    assert.equal(res.body.status, 'OK');
  });

  test('POST /api/auth/register registers student and returns JWT', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Priya Sharma',
        email: 'priya.test@apex.edu',
        password: 'Password@123',
        collegeName: 'Apex Engineering Institute',
        department: 'Computer Science and Engineering'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.email, 'priya.test@apex.edu');
    priyaToken = res.body.data.token;
    priyaId = res.body.data.user.id;
  });

  test('POST /api/auth/register rejects duplicate email with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Priya Sharma Duplicate',
        email: 'priya.test@apex.edu',
        password: 'Password@123'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  test('POST /api/auth/login validates credentials correctly', async () => {
    // Register second student
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Rahul Verma',
        email: 'rahul.test@apex.edu',
        password: 'Password@123',
        collegeName: 'Apex Engineering Institute',
        department: 'ECE'
      });
    rahulToken = regRes.body.data.token;
    rahulId = regRes.body.data.user.id;

    // Login with valid password
    const validLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'rahul.test@apex.edu',
        password: 'Password@123'
      });
    assert.equal(validLogin.status, 200);
    assert.ok(validLogin.body.data.token);

    // Login with invalid password
    const invalidLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'rahul.test@apex.edu',
        password: 'WrongPassword'
      });
    assert.equal(invalidLogin.status, 401);
  });

  test('POST /api/resources requires authentication', async () => {
    const res = await request(app)
      .post('/api/resources')
      .send({
        title: 'Unauthorized Book',
        description: 'Should fail without token',
        category: 'Textbooks',
        listingType: 'Lend',
        condition: 'Good',
        location: 'Library'
      });

    assert.equal(res.status, 401);
  });

  test('POST /api/resources creates resource when authenticated', async () => {
    const res = await request(app)
      .post('/api/resources')
      .set('Authorization', `Bearer ${priyaToken}`)
      .send({
        title: 'Introduction to Algorithms CLRS',
        description: 'Standard computer science algorithms textbook in great condition',
        category: 'Textbooks',
        listingType: 'Lend',
        condition: 'Like New',
        lendingDuration: '14 days',
        location: 'Central Library Floor 2'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.title, 'Introduction to Algorithms CLRS');
    assert.equal(res.body.data.availabilityStatus, 'available');
    assert.equal(res.body.data.owner.email, 'priya.test@apex.edu');
    createdResourceId = res.body.data._id;
  });

  test('GET /api/resources lists resources with pagination', async () => {
    const res = await request(app).get('/api/resources?page=1&limit=10');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.length >= 1);
  });

  test('GET /api/resources/search finds resources by keyword', async () => {
    const res = await request(app).get('/api/resources/search?q=Algorithms');
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length >= 1);
    assert.equal(res.body.data[0].title, 'Introduction to Algorithms CLRS');
  });

  test('GET /api/resources/:id returns full resource details', async () => {
    const res = await request(app).get(`/api/resources/${createdResourceId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.data._id, createdResourceId);
  });

  test('PUT /api/resources/:id rejects non-owner edit with 403', async () => {
    const res = await request(app)
      .put(`/api/resources/${createdResourceId}`)
      .set('Authorization', `Bearer ${rahulToken}`)
      .send({
        title: 'Hacked Title Attempt'
      });

    assert.equal(res.status, 403);
  });

  test('PUT /api/resources/:id allows owner to edit listing', async () => {
    const res = await request(app)
      .put(`/api/resources/${createdResourceId}`)
      .set('Authorization', `Bearer ${priyaToken}`)
      .send({
        title: 'Introduction to Algorithms CLRS (Updated 3rd Ed)'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.title, 'Introduction to Algorithms CLRS (Updated 3rd Ed)');
  });

  test('PATCH /api/resources/:id/availability updates status with service key', async () => {
    const res = await request(app)
      .patch(`/api/resources/${createdResourceId}/availability`)
      .set('x-service-api-key', 'internal_shared_microservice_secret_token_college_2025')
      .send({
        availabilityStatus: 'reserved'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.availabilityStatus, 'reserved');
  });

  test('DELETE /api/resources/:id allows owner to delete resource', async () => {
    const res = await request(app)
      .delete(`/api/resources/${createdResourceId}`)
      .set('Authorization', `Bearer ${priyaToken}`);

    assert.equal(res.status, 200);

    const check = await request(app).get(`/api/resources/${createdResourceId}`);
    assert.equal(check.status, 404);
  });
});
