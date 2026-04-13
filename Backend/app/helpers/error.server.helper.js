const getErrorMessage = (err) => {
  let message = 'Unknown server error';

  if (!err) {
    return message;
  }

  /**
   * Custom thrown Error (from resolvers or helpers)
   */
  if (err.message && err.name !== 'ValidationError') {
    message = err.message;
  }

  /**
   * Mongoose validation errors
   */
  if (err.name === 'ValidationError' && err.errors) {
    const messages = Object.values(err.errors)
      .map((value) => value.message)
      .filter(Boolean);

    if (messages.length > 0) {
      message = messages.join(', ');
    }
  }

  /**
   * MongoDB duplicate key error
   */
  if (err.code === 11000) {
    if (
      err.keyPattern &&
      err.keyPattern.name &&
      err.keyPattern.game &&
      err.keyPattern.date &&
      err.keyPattern.status
    ) {
      message =
        'A tournament with the same name, game, date, and status already exists.';
    } else if (err.keyPattern) {
      const duplicateField = Object.keys(err.keyPattern)[0];
      message = `${duplicateField} already exists`;
    } else {
      message = 'Duplicate value already exists';
    }
  }

  /**
   * Invalid MongoDB ObjectId
   */
  if (err.name === 'CastError') {
    message = `Invalid ${err.path}`;
  }

  /**
   * JWT errors
   */
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Authentication token has expired';
  }

  /**
   * Prevent leaking internal DB errors
   */
  if (
    typeof message === 'string' &&
    message.toLowerCase().includes('mongo')
  ) {
    message = 'Database error occurred';
  }

  return message;
};

module.exports = {
  getErrorMessage
};