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

  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  let match = cleaned.match(/^(\d{1,2})[\-\/\.](\d{1,2})[\-\/\.](\d{4})$/);
  if (match) {
    const date = new Date(match[3], match[2] - 1, match[1]);
    if (isValidDate(date)) return date;
  }

  // YYYY-MM-DD
  match = cleaned.match(/^(\d{4})[\-\/\.](\d{1,2})[\-\/\.](\d{1,2})$/);
  if (match) {
    const date = new Date(match[1], match[2] - 1, match[3]);
    if (isValidDate(date)) return date;
  }

  // DD/MM/YY (2-digit year)
  match = cleaned.match(/^(\d{1,2})[\-\/\.](\d{1,2})[\-\/\.](\d{2})$/);
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
  // Remove all spaces and convert to uppercase
  const cleaned = gstStr.replace(/\s+/g, '').toUpperCase();
  // Standard 15-digit GSTIN pattern
  if (/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d][A-Z\d][A-Z\d]$/.test(cleaned)) {
    const stateCode = parseInt(cleaned.substring(0, 2));
    if (stateCode >= 1 && stateCode <= 37) return cleaned;
  }
  return null;
};

/** Clean vendor name */
const cleanVendorName = (name) => {
  if (!name) return null;
  let cleaned = name.trim().replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ')
    .replace(/[,.\-\s]+$/, '').replace(/^[,.\-\s]+/, '').trim();
  if (cleaned.length < 2 || /^\d+$/.test(cleaned)) return null;
  return cleaned.substring(0, 100);
};

/** Clean any ID field (invoice, order, AWB) */
const cleanIdField = (val) => {
  if (!val) return null;
  let cleaned = val.trim().replace(/[\r\n]+/g, '').replace(/\s+/g, '')
    .replace(/^[:\-\s]+/, '').replace(/[:\-\s]+$/, '');

  // Clean trailing noise words like Invoice, Date, Tax, Gst, etc.
  cleaned = cleaned.replace(/(?:invoice|date|tax|gst|billing|shipping).*$/i, '');
  cleaned = cleaned.replace(/[:\-\s]+$/, '');

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

module.exports = {
  parseDate, isValidDate, parseAmount, validateGST,
  cleanVendorName, cleanIdField, cleanSkuField, validateHSN, parseInteger,
};
