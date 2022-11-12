const faker = require('faker');
const { Customer } = require('../../src/db/models');
const { getFirebaseUser } = require('./token.fixture');

const userOne = (async () => {
    const { token, uid } = await getFirebaseUser('buyer@buyer.com', 'buyersc');
    return {
        customer: {
            id: uid,
            email: faker.internet.email().toLowerCase(),
            profileImage: null,
            description: null,
            backgroundImage: null,
            fcmToken: faker.random.alphaNumeric(16)
        },
        token
    };
})();

const userTwo = (async () => {
    const { token, uid } = await getFirebaseUser('test@test.com', 'testsc');
    return {
        customer: {
            id: uid,
            email: faker.internet.email().toLowerCase(),
            profileImage: null,
            description: null,
            backgroundImage: null,
            fcmToken: faker.random.alphaNumeric(16)
        },
        token
    };
})();

const adminUser = (async () => {
    const { token, uid } = await getFirebaseUser('admin@admin.com', 'adminsc');
    return {
        customer: {
            id: uid,
            email: faker.internet.email().toLowerCase(),
            profileImage: null,
            description: null,
            backgroundImage: null,
            fcmToken: faker.random.alphaNumeric(16)
        },
        token
    };
})();

const insertCustomers = async (customers) => {
    await Customer.insertMany(customers);
};

module.exports = {
    userOne,
    userTwo,
    adminUser,
    insertCustomers
};
