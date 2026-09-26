const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const reviewRoutes = require('./reviewRoutes');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Re-route into other resource routers
router.use('/:productId/reviews', reviewRoutes);

// Public catalog and search routes
router.get('/', getProducts);
router.get('/search', searchProducts); // Must precede /:id to prevent route clash
router.get('/:id', getProductById);

// Protected seller & admin product operations
router.post('/', protect, authorize('seller', 'admin'), createProduct);
router.put('/:id', protect, authorize('seller', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('seller', 'admin'), deleteProduct);

module.exports = router;
