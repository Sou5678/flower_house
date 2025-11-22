const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  uploadProductImages,
  uploadToCloudinary,
  deleteImage,
  processMultipleImages,
  generateImageVariants,
  uploadImageFromUrl
} = require('../config/cloudinary');

const router = express.Router();

// @desc    Upload single product image
// @route   POST /api/upload/product/single
// @access  Private/Admin
router.post('/product/single', protect, authorize('admin'), uploadProductImages.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'amour-florals/products',
      public_id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    // Generate image variants
    const variants = generateImageVariants(result.public_id);

    res.status(200).json({
      status: 'success',
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        variants,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      }
    });
  } catch (error) {
    console.error('Single image upload error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Upload multiple product images
// @route   POST /api/upload/product/multiple
// @access  Private/Admin
router.post('/product/multiple', protect, authorize('admin'), uploadProductImages.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No image files provided'
      });
    }

    // Process multiple images
    const results = await processMultipleImages(req.files, {
      folder: 'amour-florals/products'
    });

    res.status(200).json({
      status: 'success',
      count: results.length,
      data: {
        images: results
      }
    });
  } catch (error) {
    console.error('Multiple images upload error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/image/:publicId
// @access  Private/Admin
router.delete('/image/:publicId', protect, authorize('admin'), async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Decode the public_id (it might be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);
    
    const result = await deleteImage(decodedPublicId);
    
    if (result.result === 'ok') {
      res.status(200).json({
        status: 'success',
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'Image not found'
      });
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Upload image from URL
// @route   POST /api/upload/product/url
// @access  Private/Admin
router.post('/product/url', protect, authorize('admin'), async (req, res) => {
  try {
    const { imageUrl, productName } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'Image URL is required'
      });
    }

    // Upload from URL
    const result = await uploadImageFromUrl(imageUrl, {
      folder: 'amour-florals/products',
      public_id: `product_${productName ? productName.replace(/\s+/g, '_').toLowerCase() : 'unnamed'}_${Date.now()}`
    });

    // Generate image variants
    const variants = generateImageVariants(result.public_id);

    res.status(200).json({
      status: 'success',
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        variants,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      }
    });
  } catch (error) {
    console.error('URL image upload error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Get image variants for existing image
// @route   GET /api/upload/variants/:publicId
// @access  Private/Admin
router.get('/variants/:publicId', protect, authorize('admin'), (req, res) => {
  try {
    const { publicId } = req.params;
    const decodedPublicId = decodeURIComponent(publicId);
    
    const variants = generateImageVariants(decodedPublicId);
    
    res.status(200).json({
      status: 'success',
      data: {
        public_id: decodedPublicId,
        variants
      }
    });
  } catch (error) {
    console.error('Get variants error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Upload category image
// @route   POST /api/upload/category
// @access  Private/Admin
router.post('/category', protect, authorize('admin'), uploadProductImages.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary with category-specific settings
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'amour-florals/categories',
      public_id: `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      transformation: [
        { width: 400, height: 300, crop: 'fill', quality: 'auto' }
      ]
    });

    res.status(200).json({
      status: 'success',
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      }
    });
  } catch (error) {
    console.error('Category image upload error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Test upload endpoint
// @route   POST /api/upload/test
// @access  Private/Admin
router.post('/test', protect, authorize('admin'), uploadProductImages.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'File received successfully',
      data: {
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer ? 'Buffer received' : 'No buffer'
      }
    });
  } catch (error) {
    console.error('Test upload error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;