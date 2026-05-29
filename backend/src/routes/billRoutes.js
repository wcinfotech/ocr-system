/**
 * ============================================
 * Bill Routes
 * ============================================
 */

const express = require('express');
const router = express.Router();
const {
  uploadBill,
  getBills,
  getBillById,
  deleteBill,
  migrateBills,
} = require('../controllers/billController');
const uploadMiddleware = require('../middleware/upload');

// POST /api/upload-bill - Upload and process a bill
router.post('/upload-bill', uploadMiddleware, uploadBill);

// GET /api/bills - Get all bills (with search/filter/pagination)
router.get('/bills', getBills);

// GET /api/bill/:id - Get single bill details
router.get('/bill/:id', getBillById);

// GET /api/migrate - Migrate existing bill fields
router.get('/migrate', migrateBills);

// DELETE /api/bill/:id - Delete a bill
router.delete('/bill/:id', deleteBill);

module.exports = router;
