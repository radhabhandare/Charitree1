const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Admin = require('../models/Admin');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'radhabhandare045@gmail.com' });
    if (existingAdmin) {
      console.log('⚠️ Admin already exists!');
      
      // Show admin details
      const adminProfile = await Admin.findOne({ userId: existingAdmin._id });
      console.log('\n📋 Admin Details:');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      console.log('Admin Role:', adminProfile?.role);
      console.log('Status:', existingAdmin.isActive ? 'Active' : 'Inactive');
      
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('radha@123', salt);

    // Create admin user
    const adminUser = await User.create({
      email: 'radhabhandare045@gmail.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      isActive: true
    });

    // Create admin profile
    await Admin.create({
      userId: adminUser._id,
      fullName: 'Radha Bhandare',
      phoneNumber: '9999999999',
      role: 'super-admin',
      permissions: ['verify-schools', 'manage-users', 'view-reports', 'manage-campaigns']
    });

    console.log('\n✅ Admin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: radhabhandare045@gmail.com');
    console.log('🔑 Password: radha@123');
    console.log('👤 Role: super-admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  Important: Save these credentials securely!');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit();
  }
};

createAdmin();