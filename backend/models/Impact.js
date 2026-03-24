const mongoose = require('mongoose');

const impactSchema = new mongoose.Schema({
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
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true
  },
  studentsImpacted: {
    type: Number,
    default: 0
  },
  itemsDelivered: {
    type: Number,
    default: 0
  },
  beforeImage: {
    type: String
  },
  afterImage: {
    type: String
  },
  testimonial: {
    type: String
  },
  impactDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Impact', impactSchema);