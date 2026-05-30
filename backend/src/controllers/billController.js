/**
 * ============================================
 * Bill Controller (v3) — Production
 * ============================================
 * Multi-file batch upload, export, retry logic,
 * robust error handling
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Bill = require('../models/Bill');
const { extractTextFromPDF } = require('../services/pdfService');
const { extractTextFromImage } = require('../services/ocrService');
const { extractBillData, extractSingleBill } = require('../services/extractionService');
const { parseDate } = require('../helpers/validators');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

const useCloudinary = process.env.USE_CLOUDINARY === 'true';

// ════════════════════════════════════════════
// SINGLE FILE UPLOAD (backward compatible)
// ════════════════════════════════════════════

const uploadBill = async (req, res) => {
  try {
    const file = req.file;
    const filePath = file.path;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const batchId = crypto.randomUUID();

    const placeholder = new Bill({
      uploadBatchId: batchId,
      originalFile: filePath,
      originalFileName: file.originalname,
      fileType: ext,
      status: 'processing',
    });
    await placeholder.save();

    processBill(placeholder._id, batchId, filePath, ext, file.originalname).catch((err) => {
      console.error(`Background processing error: ${err.message}`);
    });

    res.status(201).json({
      success: true,
      message: 'Bill uploaded — extraction in progress',
      data: { batchId, billId: placeholder._id, status: 'processing' },
    });
  } catch (error) {
    console.error(`Upload error: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ════════════════════════════════════════════
// BATCH MULTI-FILE UPLOAD (v3)
// ════════════════════════════════════════════

const uploadBills = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const batchId = crypto.randomUUID();
    const results = [];

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
      const placeholder = new Bill({
        uploadBatchId: batchId,
        originalFile: file.path,
        originalFileName: file.originalname,
        fileType: ext,
        status: 'processing',
      });
      await placeholder.save();

      // Start background processing for each file
      processBill(placeholder._id, batchId, file.path, ext, file.originalname).catch((err) => {
        console.error(`Batch processing error [${file.originalname}]: ${err.message}`);
      });

      results.push({
        billId: placeholder._id,
        fileName: file.originalname,
        status: 'processing',
      });
    }

    res.status(201).json({
      success: true,
      message: `${files.length} file(s) uploaded — extraction in progress`,
      data: { batchId, totalFiles: files.length, files: results },
    });
  } catch (error) {
    console.error(`Batch upload error: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ════════════════════════════════════════════
// BACKGROUND PROCESSOR
// ════════════════════════════════════════════

const processBill = async (placeholderId, batchId, filePath, fileType, fileName, retryCount = 0) => {
  const startTime = Date.now();
  try {
    let rawText = '';
    let ocrUsed = false;
    let pagesProcessed = 0;

    if (fileType === 'pdf') {
      const pdfResult = await extractTextFromPDF(filePath);
      rawText = pdfResult.text;
      ocrUsed = pdfResult.ocrUsed || false;
      pagesProcessed = pdfResult.pages || 0;
      console.log(`📄 PDF: ${rawText.length} chars, ${pagesProcessed} pages, OCR=${ocrUsed}`);
    } else {
      const ocrResult = await extractTextFromImage(filePath, true);
      rawText = ocrResult.text;
      ocrUsed = true;
      pagesProcessed = 1;
    }

    const { bills, totalBills } = extractBillData(rawText);
    console.log(`📊 Found ${totalBills} bill(s) in ${fileName}`);

    const processingTimeMs = Date.now() - startTime;

    // Upload to Cloudinary if enabled
    let cloudinaryUrl = null;
    let cloudinaryPublicId = null;
    if (useCloudinary) {
      try {
        console.log(`☁️  Uploading ${fileName} to Cloudinary...`);
        const cloudResult = await uploadToCloudinary(filePath);
        cloudinaryUrl = cloudResult.url;
        cloudinaryPublicId = cloudResult.publicId;
        console.log(`☁️  Cloudinary URL: ${cloudinaryUrl}`);
      } catch (cloudErr) {
        console.warn(`⚠️  Cloudinary upload failed, keeping local: ${cloudErr.message}`);
      }
    }

    if (totalBills === 1) {
      const bill = bills[0];
      await Bill.findByIdAndUpdate(placeholderId, {
        ...buildBillUpdate(bill, totalBills),
        rawExtractedText: rawText,
        status: 'completed',
        ocrUsed,
        pagesProcessed,
        processingTimeMs,
        retryCount,
        cloudinaryUrl,
        cloudinaryPublicId,
      });
    } else {
      for (let i = 0; i < bills.length; i++) {
        const bill = bills[i];
        const update = {
          ...buildBillUpdate(bill, totalBills),
          uploadBatchId: batchId,
          originalFile: filePath,
          originalFileName: fileName,
          fileType,
          rawExtractedText: bill.rawExtractedText || '',
          status: 'completed',
          ocrUsed,
          pagesProcessed,
          processingTimeMs,
          retryCount,
          cloudinaryUrl,
          cloudinaryPublicId,
        };
        if (i === 0) {
          await Bill.findByIdAndUpdate(placeholderId, update);
        } else {
          await new Bill(update).save();
        }
      }
    }

    // Clean up local temp file after cloud upload
    if (cloudinaryUrl && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); console.log(`🗑️  Local temp file cleaned: ${fileName}`); } catch { /* ignore */ }
    }

    console.log(`✅ Batch ${batchId}: ${totalBills} bill(s) in ${processingTimeMs}ms`);
  } catch (error) {
    console.error(`❌ Processing failed [${fileName}]: ${error.message}`);

    // Retry up to 2 times
    if (retryCount < 2) {
      console.log(`🔄 Retrying (${retryCount + 1}/2)...`);
      setTimeout(() => {
        processBill(placeholderId, batchId, filePath, fileType, fileName, retryCount + 1);
      }, 3000 * (retryCount + 1));
      return;
    }

    await Bill.findByIdAndUpdate(placeholderId, {
      status: 'failed',
      errorMessage: error.message,
      processingTimeMs: Date.now() - startTime,
      retryCount,
    });
  }
};

/** Build update object from extracted bill data */
const buildBillUpdate = (bill, totalBills) => {
  let parsedBillDate = null;
  if (bill.billDate) parsedBillDate = parseDate(bill.billDate);
  let parsedReturnDate = null;
  if (bill.returnDate) parsedReturnDate = parseDate(bill.returnDate);

  return {
    billType: bill.billType || 'regular',
    invoiceNumber: bill.invoiceNumber,
    orderNumber: bill.orderNumber,
    billDate: bill.billDate,
    parsedBillDate,
    amount: bill.amount,
    vendorName: bill.vendorName,
    vendorDetails: bill.vendorDetails,
    supplierPlatform: bill.supplierPlatform,
    awbNumber: bill.awbNumber,
    deliveryPartner: bill.deliveryPartner,
    payment: bill.payment,
    sku: bill.sku,
    qty: bill.qty,
    gstNumber: bill.gstNumber,
    taxAmount: bill.taxAmount,
    items: bill.items || [],
    totalItems: bill.totalItems || 0,
    totalQty: bill.totalQty || 0,
    returnDate: bill.returnDate,
    parsedReturnDate,
    returnType: bill.returnType,
    returnStatus: bill.returnStatus,
    claimAmount: bill.claimAmount,
    claimStatus: bill.claimStatus,
    billIndex: bill.billIndex,
    totalBillsInFile: totalBills,
    extractionConfidence: bill.extractionConfidence,
  };
};

// ════════════════════════════════════════════
// CRUD ENDPOINTS
// ════════════════════════════════════════════

const getBills = async (req, res) => {
  try {
    const {
      page = 1, limit = 25, search = '',
      startDate, endDate, platform, billType,
      sortBy = 'createdAt', sortOrder = 'desc',
    } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { vendorName: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { orderNumber: { $regex: search, $options: 'i' } },
        { awbNumber: { $regex: search, $options: 'i' } },
        { gstNumber: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { 'items.sku': { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      query.parsedBillDate = {};
      if (startDate) query.parsedBillDate.$gte = new Date(startDate);
      if (endDate) query.parsedBillDate.$lte = new Date(endDate);
    }
    if (platform) query.supplierPlatform = platform;
    if (billType) query.billType = billType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [bills, total] = await Promise.all([
      Bill.find(query).sort(sort).skip(skip).limit(parseInt(limit)).select('-rawExtractedText'),
      Bill.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: bills,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, error: 'Bill not found' });
    res.json({ success: true, data: bill });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ success: false, error: 'Invalid bill ID' });
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, error: 'Bill not found' });
    const siblings = await Bill.countDocuments({ uploadBatchId: bill.uploadBatchId, _id: { $ne: bill._id } });
    if (siblings === 0) {
      // Delete from Cloudinary
      if (bill.cloudinaryPublicId) {
        await deleteFromCloudinary(bill.cloudinaryPublicId);
      }
      // Delete local file if exists
      if (bill.originalFile && fs.existsSync(bill.originalFile)) {
        try { fs.unlinkSync(bill.originalFile); } catch { /* ignore */ }
      }
    }
    await Bill.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Bill deleted' });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ success: false, error: 'Invalid bill ID' });
    res.status(500).json({ success: false, error: error.message });
  }
};

// ════════════════════════════════════════════
// BATCH STATUS
// ════════════════════════════════════════════

const getBatchStatus = async (req, res) => {
  try {
    const { batchId } = req.params;
    const bills = await Bill.find({ uploadBatchId: batchId }).select('status originalFileName errorMessage processingTimeMs');
    if (bills.length === 0) return res.status(404).json({ success: false, error: 'Batch not found' });

    const completed = bills.filter(b => b.status === 'completed').length;
    const failed = bills.filter(b => b.status === 'failed').length;
    const processing = bills.filter(b => b.status === 'processing').length;

    res.json({
      success: true,
      data: {
        batchId,
        totalFiles: bills.length,
        completed, failed, processing,
        isComplete: processing === 0,
        files: bills,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ════════════════════════════════════════════
// EXPORT (CSV)
// ════════════════════════════════════════════

const exportBills = async (req, res) => {
  try {
    const { format = 'csv', ...filters } = req.query;
    const query = {};
    if (filters.platform) query.supplierPlatform = filters.platform;
    if (filters.billType) query.billType = filters.billType;
    if (filters.startDate || filters.endDate) {
      query.parsedBillDate = {};
      if (filters.startDate) query.parsedBillDate.$gte = new Date(filters.startDate);
      if (filters.endDate) query.parsedBillDate.$lte = new Date(filters.endDate);
    }

    const bills = await Bill.find(query).sort({ createdAt: -1 }).limit(5000).select('-rawExtractedText');

    if (format === 'csv') {
      const headers = ['Invoice No', 'Order No', 'Date', 'Platform', 'Vendor', 'Amount', 'SKU', 'Qty', 'Items', 'AWB', 'Delivery Partner', 'Payment', 'GST', 'Tax', 'Type', 'Status'];
      const rows = bills.map(b => [
        b.invoiceNumber || '', b.orderNumber || '', b.billDate || '',
        b.supplierPlatform || '', b.vendorName || '', b.amount || '',
        b.sku || '', b.qty || '', b.totalItems || '',
        b.awbNumber || '', b.deliveryPartner || '', b.payment || '',
        b.gstNumber || '', b.taxAmount || '', b.billType || '', b.status || '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

      const csv = [headers.join(','), ...rows].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=bills_export_${Date.now()}.csv`);
      return res.send(csv);
    }

    res.json({ success: true, data: bills, total: bills.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ════════════════════════════════════════════
// MIGRATE
// ════════════════════════════════════════════

const migrateBills = async (req, res) => {
  try {
    const bills = await Bill.find({ rawExtractedText: { $exists: true, $ne: '' } });
    let updatedCount = 0;
    const details = [];

    for (const bill of bills) {
      const extracted = extractSingleBill(bill.rawExtractedText);
      if (!extracted) continue;

      const updates = {};
      // Check ALL extractable fields
      const fieldsToCheck = [
        'supplierPlatform', 'qty', 'amount', 'invoiceNumber', 'orderNumber',
        'sku', 'awbNumber', 'deliveryPartner', 'payment', 'gstNumber',
        'taxAmount', 'vendorName', 'billType',
      ];
      for (const field of fieldsToCheck) {
        // Update if extracted has a value and it's different (or old is null)
        if (extracted[field] && extracted[field] !== bill[field]) {
          updates[field] = extracted[field];
        }
      }

      // Always refresh items array
      if (extracted.items && extracted.items.length > 0) {
        updates.items = extracted.items;
        updates.totalItems = extracted.totalItems;
        updates.totalQty = extracted.totalQty;
      }

      // Always refresh confidence
      if (extracted.extractionConfidence) {
        updates.extractionConfidence = extracted.extractionConfidence;
      }

      if (Object.keys(updates).length > 0) {
        await Bill.findByIdAndUpdate(bill._id, updates);
        details.push({ id: bill._id, invoice: bill.invoiceNumber, updates: Object.keys(updates) });
        updatedCount++;
      }
    }

    res.json({
      success: true,
      message: `Migrated ${updatedCount} of ${bills.length} bills.`,
      details,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ════════════════════════════════════════════
// STATS
// ════════════════════════════════════════════

const getStats = async (req, res) => {
  try {
    const [total, completed, failed, processing] = await Promise.all([
      Bill.countDocuments(),
      Bill.countDocuments({ status: 'completed' }),
      Bill.countDocuments({ status: 'failed' }),
      Bill.countDocuments({ status: 'processing' }),
    ]);

    const platformStats = await Bill.aggregate([
      { $match: { supplierPlatform: { $ne: null } } },
      { $group: { _id: '$supplierPlatform', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
      { $sort: { count: -1 } },
    ]);

    const recentBatches = await Bill.aggregate([
      { $group: { _id: '$uploadBatchId', count: { $sum: 1 }, firstFile: { $first: '$originalFileName' }, createdAt: { $first: '$createdAt' }, status: { $addToSet: '$status' } } },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: { total, completed, failed, processing, platformStats, recentBatches },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { uploadBill, uploadBills, getBills, getBillById, deleteBill, migrateBills, getBatchStatus, exportBills, getStats };
