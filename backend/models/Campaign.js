const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  organizationName: {
    type: String,
    required: [true, 'Organization name is required']
  },
  organizationType: {
    type: String,
    enum: ['ngo', 'trust', 'foundation', 'society', 'other'],
    required: true
  },
  registrationNumber: {
    type: String,
    default: ''
  },
  establishedYear: {
    type: Number
  },
  contactPerson: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' }
  },
  description: {
    type: String,
    default: ''
  },
  focusAreas: [{
    type: String
  }],
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  logo: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Campaign', campaignSchema);