const jwt = require('jsonwebtoken');
const Company = require('../models/Company');

const generateToken = (company) => {
  return jwt.sign(
    {
      id: company._id,
      name: company.name,
      email: company.email,
      industrySector: company.industrySector,
      companyRole: company.companyRole,
      verificationStatus: company.verificationStatus,
      role: company.role
    },
    process.env.JWT_SECRET || 'super_secret_jwt_key_for_resource_service_college_2025',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new industrial company
// @route   POST /api/auth/register
// @access  Public
const registerCompany = async (req, res, next) => {
  try {
    const {
      name,
      registrationRef,
      industrySector,
      contactPerson,
      email,
      password,
      phone,
      address,
      city,
      state,
      country,
      description,
      companyRole
    } = req.body;

    if (!name || !email || !password || !industrySector || !address || !city || !state) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required company registration fields'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const emailNormalized = email.toLowerCase().trim();
    const existing = await Company.findOne({ email: emailNormalized });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A company account with this official email already exists'
      });
    }

    const company = await Company.create({
      name: name.trim(),
      registrationRef: registrationRef ? registrationRef.trim() : 'GSTIN-PENDING',
      industrySector,
      contactPerson: contactPerson ? contactPerson.trim() : 'Facility Manager',
      email: emailNormalized,
      password,
      phone: phone || '',
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country ? country.trim() : 'India',
      description: description ? description.trim() : '',
      companyRole: companyRole || 'both',
      verificationStatus: 'Pending',
      role: 'company'
    });

    const token = generateToken(company);

    res.status(201).json({
      success: true,
      message: 'Company registered successfully. Account verification is currently Pending.',
      data: {
        token,
        company: {
          id: company._id,
          name: company.name,
          registrationRef: company.registrationRef,
          email: company.email,
          industrySector: company.industrySector,
          contactPerson: company.contactPerson,
          address: company.address || '',
          city: company.city,
          state: company.state,
          country: company.country || 'India',
          phone: company.phone || '',
          description: company.description || '',
          companyRole: company.companyRole,
          verificationStatus: company.verificationStatus,
          role: company.role,
          createdAt: company.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate company & obtain JWT
// @route   POST /api/auth/login
// @access  Public
const loginCompany = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide corporate email and password'
      });
    }

    const emailNormalized = email.toLowerCase().trim();
    const company = await Company.findOne({ email: emailNormalized }).select('+password');

    if (!company) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: No company registered with this email'
      });
    }

    const isMatch = await company.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Incorrect password'
      });
    }

    const token = generateToken(company);

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        token,
        company: {
          id: company._id,
          name: company.name,
          registrationRef: company.registrationRef,
          email: company.email,
          industrySector: company.industrySector,
          contactPerson: company.contactPerson,
          address: company.address || '',
          city: company.city,
          state: company.state,
          country: company.country || 'India',
          phone: company.phone || '',
          description: company.description || '',
          companyRole: company.companyRole,
          verificationStatus: company.verificationStatus,
          role: company.role,
          createdAt: company.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current company profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const company = await Company.findById(req.company.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: List all companies for verification review
// @route   GET /api/admin/companies
// @access  Private (Admin)
const getCompaniesForAdmin = async (req, res, next) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update company verification status
// @route   PATCH /api/admin/companies/:id/verify
// @access  Private (Admin)
const verifyCompany = async (req, res, next) => {
  try {
    const { verificationStatus } = req.body;
    if (!['Pending', 'Verified', 'Rejected'].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Permitted: Pending, Verified, Rejected'
      });
    }

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    company.verificationStatus = verificationStatus;
    await company.save();

    res.json({
      success: true,
      message: `Company verification status updated to "${verificationStatus}"`,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerCompany,
  loginCompany,
  getMe,
  getCompaniesForAdmin,
  verifyCompany
};
