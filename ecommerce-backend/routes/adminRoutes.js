const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getAdminAnalytics,
  getUsers,
  getUserById,
  toggleUserBan,
  updateUserRole,
  getAdminProducts,
  toggleProductStatus,
  updateOrderStatusOverride,
  getSecurityAuditLogs
} = require('../controllers/adminController');
const { getAllOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// All admin endpoints require authenticated Administrator
router.use(protect, authorize('admin'));

// Platform KPIs & Analytics
router.get('/dashboard', getAdminDashboard);
router.get('/analytics', getAdminAnalytics);

// User Management & Moderation
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/ban', toggleUserBan);
router.patch('/users/:id/role', updateUserRole);

// Catalog Moderation
router.get('/products', getAdminProducts);
router.patch('/products/:id/status', toggleProductStatus);

// Platform Order Audits & Overrides
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatusOverride);

// Security Audit Trail (SOC2 / ISO-27001)
router.get('/audit-logs', getSecurityAuditLogs);

module.exports = router;
