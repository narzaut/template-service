module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Customer', 'createdAt', {
            type: Sequelize.DATE
        });
        await queryInterface.addColumn('Customer', 'updatedAt', {
            type: Sequelize.DATE
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Customer', 'createdAt');
        await queryInterface.removeColumn('Customer', 'updatedAt');
    }
};
