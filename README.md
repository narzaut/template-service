
## Manual Installation



Clone the repo:

  

```bash

git@github.com:narzaut/template-service.git

cd template-service

```  

Set the environment variables:

  

```bash

cp env.example .env

  

# DISCLAIMER: Some variables don't come with a default value and need to be supplied manually

```

Create docker user-defined bridge network
```bash
docker network create db_backend
```

Start docker containers and open logs
```bash
docker compose up -d --build
docker compose logs -f
```  

## Table of Contents

  

- [Features](#features)

- [Commands](#commands)

- [Project Structure](#project-structure)

- [API Documentation](#api-documentation)

- [Error Handling](#error-handling)

- [Validation](#validation)

- [Authentication](#authentication)

- [Authorization](#authorization)

- [Logging](#logging)

- [Communication](#communication)

- [Linting](#linting)


  

## Features

  

-  **Database**: [PostgreSQL](https://www.postgresql.org) data modeling using [Sequelize](https://sequelize.org)

-  **Authentication and authorization**: using [Firebase](http://www.firebase.google.com)

-  **Validation**: request data validation using [Joi](https://github.com/hapijs/joi)

-  **Logging**: using [winston](https://github.com/winstonjs/winston) and [morgan](https://github.com/expressjs/morgan)

-  **Testing**:  tests using [Jest](https://jestjs.io)

- **Communcation**: between microservices with a [RPC Direct Reply-to](https://www.rabbitmq.com/direct-reply-to.html) implementation with [RabbitMQ](https://www.rabbitmq.com/tutorials/tutorial-six-python.html) 

-  **Error handling**: centralized error handling mechanism

-  **API documentation**: with [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express)

-  **Dependency management**: with [npm](https://npmjs.com)

-  **Environment variables**: using [dotenv](https://github.com/motdotla/dotenv)

-  **Security**: set security HTTP headers using [helmet](https://helmetjs.github.io)

-  **Santizing**: sanitize request data against xss and query injection

-  **CORS**: Cross-Origin Resource-Sharing enabled using [cors](https://github.com/expressjs/cors)

-  **Changelog**: auto changelog implementation with [standard-version](https://www.npmjs.com/package/standard-version) following [conventional commit](https://conventionalcommits.org) specification
-  **Docker support**

-  **Linting**: with [ESLint](https://eslint.org) and [Prettier](https://prettier.io)


  

## Commands

  
Testing:

  

```bash

# run all tests

npm run test:all


```
  


Linting:

  

```bash

# run ESLint

npm run lint

  

# fix ESLint errors

npm run lint:fix

```

Database:
```bash

# migrate
npm run db:migrate:dev

# seed
npm run db:seed:dev

```
  

## Project Structure

  

```

src\

|--config\ # Environment variables and configuration related things

|--controllers\ # Route controllers (controller layer)

|--docs\ # Swagger files

|--middlewares\ # Custom express middlewares

|--models\ # Sequelize models (data layer)

|--routes\ # Routes

|--services\ # Business logic (service layer)

|--utils\ # Utility classes and functions

|--validations\ # Request data validation schemas

|--app.js # Express app

|--index.js # App entry point

```

  

## API Documentation

  

To view the list of available APIs and their specifications, run the server and go to `http://localhost:4002/api/v2/docs` in your browser. This documentation page is generated using the .yaml file written with the [openapi specification](https://www.openapis.org/).

  

## Error Handling

  

The app has a centralized error handling mechanism.

  

Controllers should try to catch the errors and forward them to the error handling middleware (by calling `next(error)`). For convenience, you can also wrap the controller inside the catchAsync utility wrapper, which forwards the error.

  

```javascript

const  catchAsync = require('../utils/catchAsync');

const  controller = catchAsync(async (req, res) => {
	// this error will be forwarded to the error handling middleware
	throw  new  Error('Something wrong happened');
});

```

  

The error handling middleware sends an error response, which has the following format:

  

```json

{
	"code": 404,
	"message": "Not found"
}

```

  

When running in development mode, the error response also contains the error stack.

  

The app has a utility ApiError class to which you can attach a response code and a message, and then throw it from anywhere (catchAsync will catch it).

  

For example, if you are trying to get a user from the DB who is not found, and you want to send a 404 error, the code should look something like:

  

```javascript

const  httpStatus = require('http-status');
const  ApiError = require('../utils/ApiError');
const  User = require('../models/User');

const  getUser = async (userId) => {
	const  user = await  User.findById(userId);
	if (!user) 
		throw  new  ApiError(httpStatus.NOT_FOUND, 'User not found');
};

```

  

## Validation

  

Request data is validated using [Joi](https://joi.dev/). Check the [documentation](https://joi.dev/api/) for more details on how to write Joi validation schemas.

  

The validation schemas are defined in the `src/validations` directory and are used in the routes by providing them as parameters to the `validate` middleware.

  

```javascript

const  express = require('express');
const  validate = require('../../middlewares/validate');
const  userValidation = require('../../validations/user.validation');
const  userController = require('../../controllers/user.controller');

const  router = express.Router();

router.post('/users', validate(userValidation.createUser), userController.createUser);

```

  

## Authentication

  

To require authentication for certain routes, you can use the `authenticate` middleware

  

```javascript

const  express = require('express');
const  { authenticate } = require('middlewares/auth');
const  userController = require('controllers/user.controller');

const  router = express.Router();
  
router.use(authenticate)
router.post('/users', userController.createUser);

```



These routes require a valid JWT access token in the Authorization request header using the Bearer schema. If the request does not contain a valid access token, an Unauthorized (401) error is thrown.

  

**Generating Access Tokens**:

  

An access token can be generated by making a successful call to the firebase login endpoints (or sdk). The response of these endpoints also contains user email and id

  

An access token is valid for 60 minutes.

  


## Authorization

  

There is also an `authorization` middleware can also be used to require certain rights/permissions to access a route.

  

```javascript

const  express = require('express');
const  { authorization } = require('middlewares/auth');
const  userController = require('controllers/user.controller');

const  router = express.Router();

router.post('/users', authorize(['admin']), userController.createUser);

```

  

In the example above, an authenticated user can access this route only if that user has the `admin` permission set in his Firebase record

If the user making the request does not have the required permissions to access this route, a Forbidden (403) error is thrown.

```javascript

const  express = require('express');
const  { authorize, authenticate } = require('middlewares/auth');
const  userController = require('controllers/user.controller');

const  router = express.Router();
  
router.get(
	'/user/:userId', 
	authorize(['admin'], userValidation.sameUser), 
	userController.createUser
);

```
  
The middleware `authorize` also receives a callback as its second argument that allows for more custom validations.

Above is an example of an endpoint that can only be accessed by the validated user (which corresponds to the Firebase record) or an admin.


## Communication
To fetch/send data from/to another microservice, RabbitMQ is required. 

Communicating to another microservice as `client`
```javascript
const RPCService = require('integrations/rabbitmq/service');
const httpStatus = require('http-status');
const ApiError = require('utils/ApiError');

const getUserFromAnotherMicroservice = async () => {
	const { status, details, data: user, err } = await RPCService.publishToQueue('get-user-by-id', { 
		uid: 'userId',
		include: [ { child: "personalData" } ] 
	});
	if (status !== httpStatus.OK) // something went wrong
		throw new ApiError(status, err || details);
	return user
};
```

Exposing a `queue` (rpc function) as `server`

```javascript

const  httpStatus = require('http-status');
const  RPCService = require('integration/rabbitmq/service');
const  customerService = require('services/customer');
const  logger = require('config/logger');

RPCService.consumeToQueue(
	'get-customer-by-id',
	async (jsonMessage, queue) => {
		const { uid, include } = jsonMessage;
		try {
			const  user = await  customerService.getCustomerById(uid, include);
			if (!user)
				return  RPCService.replyToQueue(queue, {
					status:  httpStatus.NOT_FOUND,
					details:  'Customer Not Found'
				});

			return  RPCService.replyToQueue(queue, {
				status:  httpStatus.OK,
				data:  user
			});

		} catch (err) {
			logger.debug(err);
			return  RPCService.replyToQueue(queue, {
				status:  httpStatus.INTERNAL_SERVER_ERROR,
				details:  'There was an error attempting to fetch customer',
				err
			});
		}
	}
);

```
## Logging

  

Import the logger from `src/config/logger.js`. It is using the [Winston](https://github.com/winstonjs/winston) logging library.

  

Logging should be done according to the following severity levels (ascending order from most important to least important):

  

```javascript

const  logger = require('config/logger');

  

logger.error('message'); // level 0

logger.warn('message'); // level 1

logger.info('message'); // level 2

logger.http('message'); // level 3

logger.verbose('message'); // level 4

logger.debug('message'); // level 5

```

  

In development mode, log messages of all severity levels will be printed to the console.

  

In production mode, only `info`, `warn`, and `error` logs will be printed to the console.\


Note: API request information (request url, response code, timestamp, etc.) are also automatically logged (using [morgan](https://github.com/expressjs/morgan)).



### Pagination  

```javascript
const { getPagination, getPagingData } = require('utils/pagination');

const  queryUsers = async (query) => {
	const { page, size } = { ...query };
	const { limit, offset } = getPagination(page, size)
	const  customers = await  Customer.findAndCountAll({
		limit,
		offset
	});
	return getPagingData(customers, page, limit);
};

```
The `getPagingData` method returns an object having the following properties:

  

```json

{

	"results": [ ... ],

	"currentPage": 1,

	"totalItems": 15,

	"totalPages": 2

}

```

  

## Linting

  

Linting is done using [ESLint](https://eslint.org/) and [Prettier](https://prettier.io).

  

In this app, ESLint is configured to follow the [Airbnb JavaScript style guide](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb-base) with some modifications. It also extends [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) to turn off all rules that are unnecessary or might conflict with Prettier.

  

To modify the ESLint configuration, update the `.eslintrc.json` file. To modify the Prettier configuration, update the `.prettierrc.json` file.

  

To prevent a certain file or directory from being linted, add it to `.eslintignore` and `.prettierignore`.

  
