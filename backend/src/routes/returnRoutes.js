/**
 * ============================================
 * Return Routes (v1)
 * ============================================
 * Endpoints for Return Slips, QR/Barcode Scanner,
 * Automatic Matching, Side-by-Side Comparison & Stats.
 */

const express = require('express');
const router = express.Router();
const {
  getReturns,
  scanReturn,
  matchReturnManually,
  unmatchReturn,
  getReturnStats,
  getReturnComparison,
} = require('../controllers/returnController');
const { protect } = require('../middleware/auth');

// Protect all return routes with JWT auth
router.use(protect);

// GET /api/returns - Get paginated list of return bills
router.get('/returns', getReturns);

// GET /api/returns/stats - Return analytics metrics
router.get('/returns/stats', getReturnStats);

// POST /api/returns/scan - Real-time QR/Barcode scanner matching endpoint
router.post('/returns/scan', scanReturn);

// POST /api/returns/match-manually - Link unmatched return to sales bill
router.post('/returns/match-manually', matchReturnManually);

// POST /api/returns/unmatch - Unlink return from sales bill
router.post('/returns/unmatch', unmatchReturn);

// GET /api/returns/compare/:returnId - Side-by-side comparison payload
router.get('/returns/compare/:returnId', getReturnComparison);

module.exports = router;
