const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const emailQueue = require('../utils/emailQueue');

// Order status workflow: pending → confirmed → processing → shipped → delivered
const ORDER_STATUS_FLOW = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: []
};

// @desc    Get all orders with advanced filtering
// @route   GET /api/admin/order-management
// @access  Private/Admin
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      dateFrom,
      dateTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }
    
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get orders with pagination
    const orders = await Order.find(filter)
      .populate('user', 'fullName email phone')
      .populate('items.product', 'name images price')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / parseInt(limit));

    // Get status counts for dashboard
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$total' }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        },
        statusCounts,
        filters: {
          status,
          dateFrom,
          dateTo,
          search,
          sortBy,
          sortOrder
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get single order details for admin
// @route   GET /api/admin/order-management/:id
// @access  Private/Admin
exports.getOrderDetailsAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'fullName email phone createdAt')
      .populate('items.product', 'name images price category')
      .populate('items.product.category', 'name');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Get order timeline/history (you might want to create an OrderHistory model)
    const orderHistory = [
      {
        status: 'pending',
        timestamp: order.createdAt,
        message: 'Order placed successfully',
        automated: true
      }
    ];

    // Add payment status if available
    if (order.paidAt) {
      orderHistory.push({
        status: 'paid',
        timestamp: order.paidAt,
        message: 'Payment confirmed',
        automated: true
      });
    }

    // Get available status transitions
    const availableTransitions = ORDER_STATUS_FLOW[order.status] || [];

    res.status(200).json({
      status: 'success',
      data: {
        order,
        orderHistory,
        availableTransitions,
        statusFlow: ORDER_STATUS_FLOW
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update order status with workflow validation
// @route   PUT /api/admin/order-management/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, statusMessage, notifyCustomer = true } = req.body;
    
    const order = await Order.findById(req.params.id).populate('user');
    
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Validate status transition
    const allowedTransitions = ORDER_STATUS_FLOW[order.status] || [];
    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot transition from ${order.status} to ${status}. Allowed transitions: ${allowedTransitions.join(', ')}`
      });
    }

    const oldStatus = order.status;
    
    // Update order
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (statusMessage) order.statusMessage = statusMessage;
    
    // Set timestamps for specific statuses
    if (status === 'confirmed') {
      order.confirmedAt = new Date();
    } else if (status === 'shipped') {
      order.shippedAt = new Date();
    } else if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    // Send notification email if requested
    if (notifyCustomer && order.user) {
      try {
        await emailQueue.queueOrderStatusUpdate(order.user.email, {
          orderId: order.orderNumber,
          customerName: order.user.fullName,
          status: order.status,
          trackingNumber: order.trackingNumber,
          statusMessage: order.statusMessage,
          _id: order._id
        });
      } catch (emailError) {
        console.error('Failed to queue status update email:', emailError);
      }
    }

    // Handle inventory for cancelled orders
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      await restoreInventoryForCancelledOrder(order);
    }

    res.status(200).json({
      status: 'success',
      data: {
        order,
        message: `Order status updated from ${oldStatus} to ${status}`,
        emailSent: notifyCustomer
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
// @route   PUT /api/admin/order-management/bulk-status
// @access  Private/Admin
exports.bulkUpdateOrderStatus = async (req, res) => {
  try {
    const { orderIds, status, trackingNumbers = {}, statusMessage, notifyCustomers = true } = req.body;
    
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Order IDs array is required'
      });
    }

    const results = [];
    const errors = [];

    for (const orderId of orderIds) {
      try {
        const order = await Order.findById(orderId).populate('user');
        
        if (!order) {
          errors.push({ orderId, error: 'Order not found' });
          continue;
        }

        // Validate status transition
        const allowedTransitions = ORDER_STATUS_FLOW[order.status] || [];
        if (!allowedTransitions.includes(status)) {
          errors.push({ 
            orderId, 
            error: `Cannot transition from ${order.status} to ${status}` 
          });
          continue;
        }

        const oldStatus = order.status;
        
        // Update order
        order.status = status;
        if (trackingNumbers[orderId]) order.trackingNumber = trackingNumbers[orderId];
        if (statusMessage) order.statusMessage = statusMessage;
        
        // Set timestamps
        if (status === 'confirmed') order.confirmedAt = new Date();
        else if (status === 'shipped') order.shippedAt = new Date();
        else if (status === 'delivered') order.deliveredAt = new Date();

        await order.save();

        // Send notification email
        if (notifyCustomers && order.user) {
          try {
            await emailQueue.queueOrderStatusUpdate(order.user.email, {
              orderId: order.orderNumber,
              customerName: order.user.fullName,
              status: order.status,
              trackingNumber: order.trackingNumber,
              statusMessage: order.statusMessage,
              _id: order._id
            });
          } catch (emailError) {
            console.error('Failed to queue email for order:', orderId, emailError);
          }
        }

        // Handle inventory for cancelled orders
        if (status === 'cancelled' && oldStatus !== 'cancelled') {
          await restoreInventoryForCancelledOrder(order);
        }

        results.push({
          orderId,
          orderNumber: order.orderNumber,
          oldStatus,
          newStatus: status,
          success: true
        });
      } catch (error) {
        errors.push({ orderId, error: error.message });
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        updated: results.length,
        errors: errors.length,
        results,
        errors
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get order analytics
// @route   GET /api/admin/order-management/analytics
// @access  Private/Admin
exports.getOrderAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get order statistics
    const orderStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get daily order trends
    const dailyTrends = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Get top products
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          totalSold: 1,
          revenue: 1,
          image: { $arrayElemAt: ['$product.images.url', 0] }
        }
      }
    ]);

    // Get status distribution
    const statusDistribution = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          percentage: { $sum: 1 }
        }
      }
    ]);

    const totalOrdersForPercentage = statusDistribution.reduce((sum, item) => sum + item.count, 0);
    statusDistribution.forEach(item => {
      item.percentage = totalOrdersForPercentage > 0 ? (item.count / totalOrdersForPercentage * 100).toFixed(1) : 0;
    });

    res.status(200).json({
      status: 'success',
      data: {
        period,
        dateRange: { startDate, endDate: now },
        overview: orderStats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          completedOrders: 0,
          pendingOrders: 0,
          cancelledOrders: 0
        },
        dailyTrends,
        topProducts,
        statusDistribution
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Cancel order (customer or admin)
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const order = await Order.findById(req.params.id).populate('user');
    
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Check if user owns the order (unless admin)
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    const oldStatus = order.status;
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    if (reason) order.cancellationReason = reason;

    await order.save();

    // Restore inventory
    await restoreInventoryForCancelledOrder(order);

    // Send notification email
    if (order.user) {
      try {
        await emailQueue.queueOrderStatusUpdate(order.user.email, {
          orderId: order.orderNumber,
          customerName: order.user.fullName,
          status: 'cancelled',
          statusMessage: reason || 'Order cancelled as requested',
          _id: order._id
        });
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        order,
        message: `Order cancelled successfully`
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Helper function to restore inventory for cancelled orders
async function restoreInventoryForCancelledOrder(order) {
  try {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { 'inventory.stock': item.quantity } }
      );
    }
    console.log(`Inventory restored for cancelled order: ${order.orderNumber}`);
  } catch (error) {
    console.error('Failed to restore inventory for order:', order.orderNumber, error);
  }
}

// Functions are already exported using exports.functionName above