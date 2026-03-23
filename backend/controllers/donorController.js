const Donor = require('../models/Donor');
const User = require('../models/User');
const Donation = require('../models/Donation');

// @desc    Get donor profile
// @route   GET /api/donor/profile
// @access  Private (Donor)
const getProfile = async (req, res) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.id });
    const user = await User.findById(req.user.id).select('-password');

    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    res.json({
      fullName: donor.fullName,
      email: user.email,
      phoneNumber: donor.phoneNumber,
      address: donor.address,
      city: donor.address?.city,
      state: donor.address?.state,
      pincode: donor.address?.pincode,
      occupation: donor.occupation,
      interests: donor.interests,
      bio: donor.bio,
      avatar: donor.avatar,
      preferences: donor.preferences,
      totalDonations: donor.totalDonations,
      totalItems: donor.totalItems,
      schoolsSupported: donor.schoolsSupported
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update donor profile
// @route   PUT /api/donor/profile
// @access  Private (Donor)
const updateProfile = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      address,
      occupation,
      interests,
      bio,
      preferences
    } = req.body;

    const donor = await Donor.findOne({ userId: req.user.id });
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    if (fullName) donor.fullName = fullName;
    if (phoneNumber) donor.phoneNumber = phoneNumber;
    if (address) donor.address = address;
    if (occupation) donor.occupation = occupation;
    if (interests) donor.interests = interests;
    if (bio) donor.bio = bio;
    if (preferences) donor.preferences = { ...donor.preferences, ...preferences };

    await donor.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      donor
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get donor impact stats
// @route   GET /api/donor/impact
// @access  Private (Donor)
const getImpact = async (req, res) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.id });
    const donations = await Donation.find({ donorId: req.user.id });

    const uniqueSchools = [...new Set(donations.map(d => d.schoolId.toString()))];
    const categories = [];
    donations.forEach(donation => {
      donation.items.forEach(item => {
        if (item.category && !categories.includes(item.category)) {
          categories.push(item.category);
        }
      });
    });

    const studentsImpacted = uniqueSchools.length * 100;

    res.json({
      studentsImpacted,
      itemsDonated: donor?.totalItems || 0,
      categoriesSupported: categories
    });
  } catch (error) {
    console.error('Get impact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getImpact
};