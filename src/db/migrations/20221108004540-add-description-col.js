module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Customer', 'description', {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Customer', 'description');
    }
};
