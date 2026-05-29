/**
 * ============================================
 * Bill Model - MongoDB Schema (v2)
 * ============================================
 * Supports regular + return bills
 * Supports multiple bills from a single PDF
 */

const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    // ── Upload Tracking ──
    uploadBatchId: {
      type: String,
      required: true,
      index: true,
    },
    originalFile: {
      type: String,
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'jpg', 'jpeg', 'png'],
      required: true,
    },
    billIndex: {
      type: Number,
      default: 1,
    },
    totalBillsInFile: {
      type: Number,
      default: 1,
    },

    // ── Bill Type ──
    billType: {
      type: String,
      enum: ['regular', 'return'],
      default: 'regular',
    },

    // ── Common Fields ──
    invoiceNumber: { type: String, default: null },
    orderNumber: { type: String, default: null },
    billDate: { type: String, default: null },
    parsedBillDate: { type: Date, default: null },
    amount: { type: Number, default: null },
    vendorName: { type: String, default: null },
    vendorDetails: { type: String, default: null },

    // ── E-commerce Specific ──
    supplierPlatform: {
      type: String,
      enum: ['amazon', 'flipkart', 'meesho', 'myntra', 'snapdeal', 'jiomart', 'ajio', 'personal', 'other', null],
      default: null,
    },
    awbNumber: { type: String, default: null },
    deliveryPartner: { type: String, default: null },
    payment: { type: String, default: null }, // COD, Prepaid, Online, etc.
    sku: { type: String, default: null },
    qty: { type: Number, default: null },

    // ── Return Bill Fields ──
    returnDate: { type: String, default: null },
    parsedReturnDate: { type: Date, default: null },
    returnType: { type: String, default: null }, // RTO, Customer Return, etc.
    returnStatus: { type: String, default: null }, // Success, Failed, Pending
    claimAmount: { type: Number, default: null },
    claimStatus: { type: String, default: null },

    // ── Legacy / Compatibility ──
    gstNumber: { type: String, default: null },
    taxAmount: { type: Number, default: null },

    // ── Raw Data ──
    rawExtractedText: { type: String, default: '' },

    // ── Processing ──
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    errorMessage: { type: String, default: null },

    extractionConfidence: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search and filtering
billSchema.index({ vendorName: 'text', invoiceNumber: 'text', orderNumber: 'text', awbNumber: 'text' });
billSchema.index({ parsedBillDate: -1 });
billSchema.index({ createdAt: -1 });
billSchema.index({ supplierPlatform: 1 });
billSchema.index({ billType: 1 });

module.exports = mongoose.model('Bill', billSchema);
