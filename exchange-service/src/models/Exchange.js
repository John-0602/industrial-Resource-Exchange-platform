const mongoose = require('mongoose');

const exchangeSchema = new mongoose.Schema(
  {
    resourceId: {
      type: String,
      required: [true, 'Resource ID is required'],
      index: true
    },
    resourceTitle: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true
    },
    materialCategory: {
      type: String,
      required: true
    },
    supplierCompanyId: {
      type: String,
      required: [true, 'Supplier Company ID is required'],
      index: true
    },
    supplierCompanyName: {
      type: String,
      required: true
    },
    supplierEmail: {
      type: String,
      required: true
    },
    receiverCompanyId: {
      type: String,
      required: [true, 'Receiver Company ID is required'],
      index: true
    },
    receiverCompanyName: {
      type: String,
      required: true
    },
    receiverEmail: {
      type: String,
      required: true
    },
    requestedQuantity: {
      type: Number,
      required: [true, 'Requested quantity is required'],
      min: [0.1, 'Quantity must be positive']
    },
    unit: {
      type: String,
      required: true
    },
    proposedPricePerUnit: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    totalProposedAmount: {
      type: Number,
      default: 0
    },
    proposalMessage: {
      type: String,
      required: [true, 'Please provide proposal details or processing requirements'],
      trim: true
    },
    deliveryTerms: {
      type: String,
      default: 'Ex-Works pickup arranged by receiver facility',
      trim: true
    },
    complianceAck: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'Under Negotiation',
        'Accepted',
        'Rejected',
        'Cancelled',
        'In Transfer',
        'Completed'
      ],
      default: 'Pending',
      index: true
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: String, default: 'System' },
        note: { type: String, default: '' }
      }
    ],
    negotiationNotes: [
      {
        senderId: { type: String, required: true },
        senderName: { type: String, required: true },
        message: { type: String, required: true },
        proposedPrice: { type: Number },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    transferTracking: {
      trackingRef: { type: String, default: '' },
      carrierName: { type: String, default: '' },
      dispatchDate: { type: Date },
      expectedDeliveryDate: { type: Date },
      actualDeliveryDate: { type: Date },
      transferNotes: { type: String, default: '' }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

exchangeSchema.index({ receiverCompanyId: 1, status: 1 });
exchangeSchema.index({ supplierCompanyId: 1, status: 1 });
exchangeSchema.index({ resourceId: 1, receiverCompanyId: 1 });

module.exports = mongoose.model('Exchange', exchangeSchema);
