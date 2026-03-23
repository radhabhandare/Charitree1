const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getAllUsers,
  getPendingVerifications,
  verifySchool,
  verifyCampaign,
  toggleUserStatus,
  getRecentActivities
} = require('../controllers/adminController');

// All admin routes are protected
router.use(protect);
router.use(authorize('admin'));

// Dashboard routes
router.get('/stats', getDashboardStats);
router.get('/activities', getRecentActivities);

// User management
router.get('/users', getAllUsers);
router.put('/toggle-user/:id', toggleUserStatus);

// Verification management
router.get('/verifications', getPendingVerifications);
router.put('/verify-school/:id', verifySchool);
router.put('/verify-campaign/:id', verifyCampaign);

module.exports = router;