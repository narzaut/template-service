const fs = require('fs');
const path = require('path');

const logger = requireFromRoot('config/logger');

const basename = path.basename(__filename);

const startConsumers = () => {
    try {
        fs.readdirSync(__dirname)
            .filter((file) => {
                return (
                    file.indexOf('.') !== 0 &&
                    file !== basename &&
                    file.slice(-3) === '.js'
                );
            })
            .forEach((file) => {
                // eslint-disable-next-line global-require
                require(`./${file}`)();
            });
    } catch (err) {
        logger.error(err);
    }
};

module.exports = startConsumers;
