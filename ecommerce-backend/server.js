require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const cartRoutes = require('./routes/cartRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const couponRoutes = require('./routes/couponRoutes');
const { verifyEmailConfig } = require('./config/nodemailer');
const { initKeepAlive } = require('./utils/keepAlive');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const { globalLimiter, authLimiter } = require('./middleware/rateLimiter');

const app = express();

// Initialize MongoDB connection & SMTP verification
connectDB();
verifyEmailConfig();

// Secure HTTP headers
app.use(helmet());

// Trust reverse proxies (Render, AWS, Cloudflare) for secure cookies & HTTPS protocol detection
app.set('trust proxy', 1);

// Cross-Origin Resource Sharing setup
const configuredOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((u) => u.trim())
  : [];

const allowedOrigins = [
  ...configuredOrigins,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman),
      // explicit client origins, and Vercel preview/production domains (*.vercel.app)
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        (process.env.NODE_ENV !== 'production' && origin.includes('localhost'))
      ) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser for secure httpOnly refresh tokens
app.use(cookieParser());

// Data sanitization against NoSQL query injection (strips $ and .)
app.use(mongoSanitize());

// Prevent HTTP parameter pollution attacks
app.use(hpp());

// Global API rate limiter (150 req/min per IP)
app.use('/api', globalLimiter);

// Request logger in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint with database connection readiness indicator
app.get('/api/health', (req, res) => {
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.status(200).json({
    success: true,
    message: 'Rigamart API server is operational',
    data: {
      status: 'healthy',
      database: dbStates[mongoose.connection.readyState] || 'unknown',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    }
  });
});

// API Routes (Strict rate limiting applied on authentication endpoints)
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coupons', couponRoutes);

// Root fallback route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Rigamart E-Commerce REST API',
    data: {
      documentation: '/api/health'
    }
  });
});

// 404 Route Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
    data: null
  });
});

// Global Centralized Error Handler (Masks internal stack traces in production)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const isProduction = process.env.NODE_ENV === 'production';

  // In production, mask internal 500 errors to prevent server path and database disclosure
  const safeMessage = isProduction && statusCode === 500
    ? 'An unexpected internal server error occurred. Please try again later.'
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: safeMessage,
    data: null,
    ...(!isProduction && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Rigamart Backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  initKeepAlive();
});

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
