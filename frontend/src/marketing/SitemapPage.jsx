import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  MarketplaceTemplate,
  FeatureTemplate,
  IndustryTemplate,
  ResourceTemplate
} from './Templates';

// Lookups for slugs and templates
const SLUG_DATA = {
  // Marketplace Slugs
  'amazon-seller-management-software': {
    type: 'marketplace',
    name: 'Amazon',
    desc: 'Connect Escannora OCR tool to automatically import, verify, and parse invoice PDF data from Amazon seller dashboard invoices.',
    features: [
      { title: 'Amazon FBA Parsing', desc: 'Auto-scan FBA invoices, calculating Amazon fees, warehouse storage charges, and transport SKU numbers.' },
      { title: 'Tax & GST Extract', desc: 'Correctly classify IGST/CGST breakdown on Amazon consumer receipts.' },
      { title: 'Fulfillment Sync', desc: 'Push verified order tracking codes and status back to Amazon Seller Central.' }
    ]
  },
  'meesho-seller-management-software': {
    type: 'marketplace',
    name: 'Meesho',
    desc: 'AutomateMeesho invoice scanning and SKU catalog mapping. Turn bulk Meesho billing images into structured dashboard entries.',
    features: [
      { title: 'Bulk Meesho Label OCR', desc: 'Scan 100+ Meesho shipping bills in one go. Extract buyer address and package identifiers.' },
      { title: 'Zero Commission Tracking', desc: 'Monitor payout discrepancies and commission rates automatically.' },
      { title: 'Returns Reconciliation', desc: 'Scan returned barcodes to instantly reconcile inventory records with seller dashboards.' }
    ]
  },
  'flipkart-seller-management-software': {
    type: 'marketplace',
    name: 'Flipkart',
    desc: 'Fully integrate Flipkart seller bills. Extract product models, transaction IDs, tax records, and shipping state.',
    features: [
      { title: 'Flipkart Assured Verification', desc: 'Audit FA shipping sheets, matching SKUs with warehouse packing checklists.' },
      { title: 'GST Billing Parsing', desc: 'Automatically separate taxable values and carrier transport fees.' },
      { title: 'Real-time API Sync', desc: 'Update shipping statuses on the Flipkart portal the moment bills are printed.' }
    ]
  },
  'shopify-order-management-software': {
    type: 'marketplace',
    name: 'Shopify',
    desc: 'Sync Escannora OCR automation to your Shopify store. Scan physical bills, verify labels, and manage incoming orders in real-time.',
    features: [
      { title: 'Shopify Draft Invoices', desc: 'Scan retail store bills and automatically generate Shopify draft order items.' },
      { title: 'SKU Inventory Updates', desc: 'Update Shopify quantities automatically by scanning wholesaler supply packing invoices.' },
      { title: 'AWB Label Integration', desc: 'Generate and parse carrier shipping labels directly inside Shopify orders.' }
    ]
  },
  'woocommerce-order-management-software': {
    type: 'marketplace',
    name: 'WooCommerce',
    desc: 'Connect WooCommerce stores with Escannora OCR. Automate PDF bill processing, barcode checking, and stock reconciliations.',
    features: [
      { title: 'WooCommerce Order Sync', desc: 'Read invoice details and match client purchases to WooCommerce transactions.' },
      { title: 'Automatic GST Bills', desc: 'Generate compliance-ready tax invoices for Indian WooCommerce checkouts.' },
      { title: 'Direct Database Sync', desc: 'Secure database integration keeps order processing queues synchronized.' }
    ]
  },
  'magento-order-management-software': {
    type: 'marketplace',
    name: 'Magento',
    desc: 'Enterprise Magento order document extraction. Handle large billing databases, multi-store layouts, and custom ERPs.',
    features: [
      { title: 'Adobe Commerce OCR', desc: 'Automated OCR pipelines matching complex SKU tables to Magento product catalogs.' },
      { title: 'Multi-store Support', desc: 'Process documents from multiple Magento store views under a single dashboard.' },
      { title: 'SLA Guaranteed Uptime', desc: 'Enterprise-grade speed and reliability for high-volume transactions.' }
    ]
  },
  'ajio-seller-management-software': {
    type: 'marketplace',
    name: 'AJIO',
    desc: 'Automate AJIO seller invoices. Parse fashion apparel SKU codes, sizes, tax splits, and shipping tracking IDs.',
    features: [
      { title: 'Fashion SKU Parsing', desc: 'Read clothing catalog details, sizing variants, color options, and barcode tags.' },
      { title: 'AJIO B2B Integration', desc: 'Sync bulk wholesale shipments directly to your internal inventory ledger.' },
      { title: 'Returns Indexing', desc: 'Scan AJIO return tags to verify reason codes and item conditions.' }
    ]
  },
  'myntra-seller-management-software': {
    type: 'marketplace',
    name: 'Myntra',
    desc: 'Sync Myntra marketplace invoices. Fast OCR extraction of apparel item details, discounts, taxes, and warehouse logistics.',
    features: [
      { title: 'Myntra PPMP Support', desc: 'Integrate seller portals with automated document classification.' },
      { title: 'Discount Reconciliation', desc: 'Verify retail discounts on Myntra customer receipts against promo plans.' },
      { title: 'Courier Label Scanner', desc: 'Scan AWB numbers from carrier shipping sheets to check transit states.' }
    ]
  },
  'glowroad-seller-management-software': {
    type: 'marketplace',
    name: 'GlowRoad',
    desc: 'OCR tools for GlowRoad social commerce. Import shipping details and parse reseller billing sheets automatically.',
    features: [
      { title: 'Reseller Invoice Match', desc: 'Match customer receipts to reseller orders, verifying payout commissions.' },
      { title: 'Shipping Label Sync', desc: 'Read packing slips to automate dispatch tracking.' },
      { title: 'Simple PDF Uploads', desc: 'Drop bulk PDFs to parse customer orders and GST taxes in seconds.' }
    ]
  },
  'jiomart-seller-management-software': {
    type: 'marketplace',
    name: 'JioMart',
    desc: 'Automate JioMart grocery and retail seller documents. Parse grocery items, barcode identifiers, and invoice quantities.',
    features: [
      { title: 'FMCG SKU Classifier', desc: 'Classify grocery product categories, manufacturing dates, and tax ranges.' },
      { title: 'JioMart Logistics Sync', desc: 'Scan delivery challenge notes to confirm warehouse package receipt.' },
      { title: 'GST Billing Extract', desc: 'Extract CGST/SGST/IGST splits from JioMart merchant receipts.' }
    ]
  },
  'custom-website-order-management-software': {
    type: 'marketplace',
    name: 'Custom Website',
    desc: 'Integrate Escannora OCR directly with your proprietary eCommerce storefront via our robust developer API.',
    features: [
      { title: 'Flexible REST APIs', desc: 'Use simple POST endpoints to send documents and receive parsed JSON schemas.' },
      { title: 'Custom Field Training', desc: 'Train the model to extract custom-themed fields specific to your business documents.' },
      { title: 'Real-time Webhook Alerts', desc: 'Receive HTTP POST alerts the moment document extraction completes.' }
    ]
  },

  // Feature Slugs
  'barcode-scanning-software': {
    type: 'feature',
    title: 'Barcode Scanning',
    desc: 'High-speed web-based barcode recognition. Scan packing slips, retail products, and invoices using mobile cameras or dedicated scanners.',
    features: [
      { title: '1D/2D Symbologies', desc: 'Supports Code 128, QR Codes, DataMatrix, PDF417, EAN-13, and UPC-A.' },
      { title: 'Camera Auto-Focus', desc: 'Intelligent camera focus recognition extracts codes even from warped labels.' },
      { title: 'Direct DB Mapping', desc: 'Instantly matches barcode values to warehouse catalog items in real-time.' }
    ]
  },
  'barcode-verification-software': {
    type: 'feature',
    title: 'Barcode Verification',
    desc: 'Validate barcode labels against catalog databases to prevent shipping mistakes and catalog errors.',
    features: [
      { title: 'Order Matching', desc: 'Verify scanned item barcodes against customer order details to ensure correct packing.' },
      { title: 'Double Scan Safety', desc: 'Prevents scanning the same packing slip twice, eliminating double deliveries.' },
      { title: 'Instant Alert Audits', desc: 'Buzzer sounds and screen highlights red on mismatch detection.' }
    ]
  },
  'order-management-software': {
    type: 'feature',
    title: 'Order Management',
    desc: 'Manage multichannel ecommerce orders in a single unified dashboard. Track upload history, OCR accuracy, and sync statuses.',
    features: [
      { title: 'Centralized Queue', desc: 'See orders from Shopify, Amazon, Meesho, and manual uploads in one layout.' },
      { title: 'Status Tracking', desc: 'Monitor files from "Processing" to "Extracted" and "Synced".' },
      { title: 'Error Filtering', desc: 'Quickly filter and repair documents with low extraction confidence.' }
    ]
  },
  'invoice-printing-software': {
    type: 'feature',
    title: 'Invoice Printing',
    desc: 'Generate and print compliance-ready tax invoices, carrier shipping labels, and packing slips directly.',
    features: [
      { title: 'Custom Page Layouts', desc: 'Design printing formats with company logos, custom footers, and tax tables.' },
      { title: 'Thermal Printer Sync', desc: 'Optimized styles for 4x6 thermal label printers and standard A4 sizes.' },
      { title: 'Bulk Label Output', desc: 'Print 100+ verified shipping sheets in a single click batch.' }
    ]
  },
  'packing-verification-software': {
    type: 'feature',
    title: 'Packing Verification',
    desc: 'Check that the correct SKU variants, quantities, and promotional inserts are placed inside shipping boxes.',
    features: [
      { title: 'Visual Progress', desc: 'See progress bars fill as warehouse pickers scan items into boxes.' },
      { title: 'Weight Check Sync', desc: 'Optionally integrate weighing scales to double-check shipping weight bounds.' },
      { title: 'Box Label Print', desc: 'Prints dispatch labels only after packing validation succeeds.' }
    ]
  },
  'shipping-verification-software': {
    type: 'feature',
    title: 'Shipping Verification',
    desc: 'Audit outbound shipments. Match transport tracking numbers (AWB) to dispatch orders to prevent cargo loss.',
    features: [
      { title: 'Carrier Manifests', desc: 'Generate carrier handover sheets for Bluedart, Delhivery, Fedex, and DHL.' },
      { title: 'AWB Scan Check', desc: 'Validate carrier AWB barcodes prior to handover to courier drivers.' },
      { title: 'Discrepancy Log', desc: 'Log missing or extra shipments instantly for supervisor audits.' }
    ]
  },
  'warehouse-order-management-software': {
    type: 'feature',
    title: 'Warehouse Order Management',
    desc: 'Optimize warehouse dispatch operations. Organize item bins, pick routes, and scan zones to maximize throughput.',
    features: [
      { title: 'Bin Locations', desc: 'Map catalog items to specific warehouse racks and bin locations.' },
      { title: 'Optimized Pick Routes', desc: 'Smart algorithms calculate the shortest walking path to collect ordered items.' },
      { title: 'Dispatch Checkpoints', desc: 'Set up scanning tablets at final sealing zones to verify contents.' }
    ]
  },
  'reports-software': {
    type: 'feature',
    title: 'Reports & Auditing',
    desc: 'Generate document logs, extraction statistics, billing invoices, and export CSV sheets.',
    features: [
      { title: 'CSV/Excel Export', desc: 'Export parsed bill items and tax columns for import into Tally or QuickBooks.' },
      { title: 'Accuracy Audits', desc: 'Track model parsing accuracy over time to monitor OCR quality.' },
      { title: 'Logistics Analytics', desc: 'View order processing volumes, peak warehouse scan hours, and dispatch errors.' }
    ]
  },
  'analytics-software': {
    type: 'feature',
    title: 'OCR Analytics',
    desc: 'Monitor OCR engine performance metrics. Track processing speeds, queue states, and validation times.',
    features: [
      { title: 'Extraction Speed', desc: 'See live charts of document parsing latency in milliseconds.' },
      { title: 'Success Metrics', desc: 'Monitor the ratio of auto-extracted documents versus manual verification checks.' },
      { title: 'Data Coverage', desc: 'Audit missing fields and trace pattern recognition confidence thresholds.' }
    ]
  },
  'cloud-dashboard-software': {
    type: 'feature',
    title: 'Cloud Dashboard Portal',
    desc: 'Access your document processing dashboard securely from anywhere on any desktop, laptop, or mobile screen.',
    features: [
      { title: 'Multi-user Access', desc: 'Create accounts for pickers, finance auditors, and corporate admins.' },
      { title: 'Secure Session Keys', desc: 'All data is served over HTTPS with TLS 1.3 encryption.' },
      { title: 'Cloud Infrastructure', desc: 'Hosted on enterprise clouds ensuring 99.99% server availability.' }
    ]
  },
  'awb-verification-software': {
    type: 'feature',
    title: 'AWB Verification',
    desc: 'Scan courier Air Waybills to verify tracking addresses, carrier routes, and shipping zones.',
    features: [
      { title: 'Courier API Match', desc: 'Instantly query Bluedart or Delhivery APIs to confirm shipping routes.' },
      { title: 'AWB Barcode Parse', desc: 'Read complex barcode formats from carrier labels.' },
      { title: 'Zone Classification', desc: 'Automatically classify package destinations into delivery zones.' }
    ]
  },
  'dispatch-software': {
    type: 'feature',
    title: 'Dispatch Control',
    desc: 'Log and track final courier vehicle handovers. Make sure no packages leave the dock unverified.',
    features: [
      { title: 'Driver Manifests', desc: 'Digital signatures confirm the total package count loaded onto carrier vans.' },
      { title: 'Out-of-dock Alerts', desc: 'Alerts sound if a package is scanned that belongs to a different carrier.' },
      { title: 'Transit Logging', desc: 'Update order pipelines to "Dispatched" immediately upon loading.' }
    ]
  },
  'product-verification-software': {
    type: 'feature',
    title: 'Product Verification',
    desc: 'Verify product authenticity by scanning SKU details and matching manufacturer serial numbers.',
    features: [
      { title: 'Serial Number Tracking', desc: 'Track unique item serial numbers to check warranty details.' },
      { title: 'Counterfeit Alerts', desc: 'Validate manufacturer keys to prevent shipping counterfeit goods.' },
      { title: 'Returns Audit', desc: 'Match returned serial keys against original purchase orders.' }
    ]
  },

  // Industry Slugs
  'fashion-order-management-software': {
    type: 'industry',
    name: 'Fashion',
    desc: 'Optimize apparel order processing. Read clothing sizing, colors, catalog variants, and barcode tags using AI OCR.',
    features: [
      { title: 'Sizing & Color Variant Parse', desc: 'Understand fashion SKU structures containing size codes (S, M, L, XL).' },
      { title: 'Return Tag Scanning', desc: 'Read fashion returns tag barcodes to update inventory catalog status.' },
      { title: 'Multichannel Store Sync', desc: 'Link fashion orders across Myntra, Ajio, Meesho, and Shopify.' }
    ]
  },
  'electronics-order-management-software': {
    type: 'industry',
    name: 'Electronics',
    desc: 'Accelerate gadget and tech gear deliveries. Track serial numbers, verify barcoded warranties, and parse billing tables.',
    features: [
      { title: 'Serial Number Extraction', desc: 'Extract long IMEI and manufacturer serial numbers from electronic bills.' },
      { title: 'Warranty Log Automation', desc: 'Create system warranty records automatically on customer product scan.' },
      { title: 'Component Batch Audit', desc: 'Match hardware component SKU numbers against original purchase receipts.' }
    ]
  },
  'grocery-order-management-software': {
    type: 'industry',
    name: 'Grocery',
    desc: 'Automate FMCG grocery processing. Parse product expiration dates, batch numbers, and verify barcode labels.',
    features: [
      { title: 'Expiration Date Parsing', desc: 'Extract manufacturing and expiry dates from packaging invoices.' },
      { title: 'Weight/KG Tolerances', desc: 'Adjust packing verification triggers for weighed grocery products.' },
      { title: 'Storefront Integration', desc: 'Sync grocery invoices to JioMart, Blinkit-like, or Shopify store orders.' }
    ]
  },
  'beauty-order-management-software': {
    type: 'industry',
    name: 'Beauty & Cosmetics',
    desc: 'Intelligent inventory and document processing for beauty brands, cosmetics manufacturers, and retailers.',
    features: [
      { title: 'Batch Code Extraction', desc: 'Extract cosmetic manufacturing batches to track shelf-life compliance.' },
      { title: 'Label Verification', desc: 'Verify product barcodes to ensure incorrect shades or formulas are not shipped.' },
      { title: 'Kitting & Bundles', desc: 'Easily verify makeup kits containing multiple cosmetic SKUs.' }
    ]
  },
  'clothing-order-management-software': {
    type: 'industry',
    name: 'Clothing Manufacturers',
    desc: 'Data extraction templates tailored for textile mills, garment factories, and apparel wholesalers.',
    features: [
      { title: 'Roll & Fabric Logs', desc: 'Parse dye batch numbers, roll lengths, and material fabric bills.' },
      { title: 'Wholesale Invoice Parsing', desc: 'Read bulk bulk order sheets, container numbers, and duty invoices.' },
      { title: 'Distributor Sync', desc: 'Sync production data directly to wholesale client ERP systems.' }
    ]
  },
  'manufacturers-order-management-software': {
    type: 'industry',
    name: 'Manufacturers',
    desc: 'OCR tools for factory floors, assembly lines, and industrial product manufacturers.',
    features: [
      { title: 'Part Number Extract', desc: 'Read complex industrial part numbers, material specs, and drawing sheets.' },
      { title: 'Quality Assurance Log', desc: 'Log QA document details to trace factory batch checks.' },
      { title: 'Supply Chain Audits', desc: 'Audit inbound raw component bills against original factory POs.' }
    ]
  },
  'wholesalers-order-management-software': {
    type: 'industry',
    name: 'Wholesalers',
    desc: 'Bulk order processing tools for wholesaler distributions, cash & carry outlets, and bulk merchants.',
    features: [
      { title: 'Bulk Bill Parsing', desc: 'Extract invoices containing 100+ line items in under 500 milliseconds.' },
      { title: 'Credit Term Tracking', desc: 'Reconciliation of payment credit dates, net billing terms, and discounts.' },
      { title: 'Customer Ledger Sync', desc: 'Sync invoice details directly to company customer accounting balances.' }
    ]
  },
  'd2c-order-management-software': {
    type: 'industry',
    name: 'D2C Brands',
    desc: 'Accelerate warehouse fulfillment for direct-to-consumer digital brands. Automate packing lists and store syncs.',
    features: [
      { title: 'Shopify / Shopify Plus Link', desc: 'Auto-import customer orders, print labels, and parse logistics bills.' },
      { title: 'Gift Wrap & Inserts', desc: 'Trigger D2C picker alerts for orders containing gift wraps or customized cards.' },
      { title: 'Returns Optimization', desc: 'Scan return labels to check return fraud and update stock counts.' }
    ]
  },
  'jewellery-order-management-software': {
    type: 'industry',
    name: 'Jewellery',
    desc: 'High-value security and serial number auditing for fine jewellery retailers, designers, and manufacturers.',
    features: [
      { title: 'Certificate Indexing', desc: 'Match diamond certificate serial numbers (GIA) to physical jewellery tags.' },
      { title: 'Secure Vault Logs', desc: 'Verify serial barcodes before placing precious metals into security vaults.' },
      { title: 'Audit Trail Reporting', desc: 'Complete logging history of high-value inventory scans.' }
    ]
  },
  'footwear-order-management-software': {
    type: 'industry',
    name: 'Footwear',
    desc: 'Optimized SKU mapping and barcode verification for shoe designers, footwear brands, and retailers.',
    features: [
      { title: 'Shoe Box Tag Scanner', desc: 'Verify sizing and color variants on shoebox barcode stickers.' },
      { title: 'Single/Pair Validation', desc: 'Ensure left and right shoe components match catalog identifiers.' },
      { title: 'Distributor Integrations', desc: 'Automate bulk packing notes for department store distributions.' }
    ]
  },

  // Resource Slugs
  'privacy-policy': {
    type: 'resource',
    title: 'Privacy Policy'
  },
  'terms-and-conditions': {
    type: 'resource',
    title: 'Terms and Conditions'
  },
  'cookie-policy': {
    type: 'resource',
    title: 'Cookie Policy'
  },
  'help-center': {
    type: 'resource',
    title: 'Help Center'
  }
};

const SitemapPage = () => {
  const { slug } = useParams();

  const data = SLUG_DATA[slug];

  if (!data) {
    // If not matching any sitemap slug, redirect back to Home landing page
    return <Navigate to="/" replace />;
  }

  // Render correct template based on sitemap classification
  if (data.type === 'marketplace') {
    return (
      <MarketplaceTemplate
        name={data.name}
        description={data.desc}
        features={data.features}
      />
    );
  }

  if (data.type === 'feature') {
    return (
      <FeatureTemplate
        title={data.title}
        description={data.desc}
        features={data.features}
      />
    );
  }

  if (data.type === 'industry') {
    return (
      <IndustryTemplate
        name={data.name}
        description={data.desc}
        features={data.features}
      />
    );
  }

  if (data.type === 'resource') {
    return <ResourceTemplate title={data.title} />;
  }

  return <Navigate to="/" replace />;
};

export default SitemapPage;
