const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const resetAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin user found!');
      process.exit(1);
    }

    // New password
    const newPassword = 'admin123';
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update admin password
    await User.findByIdAndUpdate(admin._id, { 
      password: hashedPassword 
    });

    console.log('Admin password reset successfully!');
    console.log('Email:', admin.email);
    console.log('New Password:', newPassword);
    console.log('\nYou can now login to admin panel at: http://localhost:3000/admin');
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting admin password:', error);
    process.exit(1);
  }
};

resetAdminPassword();