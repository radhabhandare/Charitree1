const Donation = require('../models/Donation');
const School = require('../models/School');
const Donor = require('../models/Donor');
const Notification = require('../models/Notification');

// @desc    Create a new donation with multiple methods
// @route   POST /api/donations
// @access  Private (Donor)
const createDonation = async (req, res) => {
  try {
    const { schoolId, items, donationMethod, courierDetails, selfDeliveryDetails } = req.body;
    const donorId = req.user.id;

    if (!schoolId || !items || items.length === 0) {
      return res.status(400).json({ message: 'School ID and items are required' });
    }

    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    if (school.verificationStatus !== 'verified') {
      return res.status(400).json({ message: 'School is not verified yet' });
    }

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const donation = new Donation({
      donorId,
      schoolId: school._id,
      schoolName: school.schoolName,
      schoolLocation: school.address?.city || 'Unknown',
      items,
      totalItems,
      donationMethod: donationMethod || 'ecommerce',
      status: 'pending',
      timeline: { pending: new Date() }
    });

    if (donationMethod === 'courier' && courierDetails) {
      donation.courier = courierDetails.courierName;
      donation.trackingNumber = courierDetails.trackingId;
      donation.courierReceipt = courierDetails.receiptImage;
    }

    if (donationMethod === 'self_delivery' && selfDeliveryDetails) {
      donation.selfDeliveryDate = selfDeliveryDetails.deliveryDate;
      donation.selfDeliveryTime = selfDeliveryDetails.deliveryTime;
      donation.deliveryNotes = selfDeliveryDetails.notes;
    }

    await donation.save();

    // Update donor stats
    await Donor.findOneAndUpdate(
      { userId: donorId },
      { 
        $inc: { 
          totalDonations: 1, 
          totalItems: totalItems,
          schoolsSupported: 1,
          impactScore: totalItems * 5
        } 
      }
    );

    // Update school needs - reduce quantity
    for (const item of items) {
      const schoolNeed = school.needs.find(n => n.item === item.name);
      if (schoolNeed) {
        schoolNeed.fulfilled = (schoolNeed.fulfilled || 0) + item.quantity;
        if (schoolNeed.fulfilled >= schoolNeed.quantity) {
          schoolNeed.status = 'fulfilled';
        } else {
          schoolNeed.status = 'partial';
        }
      }
    }
    await school.save();

    // Create notification for school
    const notification = new Notification({
      userId: school.userId,
      title: 'New Donation Received!',
      message: `A donor has donated ${totalItems} items to your school via ${donationMethod === 'ecommerce' ? 'E-commerce' : donationMethod === 'courier' ? 'Courier' : 'Self Delivery'}. Please review and accept.`,
      type: 'new_donation',
      relatedId: donation._id
    });
    await notification.save();

    res.status(201).json({
      success: true,
      donation
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update donation status (Donor updates delivery)
// @route   PUT /api/donor/donations/:id/status
// @access  Private (Donor)
const updateDonationStatus = async (req, res) => {
  try {
    const { status, trackingDetails, deliveryProof } = req.body;
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check if donor owns this donation
    if (donation.donorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    donation.status = status;
    donation.timeline[status] = new Date();
    
    if (trackingDetails) {
      donation.trackingNumber = trackingDetails.trackingId;
      donation.courier = trackingDetails.courierName;
    }
    
    if (deliveryProof) {
      donation.deliveryProof = {
        image: deliveryProof.image,
        notes: deliveryProof.notes,
        uploadedAt: new Date()
      };
    }
    
    if (status === 'delivered') {
      donation.actualDelivery = new Date();
    }

    await donation.save();

    // Create notification for school
    const notification = new Notification({
      userId: donation.schoolId,
      title: `Donation Update: ${status}`,
      message: `Donor has updated the donation status to ${status}. ${status === 'shipped' ? 'Tracking ID: ' + donation.trackingNumber : ''}`,
      type: 'donation_update',
      relatedId: donation._id
    });
    await notification.save();

    res.json({ success: true, message: `Donation status updated to ${status}`, donation });
  } catch (error) {
    console.error('Update donation status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get donor's donations
// @route   GET /api/donor/donations
// @access  Private (Donor)
const getDonorDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user.id })
      .sort('-createdAt')
      .select('-__v');

    res.json(donations);
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get recent donations (last 5)
// @route   GET /api/donor/donations/recent
// @access  Private (Donor)
const getRecentDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user.id })
      .sort('-createdAt')
      .limit(5)
      .select('id schoolName schoolLocation items status createdAt donationMethod');

    res.json(donations);
  } catch (error) {
    console.error('Get recent donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single donation details
// @route   GET /api/donor/donations/:id
// @access  Private (Donor)
const getDonationDetails = async (req, res) => {
  try {
    const donation = await Donation.findOne({
      _id: req.params.id,
      donorId: req.user.id
    });

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.json(donation);
  } catch (error) {
    console.error('Get donation details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Request donation update
// @route   POST /api/donor/donations/:id/request-update
// @access  Private (Donor)
const requestUpdate = async (req, res) => {
  try {
    const donation = await Donation.findOne({
      _id: req.params.id,
      donorId: req.user.id
    });

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const notification = new Notification({
      userId: donation.schoolId,
      title: 'Donation Update Requested',
      message: `A donor has requested an update on their donation.`,
      type: 'update_request',
      relatedId: donation._id
    });
    await notification.save();

    res.json({ 
      success: true, 
      message: 'Update requested successfully. The school will be notified.' 
    });
  } catch (error) {
    console.error('Request update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get donor stats
// @route   GET /api/donor/stats
// @access  Private (Donor)
const getDonorStats = async (req, res) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.id });
    const donations = await Donation.find({ donorId: req.user.id });

    const stats = {
      totalDonations: donations.length,
      schoolsSupported: donor?.schoolsSupported || 0,
      pendingDonations: donations.filter(d => d.status === 'pending' || d.status === 'processing').length,
      deliveredDonations: donations.filter(d => d.status === 'delivered').length,
      totalItems: donor?.totalItems || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Get donor stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload delivery proof
// @route   POST /api/donor/donations/:id/proof
// @access  Private (Donor)
const uploadDeliveryProof = async (req, res) => {
  try {
    const donation = await Donation.findOne({
      _id: req.params.id,
      donorId: req.user.id
    });

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const { proofImage, notes } = req.body;
    
    donation.deliveryProof = {
      image: proofImage,
      notes: notes,
      uploadedAt: new Date()
    };
    
    await donation.save();

    const notification = new Notification({
      userId: donation.schoolId,
      title: 'Delivery Proof Uploaded',
      message: `Donor has uploaded delivery proof for donation ${donation.id}.`,
      type: 'donation_update',
      relatedId: donation._id
    });
    await notification.save();

    res.json({ success: true, message: 'Delivery proof uploaded successfully' });
  } catch (error) {
    console.error('Upload proof error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createDonation,
  getDonorDonations,
  getRecentDonations,
  getDonationDetails,
  requestUpdate,
  getDonorStats,
  uploadDeliveryProof,
  updateDonationStatus
};