const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
        process.env.JWT_SECRET || 'super_secret_jwt_key_for_resource_service_college_2025'
      );

      // Verify user still exists
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Student account not found or has been removed'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('[Resource Service Auth] Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token is invalid or has expired'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, access token missing from header'
    });
  }
};

module.exports = { protect };
