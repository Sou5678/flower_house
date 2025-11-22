const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const EmailService = require('../utils/email');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentInfo,
      shippingMethod,
      estimatedDelivery
    } = req.body;

    // Validate items and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: `Product ${item.product} not found`
        });
      }

      if (product.inventory.stock < item.quantity) {
        return res.status(400).json({
          status: 'error',
          message: `Insufficient stock for ${product.name}`
        });
      }

      let itemPrice = product.price;
      if (item.size) itemPrice += item.size.price;
      if (item.vase) itemPrice += item.vase.price;

      subtotal += itemPrice * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        size: item.size,
        vase: item.vase,
        personalNote: item.personalNote,
        image: product.images[0]?.url
      });

      // Update product stock
      product.inventory.stock -= item.quantity;
      await product.save();
    }

    // Calculate shipping and tax
    const shippingFee = shippingMethod === 'express' ? 15 : shippingMethod === 'same-day' ? 25 : 5;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shippingFee + tax;

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentInfo,
      subtotal,
      shippingFee,
      tax,
      total,
      shippingMethod,
      estimatedDelivery
    });

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [] }
    );

    // Send order confirmation email
    try {
      await EmailService.sendOrderConfirmation(order, req.user);
    } catch (emailError) {
      console.log('Order confirmation email failed:', emailError);
    }

    res.status(201).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort('-createdAt')
      .populate('items.product', 'name images');

    res.status(200).json({
      status: 'success',
      count: orders.length,
      data: { orders }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Make sure user owns this order
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this order'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    order.status = status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();

    res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Make sure user owns this order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to cancel this order'
      });
    }

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot cancel order in current status'
      });
    }

    order.status = 'cancelled';
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 'inventory.stock': item.quantity }
      });
    }

    res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort('-createdAt')
      .populate('user', 'fullName email')
      .populate('items.product', 'name images');

    res.status(200).json({
      status: 'success',
      count: orders.length,
      data: { orders }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};
