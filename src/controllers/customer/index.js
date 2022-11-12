const httpStatus = require('http-status');

const catchAsync = requireFromRoot('utils/catchAsync');
const customerService = requireFromRoot('services/customer');
const ApiError = requireFromRoot('utils/ApiError');
const logger = requireFromRoot('config/logger');

const getCustomers = catchAsync(async (req, res) => {
    const { query } = { ...req };
    const customers = await customerService.getCustomers(query);
    return res.status(httpStatus.OK).send(customers);
});

const createCustomer = catchAsync(async (req, res) => {
    const { body, user } = { ...req };
    const customer = await customerService.createCustomer({
        id: user.uid,
        email: user.email,
        ...body
    });
    return res.status(httpStatus.CREATED).send(customer);
});

const updateCustomerDescription = catchAsync(async (req, res) => {
    const { uid, body } = { ...req };
    const customer = await customerService.updateCustomerById(uid, {
        description: body.description
    });
    if (!customer)
        throw new ApiError(httpStatus.NOT_FOUND, 'Customer Not Found');
    return res.status(httpStatus.OK).send(customer);
});

const updateCustomerById = catchAsync(async (req, res) => {
    const { body, uid, query } = { ...req };
    const updatedCustomer = await customerService.updateCustomerById(
        uid,
        body,
        query
    );
    return res.status(httpStatus.OK).send(updatedCustomer);
});

const getCustomerById = catchAsync(async (req, res) => {
    const { uid, query } = { ...req };
    const customer = await customerService.getCustomerById(uid, query);
    if (!customer)
        throw new ApiError(httpStatus.NOT_FOUND, 'Customer Not Found');
    return res.status(httpStatus.OK).send(customer);
});

const deleteCustomerById = catchAsync(async (req, res) => {
    const { uid } = { ...req };
    await customerService.deleteCustomerById(uid);
    return res.sendStatus(httpStatus.NO_CONTENT);
});

const getProfileImage = catchAsync(async (req, res, next) => {
    const { uid } = { ...req };
    const profileImage = await customerService.getProfileImage(uid);
    if (!profileImage)
        throw new ApiError(
            httpStatus.NOT_FOUND,
            'Customer Profile Image Not Found'
        );
    res.set({ 'Content-Type': 'image/*' });
    return res.download(profileImage, (err) => {
        logger.debug(err);
        if (err) {
            res.set({ 'Content-Type': 'application/json' });
            return next(
                new ApiError(
                    httpStatus.NOT_FOUND,
                    'Customer Profile Image Not Found'
                )
            );
        }
    });
});

const uploadProfileImage = catchAsync(async (req, res) => {
    const { file, body, uid } = { ...req };
    if (body.length > 0 || Object.keys(body).length !== 0)
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'This endpoint only receives a file'
        );
    if (!file || file?.length < 1)
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Image is required. Must be a file'
        );

    const updatedCustomer = await customerService.updateCustomerById(uid, {
        profileImage: file.filename
    });
    return res.status(httpStatus.OK).send(updatedCustomer);
});

module.exports = {
    getCustomers,
    createCustomer,
    updateCustomerById,
    getCustomerById,
    deleteCustomerById,
    getProfileImage,
    uploadProfileImage,
    updateCustomerDescription
};
