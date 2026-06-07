/**
 * ============================================
 * Multer Upload Middleware (v3)
 * ============================================
 * Supports: multi-file upload (up to 20 files)
 * Handles PDF, JPG, PNG with size validation
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
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(ext, '');
    cb(null, `${safeName}-${uniqueSuffix}${ext}`);
  },
});

// File filter - allow PDF, JPG, PNG, and ZIP
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/zip',
    'application/x-zip-compressed',
    'application/octet-stream'
  ];
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.zip'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only PDF, JPG, PNG, and ZIP files are allowed.`), false);
  }
};

const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024; // 50MB default
const maxFiles = parseInt(process.env.MAX_FILES) || 20;

const upload = multer({ storage, fileFilter, limits: { fileSize: maxSize } });

// ── Single file upload middleware (backward compatible) ──
const singleUploadMiddleware = (req, res, next) => {
  const singleUpload = upload.single('billFile');
  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB.` });
      }
      return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
    }
    if (err) return res.status(400).json({ success: false, error: err.message });
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded. Please select a PDF, JPG, or PNG file.' });
    next();
  });
};

// ── Multi-file upload middleware (v3) ──
const multiUploadMiddleware = (req, res, next) => {
  const multiUpload = upload.array('billFiles', maxFiles);
  multiUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB.` });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ success: false, error: `Too many files. Maximum is ${maxFiles} files at once.` });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ success: false, error: `Unexpected field name. Use 'billFiles' for multi-upload.` });
      }
      return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
    }
    if (err) return res.status(400).json({ success: false, error: err.message });
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded. Please select PDF, JPG, or PNG files.' });
    }
    next();
  });
};

module.exports = singleUploadMiddleware;
module.exports.singleUpload = singleUploadMiddleware;
module.exports.multiUpload = multiUploadMiddleware;
