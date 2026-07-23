/**
 * ============================================
 * Validation Helper (v3) — Production
 * ============================================
 * Validates and cleans extracted bill fields
 *
 * v3 Upgrades:
 * - SKU cleaner that preserves spaces and special chars
 * - HSN validator
 * - Amount cross-validation
 */

/** Parse date string into a Date object */
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const cleaned = dateStr.trim();

  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY (supporting spaces/tabs as separators)
  let match = cleaned.match(/^(\d{1,2})[\-\/\.\s]+(\d{1,2})[\-\/\.\s]+(\d{4})$/);
  if (match) {
    const date = new Date(match[3], match[2] - 1, match[1]);
    if (isValidDate(date)) return date;
  }

  // DDMM/YYYY (missing first separator)
  match = cleaned.match(/^(\d{2})(\d{2})[\-\/\.\s]+(\d{4})$/);
  if (match) {
    const date = new Date(match[3], match[2] - 1, match[1]);
    if (isValidDate(date)) return date;
  }

  // DD/MMYYYY (missing second separator)
  match = cleaned.match(/^(\d{1,2})[\-\/\.\s]+(\d{2})(\d{4})$/);
  if (match) {
    const date = new Date(match[3], match[2] - 1, match[1]);
    if (isValidDate(date)) return date;
  }

  // YYYY-MM-DD
  match = cleaned.match(/^(\d{4})[\-\/\.\s]+(\d{1,2})[\-\/\.\s]+(\d{1,2})$/);
  if (match) {
    const date = new Date(match[1], match[2] - 1, match[3]);
    if (isValidDate(date)) return date;
  }

  // DD/MM/YY (2-digit year)
  match = cleaned.match(/^(\d{1,2})[\-\/\.\s]+(\d{1,2})[\-\/\.\s]+(\d{2})$/);
  if (match) {
    const year = parseInt(match[3]) > 50 ? `19${match[3]}` : `20${match[3]}`;
    const date = new Date(year, match[2] - 1, match[1]);
    if (isValidDate(date)) return date;
  }

  // Month name: "25 Jan 2024" or "January 25, 2024"
  const monthNames = {
    jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
    apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
    aug: 7, august: 7, sep: 8, september: 8, sept: 8,
    oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
  };

  match = cleaned.match(/^(\d{1,2})\s+([a-z]+)[\s,]+(\d{4})$/i);
  if (match) {
    const mi = monthNames[match[2].toLowerCase()];
    if (mi !== undefined) {
      const date = new Date(match[3], mi, match[1]);
      if (isValidDate(date)) return date;
    }
  }

  match = cleaned.match(/^([a-z]+)\s+(\d{1,2})[\s,]+(\d{4})$/i);
  if (match) {
    const mi = monthNames[match[1].toLowerCase()];
    if (mi !== undefined) {
      const date = new Date(match[3], mi, match[2]);
      if (isValidDate(date)) return date;
    }
  }

  // Fallback
  const nativeDate = new Date(cleaned);
  return isValidDate(nativeDate) ? nativeDate : null;
};

const isValidDate = (date) => date instanceof Date && !isNaN(date.getTime());

/** Parse amount string to number */
const parseAmount = (amountStr) => {
  if (!amountStr) return null;
  const cleaned = amountStr.replace(/[₹$€£¥]/g, '').replace(/Rs\.?/gi, '')
    .replace(/INR|USD/gi, '').replace(/,/g, '').replace(/\s/g, '').trim();
  const num = parseFloat(cleaned);
  if (isNaN(num) || num < 0 || num > 999999999) return null;
  return Math.round(num * 100) / 100;
};

/** Validate GST number */
const validateGST = (gstStr) => {
  if (!gstStr) return null;
  // Remove all spaces, trailing 'S' (OCR artifact), and convert to uppercase
  let cleaned = gstStr.replace(/\s+/g, '').toUpperCase();
  // Remove trailing 'S' that OCR sometimes appends (e.g. "24KLSPS0845E1ZNS")
  if (cleaned.length === 16 && cleaned.endsWith('S')) {
    cleaned = cleaned.slice(0, 15);
  }
  // Standard 15-digit GSTIN: 2 digits (state) + 5 alpha (PAN) + 4 digits + 1 alpha + 1 digit + 1 alphanumeric (check) + 1 alphanumeric
  if (/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]{2}$/.test(cleaned)) {
    const stateCode = parseInt(cleaned.substring(0, 2));
    if (stateCode >= 1 && stateCode <= 37) return cleaned;
  }
  return null;
};

/** Clean vendor name */
const cleanVendorName = (name) => {
  if (!name) return null;
  // Step 1: Truncate at first newline (prevents cross-field capture)
  let cleaned = name.split(/[\r\n]/)[0].trim();
  // Step 2: Truncate at common field labels that OCR may concatenate
  cleaned = cleaned.replace(/(?:Delivery|Tracking|AWB|Invoice|Order|Payment|GST|Date|Amount|Total|Bill|Tax|Shipping|Billing|Customer|Qty|Quantity|SKU)\s*(?:Partner|No|Number|ID|Mode|Name|Code|Type)?.*$/i, '').trim();
  // Step 3: Clean trailing punctuation
  cleaned = cleaned.replace(/\s+/g, ' ').replace(/[,.\-\s]+$/, '').replace(/^[,.\-\s]+/, '').trim();
  if (cleaned.length < 2 || /^\d+$/.test(cleaned)) return null;
  return cleaned.substring(0, 100);
};

/** Clean any ID field (invoice, order, AWB) */
const cleanIdField = (val) => {
  if (!val) return null;
  let cleaned = val.trim();

  // Step 1: Truncate at first newline — prevents cross-field capture from OCR text
  cleaned = cleaned.split(/[\r\n]/)[0].trim();

  // Step 2: Truncate at common field label boundaries that OCR may concatenate
  // e.g., "INV-001234Order Number:" → "INV-001234"
  cleaned = cleaned.replace(/(?:invoice|order|bill|date|tax|gst|billing|shipping|awb|tracking|payment|amount|total|qty|quantity|seller|vendor|customer|delivery|waybill|consignment|hsn|sku|item|product)\s*(?:no|number|id|#|name|mode|code|value|partner|type)?\.?\s*[:|\/\-].*/i, '').trim();

  // Step 3: Also truncate if a new field label keyword appears without a separator
  cleaned = cleaned.replace(/(?:Order|Invoice|Bill|Date|Tax|GST|Billing|Shipping|AWB|Tracking|Payment|Amount|Total|Qty|Quantity|Seller|Customer|Delivery|Vendor)(?:Number|No|ID|Name|Mode|Code|Date|Type).*/g, '').trim();

  // Step 4: Collapse remaining whitespace
  cleaned = cleaned.replace(/\s+/g, '').replace(/^[:\-\s]+/, '').replace(/[:\-\s]+$/, '');

  if (cleaned.length < 2) return null;
  return cleaned.substring(0, 60);
};

/**
 * Clean SKU field — preserves spaces, @, hyphens for multi-word SKUs
 * Very different from cleanIdField
 */
const cleanSkuField = (val) => {
  if (!val) return null;
  let cleaned = val.trim()
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[:\-\s|]+/, '')
    .replace(/[:\-\s|]+$/, '');

  // Remove trailing noise words
  const { SKU_NOISE_WORDS } = require('./regexPatterns');
  cleaned = cleaned.replace(SKU_NOISE_WORDS, '').trim();
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace(/^[\-\s@]+/, '').replace(/[\-\s@]+$/, '');

  if (cleaned.length < 2) return null;
  return cleaned.substring(0, 80);
};

/** Validate HSN code */
const validateHSN = (hsnStr) => {
  if (!hsnStr) return null;
  const cleaned = hsnStr.replace(/\s+/g, '').trim();
  if (/^\d{4,8}$/.test(cleaned)) return cleaned;
  return null;
};

/** Parse integer (for qty) */
const parseInteger = (val) => {
  if (!val) return null;
  const num = parseInt(val.toString().replace(/,/g, '').trim());
  if (isNaN(num) || num <= 0 || num > 99999) return null;
  return num;
};

/** Validate AWB tracking number (8-25 chars) */
const validateAWB = (awbStr) => {
  if (!awbStr) return null;
  const cleaned = awbStr.replace(/[\s\-\#\.\:]+/g, '').trim();
  if (cleaned.length >= 8 && cleaned.length <= 25) {
    return cleaned;
  }
  return null;
};

/** Convert number in words (English / Indian format) to integer */
const wordsToNumber = (str) => {
  if (!str || typeof str !== 'string') return null;

  const cleaned = str.toLowerCase()
    .replace(/rupees|rupee|only|inr|rs\.?|and|payable/g, ' ')
    .replace(/[\-\,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return null;

  const units = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
    ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
    seventeen: 17, eighteen: 18, nineteen: 19
  };

  const tens = {
    twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90
  };

  const words = cleaned.split(' ');
  let total = 0;
  let currentGroup = 0;
  let wordFound = false;

  for (const word of words) {
    if (!word) continue;
    if (units[word] !== undefined) {
      currentGroup += units[word];
      wordFound = true;
    } else if (tens[word] !== undefined) {
      currentGroup += tens[word];
      wordFound = true;
    } else if (/^hund/i.test(word)) {
      currentGroup = (currentGroup || 1) * 100;
      wordFound = true;
    } else if (/^thous|^thou/i.test(word)) {
      currentGroup = (currentGroup || 1) * 1000;
      total += currentGroup;
      currentGroup = 0;
      wordFound = true;
    } else if (/^lakh|^lac/i.test(word)) {
      currentGroup = (currentGroup || 1) * 100000;
      total += currentGroup;
      currentGroup = 0;
      wordFound = true;
    } else if (/^crore|^cror/i.test(word)) {
      currentGroup = (currentGroup || 1) * 10000000;
      total += currentGroup;
      currentGroup = 0;
      wordFound = true;
    } else if (/^mill/i.test(word)) {
      currentGroup = (currentGroup || 1) * 1000000;
      total += currentGroup;
      currentGroup = 0;
      wordFound = true;
    }
  }

  total += currentGroup;
  return wordFound && total > 0 ? total : null;
};

module.exports = {
  parseDate, isValidDate, parseAmount, validateGST,
  cleanVendorName, cleanIdField, cleanSkuField, validateHSN, parseInteger,
  validateAWB, wordsToNumber,
};

