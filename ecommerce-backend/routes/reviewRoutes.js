const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  voteReviewHelpful
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// When mounted directly under /api/products/:productId/reviews
router.route('/')
  .get((req, res, next) => {
    // If mounted under /api/products/:productId/reviews, pass params
    if (req.params.productId) {
      return getProductReviews(req, res, next);
    }
    next();
  })
  .post(protect, (req, res, next) => {
    if (req.params.productId) {
      return createReview(req, res, next);
    }
    next();
  });

// Standard review routes
router.get('/products/:productId', getProductReviews);
router.post('/products/:productId', protect, createReview);

// Specific review item actions
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.put('/:id/vote', protect, voteReviewHelpful);

module.exports = router;
