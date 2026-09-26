const cloudinary = require('cloudinary').v2;

/**
 * Configure Cloudinary with environment credentials
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Upload a memory buffer directly to Cloudinary using streaming
 * @param {Buffer} buffer - File buffer from Multer memoryStorage
 * @param {string} folder - Target folder inside Cloudinary
 * @returns {Promise<object>} { public_id, url }
 */
const uploadBufferToCloudinary = (buffer, folder = 'rigamart/products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' } // Optimize image weight & format
        ]
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve({
          public_id: result.public_id,
          url: result.secure_url
        });
      }
    );

    // Write buffer directly to writable upload stream and end it
    uploadStream.end(buffer);
  });
};

/**
 * Delete an image asset from Cloudinary by its public_id
 * @param {string} publicId - The Cloudinary public_id of the asset
 */
const deleteFromCloudinary = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId);
};

module.exports = {
  cloudinary,
  uploadBufferToCloudinary,
  deleteFromCloudinary
};
