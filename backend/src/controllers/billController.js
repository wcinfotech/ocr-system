/**
 * ============================================
 * Bill Controller (v2)
 * ============================================
 * Handles upload, multi-bill extraction, CRUD
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Bill = require('../models/Bill');
const { extractTextFromPDF } = require('../services/pdfService');
const { extractTextFromImage } = require('../services/ocrService');
const { extractBillData, extractSingleBill } = require('../services/extractionService');
const { parseDate } = require('../helpers/validators');

/**
 * POST /api/upload-bill
 * Upload and process a bill — supports multi-bill PDFs
 */
const uploadBill = async (req, res) => {
  try {
    const file = req.file;
    const filePath = file.path;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const batchId = crypto.randomUUID();

    // Create initial placeholder bill
    const placeholder = new Bill({
      uploadBatchId: batchId,
      originalFile: filePath,
      originalFileName: file.originalname,
      fileType: ext,
      status: 'processing',
    });
    await placeholder.save();

    // Start background processing
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

/**
 * Background processing — extracts text, splits multi-bill PDFs, saves each bill
 */
const processBill = async (placeholderId, batchId, filePath, fileType, fileName) => {
  try {
    let rawText = '';

    // Step 1: Extract text
    if (fileType === 'pdf') {
      const pdfResult = await extractTextFromPDF(filePath);
      rawText = pdfResult.text;
      console.log(`📄 PDF text extracted: ${rawText.length} chars, ${pdfResult.pages} pages`);
    } else {
      const ocrResult = await extractTextFromImage(filePath);
      rawText = ocrResult.text;
    }

    // Step 2: Extract data (handles multi-bill splitting internally)
    const { bills, totalBills } = extractBillData(rawText);
    console.log(`📊 Found ${totalBills} bill(s) in file`);

    // Step 3: Save extracted bills
    if (totalBills === 1) {
      // Single bill — update the placeholder
      const bill = bills[0];
      await Bill.findByIdAndUpdate(placeholderId, {
        ...buildBillUpdate(bill, totalBills),
        rawExtractedText: rawText,
        status: 'completed',
      });
    } else {
      // Multiple bills — update placeholder as first bill, create rest
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
        };

        if (i === 0) {
          // Update the placeholder record
          await Bill.findByIdAndUpdate(placeholderId, update);
        } else {
          // Create new record for additional bills
          const newBill = new Bill(update);
          await newBill.save();
        }
      }
    }

    console.log(`✅ Batch ${batchId}: ${totalBills} bill(s) processed`);
  } catch (error) {
    console.error(`❌ Processing failed: ${error.message}`);
    await Bill.findByIdAndUpdate(placeholderId, {
      status: 'failed',
      errorMessage: error.message,
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

/**
 * GET /api/bills
 */
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
      Bill.find(query).sort(sort).skip(skip).limit(parseInt(limit))
        .select('-rawExtractedText'),
      Bill.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: bills,
      pagination: {
        total, page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/bill/:id
 */
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

/**
 * DELETE /api/bill/:id
 */
const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, error: 'Bill not found' });

    // Check if other bills share the same file
    const siblings = await Bill.countDocuments({
      uploadBatchId: bill.uploadBatchId,
      _id: { $ne: bill._id },
    });

    // Only delete file if no siblings use it
    if (siblings === 0 && bill.originalFile && fs.existsSync(bill.originalFile)) {
      fs.unlinkSync(bill.originalFile);
    }

    await Bill.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Bill deleted' });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ success: false, error: 'Invalid bill ID' });
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/migrate
 * Re-runs current extraction patterns on all saved raw text fields
 */
const migrateBills = async (req, res) => {
  try {
    const bills = await Bill.find({ rawExtractedText: { $exists: true, $ne: '' } });
    let updatedCount = 0;
    const details = [];

    for (const bill of bills) {
      const extracted = extractSingleBill(bill.rawExtractedText);
      if (!extracted) continue;

      const updates = {};
      if (extracted.supplierPlatform !== bill.supplierPlatform) {
        updates.supplierPlatform = extracted.supplierPlatform;
      }
      if (extracted.qty !== bill.qty) {
        updates.qty = extracted.qty;
      }
      if (extracted.amount !== bill.amount) {
        updates.amount = extracted.amount;
      }
      if (extracted.invoiceNumber !== bill.invoiceNumber) {
        updates.invoiceNumber = extracted.invoiceNumber;
      }
      if (extracted.orderNumber !== bill.orderNumber) {
        updates.orderNumber = extracted.orderNumber;
      }

      if (Object.keys(updates).length > 0) {
        await Bill.findByIdAndUpdate(bill._id, updates);
        details.push({ id: bill._id, invoice: bill.invoiceNumber, updates });
        updatedCount++;
      }
    }

    res.json({
      success: true,
      message: `Successfully migrated ${updatedCount} out of ${bills.length} bills.`,
      details,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { uploadBill, getBills, getBillById, deleteBill, migrateBills };
