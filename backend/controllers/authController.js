const jwt = require('jsonwebtoken');
const User = require('../models/User');
const School = require('../models/School');
const Donor = require('../models/Donor');
const Campaign = require('../models/Campaign');
const Admin = require('../models/Admin');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_secret_key', {
    expiresIn: '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, password, role, ...profileData } = req.body;

    console.log('📝 Register attempt:', { email, role });
    console.log('📦 Profile data received:', profileData);

    // Block admin registration
    if (role === 'admin') {
      return res.status(403).json({ 
        message: 'Admin registration is not allowed.' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user in database
    const user = new User({
      email,
      password,
      role,
      isVerified: role === 'school' ? false : true,
      isActive: true
    });

    await user.save();
    console.log('✅ User created:', user._id);

    // Create role-specific profile
    let profile;
    switch(role) {
      case 'school':
        // Convert needs array to proper format if it's array of strings
        let needsArray = [];
        if (profileData.needs && Array.isArray(profileData.needs)) {
          needsArray = profileData.needs.map(need => ({
            item: need,
            quantity: 1,
            urgency: 'medium',
            status: 'pending',
            fulfilled: 0
          }));
        }
        
        profile = new School({
          userId: user._id,
          schoolName: profileData.schoolName,
          schoolType: profileData.schoolType,
          establishmentYear: profileData.establishmentYear,
          principalName: profileData.principalName,
          phoneNumber: profileData.phoneNumber,
          address: {
            street: profileData.address,
            city: profileData.city,
            state: profileData.state,
            pincode: profileData.pincode,
            location: profileData.location || ''
          },
          studentCount: profileData.studentCount || 0,
          teacherCount: profileData.teacherCount || 0,
          description: profileData.description || '',
          needs: needsArray,
          verificationStatus: 'pending'
        });
        break;

      case 'donor':
        profile = new Donor({
          userId: user._id,
          fullName: profileData.fullName,
          phoneNumber: profileData.phoneNumber,
          address: {
            street: profileData.address,
            city: profileData.city,
            state: profileData.state,
            pincode: profileData.pincode
          },
          occupation: profileData.occupation || '',
          interests: profileData.interests || [],
          bio: profileData.bio || '',
          totalDonations: 0,
          totalItems: 0,
          schoolsSupported: 0
        });
        break;

      case 'campaign':
        profile = new Campaign({
          userId: user._id,
          organizationName: profileData.organizationName,
          organizationType: profileData.organizationType,
          registrationNumber: profileData.registrationNumber,
          establishedYear: profileData.establishedYear,
          contactPerson: profileData.contactPerson,
          phoneNumber: profileData.phoneNumber,
          address: {
            street: profileData.address,
            city: profileData.city,
            state: profileData.state,
            pincode: profileData.pincode
          },
          description: profileData.description || '',
          focusAreas: profileData.focusAreas || [],
          verificationStatus: 'verified'
        });
        break;

      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    await profile.save();
    console.log('✅ Profile created for:', role);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile
      }
    });

  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    console.log('🔐 Login attempt:', { email, role });

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // SPECIAL CASE: Admin login with hardcoded credentials
    if (role === 'admin') {
      if (email === 'radhabhandare045@gmail.com' && password === 'radha@123') {
        console.log('✅ Admin login successful');
        
        // Check if admin exists in database
        let user = await User.findOne({ email });
        let profile = null;
        
        if (!user) {
          // Create admin in database if not exists
          user = new User({
            email,
            password,
            role: 'admin',
            isVerified: true,
            isActive: true
          });
          await user.save();
          
          profile = new Admin({
            userId: user._id,
            fullName: 'Radha Bhandare',
            phoneNumber: '9999999999',
            role: 'super-admin',
            permissions: ['verify-schools', 'manage-users', 'view-reports', 'manage-campaigns']
          });
          await profile.save();
        } else {
          profile = await Admin.findOne({ userId: user._id });
        }
        
        const token = generateToken(user._id);
        
        return res.json({
          success: true,
          token,
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            profile
          }
        });
      } else {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }
    }

    // For other roles - check database
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.role !== role) {
      return res.status(401).json({ message: 'Invalid role selected' });
    }

    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated. Contact admin.' });
    }

    // For schools - check verification status
    if (user.role === 'school') {
      const school = await School.findOne({ userId: user._id });
      if (!school) {
        return res.status(401).json({ message: 'School profile not found' });
      }
      
      if (school.verificationStatus !== 'verified') {
        return res.status(401).json({ 
          message: `Your school account is ${school.verificationStatus}. Please wait for admin verification.` 
        });
      }
    }

    // For campaigns - check verification status
    if (user.role === 'campaign') {
      const campaign = await Campaign.findOne({ userId: user._id });
      if (campaign && campaign.verificationStatus !== 'verified') {
        return res.status(401).json({ 
          message: `Your campaign account is ${campaign.verificationStatus}. Please wait for verification.` 
        });
      }
    }

    // Get profile based on role
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

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, login };