import ApiError from '../utils/ApiError.js';

/**
 * Catch-all for unmatched routes. Forwards a 404 to the error handler so all
 * error responses share one shape.
 */
const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export default notFound;
