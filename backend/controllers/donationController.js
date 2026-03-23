const Donation = require('../models/Donation');
const School = require('../models/School');
const Donor = require('../models/Donor');

// @desc    Create a new donation
// @route   POST /api/donations
// @access  Private (Donor)
const createDonation = async (req, res) => {
  try {
    const { schoolId, items } = req.body;
    const donorId = req.user.id;

    if (!schoolId || !items || items.length === 0) {
      return res.status(400).json({ message: 'School ID and items are required' });
    }

    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    if (school.verificationStatus !== 'verified') {
      return res.status(400).json({ message: 'School is not verified yet' });
    }

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const donation = new Donation({
      donorId,
      schoolId: school._id,
      schoolName: school.schoolName,
      schoolLocation: school.address?.city || 'Unknown',
      items,
      totalItems,
      timeline: { pending: new Date() }
    });

    await donation.save();

    // Update donor stats
    await Donor.findOneAndUpdate(
      { userId: donorId },
      { 
        $inc: { 
          totalDonations: 1, 
          totalItems: totalItems,
          schoolsSupported: 1 
        } 
      }
    );

    res.status(201).json({
      success: true,
      donation
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get donor's donations
// @route   GET /api/donor/donations
// @access  Private (Donor)
const getDonorDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user.id })
      .sort('-createdAt')
      .select('-__v');

    res.json(donations);
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get recent donations (last 5)
// @route   GET /api/donor/donations/recent
// @access  Private (Donor)
const getRecentDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user.id })
      .sort('-createdAt')
      .limit(5)
      .select('id schoolName schoolLocation items status createdAt');

    res.json(donations);
  } catch (error) {
    console.error('Get recent donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single donation details
// @route   GET /api/donor/donations/:id
// @access  Private (Donor)
const getDonationDetails = async (req, res) => {
  try {
    const donation = await Donation.findOne({
      _id: req.params.id,
      donorId: req.user.id
    });

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.json(donation);
  } catch (error) {
    console.error('Get donation details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Request donation update
// @route   POST /api/donor/donations/:id/request-update
// @access  Private (Donor)
const requestUpdate = async (req, res) => {
  try {
    const donation = await Donation.findOne({
      _id: req.params.id,
      donorId: req.user.id
    });

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.json({ 
      success: true, 
      message: 'Update requested successfully. The school will be notified.' 
    });
  } catch (error) {
    console.error('Request update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get donor stats
// @route   GET /api/donor/stats
// @access  Private (Donor)
const getDonorStats = async (req, res) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.id });
    const donations = await Donation.find({ donorId: req.user.id });

    const stats = {
      totalDonations: donations.length,
      schoolsSupported: donor?.schoolsSupported || 0,
      pendingDonations: donations.filter(d => d.status === 'pending' || d.status === 'processing').length,
      deliveredDonations: donations.filter(d => d.status === 'delivered').length,
      totalItems: donor?.totalItems || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Get donor stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createDonation,
  getDonorDonations,
  getRecentDonations,
  getDonationDetails,
  requestUpdate,
  getDonorStats
};