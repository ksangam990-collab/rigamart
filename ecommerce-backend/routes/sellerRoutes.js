const express = require('express');
const router = express.Router();
const {
  getSellerDashboard,
  getSellerAnalytics,
  getSellerProducts,
  updateVariantStock
} = require('../controllers/sellerController');
const {
  getSellerOrders,
  updateSellerOrderStatus
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// All seller endpoints require authenticated Seller or Admin
router.use(protect, authorize('seller', 'admin'));

// Overview Dashboard & Analytics
router.get('/dashboard', getSellerDashboard);
router.get('/analytics', getSellerAnalytics);

// Product Inventory Management
router.get('/products', getSellerProducts);
router.patch('/products/:productId/variants/:variantId/stock', updateVariantStock);

// Seller Order Management
router.get('/orders', getSellerOrders);
router.put('/orders/:id/status', updateSellerOrderStatus);

module.exports = router;
