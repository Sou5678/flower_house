const mongoose = require('mongoose');

const salesAnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  totalOrders: {
    type: Number,
    default: 0,
    min: 0
  },
  totalRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  averageOrderValue: {
    type: Number,
    default: 0,
    min: 0
  },
  topProducts: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      min: 0
    },
    revenue: {
      type: Number,
      min: 0
    }
  }],
  customerMetrics: {
    newCustomers: {
      type: Number,
      default: 0,
      min: 0
    },
    returningCustomers: {
      type: Number,
      default: 0,
      min: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
salesAnalyticsSchema.index({ date: -1 });
salesAnalyticsSchema.index({ totalRevenue: -1 });
salesAnalyticsSchema.index({ totalOrders: -1 });
salesAnalyticsSchema.index({ createdAt: -1 });

// Static method to generate analytics for a specific date
salesAnalyticsSchema.statics.generateDailyAnalytics = async function(date) {
  const Order = mongoose.model('Order');
  const User = mongoose.model('User');
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  // Get orders for the day
  const orders = await Order.find({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
  }).populate('user items.product');
  
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Calculate top products
  const productStats = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const productId = item.product._id.toString();
      if (!productStats[productId]) {
        productStats[productId] = {
          product: item.product._id,
          quantity: 0,
          revenue: 0
        };
      }
      productStats[productId].quantity += item.quantity;
      productStats[productId].revenue += item.price * item.quantity;
    });
  });
  
  const topProducts = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  
  // Calculate customer metrics
  const userIds = orders.map(order => order.user._id.toString());
  const uniqueUserIds = [...new Set(userIds)];
  
  const newCustomers = await User.countDocuments({
    _id: { $in: uniqueUserIds },
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });
  
  const returningCustomers = uniqueUserIds.length - newCustomers;
  
  return {
    date: startOfDay,
    totalOrders,
    totalRevenue,
    averageOrderValue,
    topProducts,
    customerMetrics: {
      newCustomers,
      returningCustomers
    }
  };
};

// Static method to get analytics for a date range
salesAnalyticsSchema.statics.getAnalyticsRange = async function(startDate, endDate) {
  return this.find({
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).sort({ date: -1 }).populate('topProducts.product');
};

module.exports = mongoose.model('SalesAnalytics', salesAnalyticsSchema);