const express = require('express');

const docsRoute = requireFromRoot('routes/v2/docs');
const healthcheckRoute = requireFromRoot('routes/v2/healthcheck');
const customerRoute = requireFromRoot('routes/v2/customer');
const { authenticate } = requireFromRoot('/middlewares/auth');

const router = express.Router();

const publicRoutes = [
    {
        path: '/healthcheck',
        route: healthcheckRoute
    },
    {
        path: '/docs',
        route: docsRoute
    }
];

const privateRoutes = [
    {
        path: '/customer',
        route: customerRoute
    }
];

publicRoutes.forEach((route) => router.use(route.path, route.route));
router.use(authenticate);
privateRoutes.forEach((route) => router.use(route.path, route.route));

module.exports = router;
