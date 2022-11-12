const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const basename = path.basename(__filename);
const { database } = require('../../config/config');

const db = {};
const sequelize = new Sequelize(
    database.name,
    database.user,
    database.password,
    database
);
// This hook was added because of a sequelize known bug
// Reference: https://github.com/sequelize/sequelize/issues/9481
sequelize.addHook('beforeCount', function (options) {
    if (this._scope.include && this._scope.include.length > 0) {
        options.distinct = true;
        options.col =
            this._scope.col ||
            options.col ||
            `"${this.options.name.singular}".id`;
    }

    if (options.include && options.include.length > 0) {
        options.include = null;
    }
});

fs.readdirSync(__dirname)
    .filter((file) => {
        return (
            file.indexOf('.') !== 0 &&
            file !== basename &&
            file.slice(-3) === '.js'
        );
    })
    .forEach((file) => {
        // This is default sequelize implementation
        // eslint-disable-next-line global-require
        const model = require(path.join(__dirname, file))(
            sequelize,
            Sequelize.DataTypes
        );
        db[model.name] = model;
    });

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) db[modelName].associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
