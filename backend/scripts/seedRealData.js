const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const categoriesData = require('../data/categories');
const productsData = require('../data/products');
require('dotenv').config();

const seedRealData = async () => {
  try {
    console.log('🌱 Starting real data seeding process...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Seed Categories
    console.log('📂 Seeding categories...');
    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`✅ Created ${createdCategories.length} categories\n`);

    // Create category slug to ID mapping
    const categoryMap = {};
    createdCategories.forEach(category => {
      categoryMap[category.seo.slug] = category._id;
    });

    // Prepare products with category IDs
    console.log('🌸 Preparing products...');
    const productsWithCategories = productsData.map(product => {
      const categoryId = categoryMap[product.categorySlug];
      if (!categoryId) {
        console.warn(`⚠️  Category not found for slug: ${product.categorySlug}`);
        return null;
      }

      // Remove categorySlug and add category ID
      const { categorySlug, ...productData } = product;
      return {
        ...productData,
        category: categoryId
      };
    }).filter(Boolean); // Remove null entries

    // Seed Products
    console.log('🌺 Seeding products...');
    const createdProducts = await Product.insertMany(productsWithCategories);
    console.log(`✅ Created ${createdProducts.length} products\n`);

    // Display summary
    console.log('📊 SEEDING SUMMARY');
    console.log('==================');
    console.log(`Categories: ${createdCategories.length}`);
    console.log(`Products: ${createdProducts.length}\n`);

    // Display categories with product counts
    console.log('📂 CATEGORIES CREATED:');
    for (const category of createdCategories) {
      const productCount = createdProducts.filter(p => p.category.toString() === category._id.toString()).length;
      console.log(`   ${category.name} (${category.slug}) - ${productCount} products`);
    }

    console.log('\n🌟 FEATURED PRODUCTS:');
    const featuredProducts = createdProducts.filter(p => p.isFeatured);
    featuredProducts.forEach(product => {
      console.log(`   ${product.name} - ₹${product.price}`);
    });

    console.log('\n📈 POPULAR PRODUCTS:');
    const popularProducts = createdProducts.filter(p => p.isPopular);
    popularProducts.forEach(product => {
      console.log(`   ${product.name} - ₹${product.price}`);
    });

    console.log('\n⚠️  LOW STOCK ALERTS:');
    const lowStockProducts = createdProducts.filter(p => p.inventory.stock <= p.inventory.lowStockThreshold);
    if (lowStockProducts.length > 0) {
      lowStockProducts.forEach(product => {
        console.log(`   ${product.name} - Stock: ${product.inventory.stock}`);
      });
    } else {
      console.log('   No low stock items');
    }

    console.log('\n💰 PRICE RANGE:');
    const prices = createdProducts.map(p => p.price);
    console.log(`   Lowest: ₹${Math.min(...prices)}`);
    console.log(`   Highest: ₹${Math.max(...prices)}`);
    console.log(`   Average: ₹${Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)}`);

    console.log('\n🎉 Real data seeding completed successfully!');
    console.log('🌸 Your Amour Florals store is now ready with real flower products!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedRealData();
}

module.exports = seedRealData;