const User = require('../models/User');
const School = require('../models/School');
const Donor = require('../models/Donor');
const Campaign = require('../models/Campaign');
const Admin = require('../models/Admin');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // Get counts from database
    const totalUsers = await User.countDocuments();
    const totalSchools = await School.countDocuments();
    const totalDonors = await Donor.countDocuments();
    const totalCampaigns = await Campaign.countDocuments();
    
    // Verification stats
    const pendingSchools = await School.countDocuments({ verificationStatus: 'pending' });
    const verifiedSchools = await School.countDocuments({ verificationStatus: 'verified' });
    const rejectedSchools = await School.countDocuments({ verificationStatus: 'rejected' });
    
    const pendingCampaigns = await Campaign.countDocuments({ verificationStatus: 'pending' });
    const verifiedCampaigns = await Campaign.countDocuments({ verificationStatus: 'verified' });
    
    // Recent users (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentUsers = await User.countDocuments({ createdAt: { $gte: weekAgo } });
    const recentSchools = await School.countDocuments({ createdAt: { $gte: weekAgo } });
    const recentDonors = await Donor.countDocuments({ createdAt: { $gte: weekAgo } });

    // Active vs Inactive users
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalSchools,
        totalDonors,
        totalCampaigns,
        pendingSchools,
        verifiedSchools,
        rejectedSchools,
        pendingCampaigns,
        verifiedCampaigns,
        recentUsers,
        recentSchools,
        recentDonors,
        activeUsers,
        inactiveUsers
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all users with their profiles
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    
    const usersWithProfiles = await Promise.all(users.map(async (user) => {
      let profile = null;
      switch(user.role) {
        case 'school':
          profile = await School.findOne({ userId: user._id });
          break;
        case 'donor':
          profile = await Donor.findOne({ userId: user._id });
          break;
        case 'campaign':
          profile = await Campaign.findOne({ userId: user._id });
          break;
        case 'admin':
          profile = await Admin.findOne({ userId: user._id });
          break;
      }
      
      return {
        _id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        profile
      };
    }));

    res.json({
      success: true,
      users: usersWithProfiles
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get pending verifications
// @route   GET /api/admin/verifications
// @access  Private/Admin
const getPendingVerifications = async (req, res) => {
  try {
    // Log to debug
    console.log('🔍 Fetching pending verifications...');
    
    // Get ALL schools first to debug
    const allSchools = await School.find({});
    console.log('📚 Total schools in database:', allSchools.length);
    console.log('📚 All schools:', allSchools.map(s => ({ name: s.schoolName, status: s.verificationStatus })));
    
    // Get pending schools
    const pendingSchools = await School.find({ 
      verificationStatus: 'pending' 
    }).populate('userId', 'email createdAt');
    
    console.log('⏳ Pending schools found:', pendingSchools.length);
    
    const pendingCampaigns = await Campaign.find({ 
      verificationStatus: 'pending' 
    }).populate('userId', 'email createdAt');

    console.log('⏳ Pending campaigns found:', pendingCampaigns.length);

    res.json({
      success: true,
      pendingSchools,
      pendingCampaigns
    });
  } catch (error) {
    console.error('Error fetching verifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify school
// @route   PUT /api/admin/verify-school/:id
// @access  Private/Admin
const verifySchool = async (req, res) => {
  try {
    const { status, reason } = req.body;
    
    console.log('✅ Verifying school:', { schoolId: req.params.id, status });
    
    const school = await School.findById(req.params.id);
    if (!school) {
      console.log('❌ School not found');
      return res.status(404).json({ message: 'School not found' });
    }

    console.log('📚 School found:', { name: school.schoolName, currentStatus: school.verificationStatus });

    school.verificationStatus = status;
    if (status === 'rejected') {
      school.rejectionReason = reason;
    } else if (status === 'verified') {
      school.verifiedBy = req.user.id;
      school.verifiedAt = Date.now();
      
      // Update user verification status
      await User.findByIdAndUpdate(school.userId, { isVerified: true });
    }

    await school.save();

    console.log('✅ School verification updated to:', school.verificationStatus);

    res.json({
      success: true,
      message: `School ${status} successfully`,
      school
    });
  } catch (error) {
    console.error('Error verifying school:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify campaign
// @route   PUT /api/admin/verify-campaign/:id
// @access  Private/Admin
const verifyCampaign = async (req, res) => {
  try {
    const { status, reason } = req.body;
    
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    campaign.verificationStatus = status;
    if (status === 'rejected') {
      campaign.rejectionReason = reason;
    } else if (status === 'verified') {
      campaign.verifiedBy = req.user.id;
      campaign.verifiedAt = Date.now();
      
      // Update user verification status
      await User.findByIdAndUpdate(campaign.userId, { isVerified: true });
    }

    await campaign.save();

    res.json({
      success: true,
      message: `Campaign ${status} successfully`,
      campaign
    });
  } catch (error) {
    console.error('Error verifying campaign:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/toggle-user/:id
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deactivating other admins
    if (user.role === 'admin' && req.user.id !== user._id.toString()) {
      return res.status(403).json({ message: 'Cannot modify other admin accounts' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error toggling user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get recent activities
// @route   GET /api/admin/activities
// @access  Private/Admin
const getRecentActivities = async (req, res) => {
  try {
    const activities = [];

    // Get recent schools
    const recentSchools = await School.find()
      .sort('-createdAt')
      .limit(5)
      .populate('userId', 'email');

    recentSchools.forEach(school => {
      activities.push({
        type: 'school_registration',
        title: 'New School Registration',
        description: `${school.schoolName} registered`,
        time: school.createdAt,
        status: school.verificationStatus,
        id: school._id
      });
    });

    // Get recent donors
    const recentDonors = await Donor.find()
      .sort('-createdAt')
      .limit(5)
      .populate('userId', 'email');

    recentDonors.forEach(donor => {
      activities.push({
        type: 'donor_registration',
        title: 'New Donor Registration',
        description: `${donor.fullName} joined as donor`,
        time: donor.createdAt,
        id: donor._id
      });
    });

    // Get recent campaigns
    const recentCampaigns = await Campaign.find()
      .sort('-createdAt')
      .limit(5)
      .populate('userId', 'email');

    recentCampaigns.forEach(campaign => {
      activities.push({
        type: 'campaign_registration',
        title: 'New Campaign Organization',
        description: `${campaign.organizationName} registered`,
        time: campaign.createdAt,
        status: campaign.verificationStatus,
        id: campaign._id
      });
    });

    // Sort by time descending and take latest 10
    activities.sort((a, b) => b.time - a.time);
    activities.splice(10);

    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getPendingVerifications,
  verifySchool,
  verifyCampaign,
  toggleUserStatus,
  getRecentActivities
};