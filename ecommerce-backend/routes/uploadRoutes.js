const express = require('express');
const router = express.Router();
const {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage
} = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const {
  uploadSingle,
  uploadMultiple,
  handleUploadErrors
} = require('../middleware/upload');

// Protected upload routes (Sellers and Admins only)
router.post(
  '/single',
  protect,
  authorize('seller', 'admin'),
  uploadSingle,
  handleUploadErrors,
  uploadSingleImage
);

router.post(
  '/multiple',
  protect,
  authorize('seller', 'admin'),
  uploadMultiple,
  handleUploadErrors,
  uploadMultipleImages
);

// Review image upload (accessible by any authenticated user/customer)
router.post(
  '/review-images',
  protect,
  uploadMultiple,
  handleUploadErrors,
  (req, res, next) => {
    req.body.folder = 'rigamart/reviews';
    next();
  },
  uploadMultipleImages
);

router.delete(
  '/:publicId(*)',
  protect,
  authorize('seller', 'admin'),
  deleteImage
);

module.exports = router;
