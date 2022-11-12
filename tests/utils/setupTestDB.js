require('dotenv').config({ path: '../../.env' });
const { Client } = require('pg');
const spawn = require('await-spawn');
const { database: config } = require('../../src/config/config');
const logger = require('../../src/config/logger');
const db = require('../../src/db/models');

const createDatabase = async (databaseName = config.database) => {
    const baseClient = new Client(config);
    try {
        await baseClient.connect();
        const pgDb = await baseClient.query(
            `SELECT datname FROM pg_catalog.pg_database`
        );

        if (!pgDb.rows.map((row) => row.datname).includes(databaseName)) {
            await baseClient.query(`CREATE DATABASE "${databaseName}"`);
            logger.debug(`DATABASE ${databaseName} CREATED`);
        }

        await baseClient.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
        await baseClient.end();
    } catch (err) {
        logger.debug(err);
    }
};

const syncForceDatabase = async () => {
    try {
        await db.sequelize.sync({ force: true, alter: true });
        return true;
    } catch (err) {
        logger.debug(err.message);
        return err;
    }
};

const syncDatabase = async () => {
    try {
        await db.sequelize.sync({ force: false, alter: true });
        return true;
    } catch (err) {
        logger.debug(err.message);
        return err;
    }
};

const seedDatabase = async () => {
    const undo = await spawn('./node_modules/.bin/sequelize', [
        'db:seed:undo:all'
    ]);
    const seed = await spawn('./node_modules/.bin/sequelize', ['db:seed:all']);
    logger.debug(undo.toString());
    logger.debug(seed.toString());
};

const setupTestDB = async () => {
    beforeAll(async () => {
        await createDatabase();
        await syncForceDatabase();
    });
};

module.exports = setupTestDB;
