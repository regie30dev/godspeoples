import createApp from './app.js';
import config from './config/env.js';
import logger from './utils/logger.js';
import sequelize, { connectDatabase } from './config/database.js';
import { syncModels } from './models/index.js';

const app = createApp();

/**
 * Boots the application: establish the DB connection (and optionally sync the
 * schema) BEFORE accepting traffic, then start listening. Any failure here is
 * fatal — the process exits so an orchestrator can restart it cleanly.
 */
const startServer = async () => {
  await connectDatabase();

  if (config.db.sync) {
    await syncModels({ alter: !config.isProduction });
    logger.info('Database models synchronized.');
  }

  const server = app.listen(config.port, () => {
    logger.info(`Server running in ${config.env} mode on http://localhost:${config.port}`);
    logger.info(`Health check: http://localhost:${config.port}${config.apiPrefix}/health`);
  });

  // Graceful shutdown — drain HTTP, then close the DB pool.
  const shutdown = (signal) => {
    logger.warn(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      try {
        await sequelize.close();
        logger.info('Database connection closed.');
      } catch (error) {
        logger.error('Error while closing the database connection.', error);
      }
      process.exit(0);
    });
  };

  ['SIGINT', 'SIGTERM'].forEach((signal) => process.on(signal, () => shutdown(signal)));
};

// Fail fast on unexpected programmer errors — log and exit so an orchestrator
// can restart from a known-good state.
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

startServer().catch((error) => {
  logger.error('Failed to start the server.', error);
  process.exit(1);
});
