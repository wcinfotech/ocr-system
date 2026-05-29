/**
 * ============================================
 * Regex Patterns Helper (v2)
 * ============================================
 * E-commerce bill extraction patterns
 * Supports: Amazon, Flipkart, Meesho, etc.
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
  /(?:awb\s*(?:no|number|#)?\.?\s*[:\-]?\s*)([A-Z0-9]{6,30})/i,
  /(?:tracking\s*(?:no|number|#|id)?\.?\s*[:\-]?\s*)([A-Z0-9]{6,30})/i,
  /(?:waybill\s*(?:no|number|#)?\.?\s*[:\-]?\s*)([A-Z0-9]{6,30})/i,
  /(?:shipment\s*(?:no|number|#|id)?\.?\s*[:\-]?\s*)([A-Z0-9]{6,30})/i,
  /(?:consignment\s*(?:no|number|#)?\.?\s*[:\-]?\s*)([A-Z0-9]{6,30})/i,
  /(?:lr\s*(?:no|number|#)?\.?\s*[:\-]?\s*)([A-Z0-9]{6,30})/i,
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

// ── SKU ──
const SKU_PATTERNS = [
  /(?:sku\s*(?:no|number|#|id|code)?\.?\s*[:\-]?\s*)([A-Z0-9\-_]{3,30})/i,
  /(?:product\s*(?:code|id|sku)\.?\s*[:\-]?\s*)([A-Z0-9\-_]{3,30})/i,
  /(?:item\s*(?:code|id|sku)\.?\s*[:\-]?\s*)([A-Z0-9\-_]{3,30})/i,
  /(?:asin\s*[:\-]?\s*)([A-Z0-9]{10})/i,
  /(?:fsn\s*[:\-]?\s*)([A-Z0-9]{10,20})/i,
];

// ── Quantity ──
const QTY_PATTERNS = [
  // Amazon specific: "1 of:" or "2 of:"
  /\b(\d{1,3})\s+of\s*:/i,
  // Generic: Qty: 1, Quantity: 1, Qty - 1, Ordered: 1
  /(?:qty|quantity|ordered)\.?\s*[:\-]?\s*(\d{1,4})\b/i,
  /(?:qty|quantity)\s+(\d{1,4})\b/i,
  /(?:total\s*(?:qty|quantity|items|units))\s*[:\-]?\s*(\d{1,4})/i,
  /(?:no\.\s*of\s*(?:items|units|pcs|pieces))\s*[:\-]?\s*(\d{1,4})/i,
  /(?:pcs|pieces)\s*[:\-]?\s*(\d{1,4})/i,
];

// ── GST Number ──
const GST_NUMBER_PATTERNS = [
  /(?:gst(?:in)?|gst\s*(?:no|number|#|reg)?)\s*[:\-]?\s*(\d{2}\s*[A-Z]{5}\s*\d{4}\s*[A-Z]\s*\d\s*[A-Z\d]\s*[A-Z\d]\s*[A-Z\d])/i,
  /\b(\d{2}\s*[A-Z]{5}\s*\d{4}\s*[A-Z]\s*\d\s*[A-Z\d]\s*[A-Z\d]\s*[A-Z\d])\b/i,
];

// ── Tax Amount ──
const TAX_AMOUNT_PATTERNS = [
  /(?:total\s*tax|tax\s*total|tax\s*amount)\s*[:\-]?\s*(?:(?:Rs\.?|INR|₹|\$)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:gst\s*(?:amount)?)\s*[:\-]?\s*(?:(?:Rs\.?|INR|₹|\$)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:cgst)\s*(?:@?\s*\d+%?)?\s*[:\-]?\s*(?:(?:Rs\.?|INR|₹|\$)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:sgst)\s*(?:@?\s*\d+%?)?\s*[:\-]?\s*(?:(?:Rs\.?|INR|₹|\$)\s*)?([0-9,]+\.?\d{0,2})/i,
  /(?:igst)\s*(?:@?\s*\d+%?)?\s*[:\-]?\s*(?:(?:Rs\.?|INR|₹|\$)\s*)?([0-9,]+\.?\d{0,2})/i,
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
  QTY_PATTERNS,
  GST_NUMBER_PATTERNS,
  TAX_AMOUNT_PATTERNS,
  VENDOR_NAME_PATTERNS,
  RETURN_TYPE_PATTERNS,
  RETURN_STATUS_PATTERNS,
  CLAIM_PATTERNS,
  RETURN_DATE_PATTERNS,
  BILL_SEPARATOR_PATTERNS,
};
