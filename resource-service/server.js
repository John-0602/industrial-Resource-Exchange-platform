require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { connectDB } = require('./src/config/db');
const { errorHandler } = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const resourceRoutes = require('./src/routes/resourceRoutes');
const healthRoutes = require('./src/routes/healthRoutes');

const app = express();

// Security and utility middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Database connection auto-reconnect guard
app.use(async (req, res, next) => {
  if (req.path === '/health' || req.path === '/api/health') {
    return next();
  }
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      return res.status(503).json({
        success: false,
        message: 'Database is initializing, please retry in a moment.'
      });
    }
  }
  next();
});

// Mount API routes
app.use('/', healthRoutes);
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);

// Optional: Forward /api/exchanges to Exchange Service if configured
const getExchangeServiceUrl = () => {
  let url = (process.env.EXCHANGE_SERVICE_URL || 'http://localhost:5002').trim();
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url.replace(/\/+$/, '');
};

app.use('/api/exchanges', async (req, res, next) => {
  const exchangeBase = getExchangeServiceUrl();
  try {
    const targetUrl = `${exchangeBase}/api/exchanges${req.url === '/' ? '' : req.url}`;
    const headers = {
      'content-type': req.headers['content-type'] || 'application/json',
      'authorization': req.headers.authorization || '',
      'x-service-api-key': process.env.SERVICE_API_KEY || 'internal_shared_microservice_secret_token_college_2025'
    };

    const hasBody = !['GET', 'HEAD'].includes(req.method.toUpperCase());
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: hasBody ? JSON.stringify(req.body) : undefined
    });

    const data = await response.text();
    res.status(response.status);
    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('content-type', contentType);
    return res.send(data);
  } catch (proxyErr) {
    // If exchange service proxy fails, fall through to error handling
    return next(proxyErr);
  }
});

// Serve frontend static production bundle if available in public directory
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

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
  connectDB().then(async () => {
    try {
      const Company = require('./src/models/Company');
      const count = await Company.countDocuments();
      if (count === 0) {
        console.log('[Auto-Seed] Empty database detected. Seeding verified industrial demo data...');
        const { seedIndustrialData } = require('./src/scripts/seed');
        await seedIndustrialData();
      }
    } catch (seedErr) {
      console.warn('[Auto-Seed] Notice: Automatic seed skipped:', seedErr.message);
    }

    server = app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 Resource Service running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/health`);
      console.log(`📚 Resources API: http://localhost:${PORT}/api/resources`);
      console.log(`=========================================`);
    });
  }).catch((err) => {
    console.error('Failed to initialize database on startup:', err);
    // Still bind server so health check works and auto-reconnect middleware handles requests
    server = app.listen(PORT, () => {
      console.log(`🚀 Resource Service running on port ${PORT} (retrying DB in background)`);
    });
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
