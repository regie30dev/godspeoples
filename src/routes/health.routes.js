import { Router } from 'express';

import healthController from '../controllers/health.controller.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

// Liveness check — confirms the server is up and running.
router.get('/', asyncHandler(healthController.getHealth));

export default router;
