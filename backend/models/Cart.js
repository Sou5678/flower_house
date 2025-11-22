const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  size: {
    name: String,
    price: Number
  },
  vase: {
    name: String,
    price: Number
  },
  personalNote: String,
  price: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  subtotal: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.subtotal = this.items.reduce((total, item) => {
    let itemPrice = item.price;
    if (item.size) itemPrice += item.size.price;
    if (item.vase) itemPrice += item.vase.price;
    return total + (itemPrice * item.quantity);
  }, 0);
  
  this.total = this.subtotal;
  next();
});

// Index for better query performance
cartSchema.index({ user: 1 });

module.exports = mongoose.model('Cart', cartSchema);
