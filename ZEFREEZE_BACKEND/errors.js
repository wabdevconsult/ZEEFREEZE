class AppError extends Error {
  constructor(message, details = null, isOperational = true) {
    super(message);
    this.details = details;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details = null) {
    super(message, details);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Invalid request', details = null) {
    super(message, details);
    this.name = 'BadRequestError';
    this.statusCode = 400;
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details = null) {
    super(message, details);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details = null) {
    super(message, details);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = []) {
    super(message, { errors });
    this.name = 'ValidationError';
    this.statusCode = 422;
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests', details = null) {
    super(message, details);
    this.name = 'RateLimitError';
    this.statusCode = 429;
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', details = null) {
    super(message, details, false); // Not operational
    this.name = 'DatabaseError';
    this.statusCode = 500;
  }
}

module.exports = {
  AppError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  RateLimitError,
  DatabaseError
};