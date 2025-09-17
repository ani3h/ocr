// Global error handling middleware.
const errorHandler = (error, req, res, next) => {
  // Log the error for debugging.
  // Using error.stack provides more context than just error.message.
  console.error(error.stack);

  // Determine the status code.
  // Use the status code from the error if it exists (for our custom errors), otherwise default to 500 (Internal Server Error).
  const statusCode = error.statusCode || 500;

  // Create a standardized error response.
  const response = {
    success: false,
    message: error.message || 'An unexpected internal server error occurred.',
  };

  // For security, do not expose detailed error messages in production. Only override the generic message if we are in development mode.
  if (statusCode === 500 && process.env.NODE_ENV !== 'development') {
    response.message = 'Internal Server Error';
  }

  // Send the response.
  res.status(statusCode).json(response);
};

module.exports = errorHandler;