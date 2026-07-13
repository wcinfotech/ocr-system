const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getPublishedBlogs,
  getBlogBySlug,
  getAllBlogsAdmin,
  createBlog,
  updateBlog,
  deleteBlog,
  importMarkdown,
  uploadFeaturedImage,
} = require('../controllers/blogController');
const { protectAdmin } = require('../middleware/adminAuth');

// ── Multer config for blog image uploads ──
const blogImagesDir = path.join(__dirname, '../../uploads/blog-images');
if (!fs.existsSync(blogImagesDir)) {
  fs.mkdirSync(blogImagesDir, { recursive: true });
}

const blogImageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, blogImagesDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `blog-${uniqueSuffix}${ext}`);
  },
});

const blogImageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WebP, GIF) are allowed.'), false);
  }
};

const blogImageUpload = multer({
  storage: blogImageStorage,
  fileFilter: blogImageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max for blog images
}).single('featuredImage');

// Public endpoints
router.get('/', getPublishedBlogs);
router.get('/:slug', getBlogBySlug);

// Admin endpoints (strictly protected for authenticated admins)
router.get('/admin/all', protectAdmin, getAllBlogsAdmin);
router.post('/admin/create', protectAdmin, createBlog);
router.put('/admin/update/:id', protectAdmin, updateBlog);
router.delete('/admin/delete/:id', protectAdmin, deleteBlog);
router.post('/admin/import-md', protectAdmin, importMarkdown);
router.post('/admin/upload-image', protectAdmin, (req, res, next) => {
  blogImageUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, uploadFeaturedImage);

module.exports = router;
