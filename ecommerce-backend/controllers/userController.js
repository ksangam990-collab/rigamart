const axios = require('axios');
const User = require('../models/User');
const Product = require('../models/Product');

/**
 * @desc    Get user profile with addresses and wishlist count
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch profile: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Update basic user profile details (name, mobile)
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name, mobile } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (mobile) {
      if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid 10-digit Indian mobile number',
          data: null
        });
      }
      user.mobile = mobile.trim();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update profile: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Add a new shipping delivery address
 * @route   POST /api/users/address
 * @access  Private
 */
const addAddress = async (req, res) => {
  try {
    const { name, mobile, street, city, state, pincode, landmark, isDefault } = req.body;

    if (!name || !mobile || !street || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Name, mobile, street, city, state, and 6-digit PIN code are required',
        data: null
      });
    }

    if (!/^[1-9][0-9]{5}$/.test(pincode.toString().trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit Indian PIN code',
        data: null
      });
    }

    const user = await User.findById(req.user._id);

    // If first address or isDefault is true, unset default on existing addresses
    const makeDefault = isDefault || user.addresses.length === 0;

    if (makeDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      name: name.trim(),
      mobile: mobile.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.toString().trim(),
      landmark: landmark ? landmark.trim() : '',
      isDefault: makeDefault
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: {
        addresses: user.addresses
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to add address: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Update an existing address
 * @route   PUT /api/users/address/:id
 * @access  Private
 */
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, mobile, street, city, state, pincode, landmark, isDefault } = req.body;

    const user = await User.findById(req.user._id);
    const address = user.addresses.id(id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
        data: null
      });
    }

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
      address.isDefault = true;
    }

    if (name) address.name = name.trim();
    if (mobile) address.mobile = mobile.trim();
    if (street) address.street = street.trim();
    if (city) address.city = city.trim();
    if (state) address.state = state.trim();
    if (pincode) {
      if (!/^[1-9][0-9]{5}$/.test(pincode.toString().trim())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid 6-digit Indian PIN code',
          data: null
        });
      }
      address.pincode = pincode.toString().trim();
    }
    if (landmark !== undefined) address.landmark = landmark.trim();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: {
        addresses: user.addresses
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update address: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Delete a delivery address
 * @route   DELETE /api/users/address/:id
 * @access  Private
 */
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    const address = user.addresses.id(id);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
        data: null
      });
    }

    const wasDefault = address.isDefault;
    user.addresses.pull(id);

    // If deleted address was default, promote the first remaining address to default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address removed successfully',
      data: {
        addresses: user.addresses
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to remove address: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Reverse geocode coordinates into structured Indian address fields
 * @route   GET /api/users/reverse-geocode?lat=&lon=
 * @access  Private
 */
const reverseGeocodeLocation = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (
      isNaN(latitude) ||
      isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude (-90 to 90) and longitude (-180 to 180) parameters are required',
        data: null
      });
    }

    // Query OpenStreetMap Nominatim reverse geocoding API with custom User-Agent
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'json',
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'Rigamart-ECommerce-Platform/1.0 (support@rigamart.com)'
      },
      timeout: 6000
    });

    const addr = response.data?.address || {};

    // Build street from house number, building/road, and area
    const streetParts = [
      addr.house_number,
      addr.building,
      addr.road || addr.pedestrian || addr.street,
      addr.suburb || addr.neighbourhood
    ].filter(Boolean);

    const street = streetParts.length > 0
      ? streetParts.join(', ')
      : response.data?.display_name?.split(',').slice(0, 2).join(', ') || '';

    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.district ||
      addr.county ||
      '';
    const state = addr.state || addr.state_district || '';
    const pincode = addr.postcode || '';
    const landmark = addr.neighbourhood || addr.suburb || addr.quarter || addr.amenity || '';

    res.status(200).json({
      success: true,
      message: 'Coordinates resolved successfully',
      data: {
        street,
        city,
        state,
        pincode,
        landmark,
        displayName: response.data?.display_name || ''
      }
    });
  } catch (error) {
    console.error('Reverse geocode error:', error.message);
    res.status(502).json({
      success: false,
      message: 'Failed to resolve location address. Please enter address manually.',
      data: null
    });
  }
};

/**
 * @desc    Get user's wishlist populated with product summaries
 * @route   GET /api/users/wishlist
 * @access  Private
 */
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name brand images basePrice avgRating numReviews category variants isActive'
    });

    res.status(200).json({
      success: true,
      message: 'Wishlist retrieved successfully',
      data: {
        wishlist: user.wishlist.filter((product) => product && product.isActive)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch wishlist: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Add product to user's wishlist
 * @route   POST /api/users/wishlist/:productId
 * @access  Private
 */
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
        data: null
      });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product does not exist or is inactive',
        data: null
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { wishlist: productId } },
      { new: true }
    ).populate({
      path: 'wishlist',
      select: 'name brand images basePrice avgRating numReviews category variants isActive'
    });

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      data: {
        wishlist: user.wishlist
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to add to wishlist: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Remove product from user's wishlist
 * @route   DELETE /api/users/wishlist/:productId
 * @access  Private
 */
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { wishlist: productId } },
      { new: true }
    ).populate({
      path: 'wishlist',
      select: 'name brand images basePrice avgRating numReviews category variants isActive'
    });

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      data: {
        wishlist: user.wishlist
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to remove from wishlist: ${error.message}`,
      data: null
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  reverseGeocodeLocation,
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
