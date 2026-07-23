/**
 * ============================================
 * Extraction Service (v4) - Multi-Stage Engine
 * ============================================
 * 5-Stage Invoice Extraction Pipeline:
 * Stage 1: OCR & Barcode Extraction (done in pdfService/ocrService)
 * Stage 2: Smart Platform Detection (Amazon, Flipkart, Meesho, Ajio, Myntra, Generic GST)
 * Stage 3: Stage-based extraction (specialized regex parsing for each platform)
 * Stage 4: Data Validation & AI/Rule correction
 * Stage 5: Final JSON & Confidence Score Generation
 */

const {
  PLATFORM_DETECTORS,
  INVOICE_NUMBER_PATTERNS, ORDER_NUMBER_PATTERNS, DATE_PATTERNS,
  AMOUNT_PATTERNS, AWB_PATTERNS, DELIVERY_PARTNERS, SUPPLIER_PLATFORMS,
  PAYMENT_PATTERNS, SKU_PATTERNS, SKU_NOISE_WORDS, QTY_PATTERNS,
  GST_NUMBER_PATTERNS, TAX_AMOUNT_PATTERNS, TAXABLE_VALUE_PATTERNS,
  VENDOR_NAME_PATTERNS, RETURN_TYPE_PATTERNS, RETURN_STATUS_PATTERNS,
  CLAIM_PATTERNS, RETURN_DATE_PATTERNS, ITEM_TABLE_PATTERNS,
} = require('../helpers/regexPatterns');

const {
  parseDate, parseAmount, validateGST, validateHSN,
  cleanVendorName, cleanIdField, cleanSkuField, parseInteger, validateAWB, wordsToNumber
} = require('../helpers/validators');

// ════════════════════════════════════════════
// STAGE 2: SMART PLATFORM DETECTION
// ════════════════════════════════════════════

const detectPlatform = (text) => {
  if (!text) return 'other';
  const scores = {
    amazon: 0,
    flipkart: 0,
    meesho: 0,
    ajio: 0,
    myntra: 0,
  };

  // Score against patterns
  for (const [platform, patterns] of Object.entries(PLATFORM_DETECTORS)) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        scores[platform] += 10; // high weight for regex detectors
      }
    }
  }

  // Content keywords scoring (original exact matches)
  if (/amazon/i.test(text)) scores.amazon += 5;
  if (/flipkart|retail\s*net|ekart/i.test(text)) scores.flipkart += 5;
  if (/meesho|fashnear/i.test(text)) scores.meesho += 5;
  if (/ajio|reliance/i.test(text)) scores.ajio += 5;
  if (/myntra|vector\s*e\-commerce/i.test(text)) scores.myntra += 5;

  // OCR-tolerant fuzzy keyword scoring (helps image-based extraction)
  if (/amaz[o0]n|ama[z2][o0]n|amazan|amzon/i.test(text)) scores.amazon += 5;
  if (/fl[i1I]pkart|flipcart|f[lI1][i1I]pkart|fiipkart/i.test(text)) scores.flipkart += 5;
  if (/meesh[o0]|m[e3][e3]sh[o0]/i.test(text)) scores.meesho += 5;
  if (/aj[i1I][o0]|aji0/i.test(text)) scores.ajio += 5;
  if (/myntr[a@]|myn[tT]ra/i.test(text)) scores.myntra += 5;

  // Find highest scoring platform
  let bestPlatform = 'other';
  let maxScore = 0;
  for (const [platform, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestPlatform = platform;
    }
  }

  // If no specific platform, check if there is a GST number -> generic_gst
  if (bestPlatform === 'other') {
    const hasGST = GST_NUMBER_PATTERNS.some(p => p.test(text));
    if (hasGST) return 'generic_gst';
  }

  return bestPlatform;
};

// ════════════════════════════════════════════
// STAGE 3: DATA EXTRACTION ENGINE
// ════════════════════════════════════════════

const extractField = (text, patterns, cleanFn) => {
  // Strategy 1: Standard full-text extraction
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const cleaned = cleanFn ? cleanFn(match[1]) : match[1].trim();
      if (cleaned) return cleaned;
    }
  }

  // Strategy 2: Line-by-line extraction (better for OCR text with line breaks)
  // This prevents regex from capturing across newline boundaries
  const lines = text.split(/\n/);
  for (const pattern of patterns) {
    for (const line of lines) {
      const match = line.match(pattern);
      if (match && match[1]) {
        const cleaned = cleanFn ? cleanFn(match[1]) : match[1].trim();
        if (cleaned && cleaned.length >= 2) return cleaned;
      }
    }
  }

  return null;
};

const extractDateField = (text, patterns) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  // Line-by-line fallback for OCR text
  const lines = text.split(/\n/);
  for (const pattern of patterns) {
    for (const line of lines) {
      const match = line.match(pattern);
      if (match && match[1]) return match[1].trim();
    }
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
    if (patternBest !== null && patternBest > 10.00) {
      return patternBest;
    } else if (patternBest !== null && bestAmount === null) {
      bestAmount = patternBest;
    }
  }
  return bestAmount;
};

/**
 * Specialized parser for Amazon & GST invoice total summary blocks.
 * Prevents Tax Amount (IGST/CGST/SGST) from being misidentified as Total Bill Amount.
 */
const extractAmazonAmounts = (text) => {
  const result = { amount: null, taxAmount: null, taxableValue: null };
  if (!text) return result;

  // 1. Check "Amount in Words:" (100% reliable ground truth in Indian GST/Amazon invoices)
  const wordsMatch = text.match(/(?:Amount\s*in\s*Words|Words)\s*[:\-]?\s*([^\r\n]+)/i);
  if (wordsMatch && wordsMatch[1]) {
    const wordNum = wordsToNumber(wordsMatch[1]);
    if (wordNum && wordNum > 0) {
      result.amount = wordNum;
    }
  }

  // 2. Scan TOTAL summary row (looking specifically for TOTAL: row)
  const totalMatch = text.match(/(?:^|\n)\s*(?:TOTAL|Total)\s*[:\-]?\s*([\s\S]{0,150})/i);
  if (totalMatch && totalMatch[1]) {
    const rawBlock = totalMatch[1].split(/(?:Amount\s*in\s*Words|Sold\s*By|Billing\s*Address|Shipping\s*Address|GSTIN|Invoice|Page\s*\d)/i)[0];
    const matches = [...rawBlock.matchAll(/(?:₹|Rs\.?|INR)?\s*([0-9,]+\.\d{2})/gi)];
    const numbers = matches.map(m => parseAmount(m[1])).filter(n => n !== null && n >= 0);

    if (numbers.length >= 2) {
      // In Amazon GST invoices total row: Tax Amount (smaller), Total Amount (larger)
      const sorted = [...numbers].sort((a, b) => b - a);
      if (!result.amount || Math.abs(result.amount - sorted[0]) <= 5) {
        result.amount = sorted[0]; // Maximum amount in TOTAL row is Total Amount
      }
      result.taxAmount = sorted[sorted.length - 1]; // Smaller amount is Tax Amount
    } else if (numbers.length === 1 && !result.amount) {
      result.amount = numbers[0];
    }
  }

  return result;
};

const extractAWBNumber = (text) => {
  // Priority 1: Check embedded AWB Barcode text marker injected from PDF service
  const barcodeMatch = text.match(/AWB_BARCODE:\s*([A-Z0-9]{8,25})/i);
  if (barcodeMatch) return barcodeMatch[1];

  // Priority 2: Scan AWB_PATTERNS
  for (const pattern of AWB_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const validated = validateAWB(match[1]);
      if (validated) return validated;
    }
  }
  return null;
};

const extractPaymentModes = (text) => {
  const paymentModes = new Set();
  
  // Search for common payment mode keywords
  const upiRegex = /\b(?:upi|gpay|google\s*pay|phonepe|paytm|bhim)\b/i;
  const cardRegex = /\b(?:credit\s*card|debit\s*card|visa|mastercard|rupay|card)\b/i;
  const codRegex = /\b(?:cod|cash\s*on\s*delivery|pay\s*on\s*delivery|collect\s*cash|pod)\b/i;
  const prepaidRegex = /\b(?:prepaid|pre\-paid|pre\s*paid|online\s*payment|net\s*banking|netbanking|gift\s*card|amazon\s*pay|wallet)\b/i;
  
  // Get raw payment mode strings using PAYMENT_PATTERNS
  for (const pattern of PAYMENT_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const modeStr = match[1].toLowerCase();
      if (upiRegex.test(modeStr)) paymentModes.add('UPI');
      if (cardRegex.test(modeStr)) paymentModes.add('Card');
      if (codRegex.test(modeStr)) paymentModes.add('COD');
      if (prepaidRegex.test(modeStr)) {
        if (/amazon\s*pay/i.test(modeStr)) paymentModes.add('AmazonPay');
        else if (/gift\s*card/i.test(modeStr)) paymentModes.add('GiftCard');
        else paymentModes.add('Prepaid');
      }
    }
  }

  // Direct scans of the text as fallbacks
  if (upiRegex.test(text)) paymentModes.add('UPI');
  if (cardRegex.test(text)) paymentModes.add('Card');
  if (codRegex.test(text)) paymentModes.add('COD');
  if (/amazon\s*pay/i.test(text)) paymentModes.add('AmazonPay');
  if (/gift\s*card/i.test(text)) paymentModes.add('GiftCard');
  if (/net\s*banking|netbanking/i.test(text)) paymentModes.add('NetBanking');

  return [...paymentModes];
};

const extractSKUs = (text) => {
  const skus = [];

  // Try matching SKU patterns in order of priority
  for (const pattern of SKU_PATTERNS) {
    const matches = [...text.matchAll(new RegExp(pattern.source, 'gi'))];
    for (const match of matches) {
      const raw = match[2] || match[1];
      if (raw) {
        const cleaned = cleanSkuField(raw);
        if (cleaned && cleaned.length >= 2) {
          skus.push({ value: cleaned, confidence: 90 });
        }
      }
    }
  }

  // General fallbacks
  const parenSku = text.match(/\(\s*([A-Za-z][A-Za-z0-9\-_]{2,30})\s*\)/);
  if (parenSku && parenSku[1]) {
    skus.push({ value: cleanSkuField(parenSku[1]), confidence: 70 });
  }

  return skus;
};

// ── Multi-Item Row Parsing ──
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

  // Strategy 2: Tab-delimited rows (Flipkart / Myntra)
  const tabRows = text.match(/^[ ]*\d{1,3}\t.+$/gm);
  if (tabRows && tabRows.length > 0) {
    for (const row of tabRows) {
      const item = parseTableRow(row, '\t');
      if (item) items.push(item);
    }
    if (items.length > 0) return items;
  }

  return items;
};

const parseTableRow = (row, delimiter) => {
  const parts = row.split(delimiter).map(p => p.trim()).filter(p => p.length > 0);
  if (parts.length < 3) return null;

  const srNo = parseInt(parts[0]);
  if (isNaN(srNo)) return null;

  const description = parts[1] || '';
  const sku = cleanSkuField(description);
  if (!sku || sku.length < 2) return null;

  const numbers = [];
  for (let i = 2; i < parts.length; i++) {
    const num = parseAmount(parts[i]);
    if (num !== null) numbers.push(num);
    else {
      const hsnMatch = parts[i].match(/^(\d{4,8})$/);
      if (hsnMatch) numbers.push({ hsn: hsnMatch[1] });
    }
  }

  let qty = 1, hsn = null, taxableValue = null, tax = null, total = null;
  for (const n of numbers) {
    if (typeof n === 'object' && n.hsn) { hsn = n.hsn; continue; }
    if (typeof n === 'number' && n > 0 && n <= 9999 && Number.isInteger(n) && !qty) {
      qty = n;
    }
  }

  const amountNums = numbers.filter(n => typeof n === 'number' && n > 10);
  if (amountNums.length >= 1) total = amountNums[amountNums.length - 1];
  if (amountNums.length >= 2) tax = amountNums[amountNums.length - 2];
  if (amountNums.length >= 3) taxableValue = amountNums[amountNums.length - 3];

  // Try explicit qty regex in parts
  for (let i = 2; i < parts.length; i++) {
    const qMatch = parts[i].match(/^(\d{1,3})$/);
    if (qMatch) {
      const q = parseInt(qMatch[1]);
      if (q > 0 && q < 1000) { qty = q; break; }
    }
  }

  return { sku, description: sku, qty, hsn, taxableValue, tax, total };
};

// ── Addresses & Customer Name ──
const extractNameAndAddresses = (text) => {
  const result = {
    customerName: null,
    shippingAddress: null,
    billingAddress: null,
  };

  // Try extracting customer name from shipping or billing details
  const nameMatch = text.match(/(?:ship\s*to|bill\s*to|sold\s*to|buyer|customer\s*name)\s*[:\-]?\s*([A-Z][a-zA-Z\s\.]{2,40})/i);
  if (nameMatch) {
    result.customerName = nameMatch[1].trim();
  }

  // Address parsing blocks
  const shippingMatch = text.match(/(?:shipping\s*address|ship\s*to|delivery\s*address)\s*[:\-]?\s*([\s\S]{10,250}?)(?=(?:\n\s*\n|\nBill|\nInvoice|\nOrder|\nSold|\nGSTIN))/i);
  if (shippingMatch) {
    result.shippingAddress = shippingMatch[1].replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  const billingMatch = text.match(/(?:billing\s*address|bill\s*to|invoice\s*address)\s*[:\-]?\s*([\s\S]{10,250}?)(?=(?:\n\s*\n|\nShip|\nDelivery|\nOrder|\nSold|\nGSTIN))/i);
  if (billingMatch) {
    result.billingAddress = billingMatch[1].replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // If customerName is empty, attempt extraction from first line of shipping address
  if (!result.customerName && result.shippingAddress) {
    const lines = result.shippingAddress.split(',');
    if (lines[0] && lines[0].trim().length > 2 && lines[0].trim().length < 40) {
      result.customerName = lines[0].trim();
    }
  }

  return result;
};

// ── Courier & Seller ──
const extractCourierAndSeller = (text) => {
  const result = {
    courierPartner: null,
    sellerName: null,
  };

  for (const { pattern, name } of DELIVERY_PARTNERS) {
    if (pattern.test(text)) {
      result.courierPartner = name;
      break;
    }
  }

  const sellerMatch = text.match(/(?:sold\s*by|seller\s*name|supplier|shipper)\s*[:\-]?\s*([^\n\r]{2,60})/i);
  if (sellerMatch) {
    result.sellerName = cleanVendorName(sellerMatch[1]);
  }

  return result;
};

// ── Filename extraction helper ──
const extractAwbFromFileName = (fileName) => {
  if (!fileName) return null;
  const nameWithoutExt = fileName.replace(/\.[a-zA-Z0-9]+$/, '').trim();
  
  const flipkartMatch = nameWithoutExt.match(/(?:^|[^a-zA-Z0-9])(FM[A-Z]{2}\d{8,14})(?:[^a-zA-Z0-9]|$)/i);
  if (flipkartMatch) return flipkartMatch[1].toUpperCase();

  const atsMatch = nameWithoutExt.match(/(?:^|[^a-zA-Z0-9])(ATS\d{8,15})(?:[^a-zA-Z0-9]|$)/i);
  if (atsMatch) return atsMatch[1].toUpperCase();

  // Remove the overly greedy \d{10,20} match which causes false positives on filenames

  return null;
};

// ════════════════════════════════════════════
// STAGE 4: VALIDATION AND AI DATA CORRECTION
// ════════════════════════════════════════════

const applyOcrFallbacks = (bill, text, fileName) => {
  if (!text) return bill;
  
  // 1. Invoice Number Fallback
  if (!bill.invoiceNumber) {
    const looserInvoicePatterns = [
      /(?:invoice|bill|inv|receipt)\s*(?:no|number|#|num|id|key)?\s*[:\-\|\s]?\s*([a-z0-9\-\/\s]{4,25})/i,
      /\b(INV[-\/\s]?\d{4,12})\b/i,
      /\b([A-Z]{2,4}\/\d{4}-\d{2,6}\/\d{2,6})\b/,
    ];
    for (const pat of looserInvoicePatterns) {
      const match = text.match(pat);
      if (match && match[1]) {
        const cleaned = cleanIdField(match[1]);
        if (cleaned && cleaned.length >= 4 && 
            !/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]{2}$/i.test(cleaned) && 
            !/^\d{3}-\d{7}-\d{7}$/.test(cleaned) &&
            !/^\d{18}$/.test(cleaned) &&
            !cleaned.includes('/') && !cleaned.includes('-') && !/^\d{10,20}$/.test(cleaned)) {
          bill.invoiceNumber = cleaned;
          break;
        }
      }
    }
  }

  // 2. Order ID Fallback
  if (!bill.orderNumber) {
    const amznLooseMatch = text.match(/\b(\d{3})[\s\.]?(\d{7})[\s\.]?(\d{7})\b/);
    if (amznLooseMatch) {
      bill.orderNumber = `${amznLooseMatch[1]}-${amznLooseMatch[2]}-${amznLooseMatch[3]}`;
    } else {
      const fkLooseMatch = text.match(/\b(?:OD|0D|QD|Q0|O0)\s*(\d{18})\b/i);
      if (fkLooseMatch) {
        bill.orderNumber = 'OD' + fkLooseMatch[1];
      }
    }
  }

  // 3. AWB Number Fallback (with courier-specific patterns)
  if (!bill.awbNumber) {
    const looseAwbPatterns = [
      // Amazon AWB (OCR-tolerant prefixes)
      /\b((?:ATS|AT5|AIS|AJ5)\d{10,12})\b/i,
      // Flipkart/Ekart AWB
      /\b((?:FM|PM|FN)[A-Z0-9]{2}\d{8,14})\b/i,
      // Ekart specific (EKRT prefix)
      /\b(EKRT\d{8,14})\b/i,
      // Delhivery AWB patterns
      /\b(\d{18})\b/,
      // Ecom Express patterns (starts with 36)
      /\b(36\d{10})\b/,
      // BlueDart patterns (starts with 13)
      /\b(13\d{12})\b/,
      // XpressBees patterns (starts with 12)
      /\b(12\d{7,10})\b/,
      // DTDC patterns
      /\b([A-Z]\d{8,9})\b/,
      // Shadowfax patterns
      /\b(SF\d{10,14})\b/i,
      // Generic 12-digit AWB
      /\b(\d{12})\b/,
      // Fallback: any 10-20 digit number
      /\b(\d{10,20})\b/
    ];
    for (const pat of looseAwbPatterns) {
      const match = text.match(pat);
      if (match && match[1]) {
        const cleaned = cleanIdField(match[1]);
        if (cleaned && cleaned.length >= 8 && cleaned.length <= 25 && 
            cleaned !== bill.orderNumber && cleaned !== bill.invoiceNumber &&
            !/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]{2}$/i.test(cleaned)) {
          bill.awbNumber = cleaned;
          break;
        }
      }
    }
  }

  // 4. GST Number Fallback (with common OCR character corrections)
  if (!bill.gstNumber) {
    const possibleGsts = text.match(/\b([A-Z0-9]{15})\b/gi) || [];
    for (const gst of possibleGsts) {
      let cleaned = gst.toUpperCase();
      if (cleaned.startsWith('O')) cleaned = '0' + cleaned.substring(1);
      if (cleaned.startsWith('I') || cleaned.startsWith('L')) cleaned = '1' + cleaned.substring(1);
      
      if (/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]{2}$/.test(cleaned)) {
        const stateCode = parseInt(cleaned.substring(0, 2));
        if (stateCode >= 1 && stateCode <= 37) {
          bill.gstNumber = cleaned;
          break;
        }
      }
    }
  }

  // 5. Total Amount Fallback
  if (!bill.amount) {
    const amountMatches = [...text.matchAll(/\b\d+[\.,]\d{2}\b/g)].map(m => parseAmount(m[0])).filter(n => n !== null && n < 50000);
    if (amountMatches.length > 0) {
      const lines = text.split('\n');
      for (const line of lines) {
        if (/(?:total|payable|net|amount|received|₹|\$|usd)/i.test(line)) {
          const amt = parseAmount(line);
          if (amt && amt > 10) {
            bill.amount = amt;
            break;
          }
        }
      }
      if (!bill.amount) {
        const sorted = amountMatches.sort((a, b) => b - a);
        bill.amount = sorted[0];
      }
    }
  }

  // 6. Payment Mode Fallback
  if (!bill.paymentModes || bill.paymentModes.length === 0) {
    bill.paymentModes = [];
    if (/\b(?:cod|cash|collect|pay on delivery)\b/i.test(text)) {
      bill.paymentModes.push('COD');
    } else if (/\b(?:prepaid|online|upi|gpay|paytm|card|netbanking)\b/i.test(text)) {
      bill.paymentModes.push('Prepaid');
    }
  }

  // 7. Quantity Fallback
  if (!bill.qty || bill.qty <= 0) {
    const qtyMatch = text.match(/(?:qty|quantity|ordered)\.?\s*[:\-\|\s]?\s*(\d{1,2})/i);
    if (qtyMatch && qtyMatch[1]) {
      bill.qty = parseInt(qtyMatch[1]) || 1;
    } else {
      bill.qty = 1;
    }
  }

  // 8. Customer Name Fallback
  if (!bill.customerName) {
    const nameMatch = text.match(/(?:buyer|customer|recipient|ship to|deliver to)\s*[:\-\|\s]?\s*([A-Z][a-zA-Z\s\.]{2,30})/i);
    if (nameMatch && nameMatch[1]) {
      const cleaned = cleanVendorName(nameMatch[1]);
      if (cleaned && !/^(invoice|bill|date|tax|gst|order|page|sr|total)/i.test(cleaned)) {
        bill.customerName = cleaned;
      }
    }
  }

  // 9. Seller Name Fallback
  if (!bill.sellerName && !bill.vendorName) {
    const sellerMatch = text.match(/(?:seller|supplier|vendor|sold by)\s*[:\-\|\s]?\s*([^\n\r]{2,50})/i);
    if (sellerMatch && sellerMatch[1]) {
      const cleaned = cleanVendorName(sellerMatch[1]);
      if (cleaned) {
        bill.sellerName = cleaned;
        bill.vendorName = cleaned;
      }
    }
  }

  // 10. SKU Fallback
  if (!bill.sku) {
    const hasAmount = bill.amount || /\b(?:amount|total|payable|net|₹|\$)\b/i.test(text);
    const hasInvoice = bill.invoiceNumber || /\b(?:invoice|bill|inv\b)/i.test(text);
    
    // Only run SKU fallback if the page seems to be an invoice, not a bare shipping label
    if (hasAmount || hasInvoice) {
      const skuMatches = [...text.matchAll(/\b([A-Z0-9\-_]{6,20})\b/g)];
      for (const match of skuMatches) {
        const cleaned = cleanSkuField(match[1]);
        if (cleaned && cleaned.length >= 6 && 
            cleaned !== bill.orderNumber && 
            cleaned !== bill.invoiceNumber && 
            cleaned !== bill.awbNumber && 
            cleaned !== bill.gstNumber) {
          
          // Real SKU/ASINs always have at least one digit OR a hyphen/underscore
          // This prevents address city names like "BILASPUR" or payment states like "PREPAID" from matching
          if (/\d/.test(cleaned) || /[\-_]/.test(cleaned)) {
            bill.sku = cleaned;
            break;
          }
        }
      }
    }
  }

  return bill;
};

// ════════════════════════════════════════════
// STAGE 4: VALIDATION AND AI DATA CORRECTION
// ════════════════════════════════════════════

const performCorrections = (bill, text = '', fileName = '') => {
  // Apply fallback recovery if fields are missing
  bill = applyOcrFallbacks(bill, text, fileName);

  // Reconcile deliveryType based on payment
  if (bill.paymentModes && bill.paymentModes.includes('COD')) {
    bill.deliveryType = 'COD';
  } else if (bill.paymentModes && bill.paymentModes.length > 0) {
    bill.deliveryType = 'PREPAID';
  }

  // Set single payment field for DB backwards compatibility
  if (bill.paymentModes && bill.paymentModes.length > 0) {
    bill.payment = bill.paymentModes.join(', ');
  } else {
    bill.payment = null;
  }

  // Standardise Amazon Order number format: 123-1234567-1234567
  if (bill.orderNumber) {
    const rawOrder = bill.orderNumber.replace(/[^0-9]/g, '');
    if (rawOrder.length === 17) {
      bill.orderNumber = `${rawOrder.substring(0, 3)}-${rawOrder.substring(3, 10)}-${rawOrder.substring(10, 17)}`;
    } else {
      // Correct common Flipkart order IDs (e.g. starting with 0D, QD)
      const rawUpper = bill.orderNumber.trim().toUpperCase();
      if (/^(?:0D|QD|Q0|O0)\d{18}$/.test(rawUpper)) {
        bill.orderNumber = 'OD' + rawUpper.substring(2);
      }
    }
  }

  // ── Amount Reconciliation & Cross-Validation ──
  // 1. Ground truth check: "Amount in Words"
  const wordsMatch = text.match(/(?:Amount\s*in\s*Words|Words)\s*[:\-]?\s*([^\r\n]+)/i);
  if (wordsMatch && wordsMatch[1]) {
    const wordAmt = wordsToNumber(wordsMatch[1]);
    if (wordAmt && wordAmt > 10) {
      if (!bill.amount || (bill.taxAmount && Math.abs(bill.amount - bill.taxAmount) < 0.01) || bill.amount < (bill.taxAmount || 0)) {
        bill.amount = wordAmt;
      } else if (Math.abs(bill.amount - wordAmt) > 50 && wordAmt > (bill.taxAmount || 0)) {
        bill.amount = wordAmt;
      }
    }
  }

  // 2. Anti-collision check: If bill.amount was wrongly set equal to bill.taxAmount
  if (bill.taxAmount && bill.amount && Math.abs(bill.amount - bill.taxAmount) < 0.01) {
    const matches = [...text.matchAll(/(?:₹|Rs\.?|INR)?\s*([0-9,]+\.\d{2})/gi)];
    const validAmounts = matches
      .map(m => parseAmount(m[1]))
      .filter(n => n !== null && n > bill.taxAmount + 1 && n < 10000000);

    if (validAmounts.length > 0) {
      bill.amount = Math.max(...validAmounts);
    }
  }

  // 3. Fallback if bill.amount is missing or strictly smaller than taxAmount
  if (bill.taxAmount && (!bill.amount || bill.amount < bill.taxAmount)) {
    const matches = [...text.matchAll(/(?:₹|Rs\.?|INR)?\s*([0-9,]+\.\d{2})/gi)];
    const validAmounts = matches
      .map(m => parseAmount(m[1]))
      .filter(n => n !== null && n > bill.taxAmount + 1 && n < 10000000);

    if (validAmounts.length > 0) {
      bill.amount = Math.max(...validAmounts);
    }
  }
  
  // 4. Line items total calculation
  const calculatedTotal = (bill.items || []).reduce((sum, item) => sum + (item.total || 0), 0);
  if (calculatedTotal > 0 && (!bill.amount || Math.abs(bill.amount - calculatedTotal) > 5)) {
    bill.amount = calculatedTotal;
  }

  // Ensure Quantity is integer
  bill.qty = parseInt(bill.qty) || 1;

  // OCR cleanups for AWB (if standard prefix ATS but read with O/I typos)
  if (bill.awbNumber) {
    const upperAwb = bill.awbNumber.toUpperCase();
    if (upperAwb.startsWith('ATSO') || upperAwb.startsWith('AT5O')) {
      bill.awbNumber = 'ATS0' + bill.awbNumber.slice(4);
    } else if (upperAwb.startsWith('AT5')) {
      bill.awbNumber = 'ATS' + bill.awbNumber.slice(3);
    }
  }

  return bill;
};

// ════════════════════════════════════════════
// STAGE 5: FINAL JSON & CONFIDENCE SCORE
// ════════════════════════════════════════════

const calculateConfidence = (bill) => {
  const score = (val, weight = 100) => {
    if (val === null || val === undefined) return 0;
    if (Array.isArray(val) && val.length === 0) return 0;
    if (typeof val === 'string' && val.length < 3) return Math.min(40, weight);
    return weight;
  };

  const confidenceScores = {
    invoiceNumber: score(bill.invoiceNumber),
    orderNumber: score(bill.orderNumber),
    billDate: score(bill.billDate),
    amount: score(bill.amount),
    vendorName: score(bill.vendorName, 70),
    platform: score(bill.platform),
    awbNumber: score(bill.awbNumber, 100),
    payment: score(bill.payment),
    sku: score(bill.sku),
    qty: score(bill.qty),
    gstNumber: score(bill.gstNumber, 100),
    items: bill.items && bill.items.length > 0 ? 100 : 0,
  };

  // Average confidence score
  const vals = Object.values(confidenceScores);
  const average = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;

  return {
    scores: confidenceScores,
    average,
  };
};

// ════════════════════════════════════════════
// SINGLE PAGE EXTRACTION
// ════════════════════════════════════════════

const extractSingleBill = (text, fileName = '') => {
  if (!text || typeof text !== 'string' || text.trim().length < 10) {
    return getEmptyResult();
  }

  const startTime = Date.now();
  
  // Stage 2: Platform Detection
  const platform = detectPlatform(text);
  
  // Stage 3: Platform specific data extraction
  const items = extractItems(text);
  
  // SKUs selection
  const extractedSkus = extractSKUs(text);
  const primarySku = items.length > 0 ? items[0].sku : (extractedSkus.length > 0 ? extractedSkus[0].value : null);
  
  // Quantities
  const primaryQty = items.length > 0
    ? items.reduce((sum, it) => sum + (it.qty || 0), 0)
    : extractQty(text);

  const nameAndAddr = extractNameAndAddresses(text);
  const courierAndSeller = extractCourierAndSeller(text);
  const isReturn = detectReturnBill(text);

  const amazonAmounts = (platform === 'amazon' || /amazon/i.test(text) || /Amount\s*in\s*Words/i.test(text))
    ? extractAmazonAmounts(text)
    : { amount: null, taxAmount: null };

  const extractedAmount = extractAmountField(text, AMOUNT_PATTERNS);
  const extractedTaxAmount = extractAmountField(text, TAX_AMOUNT_PATTERNS);

  let finalAmount = amazonAmounts.amount || extractedAmount;
  let finalTaxAmount = amazonAmounts.taxAmount || extractedTaxAmount;

  if (finalAmount && finalTaxAmount && Math.abs(finalAmount - finalTaxAmount) < 0.01 && amazonAmounts.amount && amazonAmounts.amount > finalTaxAmount) {
    finalAmount = amazonAmounts.amount;
  }

  let bill = {
    billType: isReturn ? 'return' : 'regular',
    invoiceNumber: extractField(text, INVOICE_NUMBER_PATTERNS, cleanIdField),
    orderNumber: extractField(text, ORDER_NUMBER_PATTERNS, cleanIdField),
    billDate: extractDateField(text, DATE_PATTERNS),
    amount: finalAmount,
    vendorName: courierAndSeller.sellerName || extractVendorName(text),
    vendorDetails: nameAndAddr.shippingAddress || null,
    supplierPlatform: platform === 'generic_gst' ? 'other' : platform,
    platform: platform,
    awbNumber: extractAWBNumber(text) || extractAwbFromFileName(fileName),
    deliveryPartner: courierAndSeller.courierPartner,
    paymentModes: extractPaymentModes(text),
    payment: null,
    deliveryType: 'PREPAID', // Default fallback
    sku: primarySku,
    qty: primaryQty,
    gstNumber: extractField(text, GST_NUMBER_PATTERNS, validateGST),
    taxAmount: finalTaxAmount,

    // Address Info
    customerName: nameAndAddr.customerName,
    shippingAddress: nameAndAddr.shippingAddress,
    billingAddress: nameAndAddr.billingAddress,
    sellerName: courierAndSeller.sellerName,
    courierPartner: courierAndSeller.courierPartner,

    // Multi-item data
    items: items,
    totalItems: items.length,
    totalQty: items.reduce((sum, it) => sum + (it.qty || 0), 0) || primaryQty || 1,

    // Return fields
    returnDate: null, returnType: null, returnStatus: null,
    claimAmount: null, claimStatus: null,
  };

  if (isReturn) {
    bill.returnDate = extractDateField(text, RETURN_DATE_PATTERNS) || bill.billDate;
    bill.returnType = extractField(text, RETURN_TYPE_PATTERNS, (s) => s.trim().substring(0, 60)) || 'Return';
    bill.returnStatus = extractField(text, RETURN_STATUS_PATTERNS, (s) => s.trim()) || 'Success';
    bill.claimAmount = extractAmountField(text, CLAIM_PATTERNS);
    bill.claimStatus = bill.claimAmount ? 'Claimed' : 'Not Claimed';
  }

  // Stage 4: Perform Corrections
  bill = performCorrections(bill, text, fileName);

  // Stage 5: Confidence Scoring
  const confidence = calculateConfidence(bill);
  bill.extractionConfidence = confidence.scores;
  bill.confidence = confidence.average;

  bill.processingTimeMs = Date.now() - startTime;

  return bill;
};

/**
 * Secondary extraction pass for image-based OCR.
 * Re-runs extraction on normalized text when critical fields are missing.
 * This is ONLY called from the image pipeline (billController.js), never for PDFs.
 *
 * @param {object} bill - Primary extraction result
 * @param {string} normalizedText - OCR text after normalization
 * @param {string} fileName - Original filename
 * @returns {object} - Enhanced bill with recovered fields
 */
const secondaryExtractionPass = (bill, normalizedText, fileName = '') => {
  if (!normalizedText || typeof normalizedText !== 'string') return bill;

  const missingCritical = [
    !bill.invoiceNumber && 'invoiceNumber',
    !bill.orderNumber && 'orderNumber',
    !bill.awbNumber && 'awbNumber',
    !bill.amount && 'amount',
  ].filter(Boolean);

  if (missingCritical.length === 0) return bill;

  console.log(`🔄 Secondary extraction pass for image. Missing: [${missingCritical.join(', ')}]`);

  // Re-run extraction on the normalized text
  const secondBill = extractSingleBill(normalizedText, fileName);

  // Fill in missing fields from secondary extraction
  for (const field of missingCritical) {
    if (secondBill[field] && !bill[field]) {
      bill[field] = secondBill[field];
      console.log(`   ✅ Recovered ${field}: ${secondBill[field]}`);
    }
  }

  // Also recover other fields that might have been missed
  const additionalFields = ['platform', 'gstNumber', 'customerName', 'sellerName', 'deliveryPartner', 'sku', 'billDate'];
  for (const field of additionalFields) {
    if (secondBill[field] && !bill[field]) {
      bill[field] = secondBill[field];
    }
  }

  // Recalculate confidence
  const confidence = calculateConfidence(bill);
  bill.extractionConfidence = confidence.scores;
  bill.confidence = confidence.average;

  return bill;
};

// Helper Qty
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

// Helper VendorName
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

const detectReturnBill = (text) => {
  return /(?:return\s*(?:invoice|bill|note|order)|credit\s*note|rto|reverse\s*pickup|customer\s*return|buyer\s*return|return\s*to\s*origin)/i.test(text);
};

// ════════════════════════════════════════════
// PHASE 5: INTELLIGENT GROUPING & MERGING ENGINE
// ════════════════════════════════════════════

const getFuzzyNameMatch = (name1, name2) => {
  if (!name1 || !name2) return false;
  const n1 = name1.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  const n2 = name2.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  if (n1 === n2 || n1.includes(n2) || n2.includes(n1)) return true;
  return false;
};

const getAddressSimilarity = (addr1, addr2) => {
  if (!addr1 || !addr2) return false;

  // 1. PIN code check
  const pin1 = addr1.match(/\b\d{6}\b/);
  const pin2 = addr2.match(/\b\d{6}\b/);
  if (pin1 && pin2 && pin1[0] === pin2[0]) {
    return true;
  }

  // 2. Word overlap check
  const w1 = addr1.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  const w2 = addr2.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  
  if (w1.length === 0 || w2.length === 0) return false;
  
  const set2 = new Set(w2);
  let overlap = 0;
  for (const w of w1) {
    if (set2.has(w)) overlap++;
  }

  const ratio = overlap / Math.min(w1.length, w2.length);
  return ratio >= 0.7;
};

/**
 * Merges two extracted page bills into a single unified record
 */
const mergePageBills = (b1, b2) => {
  const selectLonger = (s1, s2) => {
    if (!s1) return s2;
    if (!s2) return s1;
    return s1.length >= s2.length ? s1 : s2;
  };

  const selectLarger = (n1, n2) => {
    if (n1 == null) return n2;
    if (n2 == null) return n1;
    return n1 >= n2 ? n1 : n2;
  };

  const mergePaymentModes = (p1, p2) => {
    const combined = new Set([...(p1 || []), ...(p2 || [])]);
    return [...combined];
  };

  const merged = {
    ...b1,
    billType: b1.billType === 'return' || b2.billType === 'return' ? 'return' : 'regular',
    invoiceNumber: selectLonger(b1.invoiceNumber, b2.invoiceNumber),
    orderNumber: selectLonger(b1.orderNumber, b2.orderNumber),
    billDate: b1.billDate || b2.billDate,
    amount: selectLarger(b1.amount, b2.amount),
    vendorName: selectLonger(b1.vendorName, b2.vendorName),
    vendorDetails: selectLonger(b1.vendorDetails, b2.vendorDetails),
    supplierPlatform: b1.supplierPlatform || b2.supplierPlatform,
    platform: b1.platform && b1.platform !== 'other' ? b1.platform : b2.platform,
    awbNumber: selectLonger(b1.awbNumber, b2.awbNumber),
    deliveryPartner: selectLonger(b1.deliveryPartner, b2.deliveryPartner),
    paymentModes: mergePaymentModes(b1.paymentModes, b2.paymentModes),
    sku: selectLonger(b1.sku, b2.sku),
    qty: selectLarger(b1.qty, b2.qty),
    gstNumber: b1.gstNumber || b2.gstNumber,
    taxAmount: selectLarger(b1.taxAmount, b2.taxAmount),

    // Customer / Address info
    customerName: selectLonger(b1.customerName, b2.customerName),
    shippingAddress: selectLonger(b1.shippingAddress, b2.shippingAddress),
    billingAddress: selectLonger(b1.billingAddress, b2.billingAddress),
    sellerName: selectLonger(b1.sellerName, b2.sellerName),
    courierPartner: selectLonger(b1.courierPartner, b2.courierPartner),

    // Line items
    items: b1.items && b1.items.length > 0 ? b1.items : (b2.items || []),
    totalItems: selectLarger(b1.totalItems, b2.totalItems),
    totalQty: selectLarger(b1.totalQty, b2.totalQty),
  };

  // Re-run corrections
  return performCorrections(merged, merged.rawExtractedText || '');
};

/**
 * Split text by form-feed page markers, then further split by invoice headers.
 * Merge only pages that genuinely belong to the same bill (label + its invoice).
 * Anti-merge: pages with DIFFERENT order/invoice numbers are always separate.
 */
const extractBillData = (rawText, fileName = '') => {
  if (!rawText) return { bills: [], totalBills: 0 };

  // ── Step 1: Split by form-feed ──
  const rawPages = rawText.split(/\f/).map(s => s.trim()).filter(s => s.length > 15);
  
  if (rawPages.length === 0) {
    return { bills: [], totalBills: 0 };
  }

  // ── Step 2: Further split pages that contain multiple invoice headers ──
  // Amazon/GST PDFs sometimes produce pages where multiple invoices are concatenated
  const splitPages = [];
  const invoiceHeaderRegex = /(?:^|\n)\s*(?:Tax\s*Invoice|Bill\s*of\s*Supply|Cash\s*Memo|INVOICE|TAX\s*INVOICE|BILL\s*OF\s*SUPPLY).*?(?:\n|$)/i;
  
  for (const page of rawPages) {
    // Check if page contains multiple Amazon order numbers (xxx-xxxxxxx-xxxxxxx)
    const orderMatches = page.match(/\b\d{3}-\d{7}-\d{7}\b/g);
    const uniqueOrders = orderMatches ? [...new Set(orderMatches)] : [];
    
    if (uniqueOrders.length > 1) {
      // This page contains multiple distinct invoices — try to split them
      const parts = page.split(/(?=Tax\s*Invoice\/Bill\s*of\s*Supply|(?:^|\n)\s*Tax\s*Invoice\b)/i);
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.length > 15) splitPages.push(trimmed);
      }
    } else {
      splitPages.push(page);
    }
  }

  // ── Step 3: Extract data for each page individually ──
  const pageBills = splitPages.map((pageText) => {
    const extracted = extractSingleBill(pageText, fileName);
    extracted.rawExtractedText = pageText;
    return extracted;
  });

  // ── Step 4: Intelligent merging with anti-merge guards ──
  const mergedBills = [];

  for (const pageBill of pageBills) {
    let matchedIdx = -1;

    // Determine if this page is a "data-poor" label page
    const pageIsLabelOnly = !pageBill.amount && (!pageBill.items || pageBill.items.length === 0);

    for (let idx = mergedBills.length - 1; idx >= 0; idx--) {
      const existing = mergedBills[idx];
      let matches = false;
      const existingIsLabelOnly = !existing.amount && (!existing.items || existing.items.length === 0);

      // ── Anti-merge guard: DIFFERENT identifiers → NEVER merge ──
      // Skip the strict anti-merge guard if one of the pages is just a shipping label
      if (!pageIsLabelOnly && !existingIsLabelOnly) {
        if (existing.orderNumber && pageBill.orderNumber && existing.orderNumber !== pageBill.orderNumber) {
          continue;
        }
        if (existing.invoiceNumber && pageBill.invoiceNumber && existing.invoiceNumber !== pageBill.invoiceNumber) {
          continue;
        }
      }

      // Helper to do fuzzy alphanumeric matching for OCR errors (e.g., missing hyphens)
      const isFuzzyMatch = (s1, s2) => {
        if (!s1 || !s2) return false;
        const c1 = s1.replace(/[^a-z0-9]/gi, '');
        const c2 = s2.replace(/[^a-z0-9]/gi, '');
        return c1.length > 5 && c2.length > 5 && (c1.includes(c2) || c2.includes(c1));
      };

      // Priority 1: Match by Order Number
      if (existing.orderNumber && pageBill.orderNumber && isFuzzyMatch(existing.orderNumber, pageBill.orderNumber)) {
        matches = true;
      }
      // Priority 2: Match by Invoice Number
      else if (existing.invoiceNumber && pageBill.invoiceNumber && isFuzzyMatch(existing.invoiceNumber, pageBill.invoiceNumber)) {
        matches = true;
      }
      // Priority 3: Match by AWB Number
      else if (existing.awbNumber && pageBill.awbNumber && isFuzzyMatch(existing.awbNumber, pageBill.awbNumber)) {
        if (pageIsLabelOnly || existingIsLabelOnly) matches = true;
      }
      // Priority 4: Bidirectional Adjacent Merge for Labels
      else if (existingIsLabelOnly && existing.awbNumber && !pageBill.awbNumber && idx === mergedBills.length - 1) {
        matches = true; // Label came first, now the Invoice is being processed
      }
      else if (pageIsLabelOnly && pageBill.awbNumber && !existing.awbNumber && idx === mergedBills.length - 1) {
        matches = true; // Invoice came first, now the Label is being processed
      }
      // Priority 5: Completely empty page adjacent merge
      else if (pageIsLabelOnly && !pageBill.awbNumber && !pageBill.orderNumber && idx === mergedBills.length - 1) {
        matches = true;
      }

      if (matches) {
        matchedIdx = idx;
        break;
      }
    }

    if (matchedIdx !== -1) {
      // Merge pageBill into existing merged bill
      const merged = mergePageBills(mergedBills[matchedIdx], pageBill);
      merged.rawExtractedText += '\n\f\n' + pageBill.rawExtractedText;
      mergedBills[matchedIdx] = merged;
    } else {
      // Add as a new distinct bill
      mergedBills.push(pageBill);
    }
  }

  // ── Step 5: Filter out empty / useless records ──
  const validBills = mergedBills.filter(b => 
    b.invoiceNumber || b.orderNumber || b.awbNumber || b.amount || b.sku
  );

  const bills = validBills.length > 0 ? validBills : mergedBills;

  // ── Step 6: Add bill indices and recalculate confidence ──
  bills.forEach((b, idx) => {
    b.billIndex = idx + 1;
    const conf = calculateConfidence(b);
    b.extractionConfidence = conf.scores;
    b.confidence = conf.average;
  });

  return { bills, totalBills: bills.length };
};

const getEmptyResult = () => ({
  billType: 'regular', invoiceNumber: null, orderNumber: null,
  billDate: null, amount: null, vendorName: null, vendorDetails: null,
  supplierPlatform: null, platform: 'other', awbNumber: null, deliveryPartner: null,
  payment: null, paymentModes: [], deliveryType: 'PREPAID', sku: null, qty: 1, gstNumber: null, taxAmount: null,
  items: [], totalItems: 0, totalQty: 1, confidence: 0,
  returnDate: null, returnType: null, returnStatus: null,
  claimAmount: null, claimStatus: null,
  extractionConfidence: {}, rawExtractedText: '', billIndex: 1,
  processingTimeMs: 0,
});

module.exports = {
  extractBillData,
  splitIntoBills: (txt) => txt.split(/\f/).map(s => s.trim()).filter(s => s.length > 10),
  extractSingleBill,
  secondaryExtractionPass,
  detectPlatform,
  calculateConfidence,
};
