const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const { getPagination } = require('../utils/paginate');

/**
 * @desc    Get seller overview dashboard (revenue, order counts, low stock alerts, recent orders)
 * @route   GET /api/seller/dashboard
 * @access  Private (Seller, Admin)
 */
const getSellerDashboard = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user._id);

    // 1. Fetch all products owned by seller
    const products = await Product.find({ seller: sellerId })
      .select('name variants avgRating numReviews images')
      .lean();

    const totalProducts = products.length;
    let totalInventoryUnits = 0;
    const lowStockAlerts = [];

    products.forEach((p) => {
      p.variants.forEach((v) => {
        totalInventoryUnits += v.stock;
        if (v.stock <= 5) {
          lowStockAlerts.push({
            productId: p._id,
            productName: p.name,
            sku: v.sku,
            size: v.size,
            color: v.color,
            stock: v.stock,
            price: v.price
          });
        }
      });
    });

    // 2. Fetch order metrics for seller
    const orderFilter = { 'items.seller': sellerId };

    const [allOrders, statusCountsAgg, revenueAgg] = await Promise.all([
      // 5 most recent orders
      Order.find(orderFilter)
        .populate('user', 'name email mobile')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Order counts by status
      Order.aggregate([
        { $match: orderFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Total revenue and items sold across non-cancelled/non-returned orders
      Order.aggregate([
        {
          $match: {
            ...orderFilter,
            status: { $nin: ['Cancelled', 'Returned'] }
          }
        },
        { $unwind: '$items' },
        { $match: { 'items.seller': sellerId } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            totalUnitsSold: { $sum: '$items.quantity' }
          }
        }
      ])
    ]);

    // Format status counts
    const statusCounts = {
      Placed: 0,
      Confirmed: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
      Returned: 0
    };

    let totalOrdersCount = 0;
    statusCountsAgg.forEach((item) => {
      if (statusCounts[item._id] !== undefined) {
        statusCounts[item._id] = item.count;
      }
      totalOrdersCount += item.count;
    });

    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;
    const totalUnitsSold = revenueAgg.length > 0 ? revenueAgg[0].totalUnitsSold : 0;

    // Format recent orders so seller sees their specific revenue and items
    const formattedRecentOrders = allOrders.map((ord) => {
      const myItems = ord.items.filter(
        (i) => i.seller.toString() === req.user._id.toString()
      );
      const myRevenue = myItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

      return {
        _id: ord._id,
        orderNumber: ord.orderNumber,
        customerName: ord.shippingAddress ? ord.shippingAddress.name : ord.user?.name,
        city: ord.shippingAddress?.city,
        status: ord.status,
        paymentMethod: ord.paymentInfo?.method,
        createdAt: ord.createdAt,
        itemsCount: myItems.length,
        sellerRevenue: myRevenue,
        items: myItems
      };
    });

    res.status(200).json({
      success: true,
      message: 'Seller dashboard retrieved successfully',
      data: {
        metrics: {
          totalRevenue,
          totalUnitsSold,
          totalOrders: totalOrdersCount,
          pendingOrders: statusCounts.Placed + statusCounts.Confirmed,
          shippedOrders: statusCounts.Shipped,
          deliveredOrders: statusCounts.Delivered,
          cancelledOrders: statusCounts.Cancelled,
          returnedOrders: statusCounts.Returned,
          totalProducts,
          totalInventoryUnits,
          lowStockCount: lowStockAlerts.length
        },
        statusCounts,
        lowStockAlerts: lowStockAlerts.slice(0, 10), // Top 10 low stock items
        recentOrders: formattedRecentOrders
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve seller dashboard: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Get seller sales analytics and charts data
 * @route   GET /api/seller/analytics
 * @access  Private (Seller, Admin)
 */
const getSellerAnalytics = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user._id);
    const { range = '30d' } = req.query;

    let days = 30;
    if (range === '7d') days = 7;
    if (range === '90d') days = 90;
    if (range === 'all') days = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // 1. Daily sales timeline aggregation
    const timelineAgg = await Order.aggregate([
      {
        $match: {
          'items.seller': sellerId,
          createdAt: { $gte: startDate },
          status: { $nin: ['Cancelled', 'Returned'] }
        }
      },
      { $unwind: '$items' },
      { $match: { 'items.seller': sellerId } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          dailyRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          unitsSold: { $sum: '$items.quantity' },
          orderCount: { $addToSet: '$_id' }
        }
      },
      {
        $project: {
          date: '$_id',
          revenue: '$dailyRevenue',
          unitsSold: '$unitsSold',
          orderCount: { $size: '$orderCount' }
        }
      },
      { $sort: { date: 1 } }
    ]);

    // 2. Top-selling products aggregation
    const topProductsAgg = await Order.aggregate([
      {
        $match: {
          'items.seller': sellerId,
          createdAt: { $gte: startDate },
          status: { $nin: ['Cancelled', 'Returned'] }
        }
      },
      { $unwind: '$items' },
      { $match: { 'items.seller': sellerId } },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          totalUnits: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalUnits: -1 } },
      { $limit: 5 }
    ]);

    // 3. Category revenue breakdown
    const categoryAgg = await Order.aggregate([
      {
        $match: {
          'items.seller': sellerId,
          createdAt: { $gte: startDate },
          status: { $nin: ['Cancelled', 'Returned'] }
        }
      },
      { $unwind: '$items' },
      { $match: { 'items.seller': sellerId } },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDoc'
        }
      },
      { $unwind: '$productDoc' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productDoc.category',
          foreignField: '_id',
          as: 'categoryDoc'
        }
      },
      { $unwind: { path: '$categoryDoc', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$categoryDoc.name',
          categoryName: { $first: { $ifNull: ['$categoryDoc.name', 'Uncategorized'] } },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          unitsSold: { $sum: '$items.quantity' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // 4. Fill continuous day-by-day timeline for smooth charting
    const timelineMap = new Map();
    timelineAgg.forEach((item) => {
      timelineMap.set(item.date, item);
    });

    const continuousTimeline = [];
    const curr = new Date(startDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    while (curr <= today) {
      const dateStr = curr.toISOString().slice(0, 10);
      const match = timelineMap.get(dateStr);
      continuousTimeline.push(
        match || {
          date: dateStr,
          revenue: 0,
          unitsSold: 0,
          orderCount: 0
        }
      );
      curr.setDate(curr.getDate() + 1);
    }

    const totalPeriodRevenue = continuousTimeline.reduce((acc, d) => acc + d.revenue, 0);
    const totalPeriodUnits = continuousTimeline.reduce((acc, d) => acc + d.unitsSold, 0);
    const totalPeriodOrders = continuousTimeline.reduce((acc, d) => acc + d.orderCount, 0);
    const averageOrderValue =
      totalPeriodOrders > 0 ? Math.round(totalPeriodRevenue / totalPeriodOrders) : 0;

    res.status(200).json({
      success: true,
      message: 'Seller analytics retrieved successfully',
      data: {
        range: `${days} days`,
        days,
        timeline: continuousTimeline,
        topProducts: topProductsAgg,
        categoryPerformance: categoryAgg,
        summary: {
          periodRevenue: totalPeriodRevenue,
          periodUnits: totalPeriodUnits,
          periodOrders: totalPeriodOrders,
          averageOrderValue
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve seller analytics: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Get paginated seller products with stock statistics & low-stock filtering
 * @route   GET /api/seller/products
 * @access  Private (Seller, Admin)
 */
const getSellerProducts = async (req, res) => {
  try {
    const { search, lowStock, category } = req.query;
    const { page, limit, skip, getPaginationMeta } = getPagination(req.query, 10);

    const filter = { seller: req.user._id };

    if (category) {
      filter.category = category;
    }

    if (search && search.trim()) {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    if (lowStock === 'true') {
      filter['variants.stock'] = { $lte: 5 };
    }

    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter)
    ]);

    // Enrich each product with variant count and total available stock
    const enrichedProducts = products.map((p) => {
      const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
      const minStock = Math.min(...p.variants.map((v) => v.stock));
      return {
        ...p,
        totalStock,
        isLowStock: minStock <= 5,
        variantsCount: p.variants.length
      };
    });

    res.status(200).json({
      success: true,
      message: 'Seller products retrieved successfully',
      data: {
        products: enrichedProducts,
        pagination: getPaginationMeta(totalCount)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve seller products: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Quick inline update for a variant's stock
 * @route   PATCH /api/seller/products/:productId/variants/:variantId/stock
 * @access  Private (Seller, Admin)
 */
const updateVariantStock = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { stock } = req.body;

    if (stock === undefined || isNaN(stock) || Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a non-negative number',
        data: null
      });
    }

    const newStock = Number(stock);

    // Verify product exists and belongs to seller (or caller is admin)
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        data: null
      });
    }

    const isOwner = product.seller.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to modify this product',
        data: null
      });
    }

    // Locate the variant subdocument
    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found in product',
        data: null
      });
    }

    const previousStock = variant.stock;
    variant.stock = newStock;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Variant stock updated from ${previousStock} to ${newStock} successfully`,
      data: {
        productId: product._id,
        variantId: variant._id,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        previousStock,
        newStock: variant.stock,
        totalProductStock: product.variants.reduce((acc, v) => acc + v.stock, 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update variant stock: ${error.message}`,
      data: null
    });
  }
};

module.exports = {
  getSellerDashboard,
  getSellerAnalytics,
  getSellerProducts,
  updateVariantStock
};
