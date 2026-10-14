process.env.NODE_ENV = 'test';
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { connectDB, disconnectDB } = require('../src/config/db');
const app = require('../server');
const Company = require('../src/models/Company');
const Resource = require('../src/models/Resource');

describe('Industrial Resource Service API Tests', () => {
  let supplierToken;
  let supplierId;
  let receiverToken;
  let createdResourceId;

  before(async () => {
    await connectDB();
    await Company.deleteMany({});
    await Resource.deleteMany({});
  });

  after(async () => {
    await Company.deleteMany({});
    await Resource.deleteMany({});
    await disconnectDB();
  });

  test('GET /health returns 200 and healthy status', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.service, 'resource-service');
    assert.equal(res.body.status, 'OK');
  });

  test('POST /api/auth/register registers industrial company', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Apex Textiles Ltd.',
        registrationRef: 'GSTIN: 33AAACA1111A1Z1',
        industrySector: 'Textiles & Apparel',
        contactPerson: 'Karthik S',
        email: 'karthik.test@apex.com',
        password: 'Password@123',
        address: 'SIPCOT Industrial Park',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        companyRole: 'supplier'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.company.verificationStatus, 'Pending');
    supplierToken = res.body.data.token;
    supplierId = res.body.data.company.id;
  });

  test('POST /api/auth/login validates corporate credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'karthik.test@apex.com',
        password: 'Password@123'
      });

    assert.equal(res.status, 200);
    assert.ok(res.body.data.token);
  });

  test('POST /api/resources creates industrial material listing', async () => {
    const res = await request(app)
      .post('/api/resources')
      .set('Authorization', `Bearer ${supplierToken}`)
      .send({
        title: 'Pure Cotton Comber Noil Bales',
        description: 'Post-industrial high-purity cotton comber noil in 150kg compressed bales.',
        materialCategory: 'Textile and fabric waste',
        resourceType: 'By-product',
        condition: 'Grade A - Clean, Segregated, Dry',
        totalQuantity: 5000,
        unit: 'kg',
        indicativePrice: 65,
        handlingStorageInfo: 'Store in dry warehouse away from sparks',
        pickupLocation: {
          city: 'Coimbatore',
          state: 'Tamil Nadu',
          address: 'SIPCOT Industrial Park'
        }
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.availableQuantity, 5000);
    assert.equal(res.body.data.reservedQuantity, 0);
    assert.equal(res.body.data.availabilityStatus, 'available');
    createdResourceId = res.body.data._id;
  });

  test('GET /api/resources returns filtered industrial catalog', async () => {
    const res = await request(app).get('/api/resources?category=Textile and fabric waste');
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length >= 1);
  });

  test('GET /api/resources/search finds materials by keyword', async () => {
    const res = await request(app).get('/api/resources/search?q=Cotton');
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length >= 1);
  });

  test('PATCH /api/resources/:id/reserve coordinates quantity allocation (Inter-Service)', async () => {
    // 1. Reserve 1500 kg
    const resReserve = await request(app)
      .patch(`/api/resources/${createdResourceId}/reserve`)
      .set('x-service-api-key', 'internal_shared_microservice_secret_token_college_2025')
      .send({
        quantity: 1500,
        action: 'reserve'
      });

    assert.equal(resReserve.status, 200);
    assert.equal(resReserve.body.data.availableQuantity, 3500);
    assert.equal(resReserve.body.data.reservedQuantity, 1500);
    assert.equal(resReserve.body.data.availabilityStatus, 'partially_reserved');

    // 2. Reject overselling attempt (requesting 4000 kg when only 3500 kg available)
    const resOver = await request(app)
      .patch(`/api/resources/${createdResourceId}/reserve`)
      .set('x-service-api-key', 'internal_shared_microservice_secret_token_college_2025')
      .send({
        quantity: 4000,
        action: 'reserve'
      });

    assert.equal(resOver.status, 409);

    // 3. Release 1500 kg back
    const resRelease = await request(app)
      .patch(`/api/resources/${createdResourceId}/reserve`)
      .set('x-service-api-key', 'internal_shared_microservice_secret_token_college_2025')
      .send({
        quantity: 1500,
        action: 'release'
      });

    assert.equal(resRelease.status, 200);
    assert.equal(resRelease.body.data.availableQuantity, 5000);
    assert.equal(resRelease.body.data.reservedQuantity, 0);
  });
});
