const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    quote: {
      type: String,
      required: [true, 'Please add a quote/review'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Please add an author name'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Please add a role/designation'],
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);
