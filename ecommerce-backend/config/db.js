const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas cluster with resilient connection handling
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri || mongoUri.includes('user:pass@cluster0')) {
      console.warn(
        '⚠️  [DATABASE WARNING] Valid MONGO_URI not configured in .env. Schemas are ready, but database operations will fail until Atlas connection string is provided.'
      );
      return null;
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true // Ensure indices are built in development
    });

    console.log(`✅ [DATABASE] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ [DATABASE ERROR] Connection failed: ${error.message}`);
    // In production we exit; in development we keep server alive for developer inspection
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return null;
  }
};

module.exports = connectDB;
