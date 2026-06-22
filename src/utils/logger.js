/**
 * Minimal, dependency-free logger.
 * Swap the internals for a structured logger (pino/winston) later without
 * touching call sites.
 */

const timestamp = () => new Date().toISOString();

const logger = {
  info: (message, ...meta) => console.log(`[${timestamp()}] INFO  ${message}`, ...meta),
  warn: (message, ...meta) => console.warn(`[${timestamp()}] WARN  ${message}`, ...meta),
  error: (message, ...meta) => console.error(`[${timestamp()}] ERROR ${message}`, ...meta),
};

export default logger;
