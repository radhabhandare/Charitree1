const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createDonation,
  getDonorDonations,
  getRecentDonations,
  getDonationDetails,
  requestUpdate,
  getDonorStats
} = require('../controllers/donationController');

// All donation routes require authentication and donor role
router.use(protect);
router.use(authorize('donor'));

// Donation creation
router.post('/', createDonation);

// Donor stats
router.get('/stats', getDonorStats);

// Donor donations
router.get('/donor/donations', getDonorDonations);
router.get('/donor/donations/recent', getRecentDonations);
router.get('/donor/donations/:id', getDonationDetails);
router.post('/donor/donations/:id/request-update', requestUpdate);

module.exports = router;