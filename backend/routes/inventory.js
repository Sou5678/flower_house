const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getInventoryOverview,
  updateProductStock,
  bulkUpdateInventory,
  getLowStockAlerts,
  getInventoryMovements,
  generateInventoryReport
} = require('../controllers/inventory');

const router = express.Router();

// All routes require admin access
router.use(protect);
router.use(authorize('admin'));

// @desc    Get inventory overview
// @route   GET /api/inventory/overview
// @access  Private/Admin
router.get('/overview', getInventoryOverview);

// @desc    Get low stock alerts
// @route   GET /api/inventory/alerts
// @access  Private/Admin
router.get('/alerts', getLowStockAlerts);

// @desc    Get inventory movements
// @route   GET /api/inventory/movements
// @access  Private/Admin
router.get('/movements', getInventoryMovements);

// @desc    Generate inventory report
// @route   GET /api/inventory/report
// @access  Private/Admin
router.get('/report', generateInventoryReport);

// @desc    Update product stock
// @route   PUT /api/inventory/:id/stock
// @access  Private/Admin
router.put('/:id/stock', updateProductStock);

// @desc    Bulk update inventory
// @route   PUT /api/inventory/bulk-update
// @access  Private/Admin
router.put('/bulk-update', bulkUpdateInventory);

module.exports = router;