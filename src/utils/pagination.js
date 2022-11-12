const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: results } = data;
    const currentPage = page ? +page : 1;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, results, totalPages, currentPage };
};

const getPagination = (page, size = 10) => {
    const limit = size ? +size : 10;
    const offset = page ? page * limit - size : 0;

    return { limit, offset };
};

module.exports = { getPagination, getPagingData };
