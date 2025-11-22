const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all products for admin with additional details
// @route   GET /api/admin/products
// @access  Private/Admin
exports.getAdminProducts = async (req, res) => {
  try {
    // Filtering, sorting, pagination
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Search functionality
    if (req.query.search) {
      queryObj.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { 'flowerTypes': { $regex: req.query.search, $options: 'i' } },
        { 'occasions': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    let query = Product.find(JSON.parse(queryStr)).populate('category');

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
    const total = await Product.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const products = await query;

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
      count: products.length,
      pagination,
      total,
      data: {
        products
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get single product for admin with full details
// @route   GET /api/admin/products/:id
// @access  Private/Admin
exports.getAdminProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category')
      .populate('reviews.user', 'fullName avatar');

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Create product with admin validation
// @route   POST /api/admin/products
// @access  Private/Admin
exports.createAdminProduct = async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'category'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields',
        missingFields
      });
    }

    // Validate category exists
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid category ID'
      });
    }

    // Validate price is positive
    if (req.body.price <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Price must be greater than 0'
      });
    }

    // Validate inventory stock is non-negative
    if (req.body.inventory && req.body.inventory.stock < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Inventory stock cannot be negative'
      });
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update product with admin validation
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
exports.updateAdminProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Validate category if provided
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid category ID'
        });
      }
    }

    // Validate price if provided
    if (req.body.price !== undefined && req.body.price <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Price must be greater than 0'
      });
    }

    // Validate inventory stock if provided
    if (req.body.inventory && req.body.inventory.stock < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Inventory stock cannot be negative'
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      {
        new: true,
        runValidators: true
      }
    ).populate('category');

    res.status(200).json({
      status: 'success',
      data: {
        product: updatedProduct
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete product (admin only)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
exports.deleteAdminProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      data: null,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Bulk update products
// @route   PUT /api/admin/products/bulk-update
// @access  Private/Admin
exports.bulkUpdateProducts = async (req, res) => {
  try {
    const { productIds, updates } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Product IDs array is required'
      });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Updates object is required'
      });
    }

    // Validate price if provided
    if (updates.price !== undefined && updates.price <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Price must be greater than 0'
      });
    }

    // Validate inventory stock if provided
    if (updates.inventory && updates.inventory.stock < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Inventory stock cannot be negative'
      });
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: updates },
      { runValidators: true }
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

// @desc    Get product analytics
// @route   GET /api/admin/products/analytics
// @access  Private/Admin
exports.getProductAnalytics = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.countDocuments({ 'inventory.stock': { $lte: 10 } });
    const outOfStockProducts = await Product.countDocuments({ 'inventory.stock': 0 });

    // Get top performing products by rating
    const topRatedProducts = await Product.find({ 'ratings.average': { $gte: 4 } })
      .sort({ 'ratings.average': -1, 'ratings.count': -1 })
      .limit(10)
      .select('name ratings price');

    // Get products by category
    const productsByCategory = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: '$categoryInfo'
      },
      {
        $group: {
          _id: '$categoryInfo.name',
          count: { $sum: 1 },
          averagePrice: { $avg: '$price' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalProducts,
          activeProducts,
          lowStockProducts,
          outOfStockProducts
        },
        topRatedProducts,
        productsByCategory
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};