const mongoose = require('mongoose');

const needItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  urgency: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  category: { type: String },
  fulfilled: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'fulfilled', 'partial'], default: 'pending' }
});

const schoolSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  schoolName: {
    type: String,
    required: [true, 'School name is required'],
    trim: true
  },
  schoolType: {
    type: String,
    enum: ['private', 'government', 'semi-government'],
    required: true
  },
  establishmentYear: {
    type: Number,
    required: true
  },
  principalName: {
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
    pincode: { type: String, default: '' },
    location: { type: String, default: '' }
  },
  studentCount: {
    type: Number,
    default: 0
  },
  teacherCount: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  needs: [needItemSchema],
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  verifiedAt: Date,
  rejectionReason: String,
  images: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('School', schoolSchema);