const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  reverseGeocodeLocation,
  getWishlist,
  addToWishlist,
  removeFromWishlist
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// All user endpoints require authentication
router.use(protect);

// Profile & Geolocation
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/reverse-geocode', reverseGeocodeLocation);

// Shipping Addresses
router.post('/address', addAddress);
router.put('/address/:id', updateAddress);
router.delete('/address/:id', deleteAddress);

// Wishlist
router.get('/wishlist', getWishlist);
router.post('/wishlist/:productId', addToWishlist);
router.delete('/wishlist/:productId', removeFromWishlist);

module.exports = router;
