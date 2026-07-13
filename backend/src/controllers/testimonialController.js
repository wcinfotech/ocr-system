const Testimonial = require('../models/Testimonial');

const defaultTestimonials = [
  {
    quote: "Escannora cut our invoice manual data entry down to zero. We process over 10,000 marketplace orders daily across Amazon and Shopify, and Escannora extracts all our GST bills perfectly.",
    author: "Rajesh K.",
    role: "Operations Director, Fashion Hub",
    order: 0,
    isPublished: true,
  },
  {
    quote: "The API integration was incredibly smooth. The accuracy of the OCR scanner on packing labels and barcode verification is better than any tool we've tested.",
    author: "Aditi S.",
    role: "Technical Lead, ElectroCart",
    order: 1,
    isPublished: true,
  },
  {
    quote: "Outstanding product. Moving from manual keying to OCR automation helped us scale wholesalers distribution by 300% without adding headcount.",
    author: "Manoj D.",
    role: "Founder, D2C Apparel",
    order: 2,
    isPublished: true,
  },
];

// Seed helper
const seedDefaultTestimonials = async () => {
  try {
    const count = await Testimonial.countDocuments();
    if (count === 0) {
      await Testimonial.insertMany(defaultTestimonials);
      console.log('Testimonials seeded successfully');
    }
  } catch (err) {
    console.error('Error seeding testimonials:', err.message);
  }
};

/**
 * @desc    Get Published Testimonials
 * @route   GET /api/v1/testimonials
 * @access  Public
 */
const getTestimonials = async (req, res) => {
  try {
    await seedDefaultTestimonials();
    const testimonials = await Testimonial.find({ isPublished: true }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, count: testimonials.length, data: testimonials });
  } catch (error) {
    console.error(`Get testimonials error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get All Testimonials (Admin)
 * @route   GET /api/v1/testimonials/admin/all
 * @access  Private (Admin)
 */
const getAllTestimonialsAdmin = async (req, res) => {
  try {
    await seedDefaultTestimonials();
    const testimonials = await Testimonial.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, count: testimonials.length, data: testimonials });
  } catch (error) {
    console.error(`Get all testimonials admin error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Create Testimonial
 * @route   POST /api/v1/testimonials/admin/create
 * @access  Private (Admin)
 */
const createTestimonial = async (req, res) => {
  try {
    const { quote, author, role, order, isPublished } = req.body;

    if (!quote || !author || !role) {
      return res.status(400).json({ success: false, message: 'Please provide quote, author, and role' });
    }

    const testimonial = await Testimonial.create({
      quote,
      author,
      role,
      order: order !== undefined ? Number(order) : 0,
      isPublished: isPublished !== undefined ? isPublished : true,
    });

    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    console.error(`Create testimonial error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Update Testimonial
 * @route   PUT /api/v1/testimonials/admin/update/:id
 * @access  Private (Admin)
 */
const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    const { quote, author, role, order, isPublished } = req.body;

    if (quote !== undefined) testimonial.quote = quote;
    if (author !== undefined) testimonial.author = author;
    if (role !== undefined) testimonial.role = role;
    if (order !== undefined) testimonial.order = Number(order);
    if (isPublished !== undefined) testimonial.isPublished = isPublished;

    await testimonial.save();

    res.json({ success: true, data: testimonial });
  } catch (error) {
    console.error(`Update testimonial error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Delete Testimonial
 * @route   DELETE /api/v1/testimonials/admin/delete/:id
 * @access  Private (Admin)
 */
const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    await Testimonial.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error(`Delete testimonial error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getTestimonials,
  getAllTestimonialsAdmin,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
