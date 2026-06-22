import sequelize from '../config/database.js';
import Image from './image.model.js';

/**
 * Model registry. Import models from here so associations and future additions
 * live in one place.
 */

/**
 * Synchronizes models with the database schema. Intended for development;
 * production should use migrations instead.
 */
export const syncModels = async (options = {}) => {
  await sequelize.sync(options);
};

export { Image };
