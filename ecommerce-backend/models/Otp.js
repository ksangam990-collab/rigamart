const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: [true, 'Identifier (email or mobile) is required'],
      trim: true,
      lowercase: true,
      index: true
    },
    code: {
      type: String,
      required: [true, 'OTP code is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['register', 'login', 'reset-password'],
      default: 'login'
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiration
    }
  },
  {
    timestamps: true
  }
);

// MongoDB Time-To-Live (TTL) index: automatically deletes document once expiresAt is reached
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.model('Otp', otpSchema);
module.exports = Otp;
