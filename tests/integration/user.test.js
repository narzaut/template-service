/* eslint-disable jest/no-commented-out-tests */
/* eslint-disable jest/no-identical-title */
const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const customerService = require('../../src/services/customer');
const { userOne, userTwo, adminUser } = require('../fixtures/user.fixture');

jest.setTimeout(1000000);
(async () => setupTestDB())();

describe('User signup flow', () => {
    let { customer: one, token: userOneToken } = {};
    let { customer: two, token: userTwoToken } = {};
    let { customer: admin, token: adminToken } = {};

    beforeAll(async () => {
        ({ customer: one, token: userOneToken } = await userOne);
        ({ customer: two, token: userTwoToken } = await userTwo);
        ({ customer: admin, token: adminToken } = await adminUser);
    });

    describe('User flow', () => {
        describe('POST /api/v2/customer', () => {
            test('should return 200 if data is okay', async () => {
                const body = {
                    profileImage:
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/800px-Image_created_with_a_mobile_phone.png'
                };
                const res = await request(app)
                    .post('/api/v2/customer')
                    .set('Authorization', `Bearer ${userOneToken}`)
                    .send(body)
                    .expect(httpStatus.CREATED);

                expect(res.body).toEqual({
                    id: one.id,
                    email: expect.anything(),
                    backgroundImage: null,
                    description: null,
                    profileImage: expect.anything(String),
                    fcmToken: body.fcmToken,
                    favoriteProducts: [],
                    updatedAt: expect.anything(),
                    createdAt: expect.anything()
                });

                const dbUser = JSON.parse(
                    JSON.stringify(
                        await customerService.getCustomerById(res.body.id)
                    )
                );
                expect(dbUser).toBeDefined();
                expect(dbUser).toMatchObject(res.body);
            });
        });

        describe('GET /api/v2/customer/:uid/profile-image', () => {
            test('should return 200 if data is okay', async () => {
                const res = await request(app)
                    .get(`/api/v2/customer/${one.id}/profile-image`)
                    .set('Authorization', `Bearer ${userOneToken}`)
                    .expect(httpStatus.OK);
            });

            test('should return 403 if not same user or admin', async () => {
                const res = await request(app)
                    .get(`/api/v2/customer/${two.id}/profile-image`)
                    .set('Authorization', `Bearer ${userTwoToken}`)
                    .expect(httpStatus.FORBIDDEN);
            });
        });

        describe('GET /api/v2/customer', () => {
            test('should return 200 with default pagination', async () => {
                const res = await request(app)
                    .get('/api/v2/customer')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send()
                    .expect(httpStatus.OK);

                expect(res.body).toEqual({
                    results: expect.any(Array),
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 1
                });
                expect(res.body.results).toHaveLength(1);
                expect(res.body.results[0]).toEqual({
                    id: expect.anything(),
                    email: expect.anything(),
                    backgroundImage: null,
                    description: null,
                    profileImage: expect.anything(String),
                    updatedAt: expect.anything(),
                    createdAt: expect.anything()
                });
            });

            test('should return 401 if access token is missing', async () => {
                await request(app)
                    .get('/api/v2/customer')
                    .send()
                    .expect(httpStatus.UNAUTHORIZED);
            });

            test('should return 403 if a non-admin is trying to access all users', async () => {
                await request(app)
                    .get('/api/v2/customer')
                    .set('Authorization', `Bearer ${userOneToken}`)
                    .send()
                    .expect(httpStatus.FORBIDDEN);
            });
        });

        describe('PUT /api/v2/customer/:uid/description', () => {
            const body = {
                description: 'testdescriptionasdasdasdasd'
            };
            test('should return 200', async () => {
                const res = await request(app)
                    .put(`/api/v2/customer/${one.id}/description`)
                    .send(body)
                    .set('Authorization', `Bearer ${userOneToken}`)
                    .expect(httpStatus.OK);

                expect(res.body).toBeDefined();
                expect(res.body.description).toEqual(body.description);
            });
            test('should return 403 if user is not admin or same user', async () => {
                const res = await request(app)
                    .put(`/api/v2/customer/${one.id}/description`)
                    .send(body)
                    .set('Authorization', `Bearer ${userTwoToken}`)
                    .expect(httpStatus.FORBIDDEN);
            });
        });
    });
});

// describe('DELETE /api/v2/seller/:uid', () => {
//  test('should return 204 if deleted succesfully', async () => {
//    const res = await request(app)
//      .delete(`/api/v2/seller/${one.id}`)
//      .set('Authorization', `Bearer ${userOneToken}`)
//      .expect(httpStatus.NO_CONTENT);
//  });
// })
