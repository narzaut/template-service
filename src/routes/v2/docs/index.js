const swaggerUi = require('swagger-ui-express');
const router = require('express').Router();
const YAML = require('yamljs');

const swaggerDocument = YAML.load(`${__dirname}/../../../docs/openapi.yaml`);

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument));

module.exports = router;
