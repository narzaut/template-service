const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');

describe('Swagger documentation', () => {
    describe('GET /api/v2/docs/', () => {
        test('should return 200 if doc is returned correctly', async () => {
            const res = await request(app)
                .get('/api/v2/docs/')
                .expect(httpStatus.OK);
            expect(res.body).toBeDefined();
        });
    });
});
