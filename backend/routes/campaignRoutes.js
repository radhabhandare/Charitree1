const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getActiveCampaigns,
  getCampaignDetails,
  createCampaign,
  donateToCampaign
} = require('../controllers/campaignController');

// Public campaign routes (for donors)
router.get('/active', protect, authorize('donor'), getActiveCampaigns);
router.get('/:id', protect, authorize('donor', 'campaign'), getCampaignDetails);

// Campaign creation (for campaign organizers)
router.post('/', protect, authorize('campaign'), createCampaign);

// Donate to campaign (for donors)
router.post('/:id/donate', protect, authorize('donor'), donateToCampaign);

module.exports = router;