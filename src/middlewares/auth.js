const httpStatus = require('http-status');

const logger = requireFromRoot('config/logger');
const ApiError = requireFromRoot('utils/ApiError');
const firebaseService = requireFromRoot('services/firebase');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token)
            return next(new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized'));
        const { decodedToken, err } = await firebaseService.verifyToken(token);
        if (err) return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
        if (
            decodedToken.firebase.sign_in_provider === 'password' &&
            !decodedToken.email_verified
        )
            return next(
                new ApiError(
                    httpStatus.UNAUTHORIZED,
                    'Email has not been verified'
                )
            );
        req.user = decodedToken;
        return next();
    } catch (err) {
        logger.error(err.message);
        return next(
            new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err.message)
        );
    }
};
/*
This middleware will:
    First check if user firebase record claims match the protected route
    If it does, then it just continues to next middleware
    If not, then a custom callback will be executed. In this case, with the purpose of validating if the user is requesting his own resources. 
*/
const authorize = (claims, cb) => {
    return async (req, res, next) => {
        const { params, user } = { ...req };

        let authorized = false;
        claims.forEach((claim) => {
            if (user[claim] === true) {
                authorized = true;
                return authorized;
            }
        });
        req.authorized = authorized || false;
        if (authorized) {
            // * this line adds resource (eg. customer, shop) id to req object
            [req[`${Object.keys(req.params)[0]}`]] = Object.values(req.params);
            return next();
        }
        if (cb) {
            const data = await cb(user, params);
            if (data.err) return next(data.err);
            if (!data)
                return next(
                    new ApiError(httpStatus.NOT_FOUND, 'Resource Not Found')
                );
            // * this line adds resource (eg. customer, shop) id to req object
            [req[`${Object.keys(data)[0]}`]] = Object.values(data);
            return next();
        }
        return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    };
};

module.exports = { authenticate, authorize };
