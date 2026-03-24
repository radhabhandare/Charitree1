const mongoose = require('mongoose');
const School = require('../models/School');
const Donation = require('../models/Donation');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all verified schools
// @route   GET /api/schools/verified
// @access  Private (Donor, Campaign)
const getVerifiedSchools = async (req, res) => {
  try {
    const schools = await School.find({ verificationStatus: 'verified' })
      .select('-__v')
      .sort('-createdAt');

    res.json(schools);
  } catch (error) {
    console.error('Get verified schools error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single school details
// @route   GET /api/schools/:id
// @access  Private (Donor, Campaign, School)
const getSchoolById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid school ID format' });
    }

    const school = await School.findById(id);

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    if (school.verificationStatus !== 'verified' && req.user.role !== 'school') {
      return res.status(403).json({ message: 'School not verified' });
    }

    res.json(school);
  } catch (error) {
    console.error('Get school error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all school locations
// @route   GET /api/schools/locations
// @access  Private (Donor, Campaign)
const getSchoolLocations = async (req, res) => {
  try {
    const schools = await School.find({ verificationStatus: 'verified' });
    const locations = [...new Set(schools.map(s => s.address?.city).filter(Boolean))];
    res.json(locations);
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ========== SCHOOL DASHBOARD ENDPOINTS ==========

// @desc    Get school dashboard stats
// @route   GET /api/school/stats
// @access  Private (School)
const getSchoolStats = async (req, res) => {
  try {
    const school = await School.findOne({ userId: req.user.id });
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const donations = await Donation.find({ schoolId: school._id });
    
    const stats = {
      totalDonations: donations.length,
      pendingNeeds: school.needs?.filter(n => n.status === 'pending').length || 0,
      fulfilledNeeds: school.needs?.filter(n => n.status === 'fulfilled').length || 0,
      totalItemsReceived: donations.reduce((sum, d) => sum + d.totalItems, 0),
      activeRequests: school.needs?.filter(n => n.status === 'pending' && n.urgency === 'high').length || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Get school stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get school profile
// @route   GET /api/school/profile
// @access  Private (School)
const getSchoolProfile = async (req, res) => {
  try {
    const school = await School.findOne({ userId: req.user.id });
    const user = await User.findById(req.user.id).select('-password');
    
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    res.json({
      schoolName: school.schoolName,
      schoolType: school.schoolType,
      establishmentYear: school.establishmentYear,
      principalName: school.principalName,
      phoneNumber: school.phoneNumber,
      email: user.email,
      address: school.address,
      studentCount: school.studentCount,
      teacherCount: school.teacherCount,
      description: school.description,
      needs: school.needs,
      verificationStatus: school.verificationStatus
    });
  } catch (error) {
    console.error('Get school profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update school profile
// @route   PUT /api/school/profile
// @access  Private (School)
const updateSchoolProfile = async (req, res) => {
  try {
    const school = await School.findOne({ userId: req.user.id });
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const { schoolName, schoolType, establishmentYear, principalName, phoneNumber, address, studentCount, teacherCount, description } = req.body;

    if (schoolName) school.schoolName = schoolName;
    if (schoolType) school.schoolType = schoolType;
    if (establishmentYear) school.establishmentYear = establishmentYear;
    if (principalName) school.principalName = principalName;
    if (phoneNumber) school.phoneNumber = phoneNumber;
    if (address) school.address = address;
    if (studentCount !== undefined) school.studentCount = studentCount;
    if (teacherCount !== undefined) school.teacherCount = teacherCount;
    if (description) school.description = description;

    await school.save();

    res.json({ success: true, message: 'Profile updated successfully', school });
  } catch (error) {
    console.error('Update school profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get school needs
// @route   GET /api/school/needs
// @access  Private (School)
const getSchoolNeeds = async (req, res) => {
  try {
    const school = await School.findOne({ userId: req.user.id });
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Auto-update urgency based on age (ML-like feature)
    const needsWithAutoUrgency = school.needs?.map(need => {
      const daysOld = (new Date() - new Date(need.createdAt)) / (1000 * 60 * 60 * 24);
      let urgency = need.urgency;
      if (daysOld > 30 && urgency !== 'high') urgency = 'high';
      else if (daysOld > 15 && urgency !== 'medium' && urgency !== 'high') urgency = 'medium';
      return { ...need.toObject(), urgency, autoUpdated: daysOld > 30 };
    }) || [];

    res.json(needsWithAutoUrgency);
  } catch (error) {
    console.error('Get school needs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create school need
// @route   POST /api/school/needs
// @access  Private (School)
const createSchoolNeed = async (req, res) => {
  try {
    const { item, quantity, urgency, category } = req.body;
    const school = await School.findOne({ userId: req.user.id });
    
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const newNeed = {
      item,
      quantity: parseInt(quantity),
      urgency: urgency || 'medium',
      category: category || 'General',
      status: 'pending',
      fulfilled: 0,
      createdAt: new Date()
    };

    school.needs.push(newNeed);
    await school.save();

    res.status(201).json({ success: true, need: newNeed });
  } catch (error) {
    console.error('Create school need error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete school need - FIXED
// @route   DELETE /api/school/needs/:needId
// @access  Private (School)
const deleteSchoolNeed = async (req, res) => {
  try {
    const { needId } = req.params;
    console.log('Deleting need:', needId);
    
    const school = await School.findOne({ userId: req.user.id });
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const needIndex = school.needs.findIndex(need => need._id.toString() === needId);
    if (needIndex === -1) {
      return res.status(404).json({ message: 'Need not found' });
    }

    school.needs.splice(needIndex, 1);
    await school.save();

    res.json({ success: true, message: 'Need deleted successfully' });
  } catch (error) {
    console.error('Delete school need error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get school donations
// @route   GET /api/school/donations
// @access  Private (School)
const getSchoolDonations = async (req, res) => {
  try {
    const school = await School.findOne({ userId: req.user.id });
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const donations = await Donation.find({ schoolId: school._id })
      .sort('-createdAt')
      .populate('donorId', 'email');

    const formattedDonations = donations.map(d => ({
      id: d._id,
      donorName: d.donorId?.email?.split('@')[0] || 'Anonymous',
      donorEmail: d.donorId?.email,
      donorId: d.donorId?._id,
      items: d.items,
      status: d.status,
      date: d.createdAt,
      trackingNumber: d.trackingNumber,
      estimatedDelivery: d.estimatedDelivery,
      actualDelivery: d.actualDelivery,
      timeline: d.timeline,
      deliveryProof: d.deliveryProof,
      donationMethod: d.donationMethod
    }));

    res.json(formattedDonations);
  } catch (error) {
    console.error('Get school donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get recent donations (last 5)
// @route   GET /api/school/donations/recent
// @access  Private (School)
const getRecentDonations = async (req, res) => {
  try {
    const school = await School.findOne({ userId: req.user.id });
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const donations = await Donation.find({ schoolId: school._id })
      .sort('-createdAt')
      .limit(5)
      .populate('donorId', 'email');

    const formattedDonations = donations.map(d => ({
      id: d._id,
      donorName: d.donorId?.email?.split('@')[0] || 'Anonymous',
      items: d.items.map(i => i.name),
      status: d.status,
      date: d.createdAt,
      donationMethod: d.donationMethod
    }));

    res.json(formattedDonations);
  } catch (error) {
    console.error('Get recent donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Accept donation (School accepts)
// @route   PUT /api/school/donations/:donationId/accept
// @access  Private (School)
const acceptDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId);
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const school = await School.findOne({ userId: req.user.id });
    if (!school || donation.schoolId.toString() !== school._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    donation.status = 'accepted';
    donation.timeline.accepted = new Date();
    await donation.save();

    // Create notification for donor
    const notification = new Notification({
      userId: donation.donorId,
      title: 'Donation Accepted!',
      message: `Your donation to ${donation.schoolName} has been accepted by the school.`,
      type: 'donation_update',
      relatedId: donation._id
    });
    await notification.save();

    res.json({ success: true, message: 'Donation accepted successfully', donation });
  } catch (error) {
    console.error('Accept donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject donation (School rejects)
// @route   PUT /api/school/donations/:donationId/reject
// @access  Private (School)
const rejectDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId);
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const school = await School.findOne({ userId: req.user.id });
    if (!school || donation.schoolId.toString() !== school._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    donation.status = 'rejected';
    donation.timeline.rejected = new Date();
    await donation.save();

    const notification = new Notification({
      userId: donation.donorId,
      title: 'Donation Rejected',
      message: `Your donation to ${donation.schoolName} was rejected. Please contact the school for more information.`,
      type: 'donation_update',
      relatedId: donation._id
    });
    await notification.save();

    res.json({ success: true, message: 'Donation rejected', donation });
  } catch (error) {
    console.error('Reject donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark donation as received
// @route   PUT /api/school/donations/:donationId/received
// @access  Private (School)
const markAsReceived = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId);
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const school = await School.findOne({ userId: req.user.id });
    if (!school || donation.schoolId.toString() !== school._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    donation.status = 'delivered';
    donation.actualDelivery = new Date();
    donation.timeline.delivered = new Date();
    await donation.save();

    const notification = new Notification({
      userId: donation.donorId,
      title: 'Donation Received!',
      message: `Your donation to ${donation.schoolName} has been received. Thank you for your generosity!`,
      type: 'donation_update',
      relatedId: donation._id
    });
    await notification.save();

    res.json({ success: true, message: 'Donation marked as received', donation });
  } catch (error) {
    console.error('Mark as received error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get school notifications
// @route   GET /api/school/notifications
// @access  Private (School)
const getSchoolNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort('-createdAt')
      .limit(50);

    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get school analytics
// @route   GET /api/school/analytics
// @access  Private (School)
const getSchoolAnalytics = async (req, res) => {
  try {
    const school = await School.findOne({ userId: req.user.id });
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const donations = await Donation.find({ schoolId: school._id });
    
    const monthlyData = {};
    donations.forEach(d => {
      const month = d.createdAt.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    const itemCategories = {};
    donations.forEach(d => {
      d.items.forEach(item => {
        const category = item.category || 'General';
        itemCategories[category] = (itemCategories[category] || 0) + item.quantity;
      });
    });

    const totalNeeds = school.needs?.length || 0;
    const fulfilledNeeds = school.needs?.filter(n => n.status === 'fulfilled').length || 0;

    res.json({
      monthlyDonations: monthlyData,
      itemCategories,
      needsRatio: {
        total: totalNeeds,
        fulfilled: fulfilledNeeds,
        pending: totalNeeds - fulfilledNeeds,
        percentage: totalNeeds > 0 ? (fulfilledNeeds / totalNeeds) * 100 : 0
      },
      totalDonations: donations.length,
      totalItems: donations.reduce((sum, d) => sum + d.totalItems, 0)
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
  acceptDonation,
  rejectDonation,
  markAsReceived,
  getSchoolNotifications,
  getSchoolAnalytics
};