import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import LoadingSpinner from '../../../components/LoadingSpinner';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getProduct(id);
      setProduct(response.data.data.product);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await adminApi.deleteProduct(id);
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <Link
          to="/admin/products"
          className="text-blue-600 hover:text-blue-800"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 mb-4">Product not found</div>
        <Link
          to="/admin/products"
          className="text-blue-600 hover:text-blue-800"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-600">Product Details</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/admin/products/${product._id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit Product
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Delete Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Price</dt>
                <dd className="mt-1 text-sm text-gray-900">${product.price?.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {product.category?.name || 'Uncategorized'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Stock</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {product.inventory?.stock || 0} units
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Available</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.inventory?.isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.inventory?.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Description */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
          </div>

          {/* Product Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Product Details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {product.flowerTypes && product.flowerTypes.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Flower Types</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {product.flowerTypes.join(', ')}
                  </dd>
                </div>
              )}
              {product.occasions && product.occasions.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Occasions</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {product.occasions.join(', ')}
                  </dd>
                </div>
              )}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Colors</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {product.colors.join(', ')}
                  </dd>
                </div>
              )}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tags</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {product.tags.join(', ')}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Featured</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {product.isFeatured ? 'Yes' : 'No'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Popular</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {product.isPopular ? 'Yes' : 'No'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Care Instructions */}
          {product.careInstructions && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Care Instructions</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{product.careInstructions}</p>
            </div>
          )}

          {/* Delivery Information */}
          {product.deliveryInfo && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Delivery Information</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{product.deliveryInfo}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Images */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Images</h2>
            {product.images && product.images.length > 0 ? (
              <div className="space-y-4">
                {product.images.map((image, index) => (
                  <div key={index} className="relative">
                    {image.isPrimary && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded z-10">
                        Primary
                      </div>
                    )}
                    <img
                      src={image.url}
                      alt={image.alt || product.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    {image.alt && (
                      <p className="mt-2 text-sm text-gray-600">{image.alt}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-2">No images uploaded</p>
              </div>
            )}
          </div>

          {/* Inventory Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Inventory</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Current Stock</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {product.inventory?.stock || 0} units
                </dd>
              </div>
              {product.inventory?.lowStockThreshold && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Low Stock Threshold</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {product.inventory.lowStockThreshold} units
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Stock Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    (product.inventory?.stock || 0) > 0
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {(product.inventory?.stock || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </dd>
              </div>
              {product.inventory?.lowStockThreshold && (product.inventory?.stock || 0) <= product.inventory.lowStockThreshold && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800">
                        Low stock warning
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </dl>
          </div>

          {/* Metadata */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Metadata</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(product.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(product.updatedAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Product ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">
                  {product._id}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;