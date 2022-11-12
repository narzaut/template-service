const JoiBase = require('joi');
const JoiDate = require('@joi/date');
const httpStatus = require('http-status');

const customerService = requireFromRoot('services/customer');
const ApiError = requireFromRoot('utils/ApiError');
const logger = requireFromRoot('config/logger');

const Joi = JoiBase.extend(JoiDate);

const getCustomers = {
    query: Joi.object().keys({
        filter: Joi.string(),
        page: Joi.number().integer().positive(),
        size: Joi.number().integer().positive(),
        order: Joi.number().integer(),
        include: Joi.string().optional()
    })
};

const getCustomerById = {
    params: Joi.object().keys({
        uid: Joi.string().required()
    }),
    query: Joi.object().keys({
        include: Joi.string().optional()
    })
};

const getCustomerImage = {
    params: Joi.object().keys({
        imageId: Joi.string().required()
    })
};

const createCustomer = {
    body: Joi.object().keys({
        profileImage: Joi.string().optional()
    })
};

const updateCustomerDescription = {
    body: Joi.object()
        .keys({
            description: Joi.string().min(24).max(255).required()
        })
        .required()
};

const deleteCustomer = {
    params: Joi.object().keys({
        uid: Joi.string().required()
    })
};

// * Keep in mind that this function depends on 'authorize' middleware to make this run (./middlwares/auth.js)
const sameUser = async (user, params) => {
    const { uid: customerId } = { ...params };
    if (!customerId || !user)
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'must provide valid user and customer id'
        );
    try {
        const data = await customerService.getCustomerById(customerId);
        if (!data || user?.uid !== data?.id)
            throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
        // * It's important for the return object to have the same key name as the resource id specified in route parameters
        // * eg. /customer/:uid
        return { uid: data.id };
    } catch (err) {
        logger.error(err.message);
        return { err };
    }
};

module.exports = {
    getCustomers,
    getCustomerById,
    getCustomerImage,
    createCustomer,
    deleteCustomer,
    updateCustomerDescription,
    sameUser
};
