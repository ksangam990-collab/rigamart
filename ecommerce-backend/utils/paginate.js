/**
 * Pagination helper for Mongoose queries
 * @param {object} query - Express req.query object
 * @param {number} defaultLimit - default items per page (default: 12)
 * @returns {object} { page, limit, skip, getPaginationMeta }
 */
const getPagination = (query, defaultLimit = 12) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;

  const getPaginationMeta = (totalCount) => {
    const totalPages = Math.ceil(totalCount / limit) || 1;
    return {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  };

  return {
    page,
    limit,
    skip,
    getPaginationMeta
  };
};

module.exports = {
  getPagination
};
