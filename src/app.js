import express from 'express';

import config from './config/env.js';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import notFound from './middlewares/notFound.js';

/**
 * Builds and configures the Express application.
 * Kept separate from server bootstrap so it can be imported in tests.
 */
const createApp = () => {
  const app = express();

  // Core middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Mount versioned API routes
  app.use(config.apiPrefix, routes);

  // 404 + centralized error handling (must be registered last)
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export default createApp;
