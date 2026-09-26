const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { generateAccessToken } = require('./generateToken');

async function seedSampleOrder() {
  console.log('📦 Seeding Realistic Sample Order into Rigamart Database...\n');

  await mongoose.connect(process.env.MONGO_URI);

  // 1. Find or create demo customer
  let customer = await User.findOne({ email: 'demo_customer@rigamart.com' });
  if (!customer) {
    customer = await User.create({
      name: 'Aditya Sharma',
      email: 'demo_customer@rigamart.com',
      password: 'Password123!',
      mobile: '9876543210',
      role: 'customer',
      isVerified: true
    });
  }

  // 2. Find or create demo seller
  let seller = await User.findOne({ email: 'demo_seller@rigamart.com' });
  if (!seller) {
    seller = await User.create({
      name: 'Urban Threads Mumbai',
      email: 'demo_seller@rigamart.com',
      password: 'Password123!',
      mobile: '9123456780',
      role: 'seller',
      isVerified: true
    });
  }

  // 3. Find or create demo category
  let category = await Category.findOne({ slug: 'mens-fashion' });
  if (!category) {
    category = await Category.create({
      name: "Men's Fashion",
      slug: 'mens-fashion',
      description: 'Trending ethnic and casual apparel for men.'
    });
  }

  // 4. Find or create demo product
  let product = await Product.findOne({ seller: seller._id, name: 'Premium Linen Blend Casual Shirt' });
  if (!product) {
    product = await Product.create({
      name: 'Premium Linen Blend Casual Shirt',
      description: 'Ultra-breathable Mandarin collar linen casual shirt, crafted for modern summer style.',
      category: category._id,
      seller: seller._id,
      images: [
        {
          public_id: 'sample_shirt_01',
          url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
          isPrimary: true
        }
      ],
      variants: [
        {
          sku: 'SHIRT-LINEN-NAVY-M',
          size: 'M',
          color: 'Navy Blue',
          price: 1499,
          mrp: 2999,
          stock: 45
        },
        {
          sku: 'SHIRT-LINEN-WHITE-L',
          size: 'L',
          color: 'Classic White',
          price: 1499,
          mrp: 2999,
          stock: 30
        }
      ],
      basePrice: 1499
    });
  }

  const item1 = product.variants[0];
  const item2 = product.variants[1];

  // 5. Create or update realistic Order
  const orderNumber = 'ORD-2026-98721';
  let order = await Order.findOne({ orderNumber });

  const orderData = {
    orderNumber,
    user: customer._id,
    items: [
      {
        product: product._id,
        name: product.name,
        image: product.images[0].url,
        variantId: item1._id,
        sku: item1.sku,
        size: item1.size,
        color: item1.color,
        price: item1.price,
        quantity: 2,
        seller: seller._id
      },
      {
        product: product._id,
        name: product.name,
        image: product.images[0].url,
        variantId: item2._id,
        sku: item2.sku,
        size: item2.size,
        color: item2.color,
        price: item2.price,
        quantity: 1,
        seller: seller._id
      }
    ],
    shippingAddress: {
      name: 'Aditya Sharma',
      mobile: '9876543210',
      street: 'Flat 402, Sunshine Heights, Powai Vihar',
      landmark: 'Opposite D-Mart Powai',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400076'
    },
    paymentInfo: {
      method: 'RAZORPAY',
      status: 'Completed',
      razorpayOrderId: 'order_Q98xY1L2m8K0',
      razorpayPaymentId: 'pay_Q98zW99XvB87',
      razorpaySignature: '38a7c29e160a3d90f5c1234567890abcdef',
      paidAt: new Date()
    },
    status: 'Delivered',
    statusTimeline: [
      {
        status: 'Placed',
        comment: 'Order placed successfully online.',
        timestamp: new Date(Date.now() - 4 * 86400000)
      },
      {
        status: 'Confirmed',
        comment: 'Order verified and packed by seller Urban Threads Mumbai.',
        timestamp: new Date(Date.now() - 3 * 86400000)
      },
      {
        status: 'Shipped',
        comment: 'Dispatched via Express Courier. Tracking AWB: BLUEDART-882190.',
        timestamp: new Date(Date.now() - 2 * 86400000)
      },
      {
        status: 'Delivered',
        comment: 'Package delivered successfully to Aditya Sharma.',
        timestamp: new Date(Date.now() - 1 * 86400000)
      }
    ],
    itemsPrice: 4497,
    shippingPrice: 0, // Free shipping above ₹500
    taxPrice: 0,
    totalAmount: 4497,
    deliveredAt: new Date(Date.now() - 1 * 86400000)
  };

  if (order) {
    Object.assign(order, orderData);
    await order.save();
  } else {
    order = await Order.create(orderData);
  }

  // Generate Customer JWT token
  const token = generateAccessToken(customer._id, customer.role);

  console.log('✅ Real Order Prepared in Database:');
  console.log(`- Order MongoDB _id:  ${order._id}`);
  console.log(`- Order Number:       ${order.orderNumber}`);
  console.log(`- Customer Name:      ${customer.name} (${customer.email})`);
  console.log(`- Customer Password:  Password123!`);
  console.log(`- Items Count:        3 items (Total: Rs. ${order.totalAmount})`);
  console.log(`- Payment Status:     ${order.paymentInfo.status} via ${order.paymentInfo.method}`);
  console.log('\n🔑 Generated JWT Token for Customer:');
  console.log(token);

  // Directly hit the local API and save the PDF locally so the user can inspect it immediately
  const pdfFilePath = path.join(__dirname, '..', 'sample_invoice.pdf');
  console.log(`\n📥 Fetching invoice from http://localhost:5000/api/orders/${order._id}/invoice ...`);

  try {
    const response = await axios.get(`http://localhost:5000/api/orders/${order._id}/invoice`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      responseType: 'arraybuffer'
    });

    fs.writeFileSync(pdfFilePath, Buffer.from(response.data));
    console.log(`🎉 Successfully saved PDF to: ${pdfFilePath}`);
    console.log(`   File size: ${fs.statSync(pdfFilePath).size} bytes`);
  } catch (apiErr) {
    console.error('Failed to download invoice via API:', apiErr.response?.data || apiErr.message);
  }

  await mongoose.connection.close();
}

seedSampleOrder().catch((err) => {
  console.error('Error seeding order:', err);
  process.exit(1);
});
