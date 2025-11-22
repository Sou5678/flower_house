import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Image as ImageIcon, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ImageUpload from '../../components/admin/ImageUpload';
import ImageGallery from '../../components/admin/ImageGallery';

const ProductImages = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const result = await response.json();
      setProduct(result.data.product);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load product');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleImagesUploaded = (newImages) => {
    // Refresh product data to get updated images
    fetchProduct();
  };

  const handleImagesUpdate = (updatedImages) => {
    setProduct(prev => ({
      ...prev,
      images: updatedImages
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Products
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Images</h1>
            <p className="text-gray-600 mt-1">{product.name}</p>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <ImageIcon className="h-4 w-4" />
            <span>{product.images?.length || 0} images</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Upload New Images
            </h2>
            
            <ImageUpload
              onImagesUploaded={handleImagesUploaded}
              maxImages={10}
              existingImages={product.images || []}
              productId={id}
            />
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Product Details
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <p className="text-sm text-gray-900">{product.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <p className="text-sm text-gray-900">{product.category?.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Price</label>
                <p className="text-sm text-gray-900">₹{product.price}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Stock</label>
                <p className="text-sm text-gray-900">{product.inventory?.stock || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Image Gallery
              </h2>
              
              {product.images && product.images.length > 0 && (
                <div className="text-sm text-gray-500">
                  Drag images to reorder • First image is used as primary
                </div>
              )}
            </div>
            
            <ImageGallery
              images={product.images || []}
              onImagesUpdate={handleImagesUpdate}
              productId={id}
              editable={true}
            />
          </div>
        </div>
      </div>

      {/* Image Guidelines */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Image Guidelines & Best Practices
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Technical Requirements</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Minimum resolution: 800x800 pixels</li>
              <li>Maximum file size: 5MB per image</li>
              <li>Supported formats: JPG, PNG, WEBP</li>
              <li>Square aspect ratio recommended</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Content Guidelines</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Show product from multiple angles</li>
              <li>Use good lighting and clean background</li>
              <li>Include close-up detail shots</li>
              <li>First image should be the main product view</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductImages;