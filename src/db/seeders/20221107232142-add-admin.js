/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert(
            'Customer',
            [
                {
                    id: 'SKqCvxmtzPaaLfykbuMZoDZPvMJ3',
                    email: 'admin@admin.com'
                }
            ],
            {}
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Customer', null, {});
    }
};
