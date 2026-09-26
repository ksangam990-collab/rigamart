const {
  uploadBufferToCloudinary,
  deleteFromCloudinary
} = require('../config/cloudinary');

/**
 * @desc    Upload a single image (e.g., category icon, avatar)
 * @route   POST /api/upload/single
 * @access  Private (Seller or Admin)
 */
const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded. Please attach an image under field "image".',
        data: null
      });
    }

    const folder = req.body.folder || 'rigamart/categories';
    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, folder);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        public_id: uploadResult.public_id,
        url: uploadResult.url
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Image upload failed: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Upload multiple images (up to 5 for product gallery)
 * @route   POST /api/upload/multiple
 * @access  Private (Seller or Admin)
 */
const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files uploaded. Please attach images under field "images".',
        data: null
      });
    }

    const folder = req.body.folder || 'rigamart/products';

    // Upload all files concurrently via Promise.all
    const uploadPromises = req.files.map((file) =>
      uploadBufferToCloudinary(file.buffer, folder)
    );

    const uploadedImages = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      message: `${uploadedImages.length} images uploaded successfully`,
      data: {
        images: uploadedImages
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Image upload failed: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Delete image from Cloudinary by public_id
 * @route   DELETE /api/upload/:publicId(*)
 * @access  Private (Seller or Admin)
 */
const deleteImage = async (req, res) => {
  try {
    const publicId = req.params.publicId || req.body.public_id;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Cloudinary public_id is required for deletion',
        data: null
      });
    }

    const result = await deleteFromCloudinary(publicId);

    res.status(200).json({
      success: true,
      message: 'Image deleted from Cloudinary successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to delete image: ${error.message}`,
      data: null
    });
  }
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage
};
