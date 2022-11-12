const models = requireFromRoot('db/models');

const {
    PhoneData,
    CustomerPersonalData,
    Address,
    Billing,
    BillingAddress,
    DueToReceive
} = models;

const childs = [
    {
        as: 'phones',
        model: PhoneData
    },
    {
        as: 'personalData',
        model: CustomerPersonalData
    },
    {
        as: 'address',
        model: Address,
        where: {
            deleted: false
        },
        required: false,
        attributes: { exclude: ['deleted'] }
    },
    {
        as: 'billings',
        model: Billing,
        required: false
    },
    {
        model: BillingAddress,
        as: 'billingAddress'
    },
    { model: DueToReceive, as: 'dueToReceive', required: false }
];

const allIncludes = [
    {
        as: 'personalData',
        model: CustomerPersonalData,
        include: [
            {
                as: 'phones',
                model: PhoneData
            },
            {
                as: 'address',
                model: Address,
                where: {
                    deleted: false
                },
                required: false,
                attributes: { exclude: ['deleted'] },
                include: [
                    { model: DueToReceive, as: 'dueToReceive', required: false }
                ]
            }
        ]
    },
    {
        as: 'billings',
        model: Billing,
        required: false,
        include: [
            {
                model: BillingAddress,
                as: 'billingAddress'
            }
        ]
    }
];

module.exports = {
    default: childs,
    all: allIncludes
};
