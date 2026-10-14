const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide company name'],
      trim: true,
      maxlength: [150, 'Company name cannot exceed 150 characters']
    },
    registrationRef: {
      type: String,
      required: [true, 'Please provide business registration reference (GST/CIN/Tax ID)'],
      trim: true
    },
    industrySector: {
      type: String,
      required: [true, 'Please select industry sector'],
      enum: [
        'Textiles & Apparel',
        'Metal Fabrication & Foundry',
        'Chemicals & Polymers',
        'Woodwork & Furniture',
        'Paper & Packaging',
        'Construction & Building Materials',
        'Agriculture & Food Processing',
        'Electronics & Electrical',
        'Automotive & Heavy Engineering',
        'Recycling & Waste Management',
        'Other'
      ]
    },
    contactPerson: {
      type: String,
      required: [true, 'Please provide contact person name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide official business email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    phone: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      required: [true, 'Please provide registered facility address'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'Please provide state'],
      trim: true
    },
    country: {
      type: String,
      default: 'India',
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    companyRole: {
      type: String,
      enum: ['supplier', 'receiver', 'both'],
      default: 'both'
    },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending'
    },
    role: {
      type: String,
      enum: ['company', 'admin'],
      default: 'company'
    }
  },
  {
    timestamps: true
  }
);

companySchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

companySchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Company', companySchema);
