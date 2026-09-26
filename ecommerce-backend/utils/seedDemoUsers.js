const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Cart = require('../models/Cart');

const demoAccounts = [
  {
    name: 'Demo Customer',
    email: 'demo_customer@rigamart.com',
    password: 'Password123!',
    mobile: '9876543211',
    role: 'customer',
    isVerified: true
  },
  {
    name: 'Urban Threads Mumbai',
    email: 'demo_seller@rigamart.com',
    password: 'Password123!',
    mobile: '9123456780',
    role: 'seller',
    isVerified: true
  },
  {
    name: 'Platform Administrator',
    email: 'demo_admin@rigamart.com',
    password: 'Password123!',
    mobile: '9876543210',
    role: 'admin',
    isVerified: true
  }
];

async function seedDemoUsers() {
  console.log('🌱 Seeding Rigamart Demo User Accounts...\n');

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas.');

    for (const acc of demoAccounts) {
      let user = await User.findOne({ email: acc.email });

      if (!user) {
        user = await User.create(acc);
        console.log(`✅ Created [${acc.role.toUpperCase()}]: ${acc.email} / ${acc.password}`);
      } else {
        // Ensure role, verification, and password match expectations
        user.role = acc.role;
        user.isVerified = true;
        user.password = acc.password; // pre-save hook will hash it
        await user.save();
        console.log(`🔄 Updated [${acc.role.toUpperCase()}]: ${acc.email} / ${acc.password}`);
      }

      // Ensure user has persistent cart
      const existingCart = await Cart.findOne({ user: user._id });
      if (!existingCart) {
        await Cart.create({ user: user._id, items: [] });
      }
    }

    console.log('\n🎉 All demo accounts verified and ready for testing!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed demo users:', err.message);
    process.exit(1);
  }
}

seedDemoUsers();
