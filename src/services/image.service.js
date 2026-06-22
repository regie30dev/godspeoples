import { Image } from '../models/index.js';

/**
 * Data-access layer for images. Controllers call into here; this is the only
 * place that talks to the Image model directly.
 */

const createImage = ({ name, description, buffer, mimeType, size, date }) =>
  Image.create({
    name,
    description,
    image: buffer,
    mimeType,
    size,
    ...(date ? { date } : {}),
  });

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Lists image *metadata*, paginated. The heavy BYTEA payload is deliberately
 * excluded (not even selected from Postgres) so the list response stays small;
 * clients render each picture by requesting `GET /images/:id/raw`, which is
 * cacheable and streamed with the correct content type.
 *
 * @param {object} [options]
 * @param {number|string} [options.page=1]   1-based page number.
 * @param {number|string} [options.limit=20] Items per page (capped at 100).
 * @returns {Promise<{ data: object[], pagination: object }>}
 */
const listImages = async ({ page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = {}) => {
  const safePage = Math.max(DEFAULT_PAGE, Number.parseInt(page, 10) || DEFAULT_PAGE);
  const safeLimit = Math.min(MAX_LIMIT, Math.max(1, Number.parseInt(limit, 10) || DEFAULT_LIMIT));
  const offset = (safePage - 1) * safeLimit;

  const { count, rows } = await Image.findAndCountAll({
    attributes: { exclude: ['image'] }, // never ship the BYTEA in list responses
    order: [['createdAt', 'DESC']],
    limit: safeLimit,
    offset,
  });

  const data = rows.map((row) => row.toMetadata());

  const totalPages = Math.ceil(count / safeLimit) || 0;

  return {
    data,
    pagination: {
      total: count,
      page: safePage,
      limit: safeLimit,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
  };
};

const getImageById = (id) => Image.findByPk(id);

const deleteImage = async (id) => {
  const deletedCount = await Image.destroy({ where: { id } });
  return deletedCount > 0;
};

export default { createImage, listImages, getImageById, deleteImage };
