const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyServiceOrUser = async (req, res, next) => {
  const serviceKey = req.headers['x-service-api-key'];
  const expectedKey = process.env.SERVICE_API_KEY || 'internal_shared_microservice_secret_token_college_2025';

  // 1. Allow trusted microservice call
  if (serviceKey && serviceKey === expectedKey) {
    req.isServiceCall = true;
    return next();
  }

  // 2. Otherwise fall back to user JWT auth
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_jwt_key_for_resource_service_college_2025'
      );
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
        return next();
      }
    } catch (err) {
      // Pass through to unauthorized below
    }
  }

  return res.status(403).json({
    success: false,
    message: 'Access forbidden: valid service API key or authorized user session required'
  });
};

module.exports = { verifyServiceOrUser };
