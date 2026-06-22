/**
 * Operational error carrying an HTTP status code.
 * Throw these from controllers/services; the central error handler turns them
 * into clean JSON responses.
 */
export default class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
