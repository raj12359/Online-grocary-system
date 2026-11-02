import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@freshmart.com' });
    
    if (adminExists) {
      console.log('Admin user already exists! Credentials are:');
      console.log('Email: admin@freshmart.com');
      console.log('Password: (what you set previously)');
      process.exit();
    }

    // Create new admin
    const adminUser = new User({
      name: 'FreshMart Admin',
      email: 'admin@freshmart.com',
      password: 'adminpassword123',
      role: 'admin',
      phone: '1234567890',
      status: 'active'
    });

    await adminUser.save();
    console.log('Admin user successfully created!');
    console.log('Email: admin@freshmart.com');
    console.log('Password: adminpassword123');
    
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
