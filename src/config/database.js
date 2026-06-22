import { Sequelize } from 'sequelize';

import config from './env.js';
import logger from '../utils/logger.js';

/**
 * Single shared Sequelize instance for the application.
 * Credentials come exclusively from environment config (never hard-coded).
 * Creating the instance does NOT open a connection — that happens lazily or on
 * the explicit `connectDatabase()` call below.
 */
const commonOptions = {
  dialect: 'postgres',
  // Route Sequelize's SQL logging through our logger in dev; silence in prod.
  logging: config.isProduction ? false : (msg) => logger.info(`[sequelize] ${msg}`),
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

// Prefer a single DATABASE_URL connection string when provided; otherwise fall
// back to the discrete host/port/name/user/password settings.
const sequelize = config.db.url
  ? new Sequelize(config.db.url, commonOptions)
  : new Sequelize(config.db.name, config.db.user, config.db.password, {
      ...commonOptions,
      host: config.db.host,
      port: config.db.port,
    });

/**
 * Verifies connectivity. Throws on failure so the caller (server bootstrap)
 * can decide whether to retry or exit. Keeps connection concerns out of the
 * request lifecycle.
 */
export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database.', error);
    throw error;
  }
};

export default sequelize;
