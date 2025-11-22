const mongoose = require('mongoose');

/**
 * Create database indexes optimized for admin queries
 * This should be run after database connection is established
 */
const createAdminIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    
    // Product indexes for admin queries
    await db.collection('products').createIndex(
      { 'inventory.stock': 1, 'inventory.lowStockThreshold': 1 },
      { name: 'admin_inventory_analysis' }
    );
    
    await db.collection('products').createIndex(
      { category: 1, createdAt: -1 },
      { name: 'admin_product_category_date' }
    );
    
    await db.collection('products').createIndex(
      { isFeatured: 1, isPopular: 1, createdAt: -1 },
      { name: 'admin_product_flags' }
    );
    
    // Order indexes for admin queries
    await db.collection('orders').createIndex(
      { status: 1, createdAt: -1 },
      { name: 'admin_order_status_date' }
    );
    
    await db.collection('orders').createIndex(
      { 'paymentInfo.status': 1, createdAt: -1 },
      { name: 'admin_payment_status' }
    );
    
    await db.collection('orders').createIndex(
      { total: -1, createdAt: -1 },
      { name: 'admin_order_value_analysis' }
    );
    
    // User indexes for admin analytics
    await db.collection('users').createIndex(
      { role: 1, createdAt: -1 },
      { name: 'admin_user_role_date' }
    );
    
    await db.collection('users').createIndex(
      { lastLogin: -1, isActive: 1 },
      { name: 'admin_user_activity' }
    );
    
    // AdminActivity indexes (additional to model indexes)
    await db.collection('adminactivities').createIndex(
      { createdAt: -1, success: 1 },
      { name: 'admin_activity_timeline' }
    );
    
    await db.collection('adminactivities').createIndex(
      { resource: 1, action: 1, createdAt: -1 },
      { name: 'admin_activity_resource_action' }
    );
    
    // SalesAnalytics indexes (additional to model indexes)
    await db.collection('salesanalytics').createIndex(
      { date: -1, totalRevenue: -1 },
      { name: 'admin_sales_performance' }
    );
    
    console.log('✅ Admin database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating admin indexes:', error);
    throw error;
  }
};

/**
 * Drop admin-specific indexes (for cleanup/testing)
 */
const dropAdminIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    
    const indexNames = [
      'admin_inventory_analysis',
      'admin_product_category_date',
      'admin_product_flags',
      'admin_order_status_date',
      'admin_payment_status',
      'admin_order_value_analysis',
      'admin_user_role_date',
      'admin_user_activity',
      'admin_activity_timeline',
      'admin_activity_resource_action',
      'admin_sales_performance'
    ];
    
    for (const indexName of indexNames) {
      try {
        await db.collection('products').dropIndex(indexName);
      } catch (err) {
        // Index might not exist, continue
      }
      
      try {
        await db.collection('orders').dropIndex(indexName);
      } catch (err) {
        // Index might not exist, continue
      }
      
      try {
        await db.collection('users').dropIndex(indexName);
      } catch (err) {
        // Index might not exist, continue
      }
      
      try {
        await db.collection('adminactivities').dropIndex(indexName);
      } catch (err) {
        // Index might not exist, continue
      }
      
      try {
        await db.collection('salesanalytics').dropIndex(indexName);
      } catch (err) {
        // Index might not exist, continue
      }
    }
    
    console.log('✅ Admin database indexes dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping admin indexes:', error);
    throw error;
  }
};

module.exports = {
  createAdminIndexes,
  dropAdminIndexes
};