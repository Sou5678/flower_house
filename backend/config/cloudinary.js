const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Memory storage for multer (we'll upload to Cloudinary manually)
const storage = multer.memoryStorage();

// Multer configuration for product images
const uploadProductImages = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      folder: 'amour-florals/products',
      quality: 'auto',
      fetch_format: 'auto',
      transformation: [
        { width: 800, height: 800, crop: 'limit', quality: 'auto' }
      ],
      ...options
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      defaultOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Create readable stream from buffer
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Helper function to get optimized image URL
const getOptimizedImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto',
    fetch_format: 'auto',
    ...options
  };
  
  return cloudinary.url(publicId, defaultOptions);
};

// Helper function to upload image from URL
const uploadImageFromUrl = async (imageUrl, options = {}) => {
  try {
    const defaultOptions = {
      folder: 'amour-florals/products',
      quality: 'auto',
      fetch_format: 'auto',
      ...options
    };
    
    const result = await cloudinary.uploader.upload(imageUrl, defaultOptions);
    return result;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

// Helper function to generate multiple image sizes
const generateImageVariants = (publicId) => {
  try {
    const variants = {
      thumbnail: cloudinary.url(publicId, {
        width: 150,
        height: 150,
        crop: 'fill',
        quality: 'auto',
        fetch_format: 'auto'
      }),
      small: cloudinary.url(publicId, {
        width: 300,
        height: 300,
        crop: 'limit',
        quality: 'auto',
        fetch_format: 'auto'
      }),
      medium: cloudinary.url(publicId, {
        width: 600,
        height: 600,
        crop: 'limit',
        quality: 'auto',
        fetch_format: 'auto'
      }),
      large: cloudinary.url(publicId, {
        width: 1200,
        height: 1200,
        crop: 'limit',
        quality: 'auto',
        fetch_format: 'auto'
      }),
      original: cloudinary.url(publicId, {
        quality: 'auto',
        fetch_format: 'auto'
      })
    };
    
    return variants;
  } catch (error) {
    console.error('Error generating image variants:', error);
    throw error;
  }
};

// Helper function to process multiple images
const processMultipleImages = async (files, options = {}) => {
  try {
    const uploadPromises = files.map(file => 
      uploadToCloudinary(file.buffer, {
        ...options,
        public_id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })
    );
    
    const results = await Promise.all(uploadPromises);
    
    return results.map(result => ({
      public_id: result.public_id,
      url: result.secure_url,
      variants: generateImageVariants(result.public_id)
    }));
  } catch (error) {
    console.error('Error processing multiple images:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadProductImages,
  uploadToCloudinary,
  deleteImage,
  getOptimizedImageUrl,
  uploadImageFromUrl,
  generateImageVariants,
  processMultipleImages
};