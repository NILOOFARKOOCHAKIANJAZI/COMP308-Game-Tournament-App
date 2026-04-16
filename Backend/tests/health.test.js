const request = require('supertest');
const createApp = require('../app');

describe('Backend health route', () => {
  let app;

  beforeAll(async () => {
    app = await createApp();
  });

  it('should return 200 and backend running message', async () => {
    const response = await request(app).get('/');

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Gaming Tournaments GraphQL Backend is running');
  });
});