const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get sales dashboard analytics
// @route   GET /api/admin/analytics/sales
// @access  Private/Admin
exports.getSalesAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, period = 'daily' } = req.query;
    
    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Only include completed orders for revenue calculations
    const revenueFilter = { ...dateFilter, status: { $nin: ['cancelled', 'pending'] } };

    // Total revenue and order metrics
    const revenueMetrics = await Order.aggregate([
      { $match: revenueFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' },
          totalShipping: { $sum: '$shippingFee' },
          totalTax: { $sum: '$tax' },
          totalSubtotal: { $sum: '$subtotal' }
        }
      }
    ]);

    // Revenue trends by period
    let groupBy = {};
    if (period === 'daily') {
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
    } else if (period === 'weekly') {
      groupBy = {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' }
      };
    } else if (period === 'monthly') {
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
    }

    const revenueTrends = await Order.aggregate([
      { $match: revenueFilter },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$total' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]);

    // Top performing products
    const topProducts = await Order.aggregate([
      { $match: revenueFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
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
          productName: '$product.name',
          productImage: { $arrayElemAt: ['$product.images.url', 0] },
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1,
          averagePrice: { $divide: ['$totalRevenue', '$totalQuantity'] }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        metrics: revenueMetrics[0] || {
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          totalShipping: 0,
          totalTax: 0,
          totalSubtotal: 0
        },
        trends: revenueTrends,
        topProducts
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get inventory analytics
// @route   GET /api/admin/analytics/inventory
// @access  Private/Admin
exports.getInventoryAnalytics = async (req, res) => {
  try {
    const { lowStockThreshold = 10 } = req.query;

    // Basic inventory statistics
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const inactiveProducts = await Product.countDocuments({ isActive: false });
    const lowStockProducts = await Product.countDocuments({ 
      'inventory.stock': { $lte: parseInt(lowStockThreshold) },
      isActive: true
    });
    const outOfStockProducts = await Product.countDocuments({ 
      'inventory.stock': 0,
      isActive: true
    });

    // Total inventory value
    const inventoryValue = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$price', '$inventory.stock'] } },
          totalStock: { $sum: '$inventory.stock' }
        }
      }
    ]);

    // Low stock products details
    const lowStockDetails = await Product.find({
      'inventory.stock': { $lte: parseInt(lowStockThreshold) },
      isActive: true
    })
    .select('name inventory.stock price category')
    .populate('category', 'name')
    .sort({ 'inventory.stock': 1 })
    .limit(20);

    // Inventory by category
    const inventoryByCategory = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$categoryInfo.name',
          productCount: { $sum: 1 },
          totalStock: { $sum: '$inventory.stock' },
          totalValue: { $sum: { $multiply: ['$price', '$inventory.stock'] } },
          averageStock: { $avg: '$inventory.stock' }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    // Stock movement analysis (based on recent orders)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const stockMovement = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: thirtyDaysAgo },
          status: { $nin: ['cancelled'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 20 },
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
          productName: '$product.name',
          currentStock: '$product.inventory.stock',
          totalSold: 1,
          orderCount: 1,
          turnoverRate: { 
            $divide: ['$totalSold', { $add: ['$product.inventory.stock', '$totalSold'] }] 
          }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalProducts,
          activeProducts,
          inactiveProducts,
          lowStockProducts,
          outOfStockProducts,
          totalInventoryValue: inventoryValue[0]?.totalValue || 0,
          totalStock: inventoryValue[0]?.totalStock || 0
        },
        lowStockDetails,
        inventoryByCategory,
        stockMovement
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get customer analytics
// @route   GET /api/admin/analytics/customers
// @access  Private/Admin
exports.getCustomerAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Basic customer statistics
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const activeCustomers = await User.countDocuments({ 
      role: 'user', 
      isActive: true 
    });

    // New customers in period
    const newCustomers = await User.countDocuments({
      role: 'user',
      ...dateFilter
    });

    // Customer lifetime value analysis
    const customerLTV = await Order.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$total' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$total' },
          firstOrder: { $min: '$createdAt' },
          lastOrder: { $max: '$createdAt' }
        }
      },
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
          orderCount: 1,
          averageOrderValue: 1,
          firstOrder: 1,
          lastOrder: 1,
          customerLifetime: {
            $divide: [
              { $subtract: ['$lastOrder', '$firstOrder'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);

    // Top customers
    const topCustomers = customerLTV.slice(0, 10);

    // Customer segmentation by order count
    const customerSegmentation = await Order.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$total' }
        }
      },
      {
        $bucket: {
          groupBy: '$orderCount',
          boundaries: [1, 2, 5, 10, 20, 50],
          default: '50+',
          output: {
            customerCount: { $sum: 1 },
            averageSpent: { $avg: '$totalSpent' },
            totalRevenue: { $sum: '$totalSpent' }
          }
        }
      }
    ]);

    // Customer acquisition trends
    const acquisitionTrends = await User.aggregate([
      { 
        $match: { 
          role: 'user',
          ...dateFilter
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          newCustomers: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Customer retention analysis (customers who made repeat purchases)
    const retentionAnalysis = await Order.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          repeatCustomers: {
            $sum: { $cond: [{ $gt: ['$orderCount', 1] }, 1, 0] }
          },
          oneTimeCustomers: {
            $sum: { $cond: [{ $eq: ['$orderCount', 1] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          totalCustomers: 1,
          repeatCustomers: 1,
          oneTimeCustomers: 1,
          retentionRate: {
            $multiply: [
              { $divide: ['$repeatCustomers', '$totalCustomers'] },
              100
            ]
          }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalCustomers,
          activeCustomers,
          newCustomers
        },
        topCustomers,
        customerSegmentation,
        acquisitionTrends,
        retention: retentionAnalysis[0] || {
          totalCustomers: 0,
          repeatCustomers: 0,
          oneTimeCustomers: 0,
          retentionRate: 0
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

// @desc    Generate custom report
// @route   POST /api/admin/analytics/reports
// @access  Private/Admin
exports.generateCustomReport = async (req, res) => {
  try {
    const { 
      reportType, 
      startDate, 
      endDate, 
      filters = {},
      format = 'json'
    } = req.body;

    if (!reportType) {
      return res.status(400).json({
        status: 'error',
        message: 'Report type is required'
      });
    }

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    let reportData = {};

    switch (reportType) {
      case 'sales_summary':
        reportData = await generateSalesSummaryReport(dateFilter, filters);
        break;
      case 'product_performance':
        reportData = await generateProductPerformanceReport(dateFilter, filters);
        break;
      case 'customer_analysis':
        reportData = await generateCustomerAnalysisReport(dateFilter, filters);
        break;
      case 'inventory_report':
        reportData = await generateInventoryReport(filters);
        break;
      default:
        return res.status(400).json({
          status: 'error',
          message: 'Invalid report type'
        });
    }

    res.status(200).json({
      status: 'success',
      data: {
        reportType,
        generatedAt: new Date(),
        dateRange: { startDate, endDate },
        filters,
        ...reportData
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Helper functions for report generation
async function generateSalesSummaryReport(dateFilter, filters) {
  const revenueFilter = { ...dateFilter, status: { $nin: ['cancelled'] } };
  
  const summary = await Order.aggregate([
    { $match: revenueFilter },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$total' },
        totalItems: { $sum: { $size: '$items' } }
      }
    }
  ]);

  return { summary: summary[0] || {} };
}

async function generateProductPerformanceReport(dateFilter, filters) {
  const products = await Order.aggregate([
    { $match: { ...dateFilter, status: { $nin: ['cancelled'] } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { totalRevenue: -1 } },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' }
  ]);

  return { products };
}

async function generateCustomerAnalysisReport(dateFilter, filters) {
  const customers = await Order.aggregate([
    { $match: { ...dateFilter, status: { $nin: ['cancelled'] } } },
    {
      $group: {
        _id: '$user',
        totalSpent: { $sum: '$total' },
        orderCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'customer'
      }
    },
    { $unwind: '$customer' },
    { $sort: { totalSpent: -1 } }
  ]);

  return { customers };
}

async function generateInventoryReport(filters) {
  const products = await Product.find({ isActive: true })
    .populate('category', 'name')
    .select('name inventory.stock price category')
    .sort({ 'inventory.stock': 1 });

  return { products };
}