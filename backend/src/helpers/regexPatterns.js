/**
 * ============================================
 * Regex Patterns Helper (v5) — Production
 * ============================================
 * E-commerce bill extraction patterns
 * Supports: Amazon, Flipkart, Meesho, Ajio, Myntra, Shopify, Generic GST
 */

// ── Platform Detection Markers ──
const PLATFORM_DETECTORS = {
  amazon: [
    /\b(?:amazon|amazon\.in|amazon\.com|amzn|atspl|amazon\s+seller|sold\s+by\s*:\s*amazon)\b/i,
    /\b\d{3}[-\s\.]?\d{7}[-\s\.]?\d{7}\b/, // Amazon order ID pattern (OCR-tolerant)
    /\b(?:ATS|AT5|AIS|AJ5)\d{10,12}\b/i, // Amazon ATS AWB (OCR-tolerant)
  ],
  flipkart: [
    /\b(?:flipkart|flipkart\.com|fk\b|retail\s+net|ekart|e\-kart|e\s+kart)\b/i,
    /\b(?:OD|0D|QD|Q0|O0)\d{18}\b/i, // Flipkart order ID pattern (OCR-tolerant)
    /\b(?:FM|PM)[A-Z0-9]{2}\d{8,14}\b/i, // Flipkart AWB (OCR-tolerant)
  ],
  meesho: [
    /\b(?:meesho|meeshoo|meeshu|fashnear|fash\s*near|fashnear\s+technologies)\b/i,
    /\b\d{10}_\d\b/, // Meesho typical order format in some documents
    /\b(?:purchase\s*order\s*number|invoice\s*number)\b[\s\S]{0,50}\b(?:xpressbees|delhivery|valmo)\b/i,
    /\b(?:meesho\s*order|meesho\s*id)\b/i
  ],
  ajio: [
    /\b(?:ajio|ajio\.com|reliance\s+retail|reliance\s+jiomart|trends)\b/i,
    /\b(?:FN|AJ)\d{9,12}\b/i, // Ajio order patterns
  ],
  myntra: [
    /\b(?:myntra|myntra\.com|myntra\s+designs|vector\s+e\-commerce)\b/i,
  ],
};

// ── Invoice / Bill Number ──
const INVOICE_NUMBER_PATTERNS = [
  /(?:invoice\s*(?:no|number|#|num|id|key)\.?\s*[:\-\|\s]?\s*)([A-Z0-9][A-Z0-9\-\/\s]{2,40})/i,
  /(?:bill\s*(?:no|number|#|num)\.?\s*[:\-\|\s]?\s*)([A-Z0-9][A-Z0-9\-\/\s]{2,40})/i,
  /(?:inv\s*(?:no|number|#)\.?\s*[:\-\|\s]?\s*)([A-Z0-9][A-Z0-9\-\/\s]{2,40})/i,
  /(?:tax\s*invoice\s*(?:no|number|#)?\.?\s*[:\-\|\s]?\s*)([A-Z0-9][A-Z0-9\-\/\s]{2,40})/i,
  /(?:receipt\s*(?:no|number|#)\.?\s*[:\-\|\s]?\s*)([A-Z0-9][A-Z0-9\-\/\s]{2,40})/i,
  /(?:credit\s*note\s*(?:no|number|#)?\.?\s*[:\-\|\s]?\s*)([A-Z0-9][A-Z0-9\-\/\s]{2,40})/i,
  /\b(INV[\-\/\s]?\d{4,}[\-\/\s]?\d{0,6})\b/i,
  // Shopify invoice style
  /#\s*(\d{4,10})\b/,
];

// ── Order Number ──
const ORDER_NUMBER_PATTERNS = [
  // Amazon order pattern: 123-1234567-1234567 (with OCR-tolerant separators)
  /\b(\d{3}[-\s\.]?\d{7}[-\s\.]?\d{7})\b/,
  // Flipkart order pattern: OD followed by 18 digits (OCR-tolerant prefixes)
  /\b((?:OD|0D|QD|Q0|O0)\d{18})\b/i,
  // Meesho order patterns
  /(?:meesho\s*order\s*(?:id)?\s*[:\-]?\s*)(\d{6,20})/i,
  /\b(MEESHO\d{10,15})\b/i,
  /\b(ME\d{10,15})\b/i,
  /\b(\d{10}_\d)\b/,
  // Ajio / Myntra
  /\b((?:FN|AJ)\d{9,12})\b/i,
  // General e-commerce order patterns
  /(?:order\s*(?:no|number|#|id)\.?\s*[:\-\|\s]?\s*)([A-Z0-9\-]{8,40})/i,
  /(?:order\s*id\s*[:\-\|\s]?\s*)([A-Z0-9\-]{8,40})/i,
  /(?:po\s*(?:no|number|#)\.?\s*[:\-\|\s]?\s*)([A-Z0-9\-]{8,40})/i,
  /(?:purchase\s*order\s*(?:no|number)?\.?\s*[:\-\|\s]?\s*)([A-Z0-9\-]{8,40})/i,
  /(?:sub[\s\-]?order\s*(?:no|id)?\s*[:\-\|\s]?\s*)([A-Z0-9\-]{8,40})/i,
];

// ── Date Patterns ──
const DATE_PATTERNS = [
  /(?:(?:invoice|bill|billing|order|receipt|ship|return)\s*date\s*[:\-\|\s]?\s*)([\d]{1,2}[\-\/\.][\d]{1,2}[\-\/\.][\d]{2,4})/i,
  /(?:date\s*[:\-\|\s]?\s*)([\d]{1,2}[\-\/\.][\d]{1,2}[\-\/\.][\d]{2,4})/i,
  /(?:date\s*[:\-\|\s]?\s*)([\d]{4}[\-\/\.][\d]{1,2}[\-\/\.][\d]{1,2})/i,
  /(?:dated?\s*[:\-\|\s]?\s*)([\d]{1,2}\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,]*\d{2,4})/i,
  /(?:date\s*[:\-\|\s]?\s*)((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,]*\d{1,2}[\s,]*\d{2,4})/i,
  /\b(\d{1,2}[\-\/\.]\d{1,2}[\-\/\.]\d{4})\b/,
  /\b(\d{4}[\-\/\.]\d{1,2}[\-\/\.]\d{1,2})\b/,
  /\b(\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)[\s,]+\d{4})\b/i,
];

// ── Amount / Total ──
const AMOUNT_PATTERNS = [
  /(?:grand\s*total|net\s*(?:payable|amount|value)|amount\s*payable|total\s*payable|balance\s*due|amount\s*due|invoice\s*value|total\s*payable\s*amount)\s*[:\-\|\s]?\s*(?:(?:Rs\.?|INR|₹|\$|USD)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:total\s*(?:amount|value)?)\s*[:\-\|\s]?\s*(?:(?:Rs\.?|INR|₹|\$|USD)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:bill\s*(?:total|amount))\s*[:\-\|\s]?\s*(?:(?:Rs\.?|INR|₹|\$|USD)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:invoice\s*(?:total|amount|value))\s*[:\-\|\s]?\s*(?:(?:Rs\.?|INR|₹|\$|USD)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:amount\s*received)\s*[:\-\|\s]?\s*(?:(?:Rs\.?|INR|₹|\$|USD)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:sub[\s\-]?total)\s*[:\-\|\s]?\s*(?:(?:Rs\.?|INR|₹|\$|USD)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:final\s*(?:total|amount))\s*[:\-\|\s]?\s*(?:(?:Rs\.?|INR|₹|\$|USD)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:order\s*(?:total|amount|value))\s*[:\-\|\s]?\s*(?:(?:Rs\.?|INR|₹|\$|USD)\s*)?([0-9,]+\.?\d{0,2})/i,
];

// ── AWB / Tracking Number ──
const AWB_PATTERNS = [
  // Amazon ATS / Waybill specific (OCR-tolerant prefix)
  /\b((?:ATS|AT5|AIS|AJ5)\d{10,12})\b/i,
  // Labeled AWB patterns (OCR-tolerant label names)
  /(?:aw[b8]|anb|abw)\s*(?:no|number|#|num)?\.?\s*[:\-\|\s]?\s*([A-Z0-9]{8,25})/i,
  /(?:tracking\s*(?:no|number|#|id)?\.?\s*[:\-\|\s]?\s*)\s*([A-Z0-9]{8,25})/i,
  /(?:waybill\s*(?:no|number|#)?\.?\s*[:\-\|\s]?\s*)\s*([A-Z0-9]{8,25})/i,
  /(?:shipment\s*(?:no|number|#|id)?\.?\s*[:\-\|\s]?\s*)\s*([A-Z0-9]{8,25})/i,
  /(?:consignment\s*(?:no|number|#)?\.?\s*[:\-\|\s]?\s*)\s*([A-Z0-9]{8,25})/i,
  /(?:lr\s*(?:no|number|#)?\.?\s*[:\-\|\s]?\s*)\s*([A-Z0-9]{8,25})/i,
  /(?:awb\s*[\/\-]?\s*tracking\s*(?:no|number|#|id)?\.?\s*[:\-\|\s]?\s*)\s*([A-Z0-9]{8,25})/i,

  // Flipkart E-kart AWB: FMPC/FMPP/PMPC followed by digits (OCR-tolerant)
  /\b((?:FM|PM|FN)[A-Z0-9]{2}\d{8,14})\b/i,
  
  // Generic AWB matchers for Amazon, Meesho, Xpressbees, etc.
  /\b(36\d{10})\b/, // E.g. AWB 363930681252
  /\b(13\d{12})\b/, // E.g. AWB# 13371809951323
  /\b(12\d{7,10})\b/, // E.g. AWB No. 123456789
  /\b(\d{12})\b/, // Bare 12-digit number (often AWB on label)

  // Meesho / Xpressbees / Delhivery / Courier Partners
  /(?:xpress\s*bees|xpressbees|delhivery|ecom\s*express|blue\s*dart|ekart|e[\-\s]?kart|shadowfax|dtdc|ats|amazon)[\s\S]{0,120}?\b(\d{10,20})\b/i,
  /\b(\d{10,20})\b[\s\S]{0,120}?(?:xpress\s*bees|xpressbees|delhivery|ecom\s*express|blue\s*dart|ekart|e[\-\s]?kart|shadowfax|dtdc|ats|amazon)/i,

  // Bare tracking number on its own line (10-20 digits, bounded)
  /(?:^|\n)\s*(\d{10,20})\s*(?:\n|$)/m,
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
  { pattern: /\b(?:ats|amazon\s*(?:shipping|transportation|logistics|easy\s*ship)?)\b/i, name: 'Amazon Shipping' },
  { pattern: /\b(?:valmo)\b/i, name: 'Valmo' },
  { pattern: /\b(?:rivigo)\b/i, name: 'Rivigo' },
  { pattern: /\b(?:movin)\b/i, name: 'Movin' },
  { pattern: /\b(?:smartr)\b/i, name: 'Smartr' },
];

// ── Supplier Platform Detection (Fallback) ──
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
  /(?:delivery\s*(?:&\s*)?payment\s*(?:mode|method|terms|type)?\.?\s*[:\-\|\s]?\s*)\s*([A-Za-z0-9\s,\+\/]+)/i,
  /(?:mode\s*of\s*payment\s*[:\-\|\s]?\s*)\s*([A-Za-z0-9\s,\+\/]+)/i,
  /(?:payment\s*(?:mode|method|type|status)?\.?\s*[:\-\|\s]?\s*)(?!Transaction\s*ID)\s*([A-Za-z0-9\s,\+\/]+)/i,
  /\b(COD|POD|Cash\s*on\s*Delivery|Pay\s*on\s*Delivery)\b/i,
  /\b(Prepaid|Pre\-paid|Pre\s*paid)\b/i,
  /\b(Collect)\b/i,
  /\b(Credit\s*Card|Debit\s*Card|UPI|NetBanking|AmazonPay|GiftCard)\b/i,
];

// ── SKU PATTERNS ──
const SKU_PATTERNS = [
  // Labeled SKU formats (SKU ID, Seller SKU, SKU, Item Code, Product Code, Style Code, Article Number)
  /(?:seller\s*sku\s*(?:id)?\.?\s*[:\-|]\s*)([A-Za-z0-9][A-Za-z0-9\-_@\s]{2,50})/i,
  /(?:merchant\s*sku\s*[:\-|]\s*)([A-Za-z0-9][A-Za-z0-9\-_@\s]{2,50})/i,
  /(?:sku\s*id\s*[:\-|]\s*)([A-Za-z0-9][A-Za-z0-9\-_@\s]{2,50})/i,
  /(?:style\s*code\s*[:\-|]\s*)([A-Za-z0-9][A-Za-z0-9\-_@\s]{2,50})/i,
  /(?:item\s*code\s*[:\-|]\s*)([A-Za-z0-9][A-Za-z0-9\-_@\s]{2,50})/i,
  /(?:product\s*code\s*[:\-|]\s*)([A-Za-z0-9][A-Za-z0-9\-_@\s]{2,50})/i,
  /(?:article\s*number\s*[:\-|]\s*)([A-Za-z0-9][A-Za-z0-9\-_@\s]{2,50})/i,
  /(?:sku\s*(?:no|number|#)?\.?\s*[:\-|]\s*)([A-Za-z0-9][A-Za-z0-9\-_@\s]{2,50})/i,

  // Meesho specific SKU format
  /(?:sku\s*[:\-]\s*)([A-Za-z][A-Za-z0-9\-]+\s*@?\s*[A-Z]+)\s*$/im,
  /(?:sku\s*[:\-]\s*)([A-Za-z][A-Za-z0-9\-]+(?:\s+[A-Z]+)?)\s*$/im,

  // Amazon ASIN inside parentheses and bracket patterns
  /\|\s*([A-Z0-9]{10})\s*\(/,
  /\b([A-Z0-9]{10})\s*\(\s*([A-Za-z][A-Za-z0-9\-_ ]{2,30})\s*\)/,
  /\(\s*([A-Za-z][A-Za-z0-9\-_]{2,30})\s*\)/,
  /\b(B0[A-Z0-9]{8})\b/, // Bare Amazon ASIN

  // Flipkart specific pipe format
  /(?:sku\s*id\s*\|\s*description)\s*(?:qty)?\s*\n\s*\d*\s*([A-Za-z][A-Za-z0-9\-_ ]{2,50})\s*\|/im,
  /\d([A-Z][A-Z\-_ ]{2,40})\s*\|\s*[A-Z]/,
];

// ── SKU cleaning patterns (what to strip from extracted SKU) ──
const SKU_NOISE_WORDS = /\b(qty|quantity|hsn|price|rate|tax|igst|cgst|sgst|total|amount|rs|inr|invoice|date|bill|size|color|colour|free\s*size|pcs|pieces|unit|description|product|item)\b/gi;

// ── Quantity ──
const QTY_PATTERNS = [
  // Amazon specific: "1 of:" or "2 of:"
  /\b(\d{1,3})\s+of\s*:/i,
  // Generic: Qty: 1, Quantity: 1, Qty - 1, Ordered: 1
  /(?:qty|quantity|ordered)\.?\s*[:\-\|\s]?\s*(\d{1,4})\b/i,
  /(?:qty|quantity)\s+(\d{1,4})\b/i,
  /(?:total\s*(?:qty|quantity|items|units))\s*[:\-\|\s]?\s*(\d{1,4})/i,
  /(?:no\.?\s*of\s*(?:items|units|pcs|pieces))\s*[:\-\|\s]?\s*(\d{1,4})/i,
  /(?:pcs|pieces)\s*[:\-\|\s]?\s*(\d{1,4})/i,
];

// ── HSN Code ──
const HSN_PATTERNS = [
  /(?:hsn\s*(?:code|no|number|#)?\.?\s*[:\-\|]?\s*)(\d{4,8})/i,
  /(?:hsn\/sac\s*(?:code)?\.?\s*[:\-\|]?\s*)(\d{4,8})/i,
  /(?:sac\s*(?:code|no)?\.?\s*[:\-\|]?\s*)(\d{4,8})/i,
];

// ── GST Number ──
const GST_NUMBER_PATTERNS = [
  /(?:gst(?:in)?|gst\s*(?:registration)?\s*(?:no|number|#|reg)?)\s*[:\-\|\s\.]?\s*(\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]{2})/i,
  /(?:gst|gstin)\s*[:\-\|\s\.]?\s*(\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]{2})/i,
  /\b(\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]{2})\b/,
];

// ── Tax Amount ──
const TAX_AMOUNT_PATTERNS = [
  /(?:total\s*tax|tax\s*total|tax\s*amount)\s*[:\-\|\s]?\s*(?:(?:Rs\.?|INR|₹|\$)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:gst\s*(?:amount)?)\s*[:\-\|\s]?\s*(?:(?:Rs\.?|INR|₹|\$)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:cgst)\s*(?:@?\s*\d+%?)?\s*[:\-\|\s]?\s*(?:(?:Rs\.?|INR|₹|\$)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:sgst)\s*(?:@?\s*\d+%?)?\s*[:\-\|\s]?\s*(?:(?:Rs\.?|INR|₹|\$)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:igst)\s*(?:@?\s*\d+%?)?\s*[:\-\|\s]?\s*(?:(?:Rs\.?|INR|₹|\$)\s*)?([0-9,]+\.?\d{0,2})/i,
];

// ── Taxable Value (per-item) ──
const TAXABLE_VALUE_PATTERNS = [
  /(?:taxable\s*(?:value|amount|amt))\s*[:\-\|\s]?\s*(?:(?:Rs\.?|INR|₹|\$)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:assessable\s*(?:value|amount))\s*[:\-\|\s]?\s*(?:(?:Rs\.?|INR|₹|\$)\s*)?([0-9,]+\.?\d{0,2})/i,
];

// ── Vendor Name ──
const VENDOR_NAME_PATTERNS = [
  /(?:vendor|seller|company|firm|merchant|supplier|sold\s*by|shipped?\s*by|from|billed?\s*by)\s*(?:name)?\s*[:\-\|\s]?\s*([A-Za-z][A-Za-z\s&\.\,\-]{2,60})/i,
  /(?:M\/s\.?\s*)([A-Za-z][A-Za-z\s&\.\,\-]{2,60})/,
];

// ── Return Bill Patterns ──
const RETURN_TYPE_PATTERNS = [
  /(?:return\s*(?:type|reason|category)\s*[:\-\|\s]?\s*)(.{3,60})/i,
  /\b(RTO|Return\s*to\s*Origin|Customer\s*Return|Buyer\s*Return|Reverse\s*Pickup|Quality\s*Check\s*Fail|QC\s*Fail|Damaged|Wrong\s*Product|Size\s*Issue)\b/i,
];

const RETURN_STATUS_PATTERNS = [
  /(?:return\s*(?:status)\s*[:\-\|\s]?\s*)(Success|Failed|Pending|Completed|In\s*Transit|Delivered|Rejected)/i,
  /\b(Return\s*(?:Successful|Completed|Delivered|Received))\b/i,
  /\b(Return\s*(?:Failed|Rejected|Lost|Damaged))\b/i,
];

const CLAIM_PATTERNS = [
  /(?:claim\s*(?:amount|value)?\s*[:\-\|\s]?(?:(?:Rs\.?|INR|₹|\$)\s*)?)([0-9,]+\.?\d{0,2})/i,
  /(?:compensation\s*(?:amount)?\s*[:\-\|\s]?(?:(?:Rs\.?|INR|₹|\$)\s*)?)([0-9,]+\.?\d{0,2})/i,
  /(?:refund\s*(?:amount)?\s*[:\-\|\s]?(?:(?:Rs\.?|INR|₹|\$)\s*)?)([0-9,]+\.?\d{0,2})/i,
];

const RETURN_DATE_PATTERNS = [
  /(?:return\s*date\s*[:\-\|\s]?\s*)([\d]{1,2}[\-\/\.][\d]{1,2}[\-\/\.][\d]{2,4})/i,
  /(?:rto\s*date\s*[:\-\|\s]?\s*)([\d]{1,2}[\-\/\.][\d]{1,2}[\-\/\.][\d]{2,4})/i,
  /(?:reverse\s*(?:pickup)?\s*date\s*[:\-\|\s]?\s*)([\d]{1,2}[\-\/\.][\d]{1,2}[\-\/\.][\d]{2,4})/i,
];

// ── Multi-item Table Row Patterns ──
const ITEM_TABLE_PATTERNS = {
  headerPatterns: [
    /(?:sr\.?\s*(?:no)?|s\.?\s*no|#)\s*[\|]?\s*(?:description|product|item|particular|sku)/i,
    /(?:description|product\s*name|item|sku)\s*[\|]?\s*(?:hsn|qty|quantity|rate|price)/i,
  ],
  rowPatterns: [
    /^\s*(\d{1,3})\s*\|\s*(.+?)\s*\|\s*(\d{4,8})?\s*\|\s*(\d{1,4})\s*\|\s*[\d,]+\.?\d*\s*\|\s*([\d,]+\.?\d*)\s*\|\s*([\d,]+\.?\d*)\s*\|\s*([\d,]+\.?\d*)/m,
    /^\s*(\d{1,3})\s+(.+?)\s+(\d{4,8})?\s+(\d{1,4})\s+[\d,]+\.?\d*\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)/m,
  ],
};

const BILL_SEPARATOR_PATTERNS = [
  /(?:^|\n)\s*(?:TAX\s*INVOICE|INVOICE|BILL\s*OF\s*SUPPLY|CREDIT\s*NOTE|DEBIT\s*NOTE|RETURN\s*(?:INVOICE|BILL|NOTE))\s*$/im,
  /(?:^|\n)\s*-{10,}\s*$/m,
  /(?:^|\n)\s*={10,}\s*$/m,
  /\f/, // form feed
];

module.exports = {
  PLATFORM_DETECTORS,
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
