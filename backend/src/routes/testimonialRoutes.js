const express = require('express');
const router = express.Router();
const {
  getTestimonials,
  getAllTestimonialsAdmin,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require('../controllers/testimonialController');
const { protectAdmin } = require('../middleware/adminAuth');

// Public route
router.get('/', getTestimonials);

// Admin routes
router.get('/admin/all', protectAdmin, getAllTestimonialsAdmin);
router.post('/admin/create', protectAdmin, createTestimonial);
router.put('/admin/update/:id', protectAdmin, updateTestimonial);
router.delete('/admin/delete/:id', protectAdmin, deleteTestimonial);

module.exports = router;
