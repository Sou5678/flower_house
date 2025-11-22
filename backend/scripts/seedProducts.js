const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apna_flar');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedProducts = async () => {
  try {
    // First, let's create a default category if it doesn't exist
    let category = await Category.findOne({ name: 'Bouquets' });
    if (!category) {
      category = await Category.create({
        name: 'Bouquets',
        description: 'Beautiful flower bouquets for all occasions',
        slug: 'bouquets'
      });
    }

    // Sample products data
    const sampleProducts = [
      {
        name: 'Red Rose Bouquet',
        description: 'A classic bouquet of 12 fresh red roses, perfect for expressing love and romance.',
        price: 49.99,
        originalPrice: 59.99,
        category: category._id,
        occasions: ['anniversary', 'birthday', 'just-because'],
        flowerTypes: ['roses'],
        colors: ['red'],
        inventory: {
          stock: 25,
          isAvailable: true
        },
        ratings: {
          average: 4.8,
          count: 15
        },
        isPopular: true,
        isFeatured: true,
        tags: ['romantic', 'classic', 'bestseller']
      },
      {
        name: 'Mixed Spring Bouquet',
        description: 'A vibrant mix of seasonal spring flowers including tulips, daffodils, and lilies.',
        price: 39.99,
        originalPrice: 45.99,
        category: category._id,
        occasions: ['birthday', 'congratulations', 'just-because'],
        flowerTypes: ['tulips', 'lilies', 'mixed'],
        colors: ['mixed', 'yellow', 'pink'],
        inventory: {
          stock: 18,
          isAvailable: true
        },
        ratings: {
          average: 4.6,
          count: 12
        },
        isPopular: true,
        tags: ['spring', 'colorful', 'fresh']
      },
      {
        name: 'White Lily Elegance',
        description: 'Elegant white lilies arranged with greenery, perfect for sympathy or sophisticated occasions.',
        price: 55.99,
        category: category._id,
        occasions: ['sympathy', 'wedding'],
        flowerTypes: ['lilies'],
        colors: ['white'],
        inventory: {
          stock: 12,
          isAvailable: true
        },
        ratings: {
          average: 4.9,
          count: 8
        },
        isFeatured: true,
        tags: ['elegant', 'sympathy', 'pure']
      },
      {
        name: 'Purple Orchid Arrangement',
        description: 'Exotic purple orchids in a modern arrangement, bringing sophistication to any space.',
        price: 75.99,
        originalPrice: 85.99,
        category: category._id,
        occasions: ['congratulations', 'just-because'],
        flowerTypes: ['orchids'],
        colors: ['purple'],
        inventory: {
          stock: 8,
          isAvailable: true
        },
        ratings: {
          average: 4.7,
          count: 6
        },
        isPopular: true,
        tags: ['exotic', 'modern', 'luxury']
      },
      {
        name: 'Pink Rose & Baby\'s Breath',
        description: 'Soft pink roses complemented by delicate baby\'s breath for a romantic and gentle touch.',
        price: 42.99,
        category: category._id,
        occasions: ['anniversary', 'birthday', 'wedding'],
        flowerTypes: ['roses'],
        colors: ['pink'],
        inventory: {
          stock: 20,
          isAvailable: true
        },
        ratings: {
          average: 4.5,
          count: 10
        },
        tags: ['romantic', 'soft', 'delicate']
      },
      {
        name: 'Sunflower Sunshine Bouquet',
        description: 'Bright and cheerful sunflowers that bring warmth and happiness to any day.',
        price: 35.99,
        category: category._id,
        occasions: ['birthday', 'congratulations', 'just-because'],
        flowerTypes: ['seasonal'],
        colors: ['yellow'],
        inventory: {
          stock: 15,
          isAvailable: true
        },
        ratings: {
          average: 4.4,
          count: 9
        },
        isPopular: true,
        tags: ['cheerful', 'bright', 'happy']
      },
      {
        name: 'Mixed Color Tulip Bundle',
        description: 'A vibrant collection of tulips in various colors, celebrating the beauty of spring.',
        price: 32.99,
        originalPrice: 38.99,
        category: category._id,
        occasions: ['birthday', 'just-because'],
        flowerTypes: ['tulips'],
        colors: ['mixed'],
        inventory: {
          stock: 22,
          isAvailable: true
        },
        ratings: {
          average: 4.3,
          count: 7
        },
        tags: ['spring', 'colorful', 'fresh']
      },
      {
        name: 'Red & White Rose Combo',
        description: 'A striking combination of red and white roses, perfect for making a bold statement.',
        price: 52.99,
        category: category._id,
        occasions: ['anniversary', 'wedding', 'congratulations'],
        flowerTypes: ['roses'],
        colors: ['red', 'white'],
        inventory: {
          stock: 14,
          isAvailable: true
        },
        ratings: {
          average: 4.6,
          count: 11
        },
        isFeatured: true,
        tags: ['bold', 'classic', 'statement']
      }
    ];

    // Clear existing products (optional - remove this line if you want to keep existing products)
    // await Product.deleteMany({});

    // Insert sample products
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ Successfully created ${createdProducts.length} sample products`);

    // Display created products
    createdProducts.forEach(product => {
      console.log(`- ${product.name} (${product.isPopular ? 'Popular' : 'Regular'}${product.isFeatured ? ', Featured' : ''})`);
    });

  } catch (error) {
    console.error('Error seeding products:', error);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedProducts();
  await mongoose.connection.close();
  console.log('Database connection closed');
};

// Run the seeding script
if (require.main === module) {
  runSeed();
}

module.exports = { seedProducts };