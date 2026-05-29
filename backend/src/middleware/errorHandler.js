/**
 * ============================================
 * Global Error Handler Middleware
 * ============================================
 * Centralized error handling for the application
 */

// Handle 404 - Route Not Found
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global Error Handler
const errorHandler = (err, req, res, next) => {
  // Default to 500 if status code is 200 (unset)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  console.error(`❌ Error: ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
