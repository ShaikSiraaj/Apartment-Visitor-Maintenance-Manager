const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');
const seedData = require('../seedData');

test.before(async () => {
  await seedData();
});

test('GET /api/health should return ok status', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'ok');
});

test('POST /api/auth/login with predefined Indian resident Raju Sharma should succeed', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'raju@apartment.com',
      password: 'password123',
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Raju Sharma');
  assert.equal(res.body.role, 'Resident');
  assert.ok(res.body.token);
});

test('POST /api/alerts should create visitor complaint alert', async () => {
  const res = await request(app)
    .post('/api/alerts')
    .send({
      title: 'Water Pipe Burst at Block C',
      description: 'Major leak in main pipe',
      raisedBy: 'Ram Verma',
      urgency: 'Urgent',
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.title, 'Water Pipe Burst at Block C');
  assert.equal(res.body.raisedBy, 'Ram Verma');
});

test('Protected endpoints without token should return 401', async () => {
  const visitorsRes = await request(app).get('/api/visitors');
  assert.equal(visitorsRes.status, 401);

  const maintenanceRes = await request(app).get('/api/maintenance');
  assert.equal(maintenanceRes.status, 401);
});
