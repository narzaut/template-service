const httpStatus = require('http-status');

const ApiError = requireFromRoot('utils/ApiError');

const eagerLoader = (childs, queries) => {
    try {
        queries = JSON.parse(queries);
    } catch (err) {
        // Does nothing because if it cant parse, it's because it doesn't need to
    }

    try {
        const include = [];
        queries.forEach((query) => {
            if (!childs.map((child) => child.as).includes(query.child))
                throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    `Child ${query.child} Not Found`
                );
            const child = {
                ...childs[
                    childs.map((element) => element.as).indexOf(query.child)
                ]
            };
            if (query.where) child.where = { ...query.where, ...child.where };
            if (query.subchilds?.length > 0)
                child.include = eagerLoader(childs, query.subchilds);
            if (child) include.push(child);
        });
        return include;
    } catch (err) {
        throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
};

module.exports = {
    eagerLoader
};
