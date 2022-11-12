const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');

(async () => setupTestDB())();

describe('Service healthcheck', () => {
    describe('GET /api/v2/healthcheck', () => {
        test('should return 204 if services are running correctly', async () => {
            const res = await request(app)
                .get('/api/v2/healthcheck')
                .expect(httpStatus.NO_CONTENT);
        });
    });
});
