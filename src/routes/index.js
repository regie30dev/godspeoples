import { Router } from 'express';

import healthRoutes from './health.routes.js';
import imageRoutes from './image.routes.js';

const router = Router();

/**
 * Aggregates feature route modules. Mount new resources here, e.g.:
 *   router.use('/users', userRoutes);
 */
router.use('/health', healthRoutes);
router.use('/images', imageRoutes);

export default router;
