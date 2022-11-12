module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Customer', {
            id: {
                type: Sequelize.STRING,
                allowNull: false,
                primaryKey: true,
                unique: true
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            profileImage: {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: null
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Customer');
    }
};
