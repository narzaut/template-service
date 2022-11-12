const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Customer extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {}
    }
    Customer.init(
        {
            id: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
                unique: true
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            profileImage: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null
            },
            createdAt: {
                type: DataTypes.DATE
            },

            updatedAt: {
                type: DataTypes.DATE
            }
        },
        {
            sequelize,
            modelName: 'Customer'
        }
    );
    return Customer;
};
