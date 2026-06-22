/**
 * Operational error carrying an HTTP status code.
 * Throw these from controllers/services; the central error handler turns them
 * into clean JSON responses.
 */
export default class ApiError extends Error {
  constructor(statusCode, message, { isOperational = true } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}
