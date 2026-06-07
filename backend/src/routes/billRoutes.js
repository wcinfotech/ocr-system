/**
 * ============================================
 * Bill Routes (v3)
 * ============================================
 * Single + batch upload, export, stats, batch status
 */

const express = require('express');
const router = express.Router();
const {
  uploadBill, uploadBills, getBills, getBillById,
  deleteBill, migrateBills, getBatchStatus, exportBills, getStats,
  updateBill, reprocessBill, triggerCleanup,
} = require('../controllers/billController');
const uploadMiddleware = require('../middleware/upload');
const { multiUpload } = require('../middleware/upload');

// POST /api/upload-bill - Single file upload (backward compatible)
router.post('/upload-bill', uploadMiddleware, uploadBill);

// POST /api/upload-bills - Multi-file batch upload (v3)
router.post('/upload-bills', multiUpload, uploadBills);

// GET /api/bills - Get all bills (with search/filter/pagination)
router.get('/bills', getBills);

// GET /api/bill/:id - Get single bill details
router.get('/bill/:id', getBillById);

// PUT /api/bill/:id - Update manual corrections (v4)
router.put('/bill/:id', updateBill);

// POST /api/bill/:id/reprocess - Reprocess bill (v4)
router.post('/bill/:id/reprocess', reprocessBill);

// GET /api/batch/:batchId - Get batch processing status
router.get('/batch/:batchId', getBatchStatus);

// GET /api/export - Export bills as CSV
router.get('/export', exportBills);

// GET /api/stats - Dashboard stats
router.get('/stats', getStats);

// GET /api/migrate - Migrate existing bill fields
router.get('/migrate', migrateBills);

// DELETE /api/bill/:id - Delete a bill
router.delete('/bill/:id', deleteBill);

// POST /api/cleanup - Manual file cleanup trigger
router.post('/cleanup', triggerCleanup);

module.exports = router;
