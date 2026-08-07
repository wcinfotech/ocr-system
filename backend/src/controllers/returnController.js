/**
 * ============================================
 * Return Controller (v1)
 * ============================================
 * REST APIs for Return Slips, QR/Barcode Scanner,
 * Automatic Matching, Side-by-Side Comparison & Stats.
 */

const Bill = require('../models/Bill');
const {
  findMatchingSalesBill,
  linkReturnToBill,
  unlinkReturnFromBill,
  extractBaseOrderId,
  syncReturnBillTypes,
} = require('../services/returnMatchingService');
const { logEvent } = require('../services/firebaseService');

/**
 * GET /api/returns
 * Get all return bills with pagination, search, and populated sales bill reference
 */
const getReturns = async (req, res) => {
  try {
    const userId = req.user._id;

    // Run auto-sync for any unclassified return bills in DB
    await syncReturnBillTypes(userId);

    const {
      page = 1,
      limit = 25,
      search = '',
      status = 'all', // 'all', 'matched', 'unmatched'
      platform = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = { userId, billType: 'return', status: { $ne: 'duplicate' } };

    if (status === 'matched') {
      query['ocrMetadata.isMatched'] = true;
    } else if (status === 'unmatched') {
      query['$or'] = [
        { 'ocrMetadata.isMatched': { $ne: true } },
        { 'ocrMetadata.isMatched': { $exists: false } },
      ];
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { invoiceNumber: searchRegex },
        { orderNumber: searchRegex },
        { awbNumber: searchRegex },
        { vendorName: searchRegex },
        { deliveryPartner: searchRegex },
        { customerName: searchRegex },
      ];
    }

    if (platform) {
      query.platform = platform;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [returnBills, total] = await Promise.all([
      Bill.find(query).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
      Bill.countDocuments(query),
    ]);

    // Populate matched sales bills for each return bill
    const populatedReturns = await Promise.all(
      returnBills.map(async (rBill) => {
        let matchedSalesBill = null;
        const matchedId = rBill.ocrMetadata?.matchedOriginalBillId;
        if (matchedId) {
          matchedSalesBill = await Bill.findById(matchedId)
            .select('invoiceNumber orderNumber billDate amount vendorName platform sku qty awbNumber items returnStatus')
            .lean();
        }
        return {
          ...rBill,
          matchedSalesBill,
        };
      })
    );

    res.json({
      success: true,
      data: populatedReturns,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error in getReturns:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/returns/scan
 * Real-time Scanner endpoint: Accepts scanned barcode or QR code text
 * Extracts Order ID / AWB and matches against user's sales bills!
 */
const scanReturn = async (req, res) => {
  try {
    const userId = req.user._id;
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, error: 'Scanned code is required' });
    }

    const cleanedCode = code.trim();
    console.log(`🔍 Live Scan Request for Code: "${cleanedCode}"`);

    const tempReturnBill = {
      orderNumber: cleanedCode,
      awbNumber: cleanedCode,
      invoiceNumber: cleanedCode,
      rawExtractedText: cleanedCode,
    };

    const { matchedBill, matchType, confidence, details } = await findMatchingSalesBill(userId, tempReturnBill);

    logEvent('return_live_scan', {
      userId: userId.toString(),
      scannedCode: cleanedCode,
      foundMatch: !!matchedBill,
      matchType,
    }).catch((err) => console.error('Scan logEvent error:', err));

    if (matchedBill) {
      return res.json({
        success: true,
        matched: true,
        matchType,
        confidence,
        details,
        scannedCode: cleanedCode,
        salesBill: matchedBill,
      });
    } else {
      return res.json({
        success: true,
        matched: false,
        scannedCode: cleanedCode,
        message: `No matching sales bill found for code "${cleanedCode}". Base Order ID: "${extractBaseOrderId(cleanedCode)}".`,
      });
    }
  } catch (error) {
    console.error('Error in scanReturn:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/returns/match-manually
 * Manually link an unmatched return bill to any sales bill
 */
const matchReturnManually = async (req, res) => {
  try {
    const userId = req.user._id;
    const { returnBillId, originalBillId } = req.body;

    if (!returnBillId || !originalBillId) {
      return res.status(400).json({ success: false, error: 'returnBillId and originalBillId are required' });
    }

    const result = await linkReturnToBill(returnBillId, originalBillId, userId, 'MANUAL_USER_MATCH', 100);

    logEvent('return_manual_match', {
      userId: userId.toString(),
      returnBillId,
      originalBillId,
    }).catch((err) => console.error('Manual match logEvent error:', err));

    res.json({
      success: true,
      message: 'Return bill matched successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error in matchReturnManually:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/returns/unmatch
 * Unlink a return slip from its paired sales bill
 */
const unmatchReturn = async (req, res) => {
  try {
    const userId = req.user._id;
    const { returnBillId } = req.body;

    if (!returnBillId) {
      return res.status(400).json({ success: false, error: 'returnBillId is required' });
    }

    await unlinkReturnFromBill(returnBillId, userId);

    logEvent('return_unmatched', {
      userId: userId.toString(),
      returnBillId,
    }).catch((err) => console.error('Unmatch logEvent error:', err));

    res.json({ success: true, message: 'Return bill unlinked successfully' });
  } catch (error) {
    console.error('Error in unmatchReturn:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/returns/stats
 * Get analytics statistics for Return Bills
 */
const getReturnStats = async (req, res) => {
  try {
    const userId = req.user._id;
    await syncReturnBillTypes(userId);

    const [totalSalesBills, totalReturns, matchedReturns, unmatchedReturns, claimStats] = await Promise.all([
      Bill.countDocuments({ userId, billType: 'regular', status: { $ne: 'duplicate' } }),
      Bill.countDocuments({ userId, billType: 'return', status: { $ne: 'duplicate' } }),
      Bill.countDocuments({ userId, billType: 'return', 'ocrMetadata.isMatched': true, status: { $ne: 'duplicate' } }),
      Bill.countDocuments({
        userId,
        billType: 'return',
        status: { $ne: 'duplicate' },
        $or: [{ 'ocrMetadata.isMatched': { $ne: true } }, { 'ocrMetadata.isMatched': { $exists: false } }],
      }),
      Bill.aggregate([
        { $match: { userId, billType: 'return', status: 'completed' } },
        { $group: { _id: null, totalClaimValue: { $sum: { $ifNull: ['$claimAmount', { $ifNull: ['$amount', 0] }] } } } },
      ]),
    ]);

    const totalClaimValue = claimStats.length > 0 ? claimStats[0].totalClaimValue : 0;
    const matchRatePercent = totalReturns > 0 ? Math.round((matchedReturns / totalReturns) * 100) : 100;
    const returnRatePercent = totalSalesBills > 0 ? Math.round((totalReturns / (totalSalesBills + totalReturns)) * 100) : 0;

    // Courier breakdown for return bills
    const courierStats = await Bill.aggregate([
      { $match: { userId, billType: 'return', status: { $ne: 'duplicate' } } },
      { $group: { _id: '$deliveryPartner', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalSalesBills,
        totalReturns,
        matchedReturns,
        unmatchedReturns,
        totalClaimValue,
        matchRatePercent,
        returnRatePercent,
        courierStats,
      },
    });
  } catch (error) {
    console.error('Error in getReturnStats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/returns/compare/:returnId
 * Get detailed side-by-side comparison data between Return Slip and Sales Bill
 */
const getReturnComparison = async (req, res) => {
  try {
    const userId = req.user._id;
    const { returnId } = req.params;

    const returnBill = await Bill.findOne({ _id: returnId, userId, billType: 'return' }).lean();
    if (!returnBill) {
      return res.status(404).json({ success: false, error: 'Return bill not found' });
    }

    let salesBill = null;
    const matchedId = returnBill.ocrMetadata?.matchedOriginalBillId;
    if (matchedId) {
      salesBill = await Bill.findOne({ _id: matchedId, userId }).lean();
    } else {
      // Attempt auto-match lookup
      const { matchedBill, matchType, confidence } = await findMatchingSalesBill(userId, returnBill);
      if (matchedBill) {
        await linkReturnToBill(returnBill._id, matchedBill._id, userId, matchType, confidence);
        salesBill = matchedBill;
      }
    }

    res.json({
      success: true,
      data: {
        returnBill,
        salesBill,
        isMatched: !!salesBill,
        matchReason: returnBill.ocrMetadata?.matchType || null,
        matchConfidence: returnBill.ocrMetadata?.matchConfidence || 0,
      },
    });
  } catch (error) {
    console.error('Error in getReturnComparison:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getReturns,
  scanReturn,
  matchReturnManually,
  unmatchReturn,
  getReturnStats,
  getReturnComparison,
};
