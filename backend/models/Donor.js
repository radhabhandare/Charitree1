const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' }
  },
  occupation: {
    type: String,
    default: ''
  },
  interests: [{
    type: String
  }],
  bio: {
    type: String,
    default: ''
  },
  avatar: {
    type: String
  },
  totalDonations: {
    type: Number,
    default: 0
  },
  totalItems: {
    type: Number,
    default: 0
  },
  schoolsSupported: {
    type: Number,
    default: 0
  },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    donationUpdates: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Donor', donorSchema);