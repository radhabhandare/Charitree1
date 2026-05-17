const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Mock campaign data for now - will be replaced with real data
const getActiveCampaigns = async (req, res) => {
  try {
    // Return empty array for now - you can add real campaigns later
    res.json([]);
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// All campaign routes
router.get('/active', protect, authorize('donor'), getActiveCampaigns);

module.exports = router;