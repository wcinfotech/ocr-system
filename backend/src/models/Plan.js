/**
 * ============================================
 * Plan Model - MongoDB Schema
 * ============================================
 * Handles subscription plan configurations managed by administrators
 */

const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a plan name'],
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
    },
    ocrLimit: {
      type: Number,
      required: [true, 'Please provide an OCR limit'],
      min: [0, 'OCR limit cannot be negative'],
    },
    storageMb: {
      type: Number,
      required: [true, 'Please provide a storage limit in MB'],
      min: [0, 'Storage limit cannot be negative'],
    },
    durationDays: {
      type: Number,
      required: [true, 'Please provide duration in days'],
      min: [1, 'Duration must be at least 1 day'],
      default: 30,
    },
    benefits: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);
