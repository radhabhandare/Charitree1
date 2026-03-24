const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all active campaigns
// @route   GET /api/campaigns/active
// @access  Private (Donor, Campaign)
const getActiveCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ 
      status: 'active',
      verificationStatus: 'verified'
    }).sort('-createdAt').limit(10);

    // Calculate progress for each campaign
    const campaignsWithProgress = await Promise.all(campaigns.map(async (campaign) => {
      const donations = await Donation.find({ campaignId: campaign._id });
      const totalDonated = donations.reduce((sum, d) => sum + d.totalItems, 0);
      const progress = (totalDonated / campaign.goal) * 100;
      const donors = new Set(donations.map(d => d.donorId)).size;
      
      return {
        ...campaign.toObject(),
        progress: Math.min(progress, 100),
        donated: totalDonated,
        donors
      };
    }));

    res.json(campaignsWithProgress);
  } catch (error) {
    console.error('Get active campaigns error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single campaign details
// @route   GET /api/campaigns/:id
// @access  Private (Donor, Campaign)
const getCampaignDetails = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const donations = await Donation.find({ campaignId: campaign._id })
      .populate('donorId', 'email')
      .sort('-createdAt')
      .limit(20);

    const totalDonated = donations.reduce((sum, d) => sum + d.totalItems, 0);
    const progress = (totalDonated / campaign.goal) * 100;
    const donors = [...new Set(donations.map(d => d.donorId._id))];

    const topDonors = donations
      .reduce((acc, d) => {
        const existing = acc.find(a => a.donorId === d.donorId._id);
        if (existing) {
          existing.total += d.totalItems;
        } else {
          acc.push({
            donorId: d.donorId._id,
            donorName: d.donorId.email.split('@')[0],
            total: d.totalItems
          });
        }
        return acc;
      }, [])
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    res.json({
      ...campaign.toObject(),
      progress: Math.min(progress, 100),
      donated: totalDonated,
      donors: donors.length,
      topDonors,
      recentDonations: donations.slice(0, 10)
    });
  } catch (error) {
    console.error('Get campaign details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new campaign (for campaign organizers)
// @route   POST /api/campaigns
// @access  Private (Campaign)
const createCampaign = async (req, res) => {
  try {
    const {
      title,
      description,
      goal,
      endDate,
      images,
      story
    } = req.body;

    const campaign = new Campaign({
      organizerId: req.user.id,
      title,
      description,
      goal: parseInt(goal),
      endDate,
      images: images || [],
      story,
      status: 'active',
      verificationStatus: 'pending'
    });

    await campaign.save();

    res.status(201).json({
      success: true,
      campaign
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Donate to campaign
// @route   POST /api/campaigns/:id/donate
// @access  Private (Donor)
const donateToCampaign = async (req, res) => {
  try {
    const { items, amount } = req.body;
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const donation = new Donation({
      donorId: req.user.id,
      campaignId: campaign._id,
      items,
      totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
      amount,
      status: 'pending'
    });

    await donation.save();

    // Create notification
    const notification = new Notification({
      userId: campaign.organizerId,
      title: 'New Campaign Donation!',
      message: `Someone donated to your campaign "${campaign.title}"`,
      type: 'campaign_donation',
      relatedId: donation._id
    });
    await notification.save();

    res.status(201).json({
      success: true,
      donation
    });
  } catch (error) {
    console.error('Donate to campaign error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getActiveCampaigns,
  getCampaignDetails,
  createCampaign,
  donateToCampaign
};