require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB } = require('./src/config/db');
const { errorHandler } = require('./src/middleware/errorHandler');

// Route imports
const exchangeRoutes = require('./src/routes/exchangeRoutes');
const healthRoutes = require('./src/routes/healthRoutes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Mount routes
app.use('/', healthRoutes);
app.use('/api', healthRoutes);
app.use('/api/exchanges', exchangeRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Exchange Service: Endpoint ${req.method} ${req.originalUrl} not found`
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5002;

let server;
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    server = app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🔄 Exchange Service running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/health`);
      console.log(`🤝 Exchanges API: http://localhost:${PORT}/api/exchanges`);
      console.log(`🔗 Resource Service Target: ${process.env.RESOURCE_SERVICE_URL || 'http://localhost:5001'}`);
      console.log(`=========================================`);
    });
  }).catch((err) => {
    console.error('Failed to initialize Exchange Service database on startup:', err);
  });
}

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down Exchange Service gracefully...');
  if (server) {
    server.close(() => console.log('Exchange Service process terminated.'));
  }
});

module.exports = app;
