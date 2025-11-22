const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get inventory overview
// @route   GET /api/admin/inventory/overview
// @access  Private/Admin
exports.getInventoryOverview = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const inStockProducts = await Product.countDocuments({ 'inventory.stock': { $gt: 0 } });
    const outOfStockProducts = await Product.countDocuments({ 'inventory.stock': 0 });
    
    // Low stock products (stock <= lowStockThreshold)
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$inventory.stock', '$inventory.lowStockThreshold'] },
      'inventory.stock': { $gt: 0 }
    }).populate('category', 'name');

    // Out of stock products
    const outOfStockList = await Product.find({ 'inventory.stock': 0 })
      .populate('category', 'name')
      .select('name price inventory category');

    // Total inventory value
    const inventoryValue = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$price', '$inventory.stock'] } }
        }
      }
    ]);

    // Top selling products (based on orders)
    const topSellingProducts = await Order.aggregate([
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
          currentStock: '$product.inventory.stock',
          totalSold: 1,
          revenue: 1
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalProducts,
          inStockProducts,
          outOfStockProducts,
          lowStockCount: lowStockProducts.length,
          totalInventoryValue: inventoryValue[0]?.totalValue || 0
        },
        lowStockProducts,
        outOfStockProducts: outOfStockList,
        topSellingProducts
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update product stock
// @route   PUT /api/admin/inventory/:id/stock
// @access  Private/Admin
exports.updateProductStock = async (req, res) => {
  try {
    const { stock, lowStockThreshold, reason } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    const oldStock = product.inventory.stock;
    
    // Update stock
    if (stock !== undefined) {
      product.inventory.stock = Math.max(0, stock);
    }
    
    if (lowStockThreshold !== undefined) {
      product.inventory.lowStockThreshold = Math.max(0, lowStockThreshold);
    }

    // Update availability based on stock
    product.inventory.isAvailable = product.inventory.stock > 0;

    await product.save();

    // Log inventory change (you could create an InventoryLog model for this)
    console.log(`Inventory Update: ${product.name} - Stock changed from ${oldStock} to ${product.inventory.stock}. Reason: ${reason || 'Manual update'}`);

    res.status(200).json({
      status: 'success',
      data: {
        product: {
          _id: product._id,
          name: product.name,
          inventory: product.inventory
        },
        change: {
          oldStock,
          newStock: product.inventory.stock,
          difference: product.inventory.stock - oldStock
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

// @desc    Bulk update inventory
// @route   PUT /api/admin/inventory/bulk-update
// @access  Private/Admin
exports.bulkUpdateInventory = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { productId, stock, lowStockThreshold }
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Updates array is required'
      });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { productId, stock, lowStockThreshold } = update;
        
        const product = await Product.findById(productId);
        if (!product) {
          errors.push({ productId, error: 'Product not found' });
          continue;
        }

        const oldStock = product.inventory.stock;
        
        if (stock !== undefined) {
          product.inventory.stock = Math.max(0, stock);
        }
        
        if (lowStockThreshold !== undefined) {
          product.inventory.lowStockThreshold = Math.max(0, lowStockThreshold);
        }

        product.inventory.isAvailable = product.inventory.stock > 0;
        
        await product.save();
        
        results.push({
          productId,
          name: product.name,
          oldStock,
          newStock: product.inventory.stock,
          success: true
        });
      } catch (error) {
        errors.push({ productId: update.productId, error: error.message });
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

// @desc    Get low stock alerts
// @route   GET /api/admin/inventory/alerts
// @access  Private/Admin
exports.getLowStockAlerts = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$inventory.stock', '$inventory.lowStockThreshold'] },
      'inventory.isAvailable': true
    })
    .populate('category', 'name')
    .sort({ 'inventory.stock': 1 });

    const criticalStock = lowStockProducts.filter(p => p.inventory.stock <= 2);
    const warningStock = lowStockProducts.filter(p => p.inventory.stock > 2);

    res.status(200).json({
      status: 'success',
      data: {
        total: lowStockProducts.length,
        critical: criticalStock.length,
        warning: warningStock.length,
        alerts: {
          critical: criticalStock,
          warning: warningStock
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

// @desc    Get inventory movements (stock changes over time)
// @route   GET /api/admin/inventory/movements
// @access  Private/Admin
exports.getInventoryMovements = async (req, res) => {
  try {
    const { startDate, endDate, productId } = req.query;
    
    // This would require an InventoryLog model to track movements
    // For now, we'll return recent orders that affected inventory
    
    let matchStage = {};
    
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    if (productId) {
      matchStage['items.product'] = new mongoose.Types.ObjectId(productId);
    }

    const movements = await Order.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          date: '$createdAt',
          productName: '$product.name',
          quantity: '$items.quantity',
          type: 'sale',
          orderNumber: '$orderNumber',
          status: '$status'
        }
      },
      { $sort: { date: -1 } },
      { $limit: 100 }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        movements,
        count: movements.length
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Generate inventory report
// @route   GET /api/admin/inventory/report
// @access  Private/Admin
exports.generateInventoryReport = async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    // Get all products with inventory details
    const products = await Product.find()
      .populate('category', 'name')
      .select('name price inventory category createdAt')
      .sort({ 'category.name': 1, name: 1 });

    // Calculate totals
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.inventory.stock), 0);
    const lowStockCount = products.filter(p => p.inventory.stock <= p.inventory.lowStockThreshold).length;
    const outOfStockCount = products.filter(p => p.inventory.stock === 0).length;

    // Group by category
    const categoryBreakdown = products.reduce((acc, product) => {
      const categoryName = product.category?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = {
          products: 0,
          totalStock: 0,
          totalValue: 0,
          lowStock: 0,
          outOfStock: 0
        };
      }
      
      acc[categoryName].products++;
      acc[categoryName].totalStock += product.inventory.stock;
      acc[categoryName].totalValue += product.price * product.inventory.stock;
      
      if (product.inventory.stock === 0) {
        acc[categoryName].outOfStock++;
      } else if (product.inventory.stock <= product.inventory.lowStockThreshold) {
        acc[categoryName].lowStock++;
      }
      
      return acc;
    }, {});

    const report = {
      generatedAt: new Date(),
      summary: {
        totalProducts,
        totalValue,
        lowStockCount,
        outOfStockCount,
        inStockCount: totalProducts - outOfStockCount
      },
      categoryBreakdown,
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        category: p.category?.name,
        price: p.price,
        stock: p.inventory.stock,
        lowStockThreshold: p.inventory.lowStockThreshold,
        value: p.price * p.inventory.stock,
        status: p.inventory.stock === 0 ? 'Out of Stock' : 
                p.inventory.stock <= p.inventory.lowStockThreshold ? 'Low Stock' : 'In Stock'
      }))
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(report.products);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=inventory-report.csv');
      return res.send(csv);
    }

    res.status(200).json({
      status: 'success',
      data: report
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Helper function to convert data to CSV
function convertToCSV(data) {
  const headers = ['ID', 'Name', 'Category', 'Price', 'Stock', 'Low Stock Threshold', 'Value', 'Status'];
  const csvRows = [headers.join(',')];
  
  data.forEach(item => {
    const row = [
      item.id,
      `"${item.name}"`,
      `"${item.category || ''}"`,
      item.price,
      item.stock,
      item.lowStockThreshold,
      item.value,
      `"${item.status}"`
    ];
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
}

// Functions are already exported using exports.functionName above
// No need for additional module.exports