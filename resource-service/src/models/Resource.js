const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide resource title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide detailed resource description'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
      type: String,
      required: [true, 'Please specify resource category'],
      enum: {
        values: [
          'Textbooks',
          'Notes & Study Materials',
          'Lab Equipment',
          'Stationery',
          'Calculators & Tools',
          'Electronics & Hardware',
          'Other'
        ],
        message: '{VALUE} is not a valid category'
      }
    },
    listingType: {
      type: String,
      required: [true, 'Please specify listing type'],
      enum: {
        values: ['Lend', 'Exchange', 'Donate', 'Give Away'],
        message: '{VALUE} is not a valid listing type'
      }
    },
    condition: {
      type: String,
      required: [true, 'Please specify resource condition'],
      enum: {
        values: ['New', 'Like New', 'Good', 'Fair'],
        message: '{VALUE} is not a valid condition'
      }
    },
    owner: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Owner ID is required']
      },
      name: {
        type: String,
        required: [true, 'Owner name is required']
      },
      email: {
        type: String,
        required: [true, 'Owner email is required']
      },
      collegeName: {
        type: String,
        default: 'Apex Engineering Institute'
      },
      department: {
        type: String,
        default: 'Computer Science and Engineering'
      }
    },
    imageUrl: {
      type: String,
      default: ''
    },
    exchangePreference: {
      type: String,
      trim: true,
      default: ''
    },
    lendingDuration: {
      type: String,
      trim: true,
      default: ''
    },
    location: {
      type: String,
      required: [true, 'Please specify campus location or pickup point'],
      trim: true
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'reserved', 'exchanged', 'unavailable'],
      default: 'available'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for high performance querying and searching
resourceSchema.index({ title: 'text', description: 'text' });
resourceSchema.index({ category: 1, listingType: 1, availabilityStatus: 1 });
resourceSchema.index({ 'owner.id': 1 });

module.exports = mongoose.model('Resource', resourceSchema);
