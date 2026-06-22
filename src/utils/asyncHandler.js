/**
 * Wraps an async route handler so rejected promises are forwarded to Express's
 * error middleware instead of crashing the process.
 *
 * Usage: router.get('/', asyncHandler(controller.method))
 */
const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export default asyncHandler;
