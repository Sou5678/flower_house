import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import ImageUpload from '../ImageUpload';
import { adminApi } from '../../../services/adminApi';

// Mock the admin API
vi.mock('../../../services/adminApi');

// Mock File constructor for testing
global.File = class MockFile {
  constructor(bits, name, options = {}) {
    this.bits = bits;
    this.name = name;
    this.type = options.type || 'text/plain';
    this.size = options.size || bits.length;
    this.lastModified = Date.now();
  }
};

// Generator for valid image file data
const validImageFileGenerator = () => fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }).map(name => `${name}.jpg`),
  type: fc.constantFrom('image/jpeg', 'image/jpg', 'image/png', 'image/webp'),
  size: fc.integer({ min: 1024, max: 5 * 1024 * 1024 }) // 1KB to 5MB
}).map(({ name, type, size }) => {
  const content = new Array(size).fill('a').join('');
  return new File([content], name, { type, size });
});

// Generator for invalid image file data
const invalidImageFileGenerator = () => fc.oneof(
  // Invalid file types
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 50 }).map(name => `${name}.txt`),
    type: fc.constantFrom('text/plain', 'application/pdf', 'video/mp4', 'audio/mp3'),
    size: fc.integer({ min: 1024, max: 1024 * 1024 })
  }),
  // Files too large
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 50 }).map(name => `${name}.jpg`),
    type: fc.constantFrom('image/jpeg', 'image/png'),
    size: fc.integer({ min: 6 * 1024 * 1024, max: 50 * 1024 * 1024 }) // 6MB to 50MB
  }),
  // Empty files
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 50 }).map(name => `${name}.jpg`),
    type: fc.constantFrom('image/jpeg', 'image/png'),
    size: fc.constant(0)
  })
).map(({ name, type, size }) => {
  const content = new Array(Math.max(size, 1)).fill('a').join('');
  return new File([content], name, { type, size });
});

// Generator for existing image data
const existingImageGenerator = () => fc.record({
  url: fc.webUrl(),
  alt: fc.string({ minLength: 1, maxLength: 100 }),
  isPrimary: fc.boolean()
});

// Helper to render ImageUpload component
const renderImageUpload = (images = [], onChange = vi.fn()) => {
  return render(<ImageUpload images={images} onChange={onChange} />);
};

// Helper to simulate file upload
const simulateFileUpload = async (files) => {
  const fileInput = screen.getByRole('button', { name: /add images/i });
  const hiddenInput = fileInput.parentElement.querySelector('input[type="file"]');
  
  // Create a mock FileList
  const fileList = {
    length: files.length,
    item: (index) => files[index],
    [Symbol.iterator]: function* () {
      for (let i = 0; i < files.length; i++) {
        yield files[i];
      }
    }
  };
  
  // Add array-like access
  files.forEach((file, index) => {
    fileList[index] = file;
  });

  // Simulate file selection
  Object.defineProperty(hiddenInput, 'files', {
    value: fileList,
    writable: false,
  });

  fireEvent.change(hiddenInput);
};

/**
 * **Feature: admin-dashboard, Property 4: File upload validation**
 * **Validates: Requirements 1.4**
 * 
 * For any file uploaded as a product image, the Admin_Dashboard should accept 
 * only valid image formats and reject all other file types.
 */
describe('Property 4: File upload validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('accepts only valid image formats (JPEG, PNG, WebP)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(validImageFileGenerator(), { minLength: 1, maxLength: 5 }),
        async (validFiles) => {
          // Reset mocks for each iteration
          vi.clearAllMocks();

          const mockOnChange = vi.fn();
          
          // Mock successful API responses for valid files
          const mockUploadResponses = validFiles.map((file, index) => ({
            data: {
              status: 'success',
              data: {
                url: `https://example.com/image-${index}.jpg`,
                filename: file.name
              }
            }
          }));

          adminApi.uploadImage.mockImplementation((file) => {
            const index = validFiles.findIndex(f => f.name === file.name);
            return Promise.resolve(mockUploadResponses[index]);
          });

          // Render component
          renderImageUpload([], mockOnChange);

          // Simulate file upload
          await simulateFileUpload(validFiles);

          // Wait for upload to complete
          await waitFor(() => {
            expect(adminApi.uploadImage).toHaveBeenCalledTimes(validFiles.length);
          }, { timeout: 5000 });

          // Verify all valid files were accepted and uploaded
          validFiles.forEach((file) => {
            expect(adminApi.uploadImage).toHaveBeenCalledWith(file, 'product');
          });

          // Verify onChange was called with uploaded images
          await waitFor(() => {
            expect(mockOnChange).toHaveBeenCalled();
          }, { timeout: 2000 });

          const uploadedImages = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
          expect(uploadedImages).toHaveLength(validFiles.length);

          // Verify each uploaded image has correct structure
          uploadedImages.forEach((image, index) => {
            expect(image).toHaveProperty('url');
            expect(image).toHaveProperty('alt');
            expect(image).toHaveProperty('isPrimary');
            expect(typeof image.url).toBe('string');
            expect(typeof image.alt).toBe('string');
            expect(typeof image.isPrimary).toBe('boolean');
          });
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  test('rejects invalid file types and shows appropriate error messages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(invalidImageFileGenerator(), { minLength: 1, maxLength: 3 }),
        async (invalidFiles) => {
          // Reset mocks for each iteration
          vi.clearAllMocks();

          const mockOnChange = vi.fn();

          // Render component
          renderImageUpload([], mockOnChange);

          // Simulate file upload with invalid files
          await simulateFileUpload(invalidFiles);

          // Wait for validation to complete
          await waitFor(() => {
            const errorMessage = screen.queryByText(/invalid file type|file size too large|please upload/i);
            expect(errorMessage).toBeInTheDocument();
          }, { timeout: 3000 });

          // Verify API was not called for invalid files
          expect(adminApi.uploadImage).not.toHaveBeenCalled();

          // Verify onChange was not called (no valid uploads)
          expect(mockOnChange).not.toHaveBeenCalled();

          // Verify error message is displayed
          const errorElement = screen.getByText(/invalid file type|file size too large|please upload/i);
          expect(errorElement).toBeInTheDocument();
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  test('validates file size limits (5MB maximum)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          validSize: fc.integer({ min: 1024, max: 5 * 1024 * 1024 }), // 1KB to 5MB
          invalidSize: fc.integer({ min: 6 * 1024 * 1024, max: 50 * 1024 * 1024 }) // 6MB to 50MB
        }),
        async ({ validSize, invalidSize }) => {
          // Reset mocks for each iteration
          vi.clearAllMocks();

          const mockOnChange = vi.fn();

          // Create files with different sizes
          const validFile = new File(['a'.repeat(validSize)], 'valid.jpg', { 
            type: 'image/jpeg', 
            size: validSize 
          });
          
          const invalidFile = new File(['a'.repeat(invalidSize)], 'invalid.jpg', { 
            type: 'image/jpeg', 
            size: invalidSize 
          });

          // Mock API response for valid file
          adminApi.uploadImage.mockResolvedValue({
            data: {
              status: 'success',
              data: {
                url: 'https://example.com/valid.jpg',
                filename: 'valid.jpg'
              }
            }
          });

          // Test valid file first
          renderImageUpload([], mockOnChange);
          await simulateFileUpload([validFile]);

          // Wait for valid upload to complete
          await waitFor(() => {
            expect(adminApi.uploadImage).toHaveBeenCalledWith(validFile, 'product');
          }, { timeout: 3000 });

          // Reset for invalid file test
          vi.clearAllMocks();
          mockOnChange.mockClear();

          // Test invalid file
          const { rerender } = renderImageUpload([], mockOnChange);
          await simulateFileUpload([invalidFile]);

          // Wait for validation error
          await waitFor(() => {
            const errorMessage = screen.queryByText(/file size too large|5mb/i);
            expect(errorMessage).toBeInTheDocument();
          }, { timeout: 3000 });

          // Verify API was not called for oversized file
          expect(adminApi.uploadImage).not.toHaveBeenCalled();
          expect(mockOnChange).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  test('handles mixed valid and invalid files correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(validImageFileGenerator(), { minLength: 1, maxLength: 3 }),
        fc.array(invalidImageFileGenerator(), { minLength: 1, maxLength: 2 }),
        async (validFiles, invalidFiles) => {
          // Reset mocks for each iteration
          vi.clearAllMocks();

          const mockOnChange = vi.fn();
          const allFiles = [...validFiles, ...invalidFiles];

          // Mock API responses for valid files only
          adminApi.uploadImage.mockImplementation((file) => {
            const isValid = validFiles.some(vf => vf.name === file.name);
            if (isValid) {
              return Promise.resolve({
                data: {
                  status: 'success',
                  data: {
                    url: `https://example.com/${file.name}`,
                    filename: file.name
                  }
                }
              });
            }
            return Promise.reject(new Error('Invalid file'));
          });

          // Render component
          renderImageUpload([], mockOnChange);

          // Simulate mixed file upload
          await simulateFileUpload(allFiles);

          // Wait for processing to complete
          await waitFor(() => {
            // Should show error for invalid files
            const errorMessage = screen.queryByText(/invalid file type|file size too large/i);
            expect(errorMessage).toBeInTheDocument();
          }, { timeout: 5000 });

          // Verify API was called only for valid files
          expect(adminApi.uploadImage).toHaveBeenCalledTimes(validFiles.length);

          validFiles.forEach((file) => {
            expect(adminApi.uploadImage).toHaveBeenCalledWith(file, 'product');
          });

          // Verify invalid files were not uploaded
          invalidFiles.forEach((file) => {
            expect(adminApi.uploadImage).not.toHaveBeenCalledWith(file, 'product');
          });
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);

  test('validates file extensions match MIME types', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 20 }),
          extension: fc.constantFrom('.jpg', '.jpeg', '.png', '.webp'),
          mimeType: fc.constantFrom('image/jpeg', 'image/png', 'image/webp'),
          size: fc.integer({ min: 1024, max: 1024 * 1024 })
        }),
        async ({ name, extension, mimeType, size }) => {
          // Reset mocks for each iteration
          vi.clearAllMocks();

          const mockOnChange = vi.fn();
          const fileName = `${name}${extension}`;
          
          // Create file with specific MIME type
          const file = new File(['a'.repeat(size)], fileName, { 
            type: mimeType, 
            size 
          });

          // Mock API response
          adminApi.uploadImage.mockResolvedValue({
            data: {
              status: 'success',
              data: {
                url: `https://example.com/${fileName}`,
                filename: fileName
              }
            }
          });

          // Render component
          renderImageUpload([], mockOnChange);

          // Simulate file upload
          await simulateFileUpload([file]);

          // For valid image MIME types, upload should succeed
          if (['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(mimeType)) {
            await waitFor(() => {
              expect(adminApi.uploadImage).toHaveBeenCalledWith(file, 'product');
            }, { timeout: 3000 });

            await waitFor(() => {
              expect(mockOnChange).toHaveBeenCalled();
            }, { timeout: 2000 });
          } else {
            // Invalid MIME types should show error
            await waitFor(() => {
              const errorMessage = screen.queryByText(/invalid file type/i);
              expect(errorMessage).toBeInTheDocument();
            }, { timeout: 3000 });

            expect(adminApi.uploadImage).not.toHaveBeenCalled();
            expect(mockOnChange).not.toHaveBeenCalled();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  test('preserves existing images when adding new valid images', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(existingImageGenerator(), { minLength: 1, maxLength: 3 }),
        fc.array(validImageFileGenerator(), { minLength: 1, maxLength: 2 }),
        async (existingImages, newFiles) => {
          // Reset mocks for each iteration
          vi.clearAllMocks();

          const mockOnChange = vi.fn();

          // Mock API responses for new files
          const mockUploadResponses = newFiles.map((file, index) => ({
            data: {
              status: 'success',
              data: {
                url: `https://example.com/new-${index}.jpg`,
                filename: file.name
              }
            }
          }));

          adminApi.uploadImage.mockImplementation((file) => {
            const index = newFiles.findIndex(f => f.name === file.name);
            return Promise.resolve(mockUploadResponses[index]);
          });

          // Render component with existing images
          renderImageUpload(existingImages, mockOnChange);

          // Verify existing images are displayed
          existingImages.forEach((image) => {
            expect(screen.getByAltText(image.alt)).toBeInTheDocument();
          });

          // Simulate adding new files
          await simulateFileUpload(newFiles);

          // Wait for upload to complete
          await waitFor(() => {
            expect(adminApi.uploadImage).toHaveBeenCalledTimes(newFiles.length);
          }, { timeout: 5000 });

          // Verify onChange was called with combined images
          await waitFor(() => {
            expect(mockOnChange).toHaveBeenCalled();
          }, { timeout: 2000 });

          const finalImages = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
          
          // Should have existing + new images
          expect(finalImages).toHaveLength(existingImages.length + newFiles.length);

          // Verify existing images are preserved
          existingImages.forEach((existingImage, index) => {
            expect(finalImages[index]).toEqual(existingImage);
          });

          // Verify new images are added
          const newImages = finalImages.slice(existingImages.length);
          expect(newImages).toHaveLength(newFiles.length);
          
          newImages.forEach((image) => {
            expect(image).toHaveProperty('url');
            expect(image).toHaveProperty('alt');
            expect(image).toHaveProperty('isPrimary');
          });
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);
});