const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getVerifiedSchools,
  getSchoolById,
  getSchoolLocations,
  getSchoolStats,
  getSchoolProfile,
  updateSchoolProfile,
  getSchoolNeeds,
  createSchoolNeed,
  deleteSchoolNeed,
  getSchoolDonations,
  getRecentDonations,
  updateDonationStatus,
  getSchoolNotifications,
  getSchoolAnalytics
} = require('../controllers/schoolController');

// Public school routes (for donors/campaigns)
router.get('/verified', protect, authorize('donor', 'campaign'), getVerifiedSchools);
router.get('/locations', protect, authorize('donor', 'campaign'), getSchoolLocations);
router.get('/:id', protect, authorize('donor', 'campaign', 'school'), getSchoolById);

// School protected routes
router.use(protect);
router.use(authorize('school'));

// Dashboard stats
router.get('/stats', getSchoolStats);

// Profile
router.get('/profile', getSchoolProfile);
router.put('/profile', updateSchoolProfile);

// Needs
router.get('/needs', getSchoolNeeds);
router.post('/needs', createSchoolNeed);
router.delete('/needs/:needId', deleteSchoolNeed);

// Donations
router.get('/donations', getSchoolDonations);
router.get('/donations/recent', getRecentDonations);
router.put('/donations/:donationId/status', updateDonationStatus);

// Notifications
router.get('/notifications', getSchoolNotifications);

// Analytics
router.get('/analytics', getSchoolAnalytics);

module.exports = router;