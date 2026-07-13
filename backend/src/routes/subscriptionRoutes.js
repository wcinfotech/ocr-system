/**
 * ============================================
 * Subscription Routes
 * ============================================
 * Handles subscription buy/upgrade endpoints and invoice history/PDF downloads
 */

const express = require('express');
const router = express.Router();
const { buySubscription, getMyInvoices, downloadInvoice, getActivePlans } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

router.get('/plans', getActivePlans);
router.post('/buy', protect, buySubscription);
router.get('/invoices', protect, getMyInvoices);
router.get('/invoices/:invoiceId/download', protect, downloadInvoice);

module.exports = router;
