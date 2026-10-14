const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      required: [true, 'Company ID is required'],
      index: true
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required']
    },
    contactEmail: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please provide material requirement title'],
      trim: true
    },
    materialCategory: {
      type: String,
      required: [true, 'Please specify required material category'],
      index: true
    },
    specifications: {
      type: String,
      required: [true, 'Please provide technical specifications or acceptable composition'],
      trim: true
    },
    requiredQuantity: {
      type: Number,
      required: [true, 'Please specify required quantity'],
      min: [0.1, 'Quantity must be positive']
    },
    unit: {
      type: String,
      required: [true, 'Please specify quantity unit'],
      enum: ['kg', 'tonnes', 'litres', 'units', 'bales', 'drums']
    },
    acceptableCondition: {
      type: String,
      required: [true, 'Please specify acceptable material condition or grade'],
      trim: true
    },
    deliveryLocation: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      address: { type: String, default: '' }
    },
    maxBudget: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    requiredByDate: {
      type: Date
    },
    additionalHandling: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Active', 'Fulfilled', 'Closed'],
      default: 'Active',
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

requirementSchema.index({ materialCategory: 1, status: 1 });
requirementSchema.index({ companyId: 1, status: 1 });

module.exports = mongoose.model('Requirement', requirementSchema);
