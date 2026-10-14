const express = require('express');
const router = express.Router();
const {
  registerStudent,
  loginStudent,
  getMe,
  getStudentProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, registerStudent);
router.post('/login', authLimiter, loginStudent);
router.get('/me', protect, getMe);
router.get('/profile/:id', getStudentProfile);

module.exports = router;
