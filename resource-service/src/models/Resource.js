const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide resource title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide material description and origin process'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters']
    },
    materialCategory: {
      type: String,
      required: [true, 'Please specify industrial material category'],
      enum: {
        values: [
          'Textile and fabric waste',
          'Metal scraps',
          'Plastic waste and reusable polymers',
          'Paper and cardboard',
          'Wood scraps and sawdust',
          'Agricultural by-products',
          'Construction and demolition materials',
          'Reusable industrial packaging',
          'Surplus raw materials',
          'Other recoverable industrial by-products'
        ],
        message: '{VALUE} is not a valid industrial category'
      }
    },
    resourceType: {
      type: String,
      required: [true, 'Please specify resource type'],
      enum: {
        values: [
          'By-product',
          'Scrap',
          'Surplus',
          'Reusable Material',
          'Recyclable Material'
        ],
        message: '{VALUE} is not a valid resource type'
      }
    },
    condition: {
      type: String,
      required: [true, 'Please specify material condition or grade'],
      trim: true
    },
    chemicalComposition: {
      type: String,
      default: '',
      trim: true
    },
    totalQuantity: {
      type: Number,
      required: [true, 'Please specify total quantity listed'],
      min: [0.1, 'Quantity must be positive']
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: [0, 'Available quantity cannot be negative']
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Reserved quantity cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Please specify measurement unit'],
      enum: ['kg', 'tonnes', 'litres', 'units', 'bales', 'drums']
    },
    minOrderQuantity: {
      type: Number,
      default: 1,
      min: [0.1, 'Minimum order quantity must be greater than 0']
    },
    indicativePrice: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    intendedUse: {
      type: String,
      default: '',
      trim: true
    },
    handlingStorageInfo: {
      type: String,
      required: [true, 'Please specify handling, storage, and safety instructions'],
      trim: true
    },
    complianceInfo: {
      type: String,
      default: 'Compliant with State Pollution Control Board guidelines',
      trim: true
    },
    pickupLocation: {
      facilityName: { type: String, default: '' },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, default: 'India' },
      pincode: { type: String, default: '' }
    },
    supplier: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'Supplier company ID is required']
      },
      name: {
        type: String,
        required: [true, 'Supplier company name is required']
      },
      registrationRef: {
        type: String,
        default: ''
      },
      email: {
        type: String,
        required: [true, 'Supplier contact email is required']
      },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      verificationStatus: { type: String, default: 'Pending' }
    },
    imageUrl: {
      type: String,
      default: ''
    },
    documentationUrl: {
      type: String,
      default: ''
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'partially_reserved', 'reserved', 'transferred', 'withdrawn'],
      default: 'available'
    },
    moderationStatus: {
      type: String,
      enum: ['Approved', 'Under Review', 'Flagged', 'Rejected'],
      default: 'Approved'
    },
    expiryDate: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual properties for backward compatibility with frontend schemas
resourceSchema.virtual('category').get(function () {
  return this.materialCategory;
});
resourceSchema.virtual('materialCondition').get(function () {
  return this.condition;
});
resourceSchema.virtual('pricePerUnit').get(function () {
  return this.indicativePrice;
});
resourceSchema.virtual('composition').get(function () {
  return this.chemicalComposition;
});
resourceSchema.virtual('safetyHandling').get(function () {
  return this.handlingStorageInfo;
});
resourceSchema.virtual('supplierCompanyId').get(function () {
  return this.supplier?.id;
});
resourceSchema.virtual('supplierCompanyName').get(function () {
  return this.supplier?.name;
});
resourceSchema.virtual('supplierCompanyDisplayName').get(function () {
  return this.supplier?.name;
});
resourceSchema.virtual('supplierVerificationStatus').get(function () {
  return this.supplier?.verificationStatus || 'Verified';
});
resourceSchema.virtual('compliance').get(function () {
  const isHazardous = /hazardous|danger|flammable|toxic|chemical waste/i.test(this.complianceInfo || '');
  return {
    hazardousMaterial: isHazardous,
    pcbCategory: this.complianceInfo || 'Compliant with industrial standards',
    msdsUrl: this.documentationUrl || ''
  };
});

// High-performance search and matching indexes
resourceSchema.index({ title: 'text', description: 'text', chemicalComposition: 'text', intendedUse: 'text' });
resourceSchema.index({ materialCategory: 1, resourceType: 1, availabilityStatus: 1 });
resourceSchema.index({ 'supplier.id': 1 });
resourceSchema.index({ 'pickupLocation.city': 1, 'pickupLocation.state': 1 });
resourceSchema.index({ availableQuantity: 1, indicativePrice: 1 });

module.exports = mongoose.model('Resource', resourceSchema);

