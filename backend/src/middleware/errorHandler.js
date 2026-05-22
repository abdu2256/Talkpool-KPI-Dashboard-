/**
 * Global Express error handler
 */
const multer = require('multer');

function errorHandler(err, _req, res, _next) {
  console.error('API Error:', err.message);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 10 MB.',
    });
  }

  if (err.message && err.message.includes('Only CSV')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
