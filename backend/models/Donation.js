const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  schoolName: {
    type: String,
    required: true
  },
  schoolLocation: {
    type: String,
    required: true
  },
  items: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    category: { type: String }
  }],
  totalItems: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  courier: {
    type: String
  },
  estimatedDelivery: {
    type: Date
  },
  actualDelivery: {
    type: Date
  },
  timeline: {
    pending: Date,
    accepted: Date,
    processing: Date,
    shipped: Date,
    delivered: Date,
    cancelled: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Generate tracking number before saving
donationSchema.pre('save', async function(next) {
  if (!this.trackingNumber && this.status === 'processing') {
    const prefix = 'CHAR';
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    this.trackingNumber = `${prefix}${random}`;
  }
  next();
});

module.exports = mongoose.model('Donation', donationSchema);