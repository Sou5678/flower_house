const express = require('express');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  atomicMoveToCart
} = require('../controllers/wishlist');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All wishlist routes require authentication

router.get('/', getWishlist);
router.delete('/', clearWishlist);
router.post('/:productId', addToWishlist);
router.delete('/:productId', removeFromWishlist);
router.post('/:productId/move-to-cart', atomicMoveToCart);

module.exports = router;
