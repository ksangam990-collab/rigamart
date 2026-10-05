const express = require('express');
const router = express.Router();
const {
  getMyOrders,
  getOrderById,
  cancelOrder,
  returnOrder,
  getSellerOrders,
  updateSellerOrderStatus,
  getSellerReturns,
  updateReturnStatus,
  getAllOrders,
  getInvoice
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// All order endpoints require an authenticated user session
router.use(protect);

// Static specific routes (Declared before dynamic /:id to prevent routing clash)
router.get('/my-orders', getMyOrders);
router.get('/seller/orders', authorize('seller', 'admin'), getSellerOrders);
router.get('/seller/returns', authorize('seller', 'admin'), getSellerReturns);
router.put('/seller/:id/status', authorize('seller', 'admin'), updateSellerOrderStatus);
router.put('/seller/:id/return-status', authorize('seller', 'admin'), updateReturnStatus);
router.get('/admin/all', authorize('admin'), getAllOrders);

// Dynamic parameterized order routes
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/return', returnOrder);
router.get('/:id/invoice', getInvoice);

module.exports = router;
