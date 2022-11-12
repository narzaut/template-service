//* This line adds 'requireFromRoot' to global object and makes it usable from anywhere in the code
require('./utils/addRequireFromRootToGlobal')();
const cors = require('cors');
const express = require('express');
const compression = require('compression');
const xss = require('xss-clean');
const helmet = require('helmet');

const v2 = requireFromRoot('routes/v2');
const corsOptions = requireFromRoot('config/cors');
const { errorConverter, errorHandler } = requireFromRoot('middlewares/error');
const apiLimiter = requireFromRoot('middlewares/apiLimiter')();
const RPCService = requireFromRoot('integration/rabbitmq/service');
const morgan = requireFromRoot('config/morgan');
const firebaseService = requireFromRoot('services/firebase');

RPCService.startConsumers();
firebaseService.connect();
const app = express();

app.use(morgan.successHandler);
app.use(morgan.errorHandler);
// set security HTTP headers
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// gzip compression
app.use(compression());
// sanitize request data
app.use(xss());

app.use('/api/v2/', apiLimiter, v2);

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
