import ApiError from '../utils/ApiError.js';
import imageService from '../services/image.service.js';

/**
 * Image controller — orchestrates request validation and delegates persistence
 * to the image service. Keeps no business logic beyond request/response shaping.
 */

/**
 * POST / — upload a new image (multipart/form-data).
 * Expects file field `image` and body fields `name`, optional `description`/`date`.
 */
const uploadImage = async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'An image file is required (form field name: "image").');
  }

  const { name, description, date } = req.body;
  if (!name || name.trim() === '') {
    throw new ApiError(400, 'The "name" field is required.');
  }

  const created = await imageService.createImage({
    name: name.trim(),
    description,
    buffer: req.file.buffer,
    mimeType: req.file.mimetype,
    size: req.file.size,
    date,
  });

  res.status(201).json({ success: true, data: created.toMetadata() });
};

/**
 * GET / — list images (with binary payload), paginated.
 * Query params: `page` (1-based) and `limit` (items per page, max 100).
 */
const listImages = async (req, res) => {
  const { page, limit } = req.query;
  const { data, pagination } = await imageService.listImages({ page, limit });
  res.status(200).json({ success: true, data, pagination });
};

/**
 * GET /:id — fetch a single image's metadata.
 */
const getImage = async (req, res) => {
  const image = await imageService.getImageById(req.params.id);
  if (!image) {
    throw new ApiError(404, 'Image not found.');
  }
  res.status(200).json({ success: true, data: image.toMetadata() });
};

/**
 * GET /:id/raw — stream the raw image bytes with the correct content type.
 */
const serveImage = async (req, res) => {
  const image = await imageService.getImageById(req.params.id);
  if (!image) {
    throw new ApiError(404, 'Image not found.');
  }
  res.set('Content-Type', image.mimeType);
  res.set('Content-Length', String(image.size));
  // Image bytes are immutable for a given id — let browsers cache aggressively.
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.set('ETag', `"${image.id}-${image.updatedAt.getTime()}"`);
  res.send(image.image);
};

/**
 * DELETE /:id — remove an image.
 */
const deleteImage = async (req, res) => {
  const removed = await imageService.deleteImage(req.params.id);
  if (!removed) {
    throw new ApiError(404, 'Image not found.');
  }
  res.status(204).send();
};

export default { uploadImage, listImages, getImage, serveImage, deleteImage };
