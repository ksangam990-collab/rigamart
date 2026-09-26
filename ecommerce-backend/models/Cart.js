const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Product variant ID is required']
    },
    sku: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      max: [10, 'Maximum 10 units allowed per item'],
      default: 1
    },
    priceAtAddition: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cart must belong to a user'],
      unique: true
    },
    items: [cartItemSchema]
  },
  {
    timestamps: true
  }
);

// Helper virtual to calculate total items in cart
cartSchema.virtual('totalItems').get(function () {
  return this.items.reduce((acc, item) => acc + item.quantity, 0);
});

// Helper virtual to calculate estimated total value
cartSchema.virtual('subtotal').get(function () {
  return this.items.reduce((acc, item) => acc + item.priceAtAddition * item.quantity, 0);
});

cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
