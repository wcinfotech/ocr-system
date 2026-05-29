/**
 * ============================================
 * Extraction Service (v2) - Rule-Based Engine
 * ============================================
 * Extracts e-commerce bill fields using regex
 * Supports multi-bill PDFs, return bills
 * NO AI/LLM — pure regex + keyword matching
 */

const {
  INVOICE_NUMBER_PATTERNS, ORDER_NUMBER_PATTERNS, DATE_PATTERNS,
  AMOUNT_PATTERNS, AWB_PATTERNS, DELIVERY_PARTNERS, SUPPLIER_PLATFORMS,
  PAYMENT_PATTERNS, SKU_PATTERNS, QTY_PATTERNS, GST_NUMBER_PATTERNS,
  TAX_AMOUNT_PATTERNS, VENDOR_NAME_PATTERNS, RETURN_TYPE_PATTERNS,
  RETURN_STATUS_PATTERNS, CLAIM_PATTERNS, RETURN_DATE_PATTERNS,
} = require('../helpers/regexPatterns');

const {
  parseDate, parseAmount, validateGST,
  cleanVendorName, cleanIdField, parseInteger,
} = require('../helpers/validators');

// ════════════════════════════════════════════
// MULTI-BILL SPLITTER
// ════════════════════════════════════════════

/**
 * Split raw text into multiple bill segments
 * @param {string} rawText - Full extracted text from PDF
 * @returns {string[]} - Array of text segments, one per bill
 */
const splitIntoBills = (rawText) => {
  if (!rawText || rawText.trim().length < 20) return [rawText];

  // Strategy 1: Split by form-feed characters (PDF page breaks)
  // Since we insert \f during PDF extraction, this is highly reliable page-by-page splitting.
  let segments = rawText.split(/\f/).map(s => s.trim()).filter(s => s.length > 30);
  
  if (segments.length > 1) {
    const validSegments = segments.filter(seg => hasInvoiceMarker(seg));
    if (validSegments.length > 1) return validSegments;
    if (validSegments.length === 1) return validSegments;
  }

  // Strategy 2: Split by common bill headers
  const headerPattern = /(?=(?:^|\n)\s*(?:TAX\s*INVOICE|INVOICE\s*$|BILL\s*OF\s*SUPPLY|CREDIT\s*NOTE|DEBIT\s*NOTE|RETURN\s*(?:INVOICE|NOTE))\s*(?:\n|$))/gim;
  let rawSegments2 = rawText.split(headerPattern);
  if (rawSegments2.length > 0) {
    // If the text before the first bill header is short/doesn't have invoice markers,
    // merge it with the first actual bill segment to avoid losing first-page top metadata.
    if (rawSegments2[0].trim().length > 0 && !hasInvoiceMarker(rawSegments2[0])) {
      if (rawSegments2.length > 1) {
        rawSegments2[1] = rawSegments2[0] + "\n" + rawSegments2[1];
        rawSegments2.shift();
      }
    }
  }
  let segments2 = rawSegments2.map(s => s.trim()).filter(s => s.length > 30);
  if (segments2.length > 1) {
    const validSegments = segments2.filter(seg => hasInvoiceMarker(seg));
    if (validSegments.length > 1) return validSegments;
  }

  // Strategy 3: Split by repeating "Invoice No" / "Order No" patterns
  const invoiceRepeat = /(?=(?:invoice\s*(?:no|number|#)|bill\s*(?:no|number)|order\s*(?:no|number|id))\s*[:\-]?\s*[A-Z0-9])/gi;
  const matches = [...rawText.matchAll(invoiceRepeat)];
  
  if (matches.length > 1) {
    segments = [];
    for (let i = 0; i < matches.length; i++) {
      // Start the very first segment at 0 to capture introductory first page header metadata.
      const start = i === 0 ? 0 : matches[i].index;
      const end = i + 1 < matches.length ? matches[i + 1].index : rawText.length;
      const segment = rawText.substring(start, end).trim();
      if (segment.length > 20) segments.push(segment);
    }
    if (segments.length > 1) return segments;
  }

  // Strategy 4: Split by long separator lines (----, ====)
  const sepPattern = /\n\s*[-=]{15,}\s*\n/;
  segments = rawText.split(sepPattern).map(s => s.trim()).filter(s => s.length > 30);
  if (segments.length > 1) {
    const validSegments = segments.filter(seg => hasInvoiceMarker(seg));
    if (validSegments.length > 1) return validSegments;
  }

  // No split needed — single bill
  return [rawText];

};

/** Check if a text segment looks like it contains a bill */
const hasInvoiceMarker = (text) => {
  return /(?:invoice|bill|order|receipt|credit\s*note)/i.test(text) ||
         /(?:total|amount|qty|quantity)/i.test(text);
};

// ════════════════════════════════════════════
// SINGLE BILL EXTRACTOR
// ════════════════════════════════════════════

/**
 * Extract all fields from a single bill text segment
 */
const extractSingleBill = (text) => {
  if (!text || typeof text !== 'string' || text.trim().length < 10) {
    return getEmptyResult();
  }

  // Detect if this is a return bill
  const isReturn = detectReturnBill(text);

  const result = {
    billType: isReturn ? 'return' : 'regular',

    // Common fields
    invoiceNumber: extractField(text, INVOICE_NUMBER_PATTERNS, cleanIdField),
    orderNumber: extractField(text, ORDER_NUMBER_PATTERNS, cleanIdField),
    billDate: extractDateField(text, DATE_PATTERNS),
    amount: extractAmountField(text, AMOUNT_PATTERNS),
    vendorName: extractVendorName(text),
    vendorDetails: extractVendorDetails(text),
    supplierPlatform: detectPlatform(text),
    awbNumber: extractField(text, AWB_PATTERNS, cleanIdField),
    deliveryPartner: detectDeliveryPartner(text),
    payment: extractPayment(text),
    sku: extractField(text, SKU_PATTERNS, cleanIdField),
    qty: extractQty(text),
    gstNumber: extractGSTNumber(text),
    taxAmount: extractAmountField(text, TAX_AMOUNT_PATTERNS),

    // Return fields (only populated if return bill)
    returnDate: null,
    returnType: null,
    returnStatus: null,
    claimAmount: null,
    claimStatus: null,
  };

  // Logical Safety: If total amount is missing or smaller than tax amount,
  // set total amount to tax amount (total must be >= tax).
  if (result.taxAmount && (!result.amount || result.amount < result.taxAmount)) {
    result.amount = result.taxAmount;
  }

  // Populate return-specific fields
  if (isReturn) {
    result.returnDate = extractDateField(text, RETURN_DATE_PATTERNS) || result.billDate;
    result.returnType = extractReturnType(text);
    result.returnStatus = extractReturnStatus(text);
    result.claimAmount = extractAmountField(text, CLAIM_PATTERNS);
    result.claimStatus = result.claimAmount ? 'Claimed' : 'Not Claimed';
  }

  // Build confidence map
  result.extractionConfidence = buildConfidence(result);

  return result;
};

/**
 * Extract ALL bills from raw text (handles multi-bill PDFs)
 * @param {string} rawText - Full extracted text
 * @returns {{ bills: object[], totalBills: number }}
 */
const extractBillData = (rawText) => {
  const segments = splitIntoBills(rawText);
  const bills = segments.map((segment, idx) => {
    const extracted = extractSingleBill(segment);
    extracted.rawExtractedText = segment;
    extracted.billIndex = idx + 1;
    return extracted;
  });

  return {
    bills,
    totalBills: bills.length,
  };
};

// ════════════════════════════════════════════
// FIELD EXTRACTORS
// ════════════════════════════════════════════

/** Generic field extractor */
const extractField = (text, patterns, cleanFn) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const cleaned = cleanFn ? cleanFn(match[1]) : match[1].trim();
      if (cleaned) return cleaned;
    }
  }
  return null;
};

/** Extract date from text using pattern array */
const extractDateField = (text, patterns) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  return null;
};

/** Extract amount */
const extractAmountField = (text, patterns) => {
  let bestAmount = null;

  for (const pattern of patterns) {
    const globalRegex = new RegExp(pattern.source, 'gi');
    const matches = [...text.matchAll(globalRegex)];
    
    let patternBestAmount = null;
    for (const match of matches) {
      if (match && match[1]) {
        const amount = parseAmount(match[1]);
        if (amount !== null && amount > 0) {
          if (patternBestAmount === null || amount > patternBestAmount) {
            patternBestAmount = amount;
          }
        }
      }
    }
    
    if (patternBestAmount !== null) {
      if (bestAmount === null || (patternBestAmount > bestAmount && bestAmount <= 10)) {
        bestAmount = patternBestAmount;
      }
      if (bestAmount > 10.00) {
        return bestAmount;
      }
    }
  }

  return bestAmount;
};

/** Extract vendor name with first-line fallback */
const extractVendorName = (text) => {
  const explicit = extractField(text, VENDOR_NAME_PATTERNS, cleanVendorName);
  if (explicit) return explicit;

  // Fallback: first non-trivial line
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  for (const line of lines.slice(0, 3)) {
    if (
      line.length >= 3 && line.length <= 80 &&
      /[a-zA-Z]/.test(line) &&
      !/^\d+[\-\/\.]/.test(line) &&
      !/^(invoice|bill|receipt|tax|date|gst|order|page|sr)/i.test(line)
    ) {
      return cleanVendorName(line);
    }
  }
  return null;
};

/** Extract vendor details (name + GST + address) */
const extractVendorDetails = (text) => {
  const parts = [];
  const vendor = extractField(text, VENDOR_NAME_PATTERNS, cleanVendorName);
  if (vendor) parts.push(vendor);

  // Try to grab address-like line near vendor
  const addrMatch = text.match(/(?:address|addr)\s*[:\-]?\s*(.{10,100})/i);
  if (addrMatch) parts.push(addrMatch[1].trim());

  return parts.length > 0 ? parts.join(', ') : null;
};

/** Detect platform */
const detectPlatform = (text) => {
  // 1. Direct brand name detection
  for (const { pattern, name } of SUPPLIER_PLATFORMS) {
    if (pattern.test(text)) return name;
  }

  // 2. Fallback by unique text signatures (Meesho white-label invoices)
  if (
    /incl\.\s*shipping\s*charge/i.test(text) ||
    /size:\s*(?:free\s*size|[a-z0-9]+)/i.test(text) ||
    /\b\d{10}_\d\b/.test(text)
  ) {
    return 'meesho';
  }

  // 3. Fallback by Order ID format signatures
  // Amazon: 123-1234567-1234567
  if (/\b(\d{3}-\d{7}-\d{7})\b/.test(text)) {
    return 'amazon';
  }
  // Flipkart: OD followed by 18 digits
  if (/\b(OD\d{18})\b/i.test(text)) {
    return 'flipkart';
  }

  return null;
};

/** Detect delivery partner */
const detectDeliveryPartner = (text) => {
  for (const { pattern, name } of DELIVERY_PARTNERS) {
    if (pattern.test(text)) return name;
  }
  return null;
};

/** Extract payment mode */
const extractPayment = (text) => {
  for (const pattern of PAYMENT_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  return null;
};

/** Extract quantity */
const extractQty = (text) => {
  if (!text) return null;

  // 1. Sandwiched decimal values (Unit Price + Qty + Net Amount)
  // Handles merged columns: e.g. "₹1,609.321₹1,609.32" or "Rs.516.191Rs.516.19"
  const sandwichPattern = /(?:Rs\.?|INR|₹|\$)?\s*([\d,]+\.\d{2})\s*(\d{1,2})\s*(?:Rs\.?|INR|₹|\$)?\s*([\d,]+\.\d{2})/i;
  const sandwichMatch = text.match(sandwichPattern);
  if (sandwichMatch && sandwichMatch[2]) {
    const qty = parseInt(sandwichMatch[2]);
    if (qty > 0 && qty < 100) return qty;
  }

  // 2. Loop through general quantity regex patterns
  for (const pattern of QTY_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const qty = parseInteger(match[1]);
      if (qty) return qty;
    }
  }

  // 3. Fallback: If it's a valid invoice, the quantity is at least 1
  return 1;
};

/** Extract GST with validation */
const extractGSTNumber = (text) => {
  for (const pattern of GST_NUMBER_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const validated = validateGST(match[1]);
      if (validated) return validated;
    }
  }
  return null;
};

/** Detect if bill is a return bill */
const detectReturnBill = (text) => {
  const returnKeywords = /(?:return\s*(?:invoice|bill|note|order)|credit\s*note|rto|reverse\s*pickup|customer\s*return|buyer\s*return|return\s*to\s*origin)/i;
  return returnKeywords.test(text);
};

/** Extract return type */
const extractReturnType = (text) => {
  for (const pattern of RETURN_TYPE_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim().substring(0, 60);
  }
  // Fallback detection
  if (/\bRTO\b/.test(text)) return 'RTO';
  if (/customer\s*return/i.test(text)) return 'Customer Return';
  if (/reverse\s*pickup/i.test(text)) return 'Reverse Pickup';
  return 'Return';
};

/** Extract return status */
const extractReturnStatus = (text) => {
  for (const pattern of RETURN_STATUS_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  if (/(?:return\s*)?(?:delivered|received|completed|successful)/i.test(text)) return 'Success';
  if (/(?:return\s*)?(?:failed|rejected|lost|damaged)/i.test(text)) return 'Failed';
  return 'Pending';
};

/** Build confidence map */
const buildConfidence = (result) => {
  const conf = (val) => val !== null && val !== undefined ? 'high' : 'none';
  return {
    invoiceNumber: conf(result.invoiceNumber),
    orderNumber: conf(result.orderNumber),
    billDate: conf(result.billDate),
    amount: conf(result.amount),
    vendorName: result.vendorName ? 'medium' : 'none',
    supplierPlatform: conf(result.supplierPlatform),
    awbNumber: conf(result.awbNumber),
    deliveryPartner: conf(result.deliveryPartner),
    payment: conf(result.payment),
    sku: conf(result.sku),
    qty: conf(result.qty),
  };
};

/** Empty result */
const getEmptyResult = () => ({
  billType: 'regular', invoiceNumber: null, orderNumber: null,
  billDate: null, amount: null, vendorName: null, vendorDetails: null,
  supplierPlatform: null, awbNumber: null, deliveryPartner: null,
  payment: null, sku: null, qty: null, gstNumber: null, taxAmount: null,
  returnDate: null, returnType: null, returnStatus: null,
  claimAmount: null, claimStatus: null,
  extractionConfidence: {},
  rawExtractedText: '',
  billIndex: 1,
});

module.exports = { extractBillData, splitIntoBills, extractSingleBill };
