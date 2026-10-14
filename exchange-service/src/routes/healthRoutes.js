const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.status(200).json({
    service: 'exchange-service',
    status: 'OK',
    dbStatus,
    resourceServiceTarget: process.env.RESOURCE_SERVICE_URL || 'http://localhost:5001',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;
