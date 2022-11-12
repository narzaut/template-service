require('dotenv').config();
const { database, env } = require('./config');

const db = {};
db[env] = {
    username: database.user,
    password: database.password,
    database: database.database,
    port: database.port,
    host: database.host,
    dialect: 'postgres',
    dialectOptions: database.dialectOptions
};
module.exports = db;
