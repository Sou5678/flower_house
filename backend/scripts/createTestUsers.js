const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');

const createTestUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing test users (optional)
    await User.deleteMany({ email: { $regex: /@test\.com$/ } });
    console.log('Cleared existing test users');

    // Test Users Data
    const testUsers = [
      {
        fullName: 'Admin User',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin',
        phone: '+91-9876543210',
        isActive: true
      },
      {
        fullName: 'John Doe',
        email: 'john@test.com',
        password: 'user123',
        role: 'user',
        phone: '+91-9876543211',
        addresses: [{
          type: 'home',
          street: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India',
          isDefault: true
        }],
        isActive: true
      },
      {
        fullName: 'Jane Smith',
        email: 'jane@test.com',
        password: 'user123',
        role: 'user',
        phone: '+91-9876543212',
        addresses: [{
          type: 'home',
          street: '456 Park Avenue',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India',
          isDefault: true
        }],
        isActive: true
      },
      {
        fullName: 'Test Customer',
        email: 'customer@test.com',
        password: 'customer123',
        role: 'user',
        phone: '+91-9876543213',
        addresses: [{
          type: 'home',
          street: '789 Rose Garden',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India',
          isDefault: true
        }],
        isActive: true
      },
      {
        fullName: 'Demo User',
        email: 'demo@test.com',
        password: 'demo123',
        role: 'user',
        phone: '+91-9876543214',
        addresses: [{
          type: 'home',
          street: '321 Flower Street',
          city: 'Chennai',
          state: 'Tamil Nadu',
          zipCode: '600001',
          country: 'India',
          isDefault: true
        }],
        isActive: true
      }
    ];

    // Create test users
    const createdUsers = [];
    for (const userData of testUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.fullName} (${user.email})`);
    }

    console.log('\n🎉 Test users created successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('==========================================');
    
    testUsers.forEach(user => {
      console.log(`👤 ${user.fullName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Phone: ${user.phone}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
};

createTestUsers();