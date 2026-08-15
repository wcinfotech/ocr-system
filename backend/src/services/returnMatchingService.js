/**
 * ============================================
 * Return Matching Service (v1)
 * ============================================
 * Automates matching return slips (Meesho RVP, Xpressbees DTO,
 * Delhivery RVP, Ekart RVP, etc.) with original sales bills.
 */

const Bill = require('../models/Bill');

/**
 * Clean & extract base order ID from return order numbers
 * E.g., "300819630367710720_1_RET_xyz" -> "300819630367710720"
 * E.g., "301229046157948352_1_RET_vcp" -> "301229046157948352"
 */
const extractBaseOrderId = (rawOrder) => {
  if (!rawOrder) return null;
  const str = String(rawOrder).trim();

  // Strip _1_RET..., _RET_vcp, _RET, _vcp suffixes
  const stripped = str.replace(/_\d+_RET[A-Za-z0-9_]*$/i, '')
                      .replace(/_RET[A-Za-z0-9_]*$/i, '')
                      .replace(/_vcp$/i, '');

  return stripped.length >= 5 ? stripped : str;
};

/**
 * Escapes regex special characters
 */
const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Find matching original sales bill for a return slip
 * @param {string|ObjectId} userId
 * @param {Object} returnBill
 * @returns {Promise<{matchedBill: Object|null, matchType: string|null, confidence: number}>}
 */
const findMatchingSalesBill = async (userId, returnBill) => {
  try {
    if (!returnBill) return { matchedBill: null, matchType: null, confidence: 0 };

    const cleanOrd = returnBill.orderNumber ? String(returnBill.orderNumber).trim() : null;
    const cleanAwb = returnBill.awbNumber ? String(returnBill.awbNumber).trim() : null;
    const cleanInv = returnBill.invoiceNumber ? String(returnBill.invoiceNumber).trim() : null;

    const baseOrder = extractBaseOrderId(cleanOrd);
    const rawText = returnBill.rawExtractedText || '';

    // Step 1: Exact or Base Order ID Match against sales bills (billType: 'regular')
    if (baseOrder && baseOrder.length >= 5) {
      const orderRegex = new RegExp(escapeRegex(baseOrder), 'i');
      const orderMatch = await Bill.findOne({
        userId,
        billType: 'regular',
        status: { $in: ['completed', 'processing'] },
        _id: { $ne: returnBill._id },
        orderNumber: orderRegex,
      });

      if (orderMatch) {
        return {
          matchedBill: orderMatch,
          matchType: 'ORDER_ID_MATCH',
          confidence: 100,
          details: `Matched Order ID: ${orderMatch.orderNumber}`,
        };
      }
    }

    // Step 2: AWB Tracking Number Match
    if (cleanAwb && cleanAwb.length >= 6) {
      const awbRegex = new RegExp(`^\\s*${escapeRegex(cleanAwb)}\\s*$`, 'i');
      const awbMatch = await Bill.findOne({
        userId,
        billType: 'regular',
        status: { $in: ['completed', 'processing'] },
        _id: { $ne: returnBill._id },
        awbNumber: awbRegex,
      });

      if (awbMatch) {
        return {
          matchedBill: awbMatch,
          matchType: 'AWB_MATCH',
          confidence: 95,
          details: `Matched Tracking AWB: ${awbMatch.awbNumber}`,
        };
      }
    }

    // Step 3: Invoice Number Match
    if (cleanInv && cleanInv.length >= 4) {
      const invRegex = new RegExp(`^\\s*${escapeRegex(cleanInv)}\\s*$`, 'i');
      const invMatch = await Bill.findOne({
        userId,
        billType: 'regular',
        status: { $in: ['completed', 'processing'] },
        _id: { $ne: returnBill._id },
        invoiceNumber: invRegex,
      });

      if (invMatch) {
        return {
          matchedBill: invMatch,
          matchType: 'INVOICE_MATCH',
          confidence: 90,
          details: `Matched Invoice Number: ${invMatch.invoiceNumber}`,
        };
      }
    }

    // Step 4: Scan raw text for any embedded Order numbers / AWBs in the system
    const systemBills = await Bill.find({
      userId,
      billType: 'regular',
      status: 'completed',
    }).select('_id orderNumber awbNumber invoiceNumber vendorName customerName amount');

    for (const sysBill of systemBills) {
      if (sysBill.orderNumber && sysBill.orderNumber.length >= 6) {
        const sysBase = extractBaseOrderId(sysBill.orderNumber);
        if (rawText.includes(sysBase) || (cleanOrd && cleanOrd.includes(sysBase))) {
          return {
            matchedBill: sysBill,
            matchType: 'EMBEDDED_ORDER_MATCH',
            confidence: 85,
            details: `Found embedded Order ID [${sysBill.orderNumber}] in return text`,
          };
        }
      }
      if (sysBill.awbNumber && sysBill.awbNumber.length >= 6) {
        if (rawText.includes(sysBill.awbNumber)) {
          return {
            matchedBill: sysBill,
            matchType: 'EMBEDDED_AWB_MATCH',
            confidence: 85,
            details: `Found embedded AWB [${sysBill.awbNumber}] in return text`,
          };
        }
      }
    }

    return { matchedBill: null, matchType: null, confidence: 0 };
  } catch (error) {
    console.error('Error in findMatchingSalesBill:', error);
    return { matchedBill: null, matchType: null, confidence: 0 };
  }
};

/**
 * Link a return slip with an original sales bill bidirectionally
 */
const linkReturnToBill = async (returnBillId, originalBillId, userId, matchType = 'MANUAL_MATCH', confidence = 100) => {
  try {
    const returnBill = await Bill.findOne({ _id: returnBillId, userId });
    const salesBill = await Bill.findOne({ _id: originalBillId, userId });

    if (!returnBill || !salesBill) {
      throw new Error('Return bill or sales bill not found');
    }

    // Update Return Bill document
    returnBill.billType = 'return';
    returnBill.returnStatus = returnBill.returnStatus || 'Received';
    returnBill.ocrMetadata = {
      ...(returnBill.ocrMetadata || {}),
      matchedOriginalBillId: salesBill._id,
      isMatched: true,
      matchType,
      matchConfidence: confidence,
      matchedAt: new Date(),
    };
    await returnBill.save();

    // Update Original Sales Bill document
    salesBill.returnStatus = 'Returned';
    salesBill.returnDate = returnBill.returnDate || returnBill.billDate || new Date().toISOString();
    salesBill.parsedReturnDate = returnBill.parsedReturnDate || new Date();
    salesBill.ocrMetadata = {
      ...(salesBill.ocrMetadata || {}),
      matchedReturnBillId: returnBill._id,
      returnAwbNumber: returnBill.awbNumber,
      returnCourier: returnBill.deliveryPartner || returnBill.courierPartner,
      returnedAt: new Date(),
    };
    await salesBill.save();

    console.log(`🔗 Successfully linked Return Bill [${returnBill._id}] with Sales Bill [${salesBill._id}] (${matchType})`);
    return { returnBill, salesBill };
  } catch (error) {
    console.error('Error in linkReturnToBill:', error);
    throw error;
  }
};

/**
 * Unlink a return slip from its sales bill
 */
const unlinkReturnFromBill = async (returnBillId, userId) => {
  try {
    const returnBill = await Bill.findOne({ _id: returnBillId, userId });
    if (!returnBill) throw new Error('Return bill not found');

    const matchedId = returnBill.ocrMetadata?.matchedOriginalBillId;
    if (matchedId) {
      const salesBill = await Bill.findOne({ _id: matchedId, userId });
      if (salesBill) {
        salesBill.returnStatus = 'None';
        if (salesBill.ocrMetadata) {
          delete salesBill.ocrMetadata.matchedReturnBillId;
          delete salesBill.ocrMetadata.returnAwbNumber;
          delete salesBill.ocrMetadata.returnCourier;
        }
        await salesBill.save();
      }
    }

    if (returnBill.ocrMetadata) {
      delete returnBill.ocrMetadata.matchedOriginalBillId;
      returnBill.ocrMetadata.isMatched = false;
      returnBill.ocrMetadata.matchType = null;
    }
    await returnBill.save();

    return true;
  } catch (error) {
    console.error('Error in unlinkReturnFromBill:', error);
    throw error;
  }
};

/**
 * Auto-match any unlinked return bills for a user (called when new sales bills are uploaded)
 */
const autoMatchUnmatchedReturns = async (userId) => {
  try {
    const returnBills = await Bill.find({
      userId,
      billType: 'return',
      status: 'completed',
    });

    let matchedCount = 0;
    for (const rBill of returnBills) {
      const isAlreadyMatched = rBill.ocrMetadata?.isMatched && rBill.ocrMetadata?.matchedOriginalBillId;
      if (isAlreadyMatched) continue;

      const { matchedBill, matchType, confidence } = await findMatchingSalesBill(userId, rBill);
      if (matchedBill) {
        await linkReturnToBill(rBill._id, matchedBill._id, userId, matchType, confidence);
        matchedCount++;
      }
    }

    if (matchedCount > 0) {
      console.log(`✨ Auto-reconciled ${matchedCount} return slip(s) for user ${userId}`);
    }
    return matchedCount;
  } catch (error) {
    console.error('Error in autoMatchUnmatchedReturns:', error);
    return 0;
  }
};

/**
 * Auto-sync DB documents for a user to ensure return bills have billType = 'return'
 */
const syncReturnBillTypes = async (userId) => {
  try {
    // Step 1: Re-classify existing bills back to 'regular' if they were falsely marked as 'return'
    // (e.g. Meesho regular sales bills containing 'fashnear' or 'retail' in filename)
    const fixedRes = await Bill.updateMany(
      {
        userId,
        billType: 'return',
        orderNumber: { $not: /(_RET|DLVPCA|FMPR|R22)/i },
        awbNumber: { $not: /(DLVPCA|FMPR|R22)/i },
        originalFileName: { $not: /(return_label|return_slip|return_bill|_ret_|_ret\b|\brvp\b|\brto\b|\bdto\b)/i },
        rawExtractedText: { $not: /(reverse pickup|returning to|pickup receipt|urgent pickup|\brvp\b|\bdto\b|\brto\b|\brts\b|_ret_|credit note|return invoice|return slip|return label)/i },
      },
      {
        $set: {
          billType: 'regular',
          returnStatus: 'None',
          returnDate: null,
          parsedReturnDate: null,
        },
        $unset: {
          'ocrMetadata.matchedOriginalBillId': '',
          'ocrMetadata.isMatched': '',
          'ocrMetadata.matchType': '',
          'ocrMetadata.matchConfidence': '',
          'ocrMetadata.matchedAt': '',
        },
      }
    );

    if (fixedRes.modifiedCount > 0) {
      console.log(`✅ Corrected ${fixedRes.modifiedCount} regular sales bill(s) falsely marked as return for user ${userId}`);
    }

    // Step 2: Set billType = 'return' ONLY for true return slips
    const res = await Bill.updateMany(
      {
        userId,
        billType: { $ne: 'return' },
        $or: [
          { orderNumber: { $regex: /(_RET|DLVPCA|FMPR|R22)/i } },
          { awbNumber: { $regex: /(DLVPCA|FMPR|R22)/i } },
          { originalFileName: { $regex: /(return_label|return_slip|return_bill|_ret_|_ret\b|\brvp\b|\brto\b|\bdto\b)/i } },
          { rawExtractedText: { $regex: /(reverse pickup|returning to|pickup receipt|urgent pickup|\brvp\b|\bdto\b|\brto\b|\brts\b|_ret_|credit note|return invoice|return slip|return label)/i } },
        ],
      },
      { $set: { billType: 'return' } }
    );

    if (res.modifiedCount > 0) {
      console.log(`🔄 Re-classified ${res.modifiedCount} return slip(s) in DB for user ${userId}`);
    }

    await autoMatchUnmatchedReturns(userId);
  } catch (err) {
    console.error('Error in syncReturnBillTypes:', err);
  }
};

module.exports = {
  extractBaseOrderId,
  findMatchingSalesBill,
  linkReturnToBill,
  unlinkReturnFromBill,
  autoMatchUnmatchedReturns,
  syncReturnBillTypes,
};
