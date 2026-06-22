import config from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * Central error handler. Must be registered last (4-arg signature is required
 * for Express to treat it as error middleware).
 */
/**
 * Maps known third-party/library errors to client-friendly HTTP statuses so
 * they don't surface as opaque 500s.
 */
const normalizeError = (err) => {
  // Multer file-upload errors (e.g. file too large, unexpected field).
  if (err.name === 'MulterError') {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Uploaded file exceeds the maximum allowed size.'
        : `File upload error: ${err.message}`;
    return { statusCode: 400, message };
  }

  // Sequelize validation / constraint violations.
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const message = err.errors?.map((e) => e.message).join('; ') || 'Validation error.';
    return { statusCode: 400, message };
  }

  return { statusCode: err.statusCode ?? 500, message: err.message };
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  const { statusCode, message } = normalizeError(err);
  const isServerError = statusCode >= 500;

  if (isServerError) {
    logger.error(`${req.method} ${req.originalUrl} -> ${statusCode}`, err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: isServerError && config.isProduction ? 'Internal Server Error' : message,
      ...(config.isProduction ? {} : { stack: err.stack }),
    },
  });
};

export default errorHandler;
