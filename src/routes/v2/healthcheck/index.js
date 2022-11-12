const express = require('express');
const httpStatus = require('http-status');

const db = requireFromRoot('db/models');
const RPCService = requireFromRoot('integration/rabbitmq/service');
const ApiError = requireFromRoot('utils/ApiError');

const router = express.Router();
router.get('/', async (req, res, next) => {
    let databaseStatus = false;
    const rabbitStatus = await RPCService.getStatus();
    try {
        await db.sequelize.authenticate();
        databaseStatus = true;
    } catch (err) {
        databaseStatus = false;
    }
    if (!databaseStatus)
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Database connection is not up'
        );
    if (!rabbitStatus)
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'RabbitMQ connection is not up'
        );
    return res.sendStatus(httpStatus.NO_CONTENT);
});

module.exports = router;
