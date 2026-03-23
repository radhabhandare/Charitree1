const School = require('../models/School');

// @desc    Get all verified schools
// @route   GET /api/schools/verified
// @access  Private (Donor, Campaign)
const getVerifiedSchools = async (req, res) => {
  try {
    const schools = await School.find({ verificationStatus: 'verified' })
      .select('-__v')
      .sort('-createdAt');

    res.json(schools);
  } catch (error) {
    console.error('Get verified schools error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single school details
// @route   GET /api/schools/:id
// @access  Private (Donor, Campaign, School)
const getSchoolById = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    if (school.verificationStatus !== 'verified' && req.user.role !== 'school') {
      return res.status(403).json({ message: 'School not verified' });
    }

    res.json(school);
  } catch (error) {
    console.error('Get school error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all school locations
// @route   GET /api/schools/locations
// @access  Private (Donor, Campaign)
const getSchoolLocations = async (req, res) => {
  try {
    const schools = await School.find({ verificationStatus: 'verified' });
    const locations = [...new Set(schools.map(s => s.address?.city).filter(Boolean))];
    res.json(locations);
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getVerifiedSchools,
  getSchoolById,
  getSchoolLocations
};