const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const EmailService = require('../utils/email');

// @desc    Get all orders for admin with filtering and sorting
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAdminOrders = async (req, res) => {
  try {
    // Build query object
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Search functionality
    let searchQuery = {};
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      
      // Search in order ID, customer name, or email
      searchQuery = {
        $or: [
          { _id: req.query.search.match(/^[0-9a-fA-F]{24}$/) ? req.query.search : null },
          { 'shippingAddress.fullName': searchRegex },
          { 'shippingAddress.email': searchRegex }
        ].filter(condition => condition !== null)
      };
    }

    // Combine search with other filters
    const finalQuery = { ...queryObj, ...searchQuery };

    // Advanced filtering for date ranges
    let queryStr = JSON.stringify(finalQuery);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    let query = Order.find(JSON.parse(queryStr))
      .populate('user', 'fullName email')
      .populate('items.product', 'name images');

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Order.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const orders = await query;

    // Pagination result
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      status: 'success',
      count: orders.length,
      pagination,
      total,
      data: {
        orders
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get single order for admin with full details
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
exports.getAdminOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'fullName email phone')
      .populate('items.product', 'name images price');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update order status with validation
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid order status',
        validStatuses
      });
    }

    const order = await Order.findById(req.params.id).populate('user', 'fullName email');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Validate status transition
    const currentStatus = order.status;
    const invalidTransitions = {
      'delivered': ['pending', 'confirmed', 'processing'],
      'cancelled': ['shipped', 'delivered']
    };

    if (invalidTransitions[currentStatus] && invalidTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot change status from ${currentStatus} to ${status}`
      });
    }

    // Update order
    order.status = status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    if (notes) {
      order.adminNotes = notes;
    }

    // Set shipped date if status is shipped
    if (status === 'shipped' && !order.shippedAt) {
      order.shippedAt = new Date();
    }

    // Set delivered date if status is delivered
    if (status === 'delivered' && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    await order.save();

    // Send notification email to customer
    try {
      if (order.user && order.user.email) {
        await EmailService.sendOrderStatusUpdate(order, order.user);
      }
    } catch (emailError) {
      console.log('Order status update email failed:', emailError);
    }

    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Add tracking information to order
// @route   POST /api/admin/orders/:id/tracking
// @access  Private/Admin
exports.addTrackingInfo = async (req, res) => {
  try {
    const { trackingNumber, carrier, trackingUrl } = req.body;

    if (!trackingNumber) {
      return res.status(400).json({
        status: 'error',
        message: 'Tracking number is required'
      });
    }

    const order = await Order.findById(req.params.id).populate('user', 'fullName email');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Update tracking information
    order.trackingNumber = trackingNumber;
    if (carrier) order.carrier = carrier;
    if (trackingUrl) order.trackingUrl = trackingUrl;

    // Update status to shipped if not already
    if (order.status !== 'shipped' && order.status !== 'delivered') {
      order.status = 'shipped';
      order.shippedAt = new Date();
    }

    await order.save();

    // Send tracking email to customer
    try {
      if (order.user && order.user.email) {
        await EmailService.sendTrackingInfo(order, order.user);
      }
    } catch (emailError) {
      console.log('Tracking info email failed:', emailError);
    }

    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get order analytics and statistics
// @route   GET /api/admin/orders/analytics
// @access  Private/Admin
exports.getOrderAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Basic order statistics
    const totalOrders = await Order.countDocuments(dateFilter);
    const pendingOrders = await Order.countDocuments({ ...dateFilter, status: 'pending' });
    const processingOrders = await Order.countDocuments({ ...dateFilter, status: 'processing' });
    const shippedOrders = await Order.countDocuments({ ...dateFilter, status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ ...dateFilter, status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ ...dateFilter, status: 'cancelled' });

    // Revenue statistics
    const revenueStats = await Order.aggregate([
      { $match: { ...dateFilter, status: { $nin: ['cancelled'] } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
          totalShipping: { $sum: '$shippingFee' },
          totalTax: { $sum: '$tax' }
        }
      }
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$total' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Daily order trends (last 30 days if no date range specified)
    const trendStartDate = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const trendEndDate = endDate ? new Date(endDate) : new Date();

    const dailyTrends = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: trendStartDate, $lte: trendEndDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          orderCount: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Top customers by order value
    const topCustomers = await Order.aggregate([
      { $match: { ...dateFilter, status: { $nin: ['cancelled'] } } },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      {
        $project: {
          customerName: '$customer.fullName',
          customerEmail: '$customer.email',
          totalSpent: 1,
          orderCount: 1
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalOrders,
          pendingOrders,
          processingOrders,
          shippedOrders,
          deliveredOrders,
          cancelledOrders
        },
        revenue: revenueStats[0] || {
          totalRevenue: 0,
          averageOrderValue: 0,
          totalShipping: 0,
          totalTax: 0
        },
        ordersByStatus,
        dailyTrends,
        topCustomers
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Bulk update order status
// @route   PUT /api/admin/orders/bulk-status
// @access  Private/Admin
exports.bulkUpdateOrderStatus = async (req, res) => {
  try {
    const { orderIds, status, notes } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Order IDs array is required'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid order status',
        validStatuses
      });
    }

    const updateData = { status };
    if (notes) updateData.adminNotes = notes;
    if (status === 'shipped') updateData.shippedAt = new Date();
    if (status === 'delivered') updateData.deliveredAt = new Date();

    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: updateData }
    );

    res.status(200).json({
      status: 'success',
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};