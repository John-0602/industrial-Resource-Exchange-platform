require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB } = require('./src/config/db');
const { errorHandler } = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const resourceRoutes = require('./src/routes/resourceRoutes');
const healthRoutes = require('./src/routes/healthRoutes');

const app = express();

// Security and utility middleware
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
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource Service: Endpoint ${req.method} ${req.originalUrl} not found`
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

let server;
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    server = app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 Resource Service running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/health`);
      console.log(`📚 Resources API: http://localhost:${PORT}/api/resources`);
      console.log(`=========================================`);
    });
  }).catch((err) => {
    console.error('Failed to initialize database on startup:', err);
  });
}

// Graceful termination handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  if (server) {
    server.close(() => console.log('Resource Service process terminated.'));
  }
});

module.exports = app;
