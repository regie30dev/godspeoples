/**
 * Centralized, validated access to environment configuration.
 * Read env vars here once and export a typed, frozen config object so the
 * rest of the codebase never touches `process.env` directly.
 */

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const env = process.env.NODE_ENV ?? 'development';

const config = Object.freeze({
  env,
  port: toInt(process.env.PORT, 4000),
  apiPrefix: process.env.API_PREFIX ?? '/api/v1',
  isProduction: env === 'production',

  // PostgreSQL connection settings (consumed by src/config/database.js).
  // A full DATABASE_URL takes precedence; otherwise the discrete parts are used.
  db: Object.freeze({
    url: process.env.DATABASE_URL ?? null,
    host: process.env.DB_HOST ?? 'localhost',
    port: toInt(process.env.DB_PORT, 5432),
    name: process.env.DB_NAME ?? 'be_god_peoples',
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    // When true, models are synchronized to the schema on boot (dev convenience).
    // Prefer migrations in production.
    sync: (process.env.DB_SYNC ?? 'false') === 'true',
  }),

  // File upload constraints (consumed by src/middlewares/upload.js)
  upload: Object.freeze({
    maxFileSizeBytes: toInt(process.env.MAX_FILE_SIZE_MB, 100) * 1024 * 1024,
    allowedMimeTypes: Object.freeze(['image/jpeg', 'image/png']),
  }),
});

export default config;
