const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');

/**
 * Seed starter promo codes if collection is empty or missing key codes
 */
const seedInitialCoupons = async () => {
  try {
    const oneYearAhead = new Date();
    oneYearAhead.setFullYear(oneYearAhead.getFullYear() + 1);

    const starterCoupons = [
      {
        code: 'FIRST50',
        description: 'Special newcomer offer! Flat ₹50 instant discount on your first order above ₹299',
        discountType: 'flat',
        discountValue: 50,
        maxDiscount: null,
        minCartValue: 299,
        expiryDate: oneYearAhead,
        isActive: true
      },
      {
        code: 'FESTIVE10',
        description: 'Festive season treat: 10% instant savings up to ₹150 on orders above ₹499',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscount: 150,
        minCartValue: 499,
        expiryDate: oneYearAhead,
        isActive: true
      },
      {
        code: 'SAVE20',
        description: 'Big cart bonus: 20% discount up to ₹400 on orders above ₹1,499',
        discountType: 'percentage',
        discountValue: 20,
        maxDiscount: 400,
        minCartValue: 1499,
        expiryDate: oneYearAhead,
        isActive: true
      },
      {
        code: 'WELCOME10',
        description: 'Get 10% OFF up to ₹150 on orders above ₹499',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscount: 150,
        minCartValue: 499,
        expiryDate: oneYearAhead,
        isActive: true
      },
      {
        code: 'FESTIVE20',
        description: 'Special 20% festive discount up to ₹300 on orders above ₹999',
        discountType: 'percentage',
        discountValue: 20,
        maxDiscount: 300,
        minCartValue: 999,
        expiryDate: oneYearAhead,
        isActive: true
      },
      {
        code: 'MEGA100',
        description: 'Flat ₹100 instant discount on orders above ₹799',
        discountType: 'flat',
        discountValue: 100,
        maxDiscount: null,
        minCartValue: 799,
        expiryDate: oneYearAhead,
        isActive: true
      }
    ];

    for (const c of starterCoupons) {
      await Coupon.updateOne(
        { code: c.code },
        { $setOnInsert: c },
        { upsert: true }
      );
    }
  } catch (err) {
    console.error('[COUPON SEED ERROR]', err.message);
  }
};

// Trigger seed check non-blocking
seedInitialCoupons();


/**
 * @desc    Get active, unexpired coupons for shoppers
 * @route   GET /api/coupons/active
 * @access  Public
 */
const getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gte: now },
      $or: [{ usageLimit: null }, { $expr: { $lt: ['$timesUsed', '$usageLimit'] } }]
    })
      .select('code description discountType discountValue maxDiscount minCartValue expiryDate')
      .sort({ minCartValue: 1 })
      .lean();

    res.status(200).json({
      success: true,
      message: 'Active coupons fetched successfully',
      data: {
        coupons
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch coupons: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Validate and calculate discount for a coupon code
 * @route   POST /api/coupons/apply
 * @access  Private (Authenticated Customer)
 */
const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    let { itemsPrice } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid coupon code',
        data: null
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    // If itemsPrice wasn't provided or <= 0, calculate from customer's active Cart
    if (itemsPrice === undefined || itemsPrice === null || Number(itemsPrice) <= 0) {
      if (req.user && req.user._id) {
        const cart = await Cart.findOne({ user: req.user._id }).populate({
          path: 'items.product',
          select: 'variants isActive'
        });

        if (cart && cart.items.length > 0) {
          itemsPrice = cart.items.reduce((sum, item) => {
            const variant = item.product?.variants?.id(item.variantId);
            const price = variant?.price ?? item.priceAtAddition ?? 0;
            return sum + price * item.quantity;
          }, 0);
        }
      }
    }

    const numericSubtotal = Number(itemsPrice) || 0;

    if (numericSubtotal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot apply coupon on an empty cart or zero subtotal',
        data: null
      });
    }

    const coupon = await Coupon.findOne({ code: normalizedCode });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: `Coupon code "${normalizedCode}" is not recognized`,
        data: null
      });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${coupon.code}" has expired or is no longer active`,
        data: null
      });
    }

    if (numericSubtotal < coupon.minCartValue) {
      return res.status(400).json({
        success: false,
        message: `Cart total must be at least ₹${coupon.minCartValue.toLocaleString(
          'en-IN'
        )} to apply code "${coupon.code}". Add ₹${(
          coupon.minCartValue - numericSubtotal
        ).toLocaleString('en-IN')} more!`,
        data: {
          minCartValue: coupon.minCartValue,
          currentSubtotal: numericSubtotal,
          requiredMore: coupon.minCartValue - numericSubtotal
        }
      });
    }

    const discountAmount = coupon.calculateDiscount(numericSubtotal);

    if (discountAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${coupon.code}" could not be applied to this cart`,
        data: null
      });
    }

    const finalPrice = Math.max(0, numericSubtotal - discountAmount);

    res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" applied! You saved ₹${discountAmount.toLocaleString('en-IN')}.`,
      data: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
        discountAmount,
        minCartValue: coupon.minCartValue,
        finalPrice
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to apply coupon: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Get all coupons (Admin)
 * @route   GET /api/coupons
 * @access  Private (Admin)
 */
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'All coupons retrieved successfully',
      data: { coupons }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve coupons: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Create new coupon (Admin)
 * @route   POST /api/coupons
 * @access  Private (Admin)
 */
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minCartValue,
      expiryDate,
      usageLimit
    } = req.body;

    const existing = await Coupon.findOne({ code: code?.trim().toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Coupon code "${code.toUpperCase()}" already exists`,
        data: null
      });
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      description,
      discountType,
      discountValue,
      maxDiscount: maxDiscount || null,
      minCartValue: minCartValue || 0,
      expiryDate,
      usageLimit: usageLimit || null
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: { coupon }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: `Failed to create coupon: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Delete coupon (Admin)
 * @route   DELETE /api/coupons/:id
 * @access  Private (Admin)
 */
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" deleted successfully`,
      data: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to delete coupon: ${error.message}`,
      data: null
    });
  }
};

module.exports = {
  getActiveCoupons,
  applyCoupon,
  getAllCoupons,
  createCoupon,
  deleteCoupon
};
