const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getVerifiedSchools,
  getSchoolById,
  getSchoolLocations
} = require('../controllers/schoolController');

// Public school routes (for donors/campaigns)
router.get('/verified', protect, authorize('donor', 'campaign'), getVerifiedSchools);
router.get('/locations', protect, authorize('donor', 'campaign'), getSchoolLocations);
router.get('/:id', protect, authorize('donor', 'campaign', 'school'), getSchoolById);

module.exports = router;