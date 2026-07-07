/**
 * ============================================
 * Image OCR Text Normalizer (v1) - Image-Only
 * ============================================
 * Corrects common OCR misreads that occur when
 * processing image-based invoices (JPG, PNG, etc.)
 *
 * ⚠️ This module is NEVER applied to PDF-extracted text.
 * It is called ONLY from the image processing pipeline.
 */

// ── Common OCR Character Substitution Map ──
// These are the most frequent Tesseract misreads on invoice images
const OCR_CHAR_CORRECTIONS = [
  // Platform names
  { pattern: /\bamaz[o0][n]?\b/gi, replacement: 'Amazon' },
  { pattern: /\bama[z2][o0]n\b/gi, replacement: 'Amazon' },
  { pattern: /\bamaz[o0]n\b/gi, replacement: 'Amazon' },
  { pattern: /\bAma[z2][o0]n\b/g, replacement: 'Amazon' },
  { pattern: /\bAMAZ[O0]N\b/g, replacement: 'AMAZON' },
  { pattern: /\b[fF][lI1][i1I][pP][kK][aA][rR][tT]\b/g, replacement: 'Flipkart' },
  { pattern: /\bfl[i1]pkart\b/gi, replacement: 'Flipkart' },
  { pattern: /\bflipcart\b/gi, replacement: 'Flipkart' },
  { pattern: /\bfl[i1I]pkart\b/gi, replacement: 'Flipkart' },
  { pattern: /\bFLIPKART\b/g, replacement: 'FLIPKART' },
  { pattern: /\bFI[iI1]pkart\b/g, replacement: 'Flipkart' },
  { pattern: /\bmeesh[o0]\b/gi, replacement: 'Meesho' },
  { pattern: /\bmyntr[a@]\b/gi, replacement: 'Myntra' },

  // Document keywords
  { pattern: /\b[iI1]nv[o0][iI1]ce\b/g, replacement: 'Invoice' },
  { pattern: /\bINV[O0][I1]CE\b/g, replacement: 'INVOICE' },
  { pattern: /\b[o0]rder\b/gi, replacement: 'Order' },
  { pattern: /\b0rder\b/gi, replacement: 'Order' },
  { pattern: /\bTax [iI1]nv[o0][iI1]ce\b/gi, replacement: 'Tax Invoice' },
  { pattern: /\bTAX [iI1]NV[O0][iI1]CE\b/g, replacement: 'TAX INVOICE' },

  // Shipping / AWB keywords
  { pattern: /\bAW[B8]\b/g, replacement: 'AWB' },
  { pattern: /\baw[b8]\b/gi, replacement: 'AWB' },
  { pattern: /\bTrack[i1I]ng\b/gi, replacement: 'Tracking' },
  { pattern: /\btrack[i1I]ng\b/gi, replacement: 'Tracking' },
  { pattern: /\bWayb[i1I]ll\b/gi, replacement: 'Waybill' },
  { pattern: /\bwaybill\b/gi, replacement: 'Waybill' },
  { pattern: /\bDe[lI1][iI1]very\b/gi, replacement: 'Delivery' },
  { pattern: /\bde[lI1][iI1]very\b/gi, replacement: 'Delivery' },
  { pattern: /\bSh[i1I]pment\b/gi, replacement: 'Shipment' },
  { pattern: /\bCons[i1I]gnment\b/gi, replacement: 'Consignment' },

  // Tax / GST keywords
  { pattern: /\bGST[lI1]N\b/gi, replacement: 'GSTIN' },
  { pattern: /\bGST[i1I]N\b/g, replacement: 'GSTIN' },
  { pattern: /\bgst[i1I]n\b/gi, replacement: 'GSTIN' },
  { pattern: /\b[cC][gG][sS5][tT]\b/g, replacement: 'CGST' },
  { pattern: /\b[sS5][gG][sS5][tT]\b/g, replacement: 'SGST' },
  { pattern: /\b[iI1][gG][sS5][tT]\b/g, replacement: 'IGST' },
  { pattern: /\bH[sS5]N\b/g, replacement: 'HSN' },

  // Payment keywords
  { pattern: /\bPaym[e3]nt\b/gi, replacement: 'Payment' },
  { pattern: /\bPr[e3]pa[i1I]d\b/gi, replacement: 'Prepaid' },
  { pattern: /\bC[o0]D\b/g, replacement: 'COD' },
  { pattern: /\bcash\s*[o0]n\s*de[lI1][iI1]very\b/gi, replacement: 'Cash on Delivery' },

  // Courier partner names
  { pattern: /\bDe[lI1]h[i1I]very\b/gi, replacement: 'Delhivery' },
  { pattern: /\bde[lI1]h[i1I]very\b/gi, replacement: 'Delhivery' },
  { pattern: /\b[eE][kK][aA][rR][tT]\b/g, replacement: 'Ekart' },
  { pattern: /\bB[lI1]ue\s*[dD]art\b/gi, replacement: 'BlueDart' },
  { pattern: /\bXpress[bB]ees\b/gi, replacement: 'Xpressbees' },
  { pattern: /\bxpress[bB]ees\b/gi, replacement: 'Xpressbees' },
  { pattern: /\bEc[o0]m\s*Express\b/gi, replacement: 'Ecom Express' },

  // Quantity / Amount keywords
  { pattern: /\bQu[a@]nt[i1I]ty\b/gi, replacement: 'Quantity' },
  { pattern: /\bT[o0]ta[lI1]\b/gi, replacement: 'Total' },
  { pattern: /\bAm[o0]unt\b/gi, replacement: 'Amount' },
  { pattern: /\bSub[tT][o0]ta[lI1]\b/gi, replacement: 'Subtotal' },

  // Seller / Customer
  { pattern: /\bSe[lI1][lI1]er\b/gi, replacement: 'Seller' },
  { pattern: /\bCust[o0]mer\b/gi, replacement: 'Customer' },
  { pattern: /\bS[o0][lI1]d\s*[bB]y\b/gi, replacement: 'Sold by' },
  { pattern: /\bSh[i1I]p\s*[tT][o0]\b/gi, replacement: 'Ship to' },
  { pattern: /\b[bB][i1I][lI1][lI1]\s*[tT][o0]\b/g, replacement: 'Bill to' },

  // Amazon AWB prefix corrections (AT5 → ATS, etc.)
  { pattern: /\bAT5(\d{10,12})\b/g, replacement: 'ATS$1' },
  { pattern: /\bAIS(\d{10,12})\b/g, replacement: 'ATS$1' },
  { pattern: /\bAJ5(\d{10,12})\b/g, replacement: 'ATS$1' },

  // Flipkart Order ID prefix corrections (0D → OD, QD → OD)
  { pattern: /\b0D(\d{18})\b/g, replacement: 'OD$1' },
  { pattern: /\bQD(\d{18})\b/g, replacement: 'OD$1' },
  { pattern: /\bQ0(\d{18})\b/g, replacement: 'OD$1' },
  { pattern: /\bO0(\d{18})\b/g, replacement: 'OD$1' },
];

/**
 * Normalize OCR text from image-based extraction.
 * Corrects common Tesseract misreads before passing to platform detection / regex extraction.
 *
 * @param {string} text - Raw OCR text from an image
 * @returns {string} - Normalized text
 */
const normalizeImageOcrText = (text) => {
  if (!text || typeof text !== 'string') return text || '';

  let normalized = text;

  for (const { pattern, replacement } of OCR_CHAR_CORRECTIONS) {
    normalized = normalized.replace(pattern, replacement);
  }

  // ── Fix broken number sequences (OCR sometimes inserts spaces in numeric IDs) ──
  // Amazon order: "123 - 1234567 - 1234567" → "123-1234567-1234567"
  normalized = normalized.replace(/(\d{3})\s*[-–—]\s*(\d{7})\s*[-–—]\s*(\d{7})/g, '$1-$2-$3');

  // Fix broken AWB numbers with spaces: "ATS 1234 5678 9012" → "ATS123456789012"
  normalized = normalized.replace(/\b(ATS|FMPC|FMPP|EKRT)\s+(\d[\d\s]{8,18})\b/gi, (match, prefix, digits) => {
    return prefix.toUpperCase() + digits.replace(/\s/g, '');
  });

  // Fix broken Flipkart Order IDs with OCR spaces: "OD 1234 5678 9012 3456 78" → "OD123456789012345678"
  normalized = normalized.replace(/\b(OD)\s+(\d[\d\s]{15,22})\b/gi, (match, prefix, digits) => {
    return prefix.toUpperCase() + digits.replace(/\s/g, '');
  });

  // Fix broken GSTIN with OCR spaces: "24 KLSPS 0845 E1 ZN" → "24KLSPS0845E1ZN"
  normalized = normalized.replace(/\b(\d{2})\s*([A-Z]{5})\s*(\d{4})\s*([A-Z])\s*(\d)\s*([A-Z\d]{2})\b/g, '$1$2$3$4$5$6');

  // ── Fix OCR line-break artifacts inside field values ──
  // "Invoice\nNumber: INV123" → "Invoice Number: INV123"
  normalized = normalized.replace(/(Invoice|Order|AWB|Tracking|Payment|GST|Seller|Customer)\n\s*(Number|No|ID|Mode|Name|Date)/gi, '$1 $2');

  // ── Fix garbled separators ──
  // OCR often produces stray pipes, tildes instead of colons
  normalized = normalized.replace(/(Invoice\s*(?:No|Number|#|ID))\s*[|~]/gi, '$1:');
  normalized = normalized.replace(/(Order\s*(?:No|Number|#|ID))\s*[|~]/gi, '$1:');
  normalized = normalized.replace(/(AWB\s*(?:No|Number)?)\s*[|~]/gi, '$1:');
  normalized = normalized.replace(/(GSTIN)\s*[|~]/gi, '$1:');

  // ── Fix garbled currency symbols ──
  normalized = normalized.replace(/[Zz](\d+[.,]\d{2})/g, '₹$1');
  normalized = normalized.replace(/Rs[.,]?\s*/gi, 'Rs. ');

  // ── Collapse excessive whitespace/empty lines (common in OCR) ──
  normalized = normalized.replace(/[ \t]{3,}/g, '  '); // Collapse 3+ spaces to 2
  normalized = normalized.replace(/\n{4,}/g, '\n\n\n'); // Collapse 4+ newlines to 3

  return normalized;
};

/**
 * Compute a quality score for an image OCR result to help determine
 * if secondary extraction or additional passes are needed.
 *
 * @param {string} text - Normalized OCR text
 * @returns {{score: number, missingFields: string[]}}
 */
const assessExtractionQuality = (text) => {
  if (!text) return { score: 0, missingFields: ['all'] };

  const lower = text.toLowerCase();
  const checks = {
    hasInvoice: /invoice|inv\s*(?:no|number|#)/i.test(lower),
    hasOrder: /order\s*(?:no|number|id|#)|\b\d{3}-\d{7}-\d{7}\b|\bOD\d{18}\b/i.test(text),
    hasAWB: /awb|tracking|waybill|consignment|\bATS\d{10,12}\b|\bFM[A-Z]{2}\d{8,14}\b/i.test(text),
    hasAmount: /total|amount|payable|grand\s*total|₹|rs\./i.test(lower),
    hasPlatform: /amazon|flipkart|meesho|myntra|ajio/i.test(lower),
    hasGST: /gstin|gst\s*no|gst\s*number|\b\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]{2}\b/i.test(text),
    hasDate: /date|dated/i.test(lower),
    hasPayment: /payment|prepaid|cod|cash on delivery|upi|card/i.test(lower),
  };

  const missingFields = [];
  if (!checks.hasInvoice) missingFields.push('invoiceNumber');
  if (!checks.hasOrder) missingFields.push('orderNumber');
  if (!checks.hasAWB) missingFields.push('awbNumber');
  if (!checks.hasAmount) missingFields.push('amount');
  if (!checks.hasPlatform) missingFields.push('platform');

  const found = Object.values(checks).filter(Boolean).length;
  const score = Math.round((found / Object.keys(checks).length) * 100);

  return { score, missingFields };
};

module.exports = {
  normalizeImageOcrText,
  assessExtractionQuality,
  OCR_CHAR_CORRECTIONS,
};
