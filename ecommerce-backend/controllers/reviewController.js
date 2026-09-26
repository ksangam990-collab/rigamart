const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { getPagination } = require('../utils/paginate');

/**
 * @desc    Submit a review for a product (with verified purchase badge check)
 * @route   POST /api/reviews/products/:productId (or POST /api/products/:productId/reviews)
 * @access  Private (Customer)
 */
const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, body, images = [] } = req.body;

    // Validate inputs
    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5',
        data: null
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Review title is required',
        data: null
      });
    }

    if (!body || !body.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Review body text is required',
        data: null
      });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        data: null
      });
    }

    // Guard against duplicate review on the same product by the same user
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this product. You can update your existing review.',
        data: null
      });
    }

    // Verified purchase check: Check if user has an order with status 'Delivered' containing this product
    const hasDeliveredOrder = await Order.exists({
      user: req.user._id,
      'items.product': productId,
      status: 'Delivered'
    });

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating: numRating,
      title: title.trim(),
      body: body.trim(),
      images: Array.isArray(images) ? images : [],
      verifiedPurchase: Boolean(hasDeliveredOrder)
    });

    // Populate user info for immediate response
    await review.populate('user', 'name email');

    // Fetch updated product stats
    const updatedProduct = await Product.findById(productId).select('avgRating numReviews');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: {
        review,
        productStats: {
          avgRating: updatedProduct.avgRating,
          numReviews: updatedProduct.numReviews
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to create review: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Get paginated reviews for a product with ratings distribution breakdown
 * @route   GET /api/reviews/products/:productId (or GET /api/products/:productId/reviews)
 * @access  Public
 */
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, sort, hasImages, verifiedOnly } = req.query;
    const { page, limit, skip, getPaginationMeta } = getPagination(req.query, 10);

    const productObjectId = new mongoose.Types.ObjectId(productId);

    // Build query filter
    const filter = { product: productObjectId };

    if (rating && !isNaN(rating)) {
      filter.rating = Number(rating);
    }

    if (hasImages === 'true') {
      filter['images.0'] = { $exists: true };
    }

    if (verifiedOnly === 'true') {
      filter.verifiedPurchase = true;
    }

    // Build sort order
    let sortOptions = { createdAt: -1 }; // default: most recent
    if (sort === 'helpful') {
      sortOptions = { helpfulVotes: -1, createdAt: -1 };
    } else if (sort === 'highest') {
      sortOptions = { rating: -1, createdAt: -1 };
    } else if (sort === 'lowest') {
      sortOptions = { rating: 1, createdAt: -1 };
    }

    // Parallel fetch: reviews, total count for filter, and full rating breakdown
    const [reviews, totalCount, breakdownAgg] = await Promise.all([
      Review.find(filter)
        .populate('user', 'name')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
      Review.aggregate([
        { $match: { product: productObjectId } },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Format star rating distribution (1 to 5 stars)
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalAllReviews = 0;
    let sumRating = 0;

    breakdownAgg.forEach((item) => {
      if (breakdown[item._id] !== undefined) {
        breakdown[item._id] = item.count;
        totalAllReviews += item.count;
        sumRating += item._id * item.count;
      }
    });

    const avgRating = totalAllReviews > 0 ? Math.round((sumRating / totalAllReviews) * 10) / 10 : 0;

    // Calculate percentages for UI progress bars
    const percentages = {
      5: totalAllReviews > 0 ? Math.round((breakdown[5] / totalAllReviews) * 100) : 0,
      4: totalAllReviews > 0 ? Math.round((breakdown[4] / totalAllReviews) * 100) : 0,
      3: totalAllReviews > 0 ? Math.round((breakdown[3] / totalAllReviews) * 100) : 0,
      2: totalAllReviews > 0 ? Math.round((breakdown[2] / totalAllReviews) * 100) : 0,
      1: totalAllReviews > 0 ? Math.round((breakdown[1] / totalAllReviews) * 100) : 0
    };

    res.status(200).json({
      success: true,
      message: 'Product reviews retrieved successfully',
      data: {
        reviews,
        summary: {
          totalReviews: totalAllReviews,
          avgRating,
          breakdown,
          percentages
        },
        pagination: getPaginationMeta(totalCount)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve reviews: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Update an existing review
 * @route   PUT /api/reviews/:id
 * @access  Private (Review Author)
 */
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, body, images } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
        data: null
      });
    }

    // Authorization: User must be author of review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to edit this review',
        data: null
      });
    }

    if (rating !== undefined) {
      const numRating = Number(rating);
      if (!numRating || numRating < 1 || numRating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5',
          data: null
        });
      }
      review.rating = numRating;
    }

    if (title !== undefined) review.title = title.trim();
    if (body !== undefined) review.body = body.trim();
    if (images !== undefined && Array.isArray(images)) review.images = images;

    await review.save();
    await review.populate('user', 'name email');

    const updatedProduct = await Product.findById(review.product).select('avgRating numReviews');

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review,
        productStats: {
          avgRating: updatedProduct.avgRating,
          numReviews: updatedProduct.numReviews
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update review: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private (Review Author or Admin)
 */
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
        data: null
      });
    }

    const isAuthor = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to delete this review',
        data: null
      });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(id);

    // Recalculate average rating
    await Review.calcAverageRating(productId);

    const updatedProduct = await Product.findById(productId).select('avgRating numReviews');

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      data: {
        productStats: {
          avgRating: updatedProduct ? updatedProduct.avgRating : 0,
          numReviews: updatedProduct ? updatedProduct.numReviews : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to delete review: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Toggle helpful vote on a review
 * @route   PUT /api/reviews/:id/vote
 * @access  Private (Authenticated User)
 */
const voteReviewHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
        data: null
      });
    }

    // Prevent voting on your own review
    if (review.user.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot vote on your own review',
        data: null
      });
    }

    const userId = req.user._id;
    const hasVoted = review.votedUsers.some(
      (voterId) => voterId.toString() === userId.toString()
    );

    let updatedReview;
    if (hasVoted) {
      // Toggle off vote
      updatedReview = await Review.findByIdAndUpdate(
        id,
        {
          $pull: { votedUsers: userId },
          $inc: { helpfulVotes: -1 }
        },
        { new: true }
      );
    } else {
      // Toggle on vote
      updatedReview = await Review.findByIdAndUpdate(
        id,
        {
          $addToSet: { votedUsers: userId },
          $inc: { helpfulVotes: 1 }
        },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: hasVoted ? 'Helpful vote removed' : 'Marked review as helpful',
      data: {
        reviewId: id,
        helpfulVotes: updatedReview.helpfulVotes,
        hasVoted: !hasVoted
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to vote on review: ${error.message}`,
      data: null
    });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  voteReviewHelpful
};
