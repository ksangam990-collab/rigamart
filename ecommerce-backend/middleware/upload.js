const multer = require('multer');

// Memory storage holds files in RAM buffers for immediate Cloudinary streaming
const storage = multer.memoryStorage();

// Validate image file mime types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file format: ${file.mimetype}. Only JPEG, JPG, PNG, and WebP images are allowed.`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max per image
  },
  fileFilter
});

const uploadSingle = upload.single('image');
const uploadMultiple = upload.array('images', 5);

/**
 * Handle Multer exceptions cleanly before reaching controllers
 */
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum file size allowed is 5MB.',
        data: null
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded. Maximum 5 images allowed per upload.',
        data: null
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
      data: null
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null
    });
  }
  next();
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  handleUploadErrors
};
