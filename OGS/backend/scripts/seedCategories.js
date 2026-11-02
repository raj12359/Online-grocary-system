import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Category from '../models/Category.js';

dotenv.config();

const seedCategories = async () => {
  try {
    await connectDB();

    const categories = [
      { name: 'Fruits', icon: 'FiSun' },
      { name: 'Vegetables', icon: 'FiLeaf' },
      { name: 'Dairy', icon: 'FiCloud' },
      { name: 'Bakery', icon: 'FiShoppingBag' },
      { name: 'Snacks', icon: 'FiCoffee' },
      { name: 'Beverages', icon: 'FiDroplet' },
    ];

    // Clear existing categories
    await Category.deleteMany();
    
    // Insert new categories
    await Category.insertMany(categories);

    console.log('Categories seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
