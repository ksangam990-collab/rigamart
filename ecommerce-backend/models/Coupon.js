const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Coupon description is required'],
      trim: true
    },
    discountType: {
      type: String,
      enum: {
        values: ['percentage', 'flat'],
        message: 'Discount type must be either "percentage" or "flat"'
      },
      required: [true, 'Discount type is required'],
      default: 'percentage'
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [1, 'Discount value must be at least 1']
    },
    maxDiscount: {
      type: Number,
      default: null,
      min: [0, 'Maximum discount cannot be negative']
    },
    minCartValue: {
      type: Number,
      default: 0,
      min: [0, 'Minimum cart value cannot be negative']
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required']
    },
    usageLimit: {
      type: Number,
      default: null,
      min: [1, 'Usage limit must be at least 1 unit if set']
    },
    timesUsed: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

/**
 * Check if the coupon is currently valid (active, unexpired, and usage limit not reached)
 */
couponSchema.methods.isValid = function () {
  const now = new Date();
  if (!this.isActive) return false;
  if (this.startDate && now < this.startDate) return false;
  if (this.expiryDate && now > this.expiryDate) return false;
  if (this.usageLimit !== null && this.usageLimit !== undefined && this.timesUsed >= this.usageLimit) {
    return false;
  }
  return true;
};

/**
 * Calculate the discount amount for a given cart subtotal
 * @param {number} cartSubtotal
 * @returns {number} discount amount in INR
 */
couponSchema.methods.calculateDiscount = function (cartSubtotal) {
  if (!cartSubtotal || cartSubtotal <= 0) return 0;
  if (cartSubtotal < this.minCartValue) return 0;

  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = Math.round((cartSubtotal * this.discountValue) / 100);
    if (this.maxDiscount !== null && this.maxDiscount !== undefined && this.maxDiscount > 0) {
      discount = Math.min(discount, this.maxDiscount);
    }
  } else if (this.discountType === 'flat') {
    discount = this.discountValue;
  }

  return Math.min(discount, cartSubtotal);
};

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
