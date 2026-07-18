/**
 * ============================================
 * Bill Controller (v4) — Production
 * ============================================
 * ZIP extraction, database de-duplication,
 * manual corrections, and reprocessing support.
 */

const path = require('path');
const { logEvent } = require('../services/firebaseService');
const fs = require('fs');
const crypto = require('crypto');
const Bill = require('../models/Bill');
const { extractTextFromPDF } = require('../services/pdfService');
const { extractTextFromImage } = require('../services/ocrService');
const { extractBillData, extractSingleBill, secondaryExtractionPass } = require('../services/extractionService');
const { normalizeImageOcrText, assessExtractionQuality } = require('../services/imageOcrNormalizer');
const { parseDate, parseAmount, parseInteger } = require('../helpers/validators');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');
const { cleanupOldFiles, cleanupOrphanedFiles } = require('../services/cleanupService');
const AdmZip = require('adm-zip');

const useCloudinary = process.env.USE_CLOUDINARY === 'true';

// Helper to clean up empty zip temp directories
const deleteEmptyZipParent = (filePath) => {
  try {
    const parentDir = path.dirname(filePath);
    const parentName = path.basename(parentDir);
    if (parentName.startsWith('zip_') && fs.existsSync(parentDir)) {
      const files = fs.readdirSync(parentDir);
      if (files.length === 0) {
        fs.rmdirSync(parentDir);
        console.log(`🗑️  Cleaned empty temporary zip directory: ${parentName}`);
      }
    }
  } catch (err) {
    // ignore
  }
};

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
      userId: req.user._id,
      uploadBatchId: batchId,
      originalFile: filePath,
      originalFileName: file.originalname,
      fileType: ext,
      status: 'processing',
    });
    await placeholder.save();

    if (ext === 'zip') {
      handleZipFile(placeholder._id, batchId, filePath, file.originalname, req.user._id).catch((err) => {
        console.error(`Zip background processing error: ${err.message}`);
      });
    } else {
      processBill(placeholder._id, batchId, filePath, ext, file.originalname, req.user._id).catch((err) => {
        console.error(`Background processing error: ${err.message}`);
      });
    }

    logEvent('document_upload_single', {
      userId: req.user._id.toString(),
      billId: placeholder._id.toString(),
      batchId,
      fileName: file.originalname,
      fileType: ext,
      fileSize: file.size,
    }).catch(err => console.error('Upload logEvent error:', err));

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
// BATCH MULTI-FILE UPLOAD (v3/v4)
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
        userId: req.user._id,
        uploadBatchId: batchId,
        originalFile: file.path,
        originalFileName: file.originalname,
        fileType: ext,
        status: 'processing',
      });
      await placeholder.save();

      if (ext === 'zip') {
        handleZipFile(placeholder._id, batchId, file.path, file.originalname, req.user._id).catch((err) => {
          console.error(`Batch Zip processing error: ${err.message}`);
        });
      } else {
        processBill(placeholder._id, batchId, file.path, ext, file.originalname, req.user._id).catch((err) => {
          console.error(`Batch processing error [${file.originalname}]: ${err.message}`);
        });
      }

      results.push({
        billId: placeholder._id,
        fileName: file.originalname,
        status: 'processing',
      });
    }

    logEvent('document_upload_batch', {
      userId: req.user._id.toString(),
      batchId,
      totalFiles: files.length,
      fileTypes: files.map(f => path.extname(f.originalname).toLowerCase().replace('.', '')),
    }).catch(err => console.error('Batch upload logEvent error:', err));

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
// ZIP EXTRACTOR AND PROCESSOR (Phase 12)
// ════════════════════════════════════════════

const handleZipFile = async (placeholderId, batchId, filePath, fileName, userId) => {
  try {
    console.log(`📦 Unzipping archive: ${fileName}`);
    const zip = new AdmZip(filePath);
    const tempDir = path.join(path.dirname(filePath), `zip_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`);
    fs.mkdirSync(tempDir, { recursive: true });
    
    zip.extractAllTo(tempDir, true);
    
    const extractedFiles = [];
    const scanDir = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else {
          const ext = path.extname(entry.name).toLowerCase();
          if (['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.tiff', '.tif', '.bmp', '.heic'].includes(ext)) {
            extractedFiles.push({
              path: fullPath,
              name: entry.name,
              ext: ext.replace('.', ''),
            });
          }
        }
      }
    };
    
    scanDir(tempDir);
    console.log(`📦 Found ${extractedFiles.length} valid files in zip archive.`);
    
    if (extractedFiles.length === 0) {
      throw new Error('No valid document or image files found in the ZIP archive.');
    }
    
    // Complete the zip placeholder itself
    await Bill.findByIdAndUpdate(placeholderId, {
      status: 'completed',
      originalFileName: fileName,
      fileType: 'zip',
      rawExtractedText: `Processed ZIP archive. Extracted ${extractedFiles.length} file(s).`,
      processingTimeMs: 0,
      totalBillsInFile: extractedFiles.length,
    });

    logEvent('zip_extraction_success', {
      userId: userId.toString(),
      billId: placeholderId.toString(),
      batchId,
      fileName,
      extractedCount: extractedFiles.length,
    }).catch(err => console.error('Zip extraction logEvent error:', err));
    
    // Process each extracted file under the same batchId
    for (const file of extractedFiles) {
      const childPlaceholder = new Bill({
        userId,
        uploadBatchId: batchId,
        originalFile: file.path,
        originalFileName: file.name,
        fileType: file.ext,
        status: 'processing',
      });
      await childPlaceholder.save();
      
      processBill(childPlaceholder._id, batchId, file.path, file.ext, file.name, userId).catch((err) => {
        console.error(`Error processing zip child [${file.name}]: ${err.message}`);
      });
    }

    // Clean up zip local archive
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch { /* ignore */ }
    }
  } catch (error) {
    console.error(`❌ Zip extraction failed: ${error.message}`);
    await Bill.findByIdAndUpdate(placeholderId, {
      status: 'failed',
      errorMessage: error.message,
    });
  }
};

// ════════════════════════════════════════════
// BACKGROUND PROCESSOR
// ════════════════════════════════════════════

const processBill = async (placeholderId, batchId, filePath, fileType, fileName, userId, retryCount = 0) => {
  const startTime = Date.now();
  try {
    let rawText = '';
    let ocrUsed = false;
    let pagesProcessed = 0;
    let ocrMetadata = {}; // Image-specific OCR metadata for debugging

    if (fileType === 'pdf') {
      // ════════════════════════════════════════════
      // PDF PIPELINE (UNTOUCHED - DO NOT MODIFY)
      // ════════════════════════════════════════════
      const pdfResult = await extractTextFromPDF(filePath);
      rawText = pdfResult.text;
      ocrUsed = pdfResult.ocrUsed || false;
      pagesProcessed = pdfResult.pages || 0;
      console.log(`📄 PDF: ${rawText.length} chars, ${pagesProcessed} pages, OCR=${ocrUsed}`);
    } else {
      // ════════════════════════════════════════════
      // IMAGE PIPELINE (Enhanced v6)
      // ════════════════════════════════════════════
      console.log(`\n🖼️ ══════════════════════════════════════`);
      console.log(`🖼️  IMAGE EXTRACTION: ${fileName}`);
      console.log(`🖼️ ══════════════════════════════════════`);

      const ocrResult = await extractTextFromImage(filePath, true);
      rawText = ocrResult.text;
      ocrUsed = true;
      pagesProcessed = 1;

      // Collect OCR metadata for debugging
      ocrMetadata = {
        ocrConfidence: ocrResult.confidence || 0,
        passUsed: ocrResult.passUsed || 'Unknown',
        allPassResults: ocrResult.allPassResults || [],
        barcodeDetected: !!ocrResult.barcode,
        barcodeValue: ocrResult.barcode?.text || null,
        barcodeFormat: ocrResult.barcode?.format || null,
        rawTextLength: rawText.length,
      };

      console.log(`📋 OCR Result: ${rawText.length} chars, Confidence: ${ocrMetadata.ocrConfidence}%, Pass: ${ocrMetadata.passUsed}`);

      // ── Phase 7: Barcode Priority ──
      // Inject barcode data into raw text so extraction engine can use it
      if (ocrResult.barcode && ocrResult.barcode.text) {
        const barcodePrefix = `AWB_BARCODE: ${ocrResult.barcode.text}\nBARCODE_FORMAT: ${ocrResult.barcode.format}\n\n`;
        rawText = barcodePrefix + rawText;
        console.log(`🎯 Barcode injected into text: [${ocrResult.barcode.format}] ${ocrResult.barcode.text}`);
      }

      // ── Phase 3: OCR Text Normalization (Image-Only) ──
      const normalizedText = normalizeImageOcrText(rawText);
      const normDiff = normalizedText.length - rawText.length;
      if (normalizedText !== rawText) {
        console.log(`📝 OCR text normalized. Delta: ${normDiff >= 0 ? '+' : ''}${normDiff} chars`);
      }

      // ── Phase 10: Quality Assessment ──
      const quality = assessExtractionQuality(normalizedText);
      ocrMetadata.extractionQualityScore = quality.score;
      ocrMetadata.missingFieldIndicators = quality.missingFields;
      console.log(`📊 Extraction Quality Score: ${quality.score}%, Missing indicators: [${quality.missingFields.join(', ')}]`);

      // Use normalized text for extraction
      rawText = normalizedText;
    }

    const { bills, totalBills } = extractBillData(rawText, fileName);
    console.log(`📊 Found ${totalBills} bill(s) in ${fileName}`);

    // ── Phase 10: Secondary Extraction Pass (Image-Only) ──
    if (fileType !== 'pdf' && bills.length > 0) {
      for (let i = 0; i < bills.length; i++) {
        const bill = bills[i];
        const hasMissing = !bill.invoiceNumber || !bill.orderNumber || !bill.awbNumber || !bill.amount;
        if (hasMissing) {
          bills[i] = secondaryExtractionPass(bill, rawText, fileName);
        }

        // Inject image OCR metadata into each bill
        bills[i].ocrMetadata = ocrMetadata;
      }
      console.log(`🖼️ Image extraction complete. ${totalBills} bill(s) processed with normalization + secondary pass.`);
    }

    const processingTimeMs = Date.now() - startTime;

    // Cloudinary upload bypassed to comply with zero-retention storage policy
    let cloudinaryUrl = null;
    let cloudinaryPublicId = null;

    // ── Per-bill de-duplication + save (Phase 13 v2) ──
    // Each bill in the PDF is individually checked for duplicates.
    // Non-duplicate bills are saved as separate rows in the DB.
    const nonDupeBills = [];
    for (const bill of bills) {
      let isDuplicate = false;
      let matchId = null;

      if (bill.invoiceNumber) {
        const match = await Bill.findOne({
          invoiceNumber: bill.invoiceNumber,
          platform: bill.platform,
          status: 'completed',
          _id: { $ne: placeholderId }
        });
        if (match) { isDuplicate = true; matchId = match._id; }
      }
      if (!isDuplicate && bill.orderNumber) {
        const match = await Bill.findOne({
          orderNumber: bill.orderNumber,
          platform: bill.platform,
          status: 'completed',
          _id: { $ne: placeholderId }
        });
        if (match) { isDuplicate = true; matchId = match._id; }
      }
      if (!isDuplicate && bill.awbNumber) {
        const match = await Bill.findOne({
          awbNumber: bill.awbNumber,
          status: 'completed',
          _id: { $ne: placeholderId }
        });
        if (match) { isDuplicate = true; matchId = match._id; }
      }

      if (isDuplicate) {
        console.log(`⚠️ Duplicate bill [${bill.invoiceNumber || bill.orderNumber}] matches ${matchId} — skipping.`);
        bill._isDuplicate = true;
        bill._matchId = matchId;
      } else {
        nonDupeBills.push(bill);
      }
    }

    // Determine what to save
    const billsToSave = nonDupeBills.length > 0 ? nonDupeBills : bills;
    const effectiveTotal = billsToSave.length;

    if (effectiveTotal === 0) {
      // All bills are duplicates — mark the placeholder as completed with a note
      const bill = bills[0];
      await Bill.findByIdAndUpdate(placeholderId, {
        ...buildBillUpdate(bill, totalBills),
        rawExtractedText: rawText,
        status: 'completed',
        ocrUsed,
        pagesProcessed,
        processingTimeMs,
        retryCount,
        originalFile: "(Temporary - Deleted after extraction)",
        cloudinaryUrl,
        cloudinaryPublicId,
        errorMessage: `All ${totalBills} bill(s) are duplicates.`
      });

      logEvent('document_processed', {
        userId: userId.toString(),
        billId: placeholderId.toString(),
        batchId,
        fileName,
        fileType,
        status: 'completed',
        isDuplicate: true,
        processingTimeMs,
      }).catch(err => console.error('Duplicate doc logEvent error:', err));
    } else if (effectiveTotal === 1 && nonDupeBills.length === 1) {
      // Single non-duplicate bill
      const bill = nonDupeBills[0];
      await Bill.findByIdAndUpdate(placeholderId, {
        ...buildBillUpdate(bill, totalBills),
        rawExtractedText: bill.rawExtractedText || rawText,
        status: 'completed',
        ocrUsed,
        pagesProcessed,
        processingTimeMs,
        retryCount,
        originalFile: "(Temporary - Deleted after extraction)",
        cloudinaryUrl,
        cloudinaryPublicId,
      });

      logEvent('document_processed', {
        userId: userId.toString(),
        billId: placeholderId.toString(),
        batchId,
        fileName,
        fileType,
        status: 'completed',
        isDuplicate: false,
        invoiceNumber: bill.invoiceNumber,
        amount: bill.amount,
        platform: bill.platform,
        confidence: bill.confidence,
        processingTimeMs,
      }).catch(err => console.error('Single doc logEvent error:', err));
    } else {
      // Multiple bills — save each as a separate row
      for (let i = 0; i < billsToSave.length; i++) {
        const bill = billsToSave[i];
        const update = {
          userId,
          ...buildBillUpdate(bill, totalBills),
          uploadBatchId: batchId,
          originalFile: "(Temporary - Deleted after extraction)",
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

      logEvent('document_processed_multiple', {
        userId: userId.toString(),
        batchId,
        fileName,
        fileType,
        status: 'completed',
        totalExtracted: billsToSave.length,
        processingTimeMs,
      }).catch(err => console.error('Multiple docs logEvent error:', err));
    }

    // Always clean up local temp file after text extraction completes
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Local temp file cleaned: ${fileName}`);
        // Check and clean empty zip directories
        deleteEmptyZipParent(filePath);
      } catch (err) {
        console.error(`Failed to delete local temp file: ${err.message}`);
      }
    }

    console.log(`✅ Batch ${batchId}: ${totalBills} bill(s) processed in ${processingTimeMs}ms`);
  } catch (error) {
    console.error(`❌ Processing failed [${fileName}]: ${error.message}`);

    // Retry up to 2 times
    if (retryCount < 2) {
      console.log(`🔄 Retrying (${retryCount + 1}/2)...`);
      setTimeout(() => {
        processBill(placeholderId, batchId, filePath, fileType, fileName, userId, retryCount + 1);
      }, 3000 * (retryCount + 1));
      return;
    }

    // Final failure: clean up local file
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Local temp file cleaned on final failure: ${fileName}`);
        deleteEmptyZipParent(filePath);
      } catch (err) { /* ignore */ }
    }

    await Bill.findByIdAndUpdate(placeholderId, {
      status: 'failed',
      errorMessage: error.message,
      processingTimeMs: Date.now() - startTime,
      retryCount,
      originalFile: "(Temporary - Deleted after extraction)",
      cloudinaryUrl,
      cloudinaryPublicId,
    });

    logEvent('document_processing_failed', {
      userId: userId.toString(),
      billId: placeholderId.toString(),
      batchId,
      fileName,
      fileType,
      errorMessage: error.message,
      retryCount,
    }).catch(err => console.error('Failed doc logEvent error:', err));
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
    
    // Upgraded Fields (v4)
    platform: bill.platform,
    paymentMode: bill.paymentMode,
    deliveryType: bill.deliveryType,
    confidence: bill.confidence,

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

    // Image OCR diagnostic metadata (v6)
    ocrMetadata: bill.ocrMetadata || null,
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

    const query = { userId: req.user._id };
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
    if (platform) query.platform = platform;
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
    const bill = await Bill.findOne({ _id: req.params.id, userId: req.user._id });
    if (!bill) return res.status(404).json({ success: false, error: 'Bill not found' });
    res.json({ success: true, data: bill });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ success: false, error: 'Invalid bill ID' });
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, userId: req.user._id });
    if (!bill) return res.status(404).json({ success: false, error: 'Bill not found' });
    const siblings = await Bill.countDocuments({ uploadBatchId: bill.uploadBatchId, _id: { $ne: bill._id } });
    if (siblings === 0) {
      if (bill.cloudinaryPublicId) {
        await deleteFromCloudinary(bill.cloudinaryPublicId);
      }
      if (bill.originalFile && fs.existsSync(bill.originalFile)) {
        try { fs.unlinkSync(bill.originalFile); } catch { /* ignore */ }
      }
    }
    await Bill.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: 'Bill deleted' });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ success: false, error: 'Invalid bill ID' });
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── Manual Invoice Correction (Phase 14) ──
const updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Format Dates
    if (updateData.billDate) {
      updateData.parsedBillDate = parseDate(updateData.billDate);
    }
    if (updateData.returnDate) {
      updateData.parsedReturnDate = parseDate(updateData.returnDate);
    }

    // Format numbers
    if (updateData.amount !== undefined) updateData.amount = parseAmount(String(updateData.amount));
    if (updateData.qty !== undefined) updateData.qty = parseInteger(String(updateData.qty)) || 1;
    if (updateData.taxAmount !== undefined) updateData.taxAmount = parseAmount(String(updateData.taxAmount));

    // Platform mappings
    if (updateData.platform) {
      updateData.supplierPlatform = updateData.platform === 'generic_gst' ? 'other' : updateData.platform;
    }

    const bill = await Bill.findOneAndUpdate({ _id: id, userId: req.user._id }, updateData, { new: true });
    if (!bill) return res.status(404).json({ success: false, error: 'Bill not found' });

    logEvent('document_manual_correction', {
      userId: req.user._id.toString(),
      billId: bill._id.toString(),
      invoiceNumber: bill.invoiceNumber,
      platform: bill.platform,
      correctedFields: Object.keys(req.body),
    }).catch(err => console.error('Manual correction logEvent error:', err));

    res.json({ success: true, message: 'Bill updated successfully', data: bill });
  } catch (error) {
    console.error(`Update error: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── Invoice Reprocessing worker (Phase 14) ──
const reprocessBill = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await Bill.findOne({ _id: id, userId: req.user._id });
    if (!bill) return res.status(404).json({ success: false, error: 'Bill not found' });

    const filePath = bill.originalFile;
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ success: false, error: 'Original file not found on server for reprocessing.' });
    }

    // Reset status to processing
    bill.status = 'processing';
    bill.errorMessage = null;
    await bill.save();

    // Spawn reprocessing worker
    processBill(bill._id, bill.uploadBatchId, filePath, bill.fileType, bill.originalFileName, bill.userId)
      .catch((err) => {
        console.error(`Background reprocess error for [${bill._id}]: ${err.message}`);
      });

    logEvent('document_reprocess_triggered', {
      userId: req.user._id.toString(),
      billId: bill._id.toString(),
      fileName: bill.originalFileName,
      fileType: bill.fileType,
    }).catch(err => console.error('Reprocess logEvent error:', err));

    res.json({ success: true, message: 'Invoice reprocessing triggered', data: { id, status: 'processing' } });
  } catch (error) {
    console.error(`Reprocessing error: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ════════════════════════════════════════════
// BATCH STATUS
// ════════════════════════════════════════════

const getBatchStatus = async (req, res) => {
  try {
    const { batchId } = req.params;
    const bills = await Bill.find({ uploadBatchId: batchId, userId: req.user._id }).select('status originalFileName errorMessage processingTimeMs');
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
// EXPORT (CSV / JSON)
// ════════════════════════════════════════════

const exportBills = async (req, res) => {
  try {
    const { format = 'csv', ...filters } = req.query;
    const query = { userId: req.user._id };
    if (filters.platform) query.platform = filters.platform;
    if (filters.billType) query.billType = filters.billType;
    if (filters.startDate || filters.endDate) {
      query.parsedBillDate = {};
      if (filters.startDate) query.parsedBillDate.$gte = new Date(filters.startDate);
      if (filters.endDate) query.parsedBillDate.$lte = new Date(filters.endDate);
    }

    const bills = await Bill.find(query).sort({ createdAt: -1 }).limit(5000);

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=bills_export_${Date.now()}.json`);
      return res.send(JSON.stringify(bills, null, 2));
    }

    if (format === 'csv') {
      const headers = ['Invoice No', 'Order No', 'Date', 'Platform', 'Vendor', 'Amount', 'SKU', 'Qty', 'Items', 'AWB', 'Delivery Partner', 'Payment Mode', 'Delivery Type', 'GST', 'Tax', 'Type', 'Confidence'];
      const rows = bills.map(b => [
        b.invoiceNumber || '', b.orderNumber || '', b.billDate || '',
        b.platform || '', b.vendorName || '', b.amount || '',
        b.sku || '', b.qty || '', b.totalItems || '',
        b.awbNumber || '', b.deliveryPartner || '', b.paymentMode || b.payment || '',
        b.deliveryType || '', b.gstNumber || '', b.taxAmount || '', b.billType || '', b.confidence || '',
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
    const bills = await Bill.find({ userId: req.user._id, rawExtractedText: { $exists: true, $ne: '' } });
    let updatedCount = 0;
    const details = [];

    for (const bill of bills) {
      const extracted = extractSingleBill(bill.rawExtractedText, bill.originalFileName);
      if (!extracted) continue;

      const updates = {};
      const fieldsToCheck = [
        'platform', 'paymentMode', 'deliveryType', 'confidence',
        'supplierPlatform', 'qty', 'amount', 'invoiceNumber', 'orderNumber',
        'sku', 'awbNumber', 'deliveryPartner', 'payment', 'gstNumber',
        'taxAmount', 'vendorName', 'billType',
      ];
      for (const field of fieldsToCheck) {
        if (extracted[field] !== undefined && extracted[field] !== bill[field]) {
          updates[field] = extracted[field];
        }
      }

      if (extracted.items && extracted.items.length > 0) {
        updates.items = extracted.items;
        updates.totalItems = extracted.totalItems;
        updates.totalQty = extracted.totalQty;
      }

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
    const userId = req.user._id;

    // Date calculations
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, completed, failed, processing, todayCount, monthCount] = await Promise.all([
      Bill.countDocuments({ userId }),
      Bill.countDocuments({ userId, status: 'completed' }),
      Bill.countDocuments({ userId, status: 'failed' }),
      Bill.countDocuments({ userId, status: 'processing' }),
      Bill.countDocuments({ userId, createdAt: { $gte: todayStart } }),
      Bill.countDocuments({ userId, createdAt: { $gte: monthStart } }),
    ]);

    // Unique Vendors count
    const vendors = await Bill.distinct('vendorName', { userId, vendorName: { $exists: true, $ne: '', $ne: null } });
    const totalVendors = vendors.length;

    // Total Amount sum
    const amountStats = await Bill.aggregate([
      { $match: { userId, status: 'completed', amount: { $exists: true, $ne: null } } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]);
    const totalAmount = amountStats.length > 0 ? amountStats[0].totalAmount : 0;

    // Success Rate
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 100;

    const platformStats = await Bill.aggregate([
      { $match: { userId, platform: { $ne: null } } },
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          regularCount: { $sum: { $cond: [{ $eq: ['$billType', 'regular'] }, 1, 0] } },
          returnCount: { $sum: { $cond: [{ $eq: ['$billType', 'return'] }, 1, 0] } },
          regularAmount: { $sum: { $cond: [{ $eq: ['$billType', 'regular'] }, { $ifNull: ['$amount', 0] }, 0] } },
          returnAmount: {
            $sum: {
              $cond: [
                { $eq: ['$billType', 'return'] },
                { $ifNull: ['$claimAmount', { $ifNull: ['$amount', 0] }] },
                0
              ]
            }
          }
        }
      },
      { $sort: { count: -1 } },
    ]);

    const recentBatches = await Bill.aggregate([
      { $match: { userId } },
      { $group: { _id: '$uploadBatchId', count: { $sum: 1 }, firstFile: { $first: '$originalFileName' }, createdAt: { $first: '$createdAt' }, status: { $addToSet: '$status' } } },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        total,
        completed,
        failed,
        processing,
        todayCount,
        monthCount,
        totalVendors,
        totalAmount,
        successRate,
        platformStats,
        recentBatches,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ════════════════════════════════════════════
// MANUAL CLEANUP TRIGGER
// ════════════════════════════════════════════

const triggerCleanup = async (req, res) => {
  try {
    const fileResult = await cleanupOldFiles();
    const orphanResult = await cleanupOrphanedFiles();
    res.json({
      success: true,
      message: 'Cleanup completed',
      data: {
        filesCleanedUp: fileResult.cleaned,
        orphansCleanedUp: orphanResult.cleaned,
        errors: fileResult.errors,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  uploadBill,
  uploadBills,
  getBills,
  getBillById,
  deleteBill,
  updateBill,
  reprocessBill,
  migrateBills,
  getBatchStatus,
  exportBills,
  getStats,
  triggerCleanup,
};
