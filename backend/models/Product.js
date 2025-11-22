const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  images: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    variants: {
      thumbnail: String,
      small: String,
      medium: String,
      large: String,
      original: String
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    width: Number,
    height: Number,
    format: String,
    bytes: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  occasions: [{
    type: String,
    enum: ['birthday', 'anniversary', 'wedding', 'sympathy', 'congratulations', 'just-because']
  }],
  flowerTypes: [{
    type: String,
    enum: ['roses', 'lilies', 'tulips', 'orchids', 'mixed', 'seasonal']
  }],
  colors: [{
    type: String,
    enum: ['red', 'pink', 'white', 'yellow', 'purple', 'mixed']
  }],
  sizes: [{
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    description: String
  }],
  vases: [{
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    description: String
  }],
  inventory: {
    stock: {
      type: Number,
      required: true,
      min: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  careInstructions: {
    type: String,
    maxlength: [500, 'Care instructions cannot exceed 500 characters']
  },
  deliveryInfo: {
    type: String,
    maxlength: [500, 'Delivery info cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isPopular: 1 });
productSchema.index({ occasions: 1 });
productSchema.index({ flowerTypes: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

// Update average rating when new review is added
productSchema.methods.updateRating = function() {
  if (this.reviews.length === 0) {
    this.ratings.average = 0;
    this.ratings.count = 0;
  } else {
    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.ratings.average = (total / this.reviews.length).toFixed(1);
    this.ratings.count = this.reviews.length;
  }
};

module.exports = mongoose.model('Product', productSchema);