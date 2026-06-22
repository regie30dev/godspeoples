import multer from 'multer';

import config from '../config/env.js';
import ApiError from '../utils/ApiError.js';

/**
 * Multer upload middleware.
 * Uses in-memory storage so the file buffer can be written straight to the DB.
 * Restricts uploads to the configured image MIME types and size limit.
 */
const fileFilter = (_req, file, cb) => {
  if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new ApiError(400, 'Unsupported file type. Only JPG and PNG images are allowed.'));
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: config.upload.maxFileSizeBytes },
});

export default upload;
