const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must be authored by a user']
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product']
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars']
    },
    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    body: {
      type: String,
      required: [true, 'Review body text is required'],
      trim: true,
      maxlength: [1000, 'Review body cannot exceed 1000 characters']
    },
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true }
      }
    ],
    verifiedPurchase: {
      type: Boolean,
      default: false
    },
    helpfulVotes: {
      type: Number,
      default: 0,
      min: 0
    },
    votedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

// Prevent multiple reviews from the same user on a single product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to recalculate product average rating and total review count
reviewSchema.statics.calcAverageRating = async function (productId) {
  try {
    const pId = new mongoose.Types.ObjectId(productId);
    const stats = await this.aggregate([
      {
        $match: { product: pId }
      },
      {
        $group: {
          _id: '$product',
          avgRating: { $avg: '$rating' },
          numReviews: { $sum: 1 }
        }
      }
    ]);

    const Product = mongoose.model('Product');
    if (stats.length > 0) {
      await Product.findByIdAndUpdate(pId, {
        avgRating: Math.round(stats[0].avgRating * 10) / 10,
        numReviews: stats[0].numReviews
      });
    } else {
      await Product.findByIdAndUpdate(pId, {
        avgRating: 0,
        numReviews: 0
      });
    }
  } catch (error) {
    console.error('Error updating product rating statistics:', error);
  }
};

// Update product rating stats on new review creation or update
reviewSchema.post('save', async function () {
  await this.constructor.calcAverageRating(this.product);
});

// Update product rating stats after review deletion
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRating(doc.product);
  }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
