const express = require('express');
const router = express.Router();
const {
  registerCompany,
  loginCompany,
  getMe,
  getCompaniesForAdmin,
  verifyCompany
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, registerCompany);
router.post('/login', authLimiter, loginCompany);
router.get('/me', protect, getMe);

// Admin review endpoints
router.get('/admin/companies', protect, adminOnly, getCompaniesForAdmin);
router.patch('/admin/companies/:id/verify', protect, adminOnly, verifyCompany);

module.exports = router;
