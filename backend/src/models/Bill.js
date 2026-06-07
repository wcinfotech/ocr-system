/**
 * ============================================
 * Bill Model - MongoDB Schema (v3)
 * ============================================
 * Supports: multi-item invoices, batch tracking,
 * processing metrics, numeric confidence scores
 */

const mongoose = require('mongoose');

// ── Line Item Sub-Schema ──
const lineItemSchema = new mongoose.Schema({
  sku: { type: String, default: null },
  description: { type: String, default: null },
  qty: { type: Number, default: 1 },
  hsn: { type: String, default: null },
  taxableValue: { type: Number, default: null },
  tax: { type: Number, default: null },
  total: { type: Number, default: null },
}, { _id: false });

const billSchema = new mongoose.Schema(
  {
    // ── Upload Tracking ──
    uploadBatchId: { type: String, required: true, index: true },
    originalFile: { type: String, required: true },
    originalFileName: { type: String, required: true },
    cloudinaryUrl: { type: String, default: null },
    cloudinaryPublicId: { type: String, default: null },
    fileType: {
      type: String,
      enum: ['pdf', 'jpg', 'jpeg', 'png'],
      required: true,
    },
    billIndex: { type: Number, default: 1 },
    totalBillsInFile: { type: Number, default: 1 },

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
    payment: { type: String, default: null },
    sku: { type: String, default: null },
    qty: { type: Number, default: null },

    // ── Upgraded Fields (v4) ──
    platform: { type: String, default: null },
    paymentMode: { type: String, default: null },
    deliveryType: { type: String, default: null },
    confidence: { type: Number, default: null },

    // ── Multi-Item Support (v3) ──
    items: { type: [lineItemSchema], default: [] },
    totalItems: { type: Number, default: 0 },
    totalQty: { type: Number, default: 0 },

    // ── Return Bill Fields ──
    returnDate: { type: String, default: null },
    parsedReturnDate: { type: Date, default: null },
    returnType: { type: String, default: null },
    returnStatus: { type: String, default: null },
    claimAmount: { type: Number, default: null },
    claimStatus: { type: String, default: null },

    // ── Tax / GST ──
    gstNumber: { type: String, default: null },
    taxAmount: { type: Number, default: null },

    // ── Raw Data ──
    rawExtractedText: { type: String, default: '' },

    // ── Processing Metadata (v3) ──
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    errorMessage: { type: String, default: null },
    ocrUsed: { type: Boolean, default: false },
    pagesProcessed: { type: Number, default: 0 },
    processingTimeMs: { type: Number, default: 0 },
    retryCount: { type: Number, default: 0 },

    // ── Confidence (v3: numeric 0-100) ──
    extractionConfidence: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// ── Indexes ──
billSchema.index({ vendorName: 'text', invoiceNumber: 'text', orderNumber: 'text', awbNumber: 'text', sku: 'text' });
billSchema.index({ parsedBillDate: -1 });
billSchema.index({ createdAt: -1 });
billSchema.index({ supplierPlatform: 1 });
billSchema.index({ billType: 1 });
billSchema.index({ status: 1 });
billSchema.index({ sku: 1 });
billSchema.index({ 'items.sku': 1 });

module.exports = mongoose.model('Bill', billSchema);
