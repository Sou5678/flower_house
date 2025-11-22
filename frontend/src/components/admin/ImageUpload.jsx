import React, { useState, useRef } from 'react';
import { Upload, X, Image, AlertCircle, Check, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ImageUpload = ({ 
  onImagesUploaded, 
  maxImages = 10, 
  existingImages = [],
  productId = null 
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const handleFiles = async (files) => {
    const fileArray = Array.from(files);
    
    // Validate file types
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Check total images limit
    if (existingImages.length + validFiles.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    const uploadedImages = [];

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/upload/product/single', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Upload failed');
        }

        const result = await response.json();
        uploadedImages.push(result.data);
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // If productId is provided, add images to product
      if (productId && uploadedImages.length > 0) {
        const addResponse = await fetch(`/api/admin/products/${productId}/images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ images: uploadedImages })
        });

        if (!addResponse.ok) {
          const error = await addResponse.json();
          throw new Error(error.message || 'Failed to add images to product');
        }
      }

      onImagesUploaded(uploadedImages);
      toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="space-y-2">
          {uploading ? (
            <Loader className="mx-auto h-8 w-8 animate-spin text-blue-500" />
          ) : (
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
          )}
          
          <div>
            <p className="text-sm font-medium text-gray-900">
              {uploading ? 'Uploading images...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, WEBP up to 5MB each (max {maxImages} images)
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Upload Progress</h4>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 truncate">{fileName}</span>
                <span className="text-gray-500">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">Image Guidelines</h4>
            <div className="mt-1 text-xs text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Use high-quality images (800x800px or larger recommended)</li>
                <li>First image will be used as the primary product image</li>
                <li>Images are automatically optimized for web performance</li>
                <li>Supported formats: JPG, PNG, WEBP</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;