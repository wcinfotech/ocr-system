const Blog = require('../models/Blog');
const path = require('path');
const fs = require('fs');

// Ensure blog-images directory exists
const blogImagesDir = path.join(__dirname, '../../uploads/blog-images');
if (!fs.existsSync(blogImagesDir)) {
  fs.mkdirSync(blogImagesDir, { recursive: true });
}

// Regex-based frontmatter parser for markdown imports
const parseFrontmatter = (mdText) => {
  const result = { title: '', category: 'General', excerpt: '', content: mdText };
  const frontmatterRegex = /^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/;
  const match = mdText.match(frontmatterRegex);
  if (match) {
    const yamlPart = match[1];
    const contentPart = match[2];
    result.content = contentPart.trim();
    
    const lines = yamlPart.split(/\r?\n/);
    lines.forEach((line) => {
      const colIdx = line.indexOf(':');
      if (colIdx !== -1) {
        const key = line.slice(0, colIdx).trim().toLowerCase();
        const val = line.slice(colIdx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (key === 'title') result.title = val;
        else if (key === 'category') result.category = val;
        else if (key === 'excerpt') result.excerpt = val;
      }
    });
  }
  return result;
};

// ============================================
// Public Blog Controllers
// ============================================

// @desc    Get all published blogs
// @route   GET /api/v1/blogs
const getPublishedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true }).sort({ publishedAt: -1 });
    res.json({ success: true, count: blogs.length, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single published blog by slug
// @route   GET /api/v1/blogs/:slug
const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true });
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog article not found' });
    }
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// Admin Blog Controllers (Protected)
// ============================================

// @desc    Get all blogs (Admin)
// @route   GET /api/v1/admin/blogs
const getAllBlogsAdmin = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ success: true, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create blog post
// @route   POST /api/v1/admin/blogs
const createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, category, isPublished, author, featuredImage } = req.body;
    
    // Auto-slug generated on schema save
    const blog = await Blog.create({
      title,
      excerpt,
      content,
      category,
      isPublished,
      author,
      featuredImage,
    });

    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update blog post
// @route   PUT /api/v1/admin/blogs/:id
const updateBlog = async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Force regenerate slug if title changes
    if (req.body.title && req.body.title !== blog.title) {
      blog.slug = undefined; // Trigger pre-save validate slug generator
    }

    Object.assign(blog, req.body);
    await blog.save();

    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete blog post
// @route   DELETE /api/v1/admin/blogs/:id
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Import Markdown file contents
// @route   POST /api/v1/admin/blogs/import-md
const importMarkdown = async (req, res) => {
  try {
    if (!req.files || !req.files.mdFile) {
      return res.status(400).json({ success: false, message: 'Please upload a markdown (.md) file' });
    }

    const file = req.files.mdFile;
    const mdText = file.data.toString('utf8');
    const parsed = parseFrontmatter(mdText);

    res.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload featured image for a blog post
// @route   POST /api/v1/admin/blogs/upload-image
const uploadFeaturedImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded. Please select a JPG, PNG, or WebP file.' });
    }

    // Build the public-accessible URL for the uploaded image
    const imageUrl = `/uploads/blog-images/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPublishedBlogs,
  getBlogBySlug,
  getAllBlogsAdmin,
  createBlog,
  updateBlog,
  deleteBlog,
  importMarkdown,
  uploadFeaturedImage,
};
