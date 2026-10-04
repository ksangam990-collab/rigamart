const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const {
  getActiveCoupons,
  applyCoupon,
  getAllCoupons,
  createCoupon,
  deleteCoupon
} = require('../controllers/couponController');

// Public active coupons discovery (for cart banners/drawers)
router.get('/active', getActiveCoupons);

// Authenticated shopper coupon application
router.post('/apply', protect, applyCoupon);

// Admin coupon management
router.use(protect, authorize('admin'));
router.route('/').get(getAllCoupons).post(createCoupon);
router.route('/:id').delete(deleteCoupon);

module.exports = router;
