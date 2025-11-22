const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        wishlist: user.favorites
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if product already in wishlist (idempotent operation)
    if (user.favorites.includes(productId)) {
      await user.populate('favorites');
      return res.status(200).json({
        status: 'success',
        message: 'Product already in wishlist',
        data: {
          wishlist: user.favorites
        }
      });
    }

    // Add product to favorites
    user.favorites.push(productId);
    await user.save();
    await user.populate('favorites');

    res.status(200).json({
      status: 'success',
      message: 'Product added to wishlist',
      data: {
        wishlist: user.favorites
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Remove product from favorites
    user.favorites = user.favorites.filter(
      id => id.toString() !== productId
    );

    await user.save();
    await user.populate('favorites');

    res.status(200).json({
      status: 'success',
      message: 'Product removed from wishlist',
      data: {
        wishlist: user.favorites
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist
// @access  Private
exports.clearWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    user.favorites = [];
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Wishlist cleared',
      data: {
        wishlist: []
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Atomic move product from wishlist to cart
// @route   POST /api/wishlist/:productId/move-to-cart
// @access  Private
exports.atomicMoveToCart = async (req, res) => {
  const session = require('mongoose').startSession();
  
  try {
    await session.startTransaction();
    
    const { productId } = req.params;
    const { quantity = 1, size, vase, personalNote } = req.body;

    // Validate product exists
    const Product = require('../models/Product');
    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Check stock
    if (product.inventory.stock < quantity) {
      await session.abortTransaction();
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient stock'
      });
    }

    // Get user and validate product is in wishlist
    const user = await User.findById(req.user.id).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (!user.favorites.includes(productId)) {
      await session.abortTransaction();
      return res.status(400).json({
        status: 'error',
        message: 'Product not found in wishlist'
      });
    }

    // Get or create cart
    const Cart = require('../models/Cart');
    let cart = await Cart.findOne({ user: req.user.id }).session(session);
    if (!cart) {
      cart = await Cart.create([{ user: req.user.id, items: [] }], { session });
      cart = cart[0];
    }

    // ATOMIC OPERATION 1: Add to cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        quantity,
        size,
        vase,
        personalNote,
        price: product.price
      });
    }

    await cart.save({ session });

    // ATOMIC OPERATION 2: Remove from wishlist
    user.favorites = user.favorites.filter(
      id => id.toString() !== productId
    );
    await user.save({ session });

    // Commit the transaction
    await session.commitTransaction();

    // Populate data for response
    await user.populate('favorites');
    await cart.populate('items.product');

    res.status(200).json({
      status: 'success',
      message: 'Product moved from wishlist to cart atomically',
      data: {
        wishlist: user.favorites,
        cart: cart,
        transactionId: session.id
      }
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      status: 'error',
      message: error.message,
      transactionAborted: true
    });
  } finally {
    await session.endSession();
  }
};
