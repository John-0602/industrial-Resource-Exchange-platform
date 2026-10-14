const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      collegeName: user.collegeName,
      department: user.department
    },
    process.env.JWT_SECRET || 'super_secret_jwt_key_for_resource_service_college_2025',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password, collegeName, department, profileImage } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const emailNormalized = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: emailNormalized });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A student account with this email address already exists'
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: emailNormalized,
      password,
      collegeName: collegeName ? collegeName.trim() : 'Apex Engineering Institute',
      department: department ? department.trim() : 'Computer Science and Engineering',
      profileImage: profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          collegeName: user.collegeName,
          department: user.department,
          profileImage: user.profileImage,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate student & get token
// @route   POST /api/auth/login
// @access  Public
const loginStudent = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const emailNormalized = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailNormalized }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: No account associated with this email'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: Password entered is incorrect'
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          collegeName: user.collegeName,
          department: user.department,
          profileImage: user.profileImage,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in student profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student profile by ID
// @route   GET /api/auth/profile/:id
// @access  Public
const getStudentProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerStudent,
  loginStudent,
  getMe,
  getStudentProfile
};
