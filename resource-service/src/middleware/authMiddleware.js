const jwt = require('jsonwebtoken');
const Company = require('../models/Company');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_jwt_key_for_irep_platform_2025'
      );

      const company = await Company.findById(decoded.id).select('-password');
      if (!company) {
        return res.status(401).json({
          success: false,
          message: 'Company account not found or access revoked'
        });
      }

      req.company = company;
      req.user = company; // Compatibility
      next();
    } catch (error) {
      console.error('[Resource Service Auth] Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized: token is invalid or has expired'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: access token missing from authorization header'
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.company && req.company.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Forbidden: Platform Administrator privileges required'
  });
};

module.exports = { protect, adminOnly };
