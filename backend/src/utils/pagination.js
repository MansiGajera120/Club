/**
 * Normalize raw page/limit input into safe integers with sane bounds.
 *
 * @param {{ page?: number|string, limit?: number|string }} [query]
 * @param {{ defaultLimit?: number, maxLimit?: number }} [opts]
 * @returns {{ page: number, limit: number, skip: number }}
 */
export const getPagination = (query = {}, opts = {}) => {
  const { defaultLimit = 20, maxLimit = 100 } = opts;
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  return { page, limit, skip: (page - 1) * limit };
};

/**
 * Build the standard pagination meta object returned alongside list responses.
 *
 * @param {{ total: number, page: number, limit: number }} params
 * @returns {{ page: number, limit: number, total: number, totalPages: number }}
 */
export const buildPaginationMeta = ({ total, page, limit }) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});
