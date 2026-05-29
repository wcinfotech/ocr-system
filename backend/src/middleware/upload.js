/**
 * ============================================
 * Multer Upload Middleware
 * ============================================
 * Handles file upload with validation for PDF, JPG, PNG
 * Supports single file upload with size limit
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(ext, '');
    cb(null, `${safeName}-${uniqueSuffix}${ext}`);
  },
});

// File filter - only allow PDF, JPG, PNG
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ];

  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only PDF, JPG, and PNG files are allowed.`
      ),
      false
    );
  }
};

// Max file size from env or default 10MB
const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;

// Multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxSize,
  },
});

// Middleware wrapper with error handling
const uploadMiddleware = (req, res, next) => {
  const singleUpload = upload.single('billFile');

  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`,
        });
      }
      return res.status(400).json({
        success: false,
        error: `Upload error: ${err.message}`,
      });
    }

    if (err) {
      // Custom file filter errors
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please select a PDF, JPG, or PNG file.',
      });
    }

    next();
  });
};

module.exports = uploadMiddleware;
