/* eslint-disable global-require */
const path = require('path');

const addRequireWrapperToGlobal = () => {
    global.requireFromRoot = (
        (root) => (resource) =>
            require(`${root}/${resource}`)
    )(path.resolve(__dirname, '../'));
};

module.exports = addRequireWrapperToGlobal;
