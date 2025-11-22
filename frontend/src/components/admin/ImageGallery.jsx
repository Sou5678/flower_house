import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Move, 
  Eye, 
  Trash2, 
  Download,
  MoreVertical,
  Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ImageGallery = ({ 
  images = [], 
  onImagesUpdate, 
  productId,
  editable = true 
}) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [draggedImage, setDraggedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageDelete = async (imageId, publicId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete image');
      }

      const result = await response.json();
      onImagesUpdate(result.data.product.images);
      toast.success('Image deleted successfully');
      
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete image');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async (imageId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}/images/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ primaryImageId: imageId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to set primary image');
      }

      const result = await response.json();
      onImagesUpdate(result.data.product.images);
      toast.success('Primary image updated');
      
    } catch (error) {
      console.error('Set primary error:', error);
      toast.error(error.message || 'Failed to set primary image');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, image) => {
    setDraggedImage(image);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetImage) => {
    e.preventDefault();
    
    if (!draggedImage || draggedImage._id === targetImage._id) {
      setDraggedImage(null);
      return;
    }

    const newOrder = [...images];
    const draggedIndex = newOrder.findIndex(img => img._id === draggedImage._id);
    const targetIndex = newOrder.findIndex(img => img._id === targetImage._id);

    // Remove dragged item and insert at target position
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    // Update order on server
    setLoading(true);
    try {
      const imageOrder = newOrder.map(img => img._id);
      
      const response = await fetch(`/api/admin/products/${productId}/images/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ imageOrder })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reorder images');
      }

      const result = await response.json();
      onImagesUpdate(result.data.product.images);
      toast.success('Image order updated');
      
    } catch (error) {
      console.error('Reorder error:', error);
      toast.error(error.message || 'Failed to reorder images');
    } finally {
      setLoading(false);
      setDraggedImage(null);
    }
  };

  const handleImageSelect = (imageId) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedImages.length === 0) return;
    
    if (!window.confirm(`Delete ${selectedImages.length} selected images?`)) {
      return;
    }

    setLoading(true);
    try {
      // Delete images one by one (could be optimized with bulk endpoint)
      for (const imageId of selectedImages) {
        await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }

      // Refresh product data
      const response = await fetch(`/api/admin/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const result = await response.json();
      onImagesUpdate(result.data.product.images);
      setSelectedImages([]);
      toast.success(`${selectedImages.length} images deleted`);
      
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete some images');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (imageUrl, imageName) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = imageName || 'product-image.jpg';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Eye className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-2">No images uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {editable && selectedImages.length > 0 && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
          <span className="text-sm text-blue-700">
            {selectedImages.length} image(s) selected
          </span>
          <div className="flex space-x-2">
            <button
              onClick={handleBulkDelete}
              disabled={loading}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 inline mr-1" />
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedImages([])}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={image._id}
            className={`
              relative group border-2 rounded-lg overflow-hidden transition-all
              ${image.isPrimary ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-gray-200'}
              ${selectedImages.includes(image._id) ? 'ring-2 ring-blue-400' : ''}
              ${draggedImage?._id === image._id ? 'opacity-50' : ''}
            `}
            draggable={editable}
            onDragStart={(e) => handleDragStart(e, image)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, image)}
          >
            {/* Selection Checkbox */}
            {editable && (
              <div className="absolute top-2 left-2 z-10">
                <button
                  onClick={() => handleImageSelect(image._id)}
                  className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center
                    ${selectedImages.includes(image._id)
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  {selectedImages.includes(image._id) && (
                    <Check className="h-3 w-3" />
                  )}
                </button>
              </div>
            )}

            {/* Primary Badge */}
            {image.isPrimary && (
              <div className="absolute top-2 right-2 z-10">
                <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-medium flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  Primary
                </div>
              </div>
            )}

            {/* Image */}
            <div className="aspect-square">
              <img
                src={image.variants?.small || image.url}
                alt={image.alt || `Product image ${index + 1}`}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setShowImageModal(image)}
              />
            </div>

            {/* Overlay Actions */}
            {editable && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowImageModal(image)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    title="View full size"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  
                  {!image.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(image._id)}
                      disabled={loading}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                      title="Set as primary"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => downloadImage(image.url, `product-image-${index + 1}`)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleImageDelete(image._id, image.public_id)}
                    disabled={loading}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Drag Handle */}
            {editable && (
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Move className="h-4 w-4 text-white drop-shadow-lg cursor-move" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={showImageModal.variants?.large || showImageModal.url}
              alt={showImageModal.alt}
              className="max-w-full max-h-full object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
              <p className="text-sm">
                {showImageModal.width} × {showImageModal.height} • {showImageModal.format?.toUpperCase()} • {Math.round(showImageModal.bytes / 1024)}KB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;