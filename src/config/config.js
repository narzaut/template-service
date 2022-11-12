/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable prettier/prettier */
require('dotenv').config();
const Joi = require('joi');
const fs = require('fs');

const cert = {};

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(4123),
    DB_HOST: Joi.string().required().description('database host').required(),
    DB_USER: Joi.string().description('database username').required(),
    DB_NAME: Joi.string().description('database name').required(),
    DB_NAME_TEST: Joi.string().description('test database name').required(),
    DB_PASSWORD: Joi.string().description('database password').required(),
    DB_PORT: Joi.number().description('port to connect to the database').required(),
    DB_ENABLE_SSL: Joi.string().valid('true', 'false').default('false').optional(),
    RABBITMQ: Joi.string().description('rabbitmq uri').required(),
    API_BASE_URL: Joi.string().description('base url').default('https://api.dev.simplecomercio.tk'),
  })
  .unknown();

try {
  cert.postgres = fs.readFileSync(`${__dirname}/certs/postgres-ca-cert.crt`).toString();
  cert.firebase = fs.readFileSync(`${__dirname}/certs/simple-comercio-firebase-admin.json`).toString();
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('Must provide Postgres and Firebase certificates or some features may not work');
}

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) 
  throw new Error(`Config validation error: ${error.message}`);

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  rabbitmq: envVars.RABBITMQ,
  api_base_url: envVars.API_BASE_URL,
  database: {
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    user: envVars.DB_USER,
    database: envVars.NODE_ENV === 'test' ? envVars.DB_NAME_TEST : envVars.DB_NAME,
    password: envVars.DB_PASSWORD,
    dialect: 'postgres',
    define: {
        // prevent sequelize from pluralizing table names
        freezeTableName: true
    },
    dialectOptions:
      envVars.NODE_ENV !== 'production'
        ? {
            ssl: envVars.DB_ENABLE_SSL === 'true' && {  // This option is for connecting to database through Sequelize
              require: true,
              rejectUnauthorized: false
            },
          }
        : {
            ssl: {
              rejectUnauthorized: true,
              ca: cert.postgres,
            },
          },
    minifyAliases: true,
    ssl: envVars.DB_ENABLE_SSL === 'true' ? { // This option is for connecting to database through PG Client
        rejectUnauthorized: false,
     } : false
  },
  cert
};
