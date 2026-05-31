/**
 * ============================================
 * Regex Patterns Helper (v3) — Production
 * ============================================
 * E-commerce bill extraction patterns
 * Supports: Amazon, Flipkart, Meesho, etc.
 * 
 * v3 Upgrades:
 * - Expanded SKU patterns for multi-word, @, spaces
 * - HSN code extraction
 * - Multi-item row parsing
 * - Taxable value patterns
 */

// ── Invoice / Bill Number ──
const INVOICE_NUMBER_PATTERNS = [
  /(?:invoice\s*(?:no|number|#|num|id)\.?\s*[:\-]?\s*)([A-Z0-9][A-Z0-9\-\/]{2,40})/i,
  /(?:bill\s*(?:no|number|#|num)\.?\s*[:\-]?\s*)([A-Z0-9][A-Z0-9\-\/]{2,40})/i,
  /(?:inv\s*(?:no|number|#)\.?\s*[:\-]?\s*)([A-Z0-9][A-Z0-9\-\/]{2,40})/i,
  /(?:tax\s*invoice\s*(?:no|number|#)?\.?\s*[:\-]?\s*)([A-Z0-9][A-Z0-9\-\/]{2,40})/i,
  /(?:receipt\s*(?:no|number|#)\.?\s*[:\-]?\s*)([A-Z0-9][A-Z0-9\-\/]{2,40})/i,
  /(?:credit\s*note\s*(?:no|number|#)?\.?\s*[:\-]?\s*)([A-Z0-9][A-Z0-9\-\/]{2,40})/i,
  /\b(INV[\-\/]?\d{4,}[\-\/]?\d{0,6})\b/i,
];

// ── Order Number ──
const ORDER_NUMBER_PATTERNS = [
  // Amazon order pattern: 123-1234567-1234567
  /\b(\d{3}-\d{7}-\d{7})\b/,
  // Flipkart order pattern: OD followed by 18 digits
  /\b(OD\d{18})\b/i,
  // Meesho order pattern
  /(?:meesho\s*order\s*(?:id)?\s*[:\-]?\s*)(\d{6,20})/i,
  // General e-commerce order patterns
  /(?:order\s*(?:no|number|#|id)\.?\s*[:\-]?\s*)([A-Z0-9\-]{8,40})/i,
  /(?:order\s*id\s*[:\-]?\s*)([A-Z0-9\-]{8,40})/i,
  /(?:po\s*(?:no|number|#)\.?\s*[:\-]?\s*)([A-Z0-9\-]{8,40})/i,
  /(?:purchase\s*order\s*(?:no|number)?\.?\s*[:\-]?\s*)([A-Z0-9\-]{8,40})/i,
  /(?:sub[\s\-]?order\s*(?:no|id)?\s*[:\-]?\s*)([A-Z0-9\-]{8,40})/i,
];

// ── Date Patterns ──
const DATE_PATTERNS = [
  /(?:(?:invoice|bill|billing|order|receipt|ship)\s*date\s*[:\-]?\s*)([\d]{1,2}[\-\/\.][\d]{1,2}[\-\/\.][\d]{2,4})/i,
  /(?:date\s*[:\-]?\s*)([\d]{1,2}[\-\/\.][\d]{1,2}[\-\/\.][\d]{2,4})/i,
  /(?:date\s*[:\-]?\s*)([\d]{4}[\-\/\.][\d]{1,2}[\-\/\.][\d]{1,2})/i,
  /(?:dated?\s*[:\-]?\s*)([\d]{1,2}\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,]*\d{2,4})/i,
  /(?:date\s*[:\-]?\s*)((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,]*\d{1,2}[\s,]*\d{2,4})/i,
  /\b(\d{1,2}[\-\/\.]\d{1,2}[\-\/\.]\d{4})\b/,
  /\b(\d{4}[\-\/\.]\d{1,2}[\-\/\.]\d{1,2})\b/,
  /\b(\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)[\s,]+\d{4})\b/i,
];

// ── Amount / Total ──
const AMOUNT_PATTERNS = [
  /(?:grand\s*total|net\s*(?:payable|amount|value)|amount\s*payable|total\s*payable|balance\s*due|amount\s*due|invoice\s*value|total\s*payable\s*amount)\s*[:\-]?\s*(?:(?:Rs\.?|INR|₹|\$|USD)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:total\s*(?:amount|value)?)\s*[:\-]?\s*(?:(?:Rs\.?|INR|₹|\$|USD)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:bill\s*(?:total|amount))\s*[:\-]?\s*(?:(?:Rs\.?|INR|₹|\$|USD)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:invoice\s*(?:total|amount|value))\s*[:\-]?\s*(?:(?:Rs\.?|INR|₹|\$|USD)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:amount\s*received)\s*[:\-]?\s*(?:(?:Rs\.?|INR|₹|\$|USD)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:sub[\s\-]?total)\s*[:\-]?\s*(?:(?:Rs\.?|INR|₹|\$|USD)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:final\s*(?:total|amount))\s*[:\-]?\s*(?:(?:Rs\.?|INR|₹|\$|USD)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:order\s*(?:total|amount|value))\s*[:\-]?\s*(?:(?:Rs\.?|INR|₹|\$|USD)\s*)?([0-9,]+\.?\d{0,2})/i,
];

// ── AWB / Tracking Number ──
const AWB_PATTERNS = [
  // Labeled AWB patterns
  /(?:awb\s*(?:no|number|#)?\.?\s*[:\-]?\s*)([A-Z0-9]{6,30})/i,
  /(?:tracking\s*(?:no|number|#|id)?\.?\s*[:\-]?\s*)([A-Z0-9]{6,30})/i,
  /(?:waybill\s*(?:no|number|#)?\.?\s*[:\-]?\s*)([A-Z0-9]{6,30})/i,
  /(?:shipment\s*(?:no|number|#|id)?\.?\s*[:\-]?\s*)([A-Z0-9]{6,30})/i,
  /(?:consignment\s*(?:no|number|#)?\.?\s*[:\-]?\s*)([A-Z0-9]{6,30})/i,
  /(?:lr\s*(?:no|number|#)?\.?\s*[:\-]?\s*)([A-Z0-9]{6,30})/i,

  // Flipkart E-kart AWB: FMPC/FMPP followed by digits
  /\b(FM[A-Z]{2}\d{8,14})\b/i,

  // Meesho / Xpressbees / Delhivery — bare long tracking number (12-18 digits)
  // near delivery partner mentions
  /(?:xpress\s*bees|delhivery|ecom\s*express|blue\s*dart|ekart|e[\-\s]?kart|shadowfax|dtdc)[\s\S]{0,80}?\b(\d{12,18})\b/i,
  /\b(\d{12,18})\b[\s\S]{0,80}?(?:xpress\s*bees|delhivery|ecom\s*express|blue\s*dart|ekart|e[\-\s]?kart|shadowfax|dtdc)/i,

  // Bare tracking number on its own line (12+ digits, not phone/order)
  /(?:^|\n)\s*(\d{12,18})\s*(?:\n|$)/m,
];

// ── Delivery Partner Detection ──
const DELIVERY_PARTNERS = [
  { pattern: /\b(?:delhivery)\b/i, name: 'Delhivery' },
  { pattern: /\b(?:ecom\s*express)\b/i, name: 'Ecom Express' },
  { pattern: /\b(?:blue\s*dart|bluedart)\b/i, name: 'BlueDart' },
  { pattern: /\b(?:dtdc)\b/i, name: 'DTDC' },
  { pattern: /\b(?:xpress\s*bees|xpressbees)\b/i, name: 'Xpressbees' },
  { pattern: /\b(?:shadowfax)\b/i, name: 'Shadowfax' },
  { pattern: /\b(?:india\s*post|speed\s*post)\b/i, name: 'India Post' },
  { pattern: /\b(?:ekart|e[\-\s]?kart)\b/i, name: 'Ekart' },
  { pattern: /\b(?:fedex|fed\s*ex)\b/i, name: 'FedEx' },
  { pattern: /\b(?:aramex)\b/i, name: 'Aramex' },
  { pattern: /\b(?:gati)\b/i, name: 'Gati' },
  { pattern: /\b(?:professional\s*couriers)\b/i, name: 'Professional Couriers' },
  { pattern: /\b(?:amazon\s*(?:shipping|transportation|logistics))\b/i, name: 'Amazon Shipping' },
  { pattern: /\b(?:valmo)\b/i, name: 'Valmo' },
  { pattern: /\b(?:rivigo)\b/i, name: 'Rivigo' },
  { pattern: /\b(?:movin)\b/i, name: 'Movin' },
  { pattern: /\b(?:smartr)\b/i, name: 'Smartr' },
];

// ── Supplier Platform Detection ──
const SUPPLIER_PLATFORMS = [
  { pattern: /\b(?:meesho|meeshoo|meeshu|mehsso|meesh|fashnear|fash\s*near)\b/i, name: 'meesho' },
  { pattern: /\b(?:amazon|amazon\.in|amazon\.com|amzn)\b/i, name: 'amazon' },
  { pattern: /\b(?:flipkart|flipkart\.com|fk\b)/i, name: 'flipkart' },
  { pattern: /\b(?:myntra|myntra\.com)\b/i, name: 'myntra' },
  { pattern: /\b(?:snapdeal|snapdeal\.com)\b/i, name: 'snapdeal' },
  { pattern: /\b(?:jiomart|jio\s*mart)\b/i, name: 'jiomart' },
  { pattern: /\b(?:ajio|ajio\.com)\b/i, name: 'ajio' },
];

// ── Payment Mode ──
const PAYMENT_PATTERNS = [
  /(?:payment\s*(?:mode|method|type|status)?\.?\s*[:\-]?\s*)(COD|Cash\s*on\s*Delivery|Prepaid|Online|UPI|NEFT|IMPS|Card|Debit\s*Card|Credit\s*Card|Net\s*Banking|Wallet|PayTM|PhonePe|GPay|Razorpay)/i,
  /(?:mode\s*of\s*payment\s*[:\-]?\s*)(COD|Prepaid|Online|Cash|UPI|Card)/i,
  /\b(COD|Cash\s*on\s*Delivery)\b/i,
  /\b(Prepaid)\b/i,
];

// ════════════════════════════════════════════
// SKU PATTERNS (v3) — DRAMATICALLY IMPROVED
// ════════════════════════════════════════════
// Supports:
//   PARI-03 MAROON, RJ-04 @ GREEN, RAJA RANI-YELLOW
//   RJ-03 MAROON, SKU with spaces, @, hyphens, underscores
//   ASIN (Amazon), FSN (Flipkart)

const SKU_PATTERNS = [
  // === PRIORITY 1: Meesho — "SKU: PARI-03 MAROON" ===
  /(?:sku\s*[:\-]\s*)([A-Za-z][A-Za-z0-9\-]+\s*@?\s*[A-Z]+)\s*$/im,
  /(?:sku\s*[:\-]\s*)([A-Za-z][A-Za-z0-9\-]+(?:\s+[A-Z]+)?)\s*$/im,

  // === PRIORITY 2: Amazon ASIN inside parentheses — "| B08MLHZ86G ( LUNCH-BOX )" ===
  /\|\s*([A-Z0-9]{10})\s*\(/,
  /\b([A-Z0-9]{10})\s*\(\s*([A-Za-z][A-Za-z0-9\-_ ]{2,30})\s*\)/,

  // === PRIORITY 3: Amazon — extract SKU code from inside parentheses "( LUNCH-BOX )" ===
  /\(\s*([A-Za-z][A-Za-z0-9\-_]{2,30})\s*\)/,

  // === PRIORITY 4: Flipkart — "SKU ID | Description" then pipe row "PRINT - GAJRI | vendor" ===
  /(?:sku\s*id\s*\|\s*description)\s*(?:qty)?\s*\n\s*\d*\s*([A-Za-z][A-Za-z0-9\-_ ]{2,50})\s*\|/im,
  // Flipkart pipe row: "1PRINT - GAJRI | RJTAJ FAB..." (digit then SKU then pipe)
  /\d([A-Z][A-Z\-_ ]{2,40})\s*\|\s*[A-Z]/,

  // === PRIORITY 5: Explicit SKU label with multi-word value ===
  /(?:sku\s*(?:no|number|#|id|code)?\.?\s*[:\-|]\s*)([A-Za-z0-9][A-Za-z0-9\-_@ ]{2,60}?)(?:\s*(?:\n|\||qty|quantity|hsn|price|rate|amount|size|tax|igst|cgst|sgst|total|rs|inr|₹|\d{4,}))/i,
  /(?:sku\s*(?:no|number|#|id|code)?\.?\s*[:\-|]\s*)([A-Za-z][A-Za-z0-9\-_@ ]{2,50})\s*$/im,

  // === PRIORITY 6: ASIN with label ===
  /(?:asin\s*[:\-]?\s*)([A-Z0-9]{10})/i,

  // === PRIORITY 7: FSN (Flipkart) ===
  /(?:fsn\s*[:\-]?\s*)([A-Z0-9]{10,20})/i,

  // === PRIORITY 8: Seller/Merchant SKU ===
  /(?:seller\s*sku\s*(?:id)?\.?\s*[:\-|]\s*)([A-Za-z0-9][A-Za-z0-9\-_@ ]{2,50})/i,
  /(?:merchant\s*sku\s*[:\-|]\s*)([A-Za-z0-9][A-Za-z0-9\-_@ ]{2,50})/i,

  // === PRIORITY 9: Product/Item code label ===
  /(?:product\s*(?:code|id|sku)?\.?\s*[:\-|]\s*)([A-Za-z0-9][A-Za-z0-9\-_@ ]{2,60}?)(?:\s*(?:\n|\||qty|quantity|hsn|price|rate|amount|size|tax))/i,

  // === PRIORITY 10: Fallback — bare SKU label ===
  /(?:sku\s*[:\-]?\s*)([A-Z0-9][A-Z0-9\-_]{2,30})/i,
];

// ── SKU cleaning patterns (what to strip from extracted SKU) ──
const SKU_NOISE_WORDS = /\b(qty|quantity|hsn|price|rate|tax|igst|cgst|sgst|total|amount|rs|inr|invoice|date|bill|size|color|colour|free\s*size|pcs|pieces|unit|description|product|item)\b/gi;

// ── Quantity ──
const QTY_PATTERNS = [
  // Amazon specific: "1 of:" or "2 of:"
  /\b(\d{1,3})\s+of\s*:/i,
  // Generic: Qty: 1, Quantity: 1, Qty - 1, Ordered: 1
  /(?:qty|quantity|ordered)\.?\s*[:\-]?\s*(\d{1,4})\b/i,
  /(?:qty|quantity)\s+(\d{1,4})\b/i,
  /(?:total\s*(?:qty|quantity|items|units))\s*[:\-]?\s*(\d{1,4})/i,
  /(?:no\.?\s*of\s*(?:items|units|pcs|pieces))\s*[:\-]?\s*(\d{1,4})/i,
  /(?:pcs|pieces)\s*[:\-]?\s*(\d{1,4})/i,
];

// ── HSN Code ──
const HSN_PATTERNS = [
  /(?:hsn\s*(?:code|no|number|#)?\.?\s*[:\-|]?\s*)(\d{4,8})/i,
  /(?:hsn\/sac\s*(?:code)?\.?\s*[:\-|]?\s*)(\d{4,8})/i,
  /(?:sac\s*(?:code|no)?\.?\s*[:\-|]?\s*)(\d{4,8})/i,
];

// ── GST Number ──
const GST_NUMBER_PATTERNS = [
  /(?:gst(?:in)?|gst\s*(?:registration)?\s*(?:no|number|#|reg)?)\s*[:\-.]?\s*(\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]{2})/i,
  /(?:gst|gstin)\s*[:\-.]?\s*(\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]{2})/i,
  /\b(\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]{2})\b/,
];

// ── Tax Amount ──
const TAX_AMOUNT_PATTERNS = [
  /(?:total\s*tax|tax\s*total|tax\s*amount)\s*[:\-]?\s*(?:(?:Rs\.?|INR|₹|\$)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:gst\s*(?:amount)?)\s*[:\-]?\s*(?:(?:Rs\.?|INR|₹|\$)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:cgst)\s*(?:@?\s*\d+%?)?\s*[:\-]?\s*(?:(?:Rs\.?|INR|₹|\$)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:sgst)\s*(?:@?\s*\d+%?)?\s*[:\-]?\s*(?:(?:Rs\.?|INR|₹|\$)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:igst)\s*(?:@?\s*\d+%?)?\s*[:\-]?\s*(?:(?:Rs\.?|INR|₹|\$)\s*)?([0-9,]+\.?\d{0,2})/i,
];

// ── Taxable Value (per-item) ──
const TAXABLE_VALUE_PATTERNS = [
  /(?:taxable\s*(?:value|amount|amt))\s*[:\-]?\s*(?:(?:Rs\.?|INR|₹|\$)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:assessable\s*(?:value|amount))\s*[:\-]?\s*(?:(?:Rs\.?|INR|₹|\$)\s*)?([0-9,]+\.?\d{0,2})/i,
];

// ── Vendor Name ──
const VENDOR_NAME_PATTERNS = [
  /(?:vendor|seller|company|firm|merchant|supplier|sold\s*by|shipped?\s*by|from|billed?\s*by)\s*(?:name)?\s*[:\-]?\s*([A-Za-z][A-Za-z\s&\.\,\-]{2,60})/i,
  /(?:M\/s\.?\s*)([A-Za-z][A-Za-z\s&\.\,\-]{2,60})/,
];

// ── Return Bill Patterns ──
const RETURN_TYPE_PATTERNS = [
  /(?:return\s*(?:type|reason|category)\s*[:\-]?\s*)(.{3,60})/i,
  /\b(RTO|Return\s*to\s*Origin|Customer\s*Return|Buyer\s*Return|Reverse\s*Pickup|Quality\s*Check\s*Fail|QC\s*Fail|Damaged|Wrong\s*Product|Size\s*Issue)\b/i,
];

const RETURN_STATUS_PATTERNS = [
  /(?:return\s*(?:status)\s*[:\-]?\s*)(Success|Failed|Pending|Completed|In\s*Transit|Delivered|Rejected)/i,
  /\b(Return\s*(?:Successful|Completed|Delivered|Received))\b/i,
  /\b(Return\s*(?:Failed|Rejected|Lost|Damaged))\b/i,
];

const CLAIM_PATTERNS = [
  /(?:claim\s*(?:amount|value)?\s*[:\-]?\s*(?:(?:Rs\.?|INR|₹|\$)\s*)?)([0-9,]+\.?\d{0,2})/i,
  /(?:compensation\s*(?:amount)?\s*[:\-]?\s*(?:(?:Rs\.?|INR|₹|\$)\s*)?)([0-9,]+\.?\d{0,2})/i,
  /(?:refund\s*(?:amount)?\s*[:\-]?\s*(?:(?:Rs\.?|INR|₹|\$)\s*)?)([0-9,]+\.?\d{0,2})/i,
];

const RETURN_DATE_PATTERNS = [
  /(?:return\s*date\s*[:\-]?\s*)([\d]{1,2}[\-\/\.][\d]{1,2}[\-\/\.][\d]{2,4})/i,
  /(?:rto\s*date\s*[:\-]?\s*)([\d]{1,2}[\-\/\.][\d]{1,2}[\-\/\.][\d]{2,4})/i,
  /(?:reverse\s*(?:pickup)?\s*date\s*[:\-]?\s*)([\d]{1,2}[\-\/\.][\d]{1,2}[\-\/\.][\d]{2,4})/i,
];

// ══════════════════════════════════════════════
// MULTI-ITEM TABLE ROW PATTERNS
// ══════════════════════════════════════════════
// These detect tabular item rows in invoices

// Pattern: Sr | Description/SKU | HSN | Qty | Rate | Taxable | Tax | Total
// Flexible enough for Meesho, Flipkart, Amazon formats
const ITEM_TABLE_PATTERNS = {
  // Detects table header to know where items start
  headerPatterns: [
    /(?:sr\.?\s*(?:no)?|s\.?\s*no|#)\s*[\|]?\s*(?:description|product|item|particular|sku)/i,
    /(?:description|product\s*name|item|sku)\s*[\|]?\s*(?:hsn|qty|quantity|rate|price)/i,
  ],
  // Row pattern: captures (sr, description, hsn, qty, rate, taxableValue, tax, total)
  rowPatterns: [
    // Pipe-delimited: "1 | PARI-03 MAROON | 62114403 | 1 | 1609.32 | 1609.32 | 80.47 | 1689.79"
    /^\s*(\d{1,3})\s*\|\s*(.+?)\s*\|\s*(\d{4,8})?\s*\|\s*(\d{1,4})\s*\|\s*[\d,]+\.?\d*\s*\|\s*([\d,]+\.?\d*)\s*\|\s*([\d,]+\.?\d*)\s*\|\s*([\d,]+\.?\d*)/m,
    // Space/tab delimited with amounts
    /^\s*(\d{1,3})\s+(.+?)\s+(\d{4,8})?\s+(\d{1,4})\s+[\d,]+\.?\d*\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)/m,
  ],
};

// ── Multi-bill Splitting Patterns ──
// These mark the START of a new bill in a multi-bill PDF
const BILL_SEPARATOR_PATTERNS = [
  /(?:^|\n)\s*(?:TAX\s*INVOICE|INVOICE|BILL\s*OF\s*SUPPLY|CREDIT\s*NOTE|DEBIT\s*NOTE|RETURN\s*(?:INVOICE|BILL|NOTE))\s*$/im,
  /(?:^|\n)\s*-{10,}\s*$/m,
  /(?:^|\n)\s*={10,}\s*$/m,
  /\f/, // form feed (PDF page break)
];

module.exports = {
  INVOICE_NUMBER_PATTERNS,
  ORDER_NUMBER_PATTERNS,
  DATE_PATTERNS,
  AMOUNT_PATTERNS,
  AWB_PATTERNS,
  DELIVERY_PARTNERS,
  SUPPLIER_PLATFORMS,
  PAYMENT_PATTERNS,
  SKU_PATTERNS,
  SKU_NOISE_WORDS,
  QTY_PATTERNS,
  HSN_PATTERNS,
  GST_NUMBER_PATTERNS,
  TAX_AMOUNT_PATTERNS,
  TAXABLE_VALUE_PATTERNS,
  VENDOR_NAME_PATTERNS,
  RETURN_TYPE_PATTERNS,
  RETURN_STATUS_PATTERNS,
  CLAIM_PATTERNS,
  RETURN_DATE_PATTERNS,
  ITEM_TABLE_PATTERNS,
  BILL_SEPARATOR_PATTERNS,
};
