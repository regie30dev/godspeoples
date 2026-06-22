import { Router } from 'express';

import imageController from '../controllers/image.controller.js';
import upload from '../middlewares/upload.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

// Upload a picture (JPG/PNG) — multipart/form-data, file field: "image".
router.post('/', upload.single('image'), asyncHandler(imageController.uploadImage));

// List all image metadata.
router.get('/', asyncHandler(imageController.listImages));

// Fetch a single image's metadata.
router.get('/:id', asyncHandler(imageController.getImage));

// Stream the raw image bytes.
router.get('/:id/raw', asyncHandler(imageController.serveImage));

// Delete an image.
router.delete('/:id', asyncHandler(imageController.deleteImage));

export default router;
