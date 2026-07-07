/**
 * ============================================
 * Invoice Model - MongoDB Schema
 * ============================================
 * Handles invoices/receipts for subscription payments
 */

const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invoiceId: {
      type: String,
      required: true,
      unique: true,
    },
    plan: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    billingPeriod: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['paid', 'unpaid', 'free'],
      default: 'paid',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
