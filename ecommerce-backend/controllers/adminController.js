const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { getPagination } = require('../utils/paginate');

/**
 * Helper to restore inventory if admin overrides an order to Cancelled
 */
const restoreInventory = async (items) => {
  for (const item of items) {
    await Product.findOneAndUpdate(
      {
        _id: item.product,
        variants: {
          $elemMatch: { _id: item.variantId }
        }
      },
      {
        $inc: { 'variants.$.stock': item.quantity }
      }
    );
  }
};

/**
 * @desc    Get high-level platform KPIs, revenue metrics & recent activity
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin only)
 */
const getAdminDashboard = async (req, res) => {
  try {
    const [
      revenueAgg,
      orderStatusAgg,
      userStatsAgg,
      productStatsAgg,
      recentOrders,
      recentUsers
    ] = await Promise.all([
      // 1. Gross Merchandise Value (GMV) across valid orders
      Order.aggregate([
        { $match: { status: { $nin: ['Cancelled', 'Returned'] } } },
        {
          $group: {
            _id: null,
            totalGMV: { $sum: '$totalAmount' },
            validOrdersCount: { $sum: 1 }
          }
        }
      ]),

      // 2. Order counts by status
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // 3. User distribution by role and ban status
      User.aggregate([
        {
          $group: {
            _id: '$role',
            total: { $sum: 1 },
            banned: {
              $sum: { $cond: [{ $eq: ['$isBanned', true] }, 1, 0] }
            }
          }
        }
      ]),

      // 4. Products active vs deactivated count
      Product.aggregate([
        {
          $group: {
            _id: '$isActive',
            count: { $sum: 1 }
          }
        }
      ]),

      // 5. 5 most recent platform orders
      Order.find()
        .populate('user', 'name email mobile')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // 6. 5 most recent registered users
      User.find()
        .select('name email mobile role isBanned createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    // Format financial totals
    const totalGMV = revenueAgg.length > 0 ? revenueAgg[0].totalGMV : 0;
    const validOrdersCount = revenueAgg.length > 0 ? revenueAgg[0].validOrdersCount : 0;

    // Format order status counts
    const orderStatuses = {
      Placed: 0,
      Confirmed: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
      Returned: 0
    };
    let totalAllOrders = 0;
    orderStatusAgg.forEach((item) => {
      if (orderStatuses[item._id] !== undefined) {
        orderStatuses[item._id] = item.count;
      }
      totalAllOrders += item.count;
    });

    // Format user counts
    const usersByRole = { customer: 0, seller: 0, admin: 0 };
    let totalUsers = 0;
    let totalBannedUsers = 0;

    userStatsAgg.forEach((item) => {
      if (usersByRole[item._id] !== undefined) {
        usersByRole[item._id] = item.total;
      }
      totalUsers += item.total;
      totalBannedUsers += item.banned;
    });

    // Format product counts
    let activeProducts = 0;
    let inactiveProducts = 0;
    productStatsAgg.forEach((item) => {
      if (item._id === true) activeProducts = item.count;
      if (item._id === false) inactiveProducts = item.count;
    });
    const totalProducts = activeProducts + inactiveProducts;

    res.status(200).json({
      success: true,
      message: 'Admin platform metrics retrieved successfully',
      data: {
        financials: {
          totalGMV,
          validOrdersCount,
          totalAllOrders
        },
        orders: {
          total: totalAllOrders,
          breakdown: orderStatuses
        },
        users: {
          total: totalUsers,
          banned: totalBannedUsers,
          breakdown: usersByRole
        },
        catalog: {
          totalProducts,
          activeProducts,
          inactiveProducts
        },
        recentActivity: {
          orders: recentOrders,
          users: recentUsers
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch admin dashboard: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Get detailed platform sales analytics, revenue timelines & top sellers
 * @route   GET /api/admin/analytics
 * @access  Private (Admin only)
 */
const getAdminAnalytics = async (req, res) => {
  try {
    const { range = '30d' } = req.query;

    let days = 30;
    if (range === '7d') days = 7;
    if (range === '90d') days = 90;
    if (range === '1y') days = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // 1. Daily GMV and Order volume timeline
    const timelineAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $nin: ['Cancelled', 'Returned'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          dailyRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $project: {
          date: '$_id',
          revenue: '$dailyRevenue',
          orderCount: '$orderCount',
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    // 2. Top Sellers by GMV
    const topSellersAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $nin: ['Cancelled', 'Returned'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.seller',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          unitsSold: { $sum: '$items.quantity' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'seller'
        }
      },
      { $unwind: '$seller' },
      {
        $project: {
          sellerId: '$_id',
          sellerName: '$seller.name',
          sellerEmail: '$seller.email',
          revenue: 1,
          unitsSold: 1,
          _id: 0
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    // 3. Payment Method Distribution (COD vs Online)
    const paymentMethodsAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$paymentInfo.method',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      {
        $project: {
          method: '$_id',
          count: 1,
          totalAmount: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Admin sales analytics retrieved successfully',
      data: {
        range: `${days} days`,
        timeline: timelineAgg,
        topSellers: topSellersAgg,
        paymentDistribution: paymentMethodsAgg
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch admin analytics: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Get paginated platform users with search, role and ban filters
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getUsers = async (req, res) => {
  try {
    const { search, role, isBanned } = req.query;
    const { page, limit, skip, getPaginationMeta } = getPagination(req.query, 10);

    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (isBanned !== undefined) {
      filter.isBanned = isBanned === 'true';
    }

    if (search && search.trim()) {
      const term = search.trim();
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { mobile: { $regex: term, $options: 'i' } }
      ];
    }

    const [users, totalCount] = await Promise.all([
      User.find(filter)
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      message: 'Platform users retrieved successfully',
      data: {
        users,
        pagination: getPaginationMeta(totalCount)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch users: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Get single user details with customer order count and spending stats
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin only)
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password -refreshToken');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null
      });
    }

    // Parallel fetch user spending / activity stats
    const [ordersCount, totalSpentAgg, sellerProductsCount] = await Promise.all([
      Order.countDocuments({ user: user._id }),
      Order.aggregate([
        {
          $match: {
            user: user._id,
            status: { $nin: ['Cancelled', 'Returned'] }
          }
        },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: '$totalAmount' }
          }
        }
      ]),
      user.role === 'seller' ? Product.countDocuments({ seller: user._id }) : Promise.resolve(0)
    ]);

    const totalSpent = totalSpentAgg.length > 0 ? totalSpentAgg[0].totalSpent : 0;

    res.status(200).json({
      success: true,
      message: 'User details retrieved successfully',
      data: {
        user,
        stats: {
          ordersCount,
          totalSpent,
          sellerProductsCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve user: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Ban or unban a user (revokes active sessions on ban)
 * @route   PATCH /api/admin/users/:id/ban
 * @access  Private (Admin only)
 */
const toggleUserBan = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body;

    if (typeof isBanned !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isBanned must be a boolean (true or false)',
        data: null
      });
    }

    // Safety guard: Admin cannot ban their own account
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'Action prohibited: You cannot ban your own administrator account',
        data: null
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null
      });
    }

    user.isBanned = isBanned;

    // If banning, revoke refresh token to immediately prevent session extension
    if (isBanned) {
      user.refreshToken = null;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: isBanned
        ? `User account for ${user.email} has been suspended`
        : `User account for ${user.email} has been reinstated`,
      data: {
        userId: user._id,
        email: user.email,
        isBanned: user.isBanned
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update user ban status: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Change user role (customer, seller, admin)
 * @route   PATCH /api/admin/users/:id/role
 * @access  Private (Admin only)
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['customer', 'seller', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles: ${validRoles.join(', ')}`,
        data: null
      });
    }

    // Safety guard: Admin cannot demote themselves
    if (req.user._id.toString() === id && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Action prohibited: You cannot demote your own administrator account',
        data: null
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null
      });
    }

    const previousRole = user.role;
    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Role for ${user.email} changed from '${previousRole}' to '${role}' successfully`,
      data: {
        userId: user._id,
        email: user.email,
        previousRole,
        newRole: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update user role: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Get paginated platform catalog across all sellers (with moderation filters)
 * @route   GET /api/admin/products
 * @access  Private (Admin only)
 */
const getAdminProducts = async (req, res) => {
  try {
    const { search, category, seller, isActive } = req.query;
    const { page, limit, skip, getPaginationMeta } = getPagination(req.query, 10);

    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (category) {
      filter.category = category;
    }

    if (seller) {
      filter.seller = seller;
    }

    if (search && search.trim()) {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .populate('seller', 'name email mobile')
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter)
    ]);

    // Calculate total stock per product for admin view
    const enriched = products.map((p) => ({
      ...p,
      totalStock: p.variants ? p.variants.reduce((acc, v) => acc + v.stock, 0) : 0
    }));

    res.status(200).json({
      success: true,
      message: 'Platform products retrieved successfully',
      data: {
        products: enriched,
        pagination: getPaginationMeta(totalCount)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch admin products: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Moderate product status (activate / deactivate product from public catalog)
 * @route   PATCH /api/admin/products/:id/status
 * @access  Private (Admin only)
 */
const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, reason } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean (true or false)',
        data: null
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        data: null
      });
    }

    product.isActive = isActive;
    await product.save();

    res.status(200).json({
      success: true,
      message: isActive
        ? `Product '${product.name}' activated and visible in public store`
        : `Product '${product.name}' deactivated and hidden from public store${reason ? ` (Reason: ${reason})` : ''}`,
      data: {
        productId: product._id,
        name: product.name,
        isActive: product.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update product status: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Admin order status override / dispute resolution (e.g. emergency cancellation, refund)
 * @route   PATCH /api/admin/orders/:id/status
 * @access  Private (Admin only)
 */
const updateOrderStatusOverride = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment, reason } = req.body;

    const validStatuses = ['Placed', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed statuses: ${validStatuses.join(', ')}`,
        data: null
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        data: null
      });
    }

    const previousStatus = order.status;

    // If overriding to Cancelled from an active status, restore stock
    if (status === 'Cancelled' && !['Cancelled', 'Returned'].includes(previousStatus)) {
      await restoreInventory(order.items);
      order.cancelledAt = new Date();
      order.cancelReason = reason || 'Cancelled by platform administrator';

      if (order.paymentInfo.status === 'Completed') {
        order.paymentInfo.status = 'Refunded';
      }
    }

    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      if (order.paymentInfo.method === 'COD') {
        order.paymentInfo.status = 'Completed';
        order.paymentInfo.paidAt = new Date();
      }
    }

    order.status = status;
    order.statusTimeline.push({
      status,
      comment: comment || `Admin status override from '${previousStatus}' to '${status}'`,
      timestamp: new Date()
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status overridden from '${previousStatus}' to '${status}' successfully`,
      data: {
        order
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to override order status: ${error.message}`,
      data: null
    });
  }
};

module.exports = {
  getAdminDashboard,
  getAdminAnalytics,
  getUsers,
  getUserById,
  toggleUserBan,
  updateUserRole,
  getAdminProducts,
  toggleProductStatus,
  updateOrderStatusOverride
};
