const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  getImpact,
  getDashboardStats
} = require('../controllers/donorController');
const Donation = require('../models/Donation');

// All donor routes require authentication and donor role
router.use(protect);
router.use(authorize('donor'));

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Impact routes
router.get('/impact', getImpact);
router.get('/dashboard-stats', getDashboardStats);

// Donations routes
router.get('/donations', async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user.id })
      .sort('-createdAt')
      .populate('schoolId', 'schoolName address');
    res.json(donations);
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/donations/recent', async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user.id })
      .sort('-createdAt')
      .limit(5)
      .populate('schoolId', 'schoolName');
    res.json(donations);
  } catch (error) {
    console.error('Get recent donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;