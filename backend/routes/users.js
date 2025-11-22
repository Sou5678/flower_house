const express = require('express');
const {
  updateAddress,
  deleteAddress
} = require('../controllers/users');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All user routes require authentication

router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

module.exports = router;
