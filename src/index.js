const app = require('./app');

const { sequelize } = requireFromRoot('db/models');
const { database, port } = requireFromRoot('config/config');
const logger = requireFromRoot('config/logger');

let server;
sequelize.authenticate().then(() => {
    logger.info(`connected to ${database.database}`);
    server = app.listen(port, () => {
        logger.info(`Listening to port ${port}`);
    });
});

const exitHandler = () => {
    if (server)
        server.close(() => {
            logger.info('Server closed');
            process.exit(1);
        });
    process.exit(1);
};

const unexpectedErrorHandler = (error) => {
    logger.error(error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    if (server) server.close();
});
