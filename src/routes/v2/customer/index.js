const express = require('express');
const multer = require('multer');

const { profileImageConfig } = requireFromRoot('config/multer');
const { authorize } = requireFromRoot('middlewares/auth');
const validate = requireFromRoot('middlewares/validate');
const customerController = requireFromRoot('controllers/customer');
const customerValidation = requireFromRoot('validations/customer');
const uploadProfile = multer(profileImageConfig);
const router = express.Router();

router
    .route('/')
    .get(
        authorize(['admin']),
        validate(customerValidation.getCustomers),
        customerController.getCustomers
    )
    .post(
        validate(customerValidation.createCustomer),
        customerController.createCustomer
    );

// * This validation middleware also applies to every nested route
router.use('/:uid', authorize(['admin'], customerValidation.sameUser));

router
    .route('/:uid')
    .get(
        validate(customerValidation.getCustomerById),
        customerController.getCustomerById
    )
    .delete(
        validate(customerValidation.deleteCustomer),
        customerController.deleteCustomerById
    )
    .put(authorize(['admin']), customerController.updateCustomerById);

router
    .route('/:uid/description')
    .put(
        validate(customerValidation.updateCustomerDescription),
        customerController.updateCustomerDescription
    );

router
    .route('/:uid/profile-image')
    .get(customerController.getProfileImage)
    .put(uploadProfile.single('image'), customerController.uploadProfileImage);
module.exports = router;
