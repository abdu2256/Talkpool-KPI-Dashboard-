/**
 * CLI entry — node src/index.js
 */
const { startServer } = require('./server');

startServer().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
