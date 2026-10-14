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
    resourceCategory: {
      type: String,
      default: 'General'
    },
    resourceImageUrl: {
      type: String,
      default: ''
    },
    requesterId: {
      type: String,
      required: [true, 'Requester ID is required'],
      index: true
    },
    requesterName: {
      type: String,
      required: [true, 'Requester name is required']
    },
    requesterEmail: {
      type: String,
      required: [true, 'Requester email is required']
    },
    requesterCollege: {
      type: String,
      default: 'Apex Engineering Institute'
    },
    requesterDepartment: {
      type: String,
      default: 'Computer Science and Engineering'
    },
    ownerId: {
      type: String,
      required: [true, 'Resource owner ID is required'],
      index: true
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required']
    },
    ownerEmail: {
      type: String,
      required: [true, 'Owner email is required']
    },
    requestMessage: {
      type: String,
      required: [true, 'Please provide a clear request message explaining your requirement'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    requestType: {
      type: String,
      required: [true, 'Request type is required'],
      enum: {
        values: ['Lend', 'Exchange', 'Donate', 'Give Away'],
        message: '{VALUE} is not a valid request type'
      }
    },
    exchangeItemOffered: {
      type: String,
      trim: true,
      default: ''
    },
    durationRequested: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed'],
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
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound indexes for fast sent/received queries
exchangeSchema.index({ requesterId: 1, status: 1 });
exchangeSchema.index({ ownerId: 1, status: 1 });
exchangeSchema.index({ resourceId: 1, requesterId: 1, status: 1 });

module.exports = mongoose.model('Exchange', exchangeSchema);
