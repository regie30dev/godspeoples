import sequelize from '../config/database.js';
import Image from './image.model.js';

/**
 * Central registry for all models. Import models from here so associations and
 * future additions live in one place.
 */
const models = { Image };

/**
 * Synchronizes models with the database schema. Intended for development;
 * production should use migrations instead.
 */
export const syncModels = async (options = {}) => {
  await sequelize.sync(options);
};

export { sequelize, Image };
export default models;
