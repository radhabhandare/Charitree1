const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  getImpact
} = require('../controllers/donorController');

// All donor routes require authentication and donor role
router.use(protect);
router.use(authorize('donor'));

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Impact routes
router.get('/impact', getImpact);

module.exports = router;