/**
 * ============================================
 * Extraction Service (v3) - Rule-Based Engine
 * ============================================
 * Multi-item support, improved SKU extraction
 * NO AI/LLM — pure regex + keyword + heuristics
 */

const {
  INVOICE_NUMBER_PATTERNS, ORDER_NUMBER_PATTERNS, DATE_PATTERNS,
  AMOUNT_PATTERNS, AWB_PATTERNS, DELIVERY_PARTNERS, SUPPLIER_PLATFORMS,
  PAYMENT_PATTERNS, SKU_PATTERNS, QTY_PATTERNS, GST_NUMBER_PATTERNS,
  TAX_AMOUNT_PATTERNS, TAXABLE_VALUE_PATTERNS, VENDOR_NAME_PATTERNS,
  RETURN_TYPE_PATTERNS, RETURN_STATUS_PATTERNS, CLAIM_PATTERNS,
  RETURN_DATE_PATTERNS, HSN_PATTERNS,
} = require('../helpers/regexPatterns');

const {
  parseDate, parseAmount, validateGST, validateHSN,
  cleanVendorName, cleanIdField, cleanSkuField, parseInteger,
} = require('../helpers/validators');

// ════════════════════════════════════════════
// MULTI-BILL SPLITTER
// ════════════════════════════════════════════

const splitIntoBills = (rawText) => {
  if (!rawText || rawText.trim().length < 20) return [rawText];

  // Strategy 1: Form-feed characters
  let segments = rawText.split(/\f/).map(s => s.trim()).filter(s => s.length > 30);
  if (segments.length > 1) {
    const valid = segments.filter(seg => hasInvoiceMarker(seg));
    if (valid.length > 0) return valid.length > 1 ? valid : valid;
  }

  // Strategy 2: Bill headers
  const headerPattern = /(?=(?:^|\n)\s*(?:TAX\s*INVOICE|INVOICE\s*$|BILL\s*OF\s*SUPPLY|CREDIT\s*NOTE|DEBIT\s*NOTE|RETURN\s*(?:INVOICE|NOTE))\s*(?:\n|$))/gim;
  let raw2 = rawText.split(headerPattern);
  if (raw2.length > 0 && raw2[0].trim().length > 0 && !hasInvoiceMarker(raw2[0])) {
    if (raw2.length > 1) { raw2[1] = raw2[0] + '\n' + raw2[1]; raw2.shift(); }
  }
  let seg2 = raw2.map(s => s.trim()).filter(s => s.length > 30);
  if (seg2.length > 1) {
    const valid = seg2.filter(seg => hasInvoiceMarker(seg));
    if (valid.length > 1) return valid;
  }

  // Strategy 3: Repeating Invoice/Order patterns
  const invoiceRepeat = /(?=(?:invoice\s*(?:no|number|#)|bill\s*(?:no|number)|order\s*(?:no|number|id))\s*[:\-]?\s*[A-Z0-9])/gi;
  const matches = [...rawText.matchAll(invoiceRepeat)];
  if (matches.length > 1) {
    segments = [];
    for (let i = 0; i < matches.length; i++) {
      const start = i === 0 ? 0 : matches[i].index;
      const end = i + 1 < matches.length ? matches[i + 1].index : rawText.length;
      const seg = rawText.substring(start, end).trim();
      if (seg.length > 20) segments.push(seg);
    }
    if (segments.length > 1) return segments;
  }

  // Strategy 4: Separator lines
  const sepPattern = /\n\s*[-=]{15,}\s*\n/;
  segments = rawText.split(sepPattern).map(s => s.trim()).filter(s => s.length > 30);
  if (segments.length > 1) {
    const valid = segments.filter(seg => hasInvoiceMarker(seg));
    if (valid.length > 1) return valid;
  }

  return [rawText];
};

const hasInvoiceMarker = (text) => {
  return /(?:invoice|bill|order|receipt|credit\s*note)/i.test(text) ||
    /(?:total|amount|qty|quantity)/i.test(text);
};

// ════════════════════════════════════════════
// MULTI-ITEM EXTRACTOR
// ════════════════════════════════════════════

/**
 * Extract multiple line items from invoice text.
 * Tries table-row parsing first, then falls back to single-item.
 */
const extractItems = (text) => {
  if (!text) return [];

  const items = [];

  // Strategy 1: Pipe-delimited table rows
  const pipeRows = text.match(/^[ \t]*\d{1,3}\s*\|.+$/gm);
  if (pipeRows && pipeRows.length > 0) {
    for (const row of pipeRows) {
      const item = parseTableRow(row, '|');
      if (item) items.push(item);
    }
    if (items.length > 0) return items;
  }

  // Strategy 2: Tab-delimited rows (common in Flipkart)
  const tabRows = text.match(/^[ ]*\d{1,3}\t.+$/gm);
  if (tabRows && tabRows.length > 0) {
    for (const row of tabRows) {
      const item = parseTableRow(row, '\t');
      if (item) items.push(item);
    }
    if (items.length > 0) return items;
  }

  // Strategy 3: SKU lines with amounts nearby
  const skuMatches = extractAllSKUs(text);
  if (skuMatches.length > 1) {
    for (const sku of skuMatches) {
      items.push({
        sku: sku,
        description: sku,
        qty: 1,
        hsn: null,
        taxableValue: null,
        tax: null,
        total: null,
      });
    }
    // Try to associate quantities
    enrichItemsWithQty(items, text);
    return items;
  }

  // Strategy 4: Single item fallback
  const sku = extractSKU(text);
  const qty = extractQty(text);
  const hsn = extractHSN(text);
  const taxableValue = extractAmountField(text, TAXABLE_VALUE_PATTERNS);
  const taxAmount = extractAmountField(text, TAX_AMOUNT_PATTERNS);
  const totalAmount = extractAmountField(text, AMOUNT_PATTERNS);

  if (sku || qty || totalAmount) {
    items.push({
      sku: sku,
      description: sku || null,
      qty: qty || 1,
      hsn: hsn,
      taxableValue: taxableValue,
      tax: taxAmount,
      total: totalAmount,
    });
  }

  return items;
};

/** Parse a pipe/tab delimited table row */
const parseTableRow = (row, delimiter) => {
  const parts = row.split(delimiter).map(p => p.trim()).filter(p => p.length > 0);
  if (parts.length < 3) return null;

  // First part is usually serial number
  const srNo = parseInt(parts[0]);
  if (isNaN(srNo)) return null;

  // Second part is description/SKU
  const description = parts[1] || '';
  const sku = cleanSkuField(description);
  if (!sku || sku.length < 2) return null;

  // Extract numbers from remaining parts
  const numbers = [];
  for (let i = 2; i < parts.length; i++) {
    const num = parseAmount(parts[i]);
    if (num !== null) numbers.push(num);
    else {
      const hsnMatch = parts[i].match(/^(\d{4,8})$/);
      if (hsnMatch) numbers.push({ hsn: hsnMatch[1] });
    }
  }

  // Heuristic: find qty (small integer), amounts (larger numbers)
  let qty = 1, hsn = null, taxableValue = null, tax = null, total = null;

  for (const n of numbers) {
    if (typeof n === 'object' && n.hsn) { hsn = n.hsn; continue; }
    if (typeof n === 'number' && n > 0 && n <= 9999 && Number.isInteger(n) && !qty) {
      qty = n;
    }
  }

  // Last number is usually total, second-to-last is tax
  const amountNums = numbers.filter(n => typeof n === 'number' && n > 10);
  if (amountNums.length >= 1) total = amountNums[amountNums.length - 1];
  if (amountNums.length >= 2) tax = amountNums[amountNums.length - 2];
  if (amountNums.length >= 3) taxableValue = amountNums[amountNums.length - 3];

  // Find qty from parts explicitly
  for (let i = 2; i < parts.length; i++) {
    const qMatch = parts[i].match(/^(\d{1,3})$/);
    if (qMatch) {
      const q = parseInt(qMatch[1]);
      if (q > 0 && q < 1000) { qty = q; break; }
    }
  }

  return { sku, description: sku, qty, hsn, taxableValue, tax, total };
};

/** Extract ALL SKUs found in text (for multi-item detection) */
const extractAllSKUs = (text) => {
  const skus = new Set();

  // Look for repeated SKU labels
  const skuLabelPattern = /(?:sku\s*(?:no|number|#|id|code)?\.?\s*[:\-|]\s*)([A-Za-z0-9][A-Za-z0-9\-_@ ]{2,50})/gi;
  let match;
  while ((match = skuLabelPattern.exec(text)) !== null) {
    const cleaned = cleanSkuField(match[1]);
    if (cleaned) skus.add(cleaned);
  }

  return [...skus];
};

/** Try to enrich items array with quantity data from text */
const enrichItemsWithQty = (items, text) => {
  const lines = text.split('\n');
  for (const item of items) {
    if (!item.sku) continue;
    // Look for qty near the SKU mention
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(item.sku) || lines[i].toLowerCase().includes(item.sku.toLowerCase())) {
        // Check this line and next 2 lines for qty
        const nearby = lines.slice(i, Math.min(i + 3, lines.length)).join(' ');
        const qtyMatch = nearby.match(/(?:qty|quantity)\s*[:\-]?\s*(\d{1,4})/i);
        if (qtyMatch) {
          item.qty = parseInt(qtyMatch[1]) || 1;
        }
        break;
      }
    }
  }
};

// ════════════════════════════════════════════
// SINGLE BILL EXTRACTOR
// ════════════════════════════════════════════

const extractSingleBill = (text) => {
  if (!text || typeof text !== 'string' || text.trim().length < 10) {
    return getEmptyResult();
  }

  const startTime = Date.now();
  const isReturn = detectReturnBill(text);
  const items = extractItems(text);
  const primarySku = items.length > 0 ? items[0].sku : extractSKU(text);
  const primaryQty = items.length > 0
    ? items.reduce((sum, it) => sum + (it.qty || 0), 0)
    : extractQty(text);

  const result = {
    billType: isReturn ? 'return' : 'regular',
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
    sku: primarySku,
    qty: primaryQty,
    gstNumber: extractGSTNumber(text),
    taxAmount: extractAmountField(text, TAX_AMOUNT_PATTERNS),

    // Multi-item data
    items: items,
    totalItems: items.length,
    totalQty: items.reduce((sum, it) => sum + (it.qty || 0), 0) || primaryQty || 1,

    // Return fields
    returnDate: null, returnType: null, returnStatus: null,
    claimAmount: null, claimStatus: null,
  };

  if (result.taxAmount && (!result.amount || result.amount < result.taxAmount)) {
    result.amount = result.taxAmount;
  }

  if (isReturn) {
    result.returnDate = extractDateField(text, RETURN_DATE_PATTERNS) || result.billDate;
    result.returnType = extractReturnType(text);
    result.returnStatus = extractReturnStatus(text);
    result.claimAmount = extractAmountField(text, CLAIM_PATTERNS);
    result.claimStatus = result.claimAmount ? 'Claimed' : 'Not Claimed';
  }

  result.extractionConfidence = buildConfidence(result);
  result.processingTimeMs = Date.now() - startTime;

  return result;
};

const extractBillData = (rawText) => {
  const segments = splitIntoBills(rawText);
  const bills = segments.map((segment, idx) => {
    const extracted = extractSingleBill(segment);
    extracted.rawExtractedText = segment;
    extracted.billIndex = idx + 1;
    return extracted;
  });
  return { bills, totalBills: bills.length };
};

// ════════════════════════════════════════════
// FIELD EXTRACTORS
// ════════════════════════════════════════════

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

const extractDateField = (text, patterns) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  return null;
};

const extractAmountField = (text, patterns) => {
  let bestAmount = null;
  for (const pattern of patterns) {
    const globalRegex = new RegExp(pattern.source, 'gi');
    const matches = [...text.matchAll(globalRegex)];
    let patternBest = null;
    for (const match of matches) {
      if (match && match[1]) {
        const amount = parseAmount(match[1]);
        if (amount !== null && amount > 0) {
          if (patternBest === null || amount > patternBest) patternBest = amount;
        }
      }
    }
    if (patternBest !== null) {
      if (bestAmount === null || (patternBest > bestAmount && bestAmount <= 10)) bestAmount = patternBest;
      if (bestAmount > 10.00) return bestAmount;
    }
  }
  return bestAmount;
};

/** Improved SKU extractor with multi-word support */
const extractSKU = (text) => {
  // Header/noise words that should never be returned as a SKU
  const HEADER_WORDS = /^(description|product|item|qty|quantity|hsn|rate|price|amount|total|tax|igst|cgst|sgst|cess|sr|sl|no|unit|net|gross|discount|shipping|handling|charges|declaration|sold|ordered|invoice|bill|date|status|order|payment)$/i;

  // Try explicit SKU patterns first
  for (const pattern of SKU_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      // Some patterns have 2 capture groups (ASIN + SKU inside parens)
      const raw = match[2] || match[1];
      if (raw) {
        const cleaned = cleanSkuField(raw);
        if (cleaned && cleaned.length >= 2 && !HEADER_WORDS.test(cleaned.trim())) {
          return cleaned;
        }
      }
    }
  }

  // Amazon fallback: extract from "( SKU-CODE )" inside description
  const parenSku = text.match(/\(\s*([A-Za-z][A-Za-z0-9\-_]{2,30})\s*\)/);
  if (parenSku && parenSku[1] && !HEADER_WORDS.test(parenSku[1])) {
    return cleanSkuField(parenSku[1]);
  }

  // Amazon fallback: ASIN code (10-char alphanumeric starting with B)
  const asinMatch = text.match(/\b(B0[A-Z0-9]{8})\b/);
  if (asinMatch && asinMatch[1]) return asinMatch[1];

  // Flipkart fallback: "PRINT - GAJRI" type SKUs from pipe-delimited rows
  const flipkartPipe = text.match(/\d\s*([A-Z][A-Z\-_ ]{2,40}?)\s*\|\s*[A-Z]/);
  if (flipkartPipe && flipkartPipe[1]) {
    const cleaned = cleanSkuField(flipkartPipe[1]);
    if (cleaned && cleaned.length >= 3 && !HEADER_WORDS.test(cleaned.trim())) return cleaned;
  }

  // Meesho fallback: lines containing hyphen + color like "PARI-03 MAROON"
  const descFallback = text.match(/\b([A-Z][A-Z0-9]*[\-][A-Z0-9]+(?:\s*@?\s*[A-Z]+)?)\b/);
  if (descFallback && descFallback[1]) {
    const cleaned = cleanSkuField(descFallback[1]);
    if (cleaned && cleaned.length >= 4 && !HEADER_WORDS.test(cleaned.trim())) return cleaned;
  }

  // Multi-word fallback: "RAJA RANI-YELLOW" pattern
  const multiWord = text.match(/\b([A-Z]{2,}\s+[A-Z]{2,}[\-][A-Z]+)\b/);
  if (multiWord && multiWord[1]) {
    const cleaned = cleanSkuField(multiWord[1]);
    if (cleaned && cleaned.length >= 5) return cleaned;
  }

  return null;
};

const extractHSN = (text) => {
  for (const pattern of HSN_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const validated = validateHSN(match[1]);
      if (validated) return validated;
    }
  }
  return null;
};

const extractVendorName = (text) => {
  const explicit = extractField(text, VENDOR_NAME_PATTERNS, cleanVendorName);
  if (explicit) return explicit;
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  for (const line of lines.slice(0, 3)) {
    if (line.length >= 3 && line.length <= 80 && /[a-zA-Z]/.test(line) &&
      !/^\d+[\-\/\.]/.test(line) &&
      !/^(invoice|bill|receipt|tax|date|gst|order|page|sr)/i.test(line)) {
      return cleanVendorName(line);
    }
  }
  return null;
};

const extractVendorDetails = (text) => {
  const parts = [];
  const vendor = extractField(text, VENDOR_NAME_PATTERNS, cleanVendorName);
  if (vendor) parts.push(vendor);
  const addrMatch = text.match(/(?:address|addr)\s*[:\-]?\s*(.{10,100})/i);
  if (addrMatch) parts.push(addrMatch[1].trim());
  return parts.length > 0 ? parts.join(', ') : null;
};

const detectPlatform = (text) => {
  for (const { pattern, name } of SUPPLIER_PLATFORMS) {
    if (pattern.test(text)) return name;
  }
  if (/incl\.\s*shipping\s*charge/i.test(text) || /size:\s*(?:free\s*size|[a-z0-9]+)/i.test(text) || /\b\d{10}_\d\b/.test(text)) return 'meesho';
  if (/\b(\d{3}-\d{7}-\d{7})\b/.test(text)) return 'amazon';
  if (/\b(OD\d{18})\b/i.test(text)) return 'flipkart';
  return null;
};

const detectDeliveryPartner = (text) => {
  for (const { pattern, name } of DELIVERY_PARTNERS) {
    if (pattern.test(text)) return name;
  }
  return null;
};

const extractPayment = (text) => {
  for (const pattern of PAYMENT_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  return null;
};

const extractQty = (text) => {
  if (!text) return null;
  const sandwichPattern = /(?:Rs\.?|INR|₹|\$)?\s*([\d,]+\.\d{2})\s*(\d{1,2})\s*(?:Rs\.?|INR|₹|\$)?\s*([\d,]+\.\d{2})/i;
  const sandwichMatch = text.match(sandwichPattern);
  if (sandwichMatch && sandwichMatch[2]) {
    const qty = parseInt(sandwichMatch[2]);
    if (qty > 0 && qty < 100) return qty;
  }
  for (const pattern of QTY_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const qty = parseInteger(match[1]);
      if (qty) return qty;
    }
  }
  return 1;
};

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

const detectReturnBill = (text) => {
  return /(?:return\s*(?:invoice|bill|note|order)|credit\s*note|rto|reverse\s*pickup|customer\s*return|buyer\s*return|return\s*to\s*origin)/i.test(text);
};

const extractReturnType = (text) => {
  for (const pattern of RETURN_TYPE_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim().substring(0, 60);
  }
  if (/\bRTO\b/.test(text)) return 'RTO';
  if (/customer\s*return/i.test(text)) return 'Customer Return';
  if (/reverse\s*pickup/i.test(text)) return 'Reverse Pickup';
  return 'Return';
};

const extractReturnStatus = (text) => {
  for (const pattern of RETURN_STATUS_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  if (/(?:return\s*)?(?:delivered|received|completed|successful)/i.test(text)) return 'Success';
  if (/(?:return\s*)?(?:failed|rejected|lost|damaged)/i.test(text)) return 'Failed';
  return 'Pending';
};

/** Build confidence map with numeric 0-100 scoring */
const buildConfidence = (result) => {
  const score = (val, weight = 100) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'string' && val.length < 3) return Math.min(40, weight);
    return weight;
  };
  return {
    invoiceNumber: score(result.invoiceNumber),
    orderNumber: score(result.orderNumber),
    billDate: score(result.billDate),
    amount: score(result.amount),
    vendorName: result.vendorName ? 60 : 0,
    supplierPlatform: score(result.supplierPlatform),
    awbNumber: score(result.awbNumber),
    deliveryPartner: score(result.deliveryPartner),
    payment: score(result.payment),
    sku: score(result.sku),
    qty: score(result.qty),
    gstNumber: result.gstNumber ? 100 : 0,
    items: result.items && result.items.length > 0 ? 100 : 0,
  };
};

const getEmptyResult = () => ({
  billType: 'regular', invoiceNumber: null, orderNumber: null,
  billDate: null, amount: null, vendorName: null, vendorDetails: null,
  supplierPlatform: null, awbNumber: null, deliveryPartner: null,
  payment: null, sku: null, qty: null, gstNumber: null, taxAmount: null,
  items: [], totalItems: 0, totalQty: 0,
  returnDate: null, returnType: null, returnStatus: null,
  claimAmount: null, claimStatus: null,
  extractionConfidence: {}, rawExtractedText: '', billIndex: 1,
  processingTimeMs: 0,
});

module.exports = { extractBillData, splitIntoBills, extractSingleBill };
