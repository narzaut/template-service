require('dotenv').config();
const rateLimit = require('express-rate-limit');

const config = requireFromRoot('config/config');

const apiLimiter = (tries = 100, minutes = 60) => {
    return rateLimit({
        windowMs: minutes * 60 * 1000, // 1 hour
        max: config.env === 'production' ? tries : 99999, // Limit each IP to 100 requests per `window` (here, per hour)
        message:
            'Too many requests originated from this IP, please try again after an hour',
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false // Disable the `X-RateLimit-*` headers
    });
};

module.exports = apiLimiter;
