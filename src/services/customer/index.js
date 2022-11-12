const httpStatus = require('http-status');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const models = requireFromRoot('db/models');
const ApiError = requireFromRoot('utils/ApiError');
const customerQueries = requireFromRoot('db/queries/customer.queries');
const downloadImageFromUrl = requireFromRoot('utils/downloadImageFromUrl');
const { getPagination, getPagingData } = requireFromRoot('utils/pagination');
const { eagerLoader } = requireFromRoot('utils/eagerLoader');

const { Customer } = models;
const { Op } = models.sequelize;

const getCustomers = async (query) => {
    let include = [];
    if (query?.include)
        if (query?.include === 'all') include = customerQueries.all;
        else include = eagerLoader(customerQueries.default, query.include);

    const filter = query.filter ? JSON.parse(query.filter) : {};
    const order = query.sort ? [JSON.parse(query.sort)] : [['id', 'DESC']];
    const { page, size } = { ...query };
    const { limit, offset } = getPagination(page, size);

    if (filter.name) filter.name = { [Op.iLike]: `%${filter.name}%` };
    const customers = await Customer.findAndCountAll({
        where: filter,
        limit,
        offset,
        order,
        include
    });

    return getPagingData(customers, page, limit);
};

const getCustomerById = async (uid, query, transaction = null) => {
    let include = [];
    if (query?.include)
        if (query?.include === 'all') include = customerQueries.all;
        else include = eagerLoader(customerQueries.default, query.include);

    const customer = await Customer.findByPk(uid, {
        include,
        transaction
    });
    return customer;
};

const createCustomer = async (data) => {
    const alreadyExists = await getCustomerById(data.id);
    if (alreadyExists)
        throw new ApiError(httpStatus.BAD_REQUEST, 'Customer already exists');
    if (data.profileImage) {
        const randomFilename = uuidv4().replaceAll('-', '');
        const destination = `./src/public/profiles/images/${randomFilename}`;
        await downloadImageFromUrl(data.profileImage, destination);
        data.profileImage = randomFilename;
    }
    const customer = await Customer.create(data);
    return customer;
};

const updateCustomerById = async (uid, data) => {
    const customer = await getCustomerById(uid);
    if (!customer)
        throw new ApiError(httpStatus.NOT_FOUND, 'Customer Not Found');
    if (customer.profileImage && data.profileImage)
        fs.unlinkSync(`./src/public/profiles/images/${customer.profileImage}`);
    if (customer.backgroundImage && data.backgroundImage)
        fs.unlinkSync(
            `./src/public/background/images/${customer.backgroundImage}`
        );

    await customer.update(data);
    return customer;
};

const deleteCustomerById = async (uid) => {
    const customer = await getCustomerById(uid);
    if (!customer)
        throw new ApiError(httpStatus.NOT_FOUND, 'Customer Not Found');
    await customer.destroy();
    return true;
};

const getProfileImage = async (uid) => {
    const customer = await getCustomerById(uid);
    if (!customer)
        throw new ApiError(httpStatus.NOT_FOUND, 'Customer Not Found');
    if (customer.profileImage)
        return `./src/public/profiles/images/${customer.profileImage}`;
    return customer.profileImage;
};

module.exports = {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomerById,
    deleteCustomerById,
    getProfileImage
};
