const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Full Name:', existingAdmin.fullName);
      console.log('Role:', existingAdmin.role);
      console.log('Active:', existingAdmin.isActive);
      console.log('\nUse these credentials to login to admin panel:');
      console.log('URL: http://localhost:3000/admin');
      process.exit(0);
    }

    // Create admin user
    const adminData = {
      fullName: 'Admin User',
      email: 'admin@test.com',
      password: 'admin123', // Will be hashed automatically by User model
      role: 'admin',
      isActive: true
    };

    const admin = await User.create(adminData);
    console.log('Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: admin123');
    console.log('Role:', admin.role);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();