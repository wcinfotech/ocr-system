/**
 * ============================================
 * PDF Generation Service
 * ============================================
 * Generates beautiful invoices as PDF buffers using pdfkit
 */

const PDFDocument = require('pdfkit');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const fs = require('fs');
const { extractTextFromImage } = require('./ocrService');
const path = require('path');

/**
 * Extract text from a PDF file with OCR fallback using pdfjs-dist directly
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {Promise<{text: string, pages: number, info: object, isTextPDF: boolean, ocrUsed: boolean}>}
 */
const extractTextFromPDF = async (filePath) => {
  let ocrUsed = false;

  try {
    const dataBuffer = fs.readFileSync(filePath);

    // Parse PDF with pdfjs-dist
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(dataBuffer) });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    let extractedText = '';
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      let lastY, text = '';
      for (let item of textContent.items) {
        if (lastY === item.transform[5] || !lastY) {
          text += item.str;
        } else {
          text += '\n' + item.str;
        }
        lastY = item.transform[5];
      }
      extractedText += text + '\n\f\n';
    }

    const meaningfulText = extractedText.replace(/\s+/g, ' ').trim();
    const isTextPDF = meaningfulText.length > 50;

    // OCR Fallback: If text extraction yielded poor results
    if (!isTextPDF || meaningfulText.length < 100) {
      console.log('📸 PDF appears scanned/image-based. Attempting OCR fallback...');
      try {
        const ocrResult = await extractTextFromImage(filePath, true);
        if (ocrResult.text && ocrResult.text.trim().length > extractedText.trim().length) {
          extractedText = ocrResult.text;
          ocrUsed = true;
          console.log(`✅ OCR fallback successful: ${extractedText.length} chars`);
        }
      } catch (ocrErr) {
        console.warn(`⚠️  OCR fallback failed: ${ocrErr.message}`);
      }
    }

    // Attempt to extract metadata
    const metadata = await pdfDoc.getMetadata().catch(() => null);
    const info = metadata ? metadata.info : {};

    return {
      text: extractedText,
      pages: numPages,
      info: info || {},
      isTextPDF,
      ocrUsed,
    };
  } catch (error) {
    // If PDF parsing itself fails, try OCR on the file directly
    console.error(`PDF parsing error: ${error.message}`);
    console.log('📸 Attempting direct OCR on PDF...');
    try {
      const ocrResult = await extractTextFromImage(filePath, true);
      return {
        text: ocrResult.text || '',
        pages: 1,
        info: {},
        isTextPDF: false,
        ocrUsed: true,
      };
    } catch (ocrErr) {
      throw new Error(`Failed to parse PDF: ${error.message}. OCR also failed: ${ocrErr.message}`);
    }
  }
};


/**
 * Generate a PDF Invoice Buffer
 * @param {Object} invoice - Invoice details
 * @param {string} invoice.invoiceId - Invoice ID
 * @param {string} invoice.date - Date formatted
 * @param {string} invoice.userName - Customer Name
 * @param {string} invoice.userEmail - Customer Email
 * @param {string} invoice.plan - Plan Name
 * @param {string} invoice.billingPeriod - Billing Cycle
 * @param {number} invoice.price - Subtotal price (number)
 * @returns {Promise<Buffer>} - Resolves to PDF Buffer
 */
const generateInvoicePDF = (invoice) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    // Colors
    const primaryColor = '#4f46e5'; // Indigo
    const darkSlate = '#1e293b';
    const lightGrey = '#f8fafc';
    const borderGrey = '#e2e8f0';

    // Header / Branding
    doc
      .fillColor(primaryColor)
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('BillScan Pro', 50, 50);

    doc
      .fillColor(darkSlate)
      .fontSize(9)
      .font('Helvetica')
      .text('Automated Invoice Processing System', 50, 75);

    // INVOICE title
    doc
      .fillColor(primaryColor)
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('INVOICE', 350, 50, { align: 'right', width: 200 });

    doc
      .fillColor(darkSlate)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(`Invoice ID: #${invoice.invoiceId}`, 350, 75, { align: 'right', width: 200 })
      .text(`Date: ${invoice.date}`, 350, 90, { align: 'right', width: 200 });

    // Draw horizontal divider rule
    doc
      .moveTo(50, 115)
      .lineTo(550, 115)
      .strokeColor(borderGrey)
      .lineWidth(1)
      .stroke();

    // Bill To details
    doc
      .fillColor(primaryColor)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('BILL TO:', 50, 135);

    doc
      .fillColor(darkSlate)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(invoice.userName, 50, 150);

    doc
      .fillColor('#64748b')
      .fontSize(9)
      .font('Helvetica')
      .text(invoice.userEmail, 50, 165);

    // Company / From details
    doc
      .fillColor(primaryColor)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('FROM:', 350, 135, { align: 'right', width: 200 });

    doc
      .fillColor(darkSlate)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('BillScan Pro Ltd.', 350, 150, { align: 'right', width: 200 });

    doc
      .fillColor('#64748b')
      .fontSize(9)
      .font('Helvetica')
      .text('support@billscanpro.com', 350, 165, { align: 'right', width: 200 });

    // Table Header
    const tableTop = 210;
    doc
      .rect(50, tableTop, 500, 25)
      .fill(lightGrey);

    doc
      .fillColor(primaryColor)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Plan Description', 60, tableTop + 8);

    doc
      .text('Qty', 320, tableTop + 8)
      .text('Unit Price', 380, tableTop + 8)
      .text('Amount', 480, tableTop + 8, { align: 'right', width: 60 });

    // Table Row
    const rowTop = tableTop + 25;
    doc
      .fillColor(darkSlate)
      .fontSize(10)
      .font('Helvetica')
      .text(`BillScan Pro - ${invoice.plan} Plan (${invoice.billingPeriod})`, 60, rowTop + 10, { width: 240 })
      .text('1', 320, rowTop + 10)
      .text(`INR ${invoice.price.toLocaleString('en-IN')}`, 380, rowTop + 10)
      .font('Helvetica-Bold')
      .text(`INR ${invoice.price.toLocaleString('en-IN')}`, 480, rowTop + 10, { align: 'right', width: 60 });

    // Bottom Divider
    doc
      .moveTo(50, rowTop + 40)
      .lineTo(550, rowTop + 40)
      .strokeColor(borderGrey)
      .stroke();

    // Calculations
    const calcTop = rowTop + 55;
    const tax = Math.round(invoice.price * 0.18);
    const total = invoice.price + tax;

    doc
      .fillColor('#64748b')
      .fontSize(9)
      .font('Helvetica')
      .text('Subtotal:', 350, calcTop)
      .text(`INR ${invoice.price.toLocaleString('en-IN')}`, 480, calcTop, { align: 'right', width: 60 });

    doc
      .text('GST (18%):', 350, calcTop + 15)
      .text(`INR ${tax.toLocaleString('en-IN')}`, 480, calcTop + 15, { align: 'right', width: 60 });

    // Grand Total Row
    doc
      .rect(340, calcTop + 35, 210, 30)
      .fill('#eff6ff');

    doc
      .fillColor(primaryColor)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Grand Total:', 350, calcTop + 45)
      .text(`INR ${total.toLocaleString('en-IN')}`, 450, calcTop + 45, { align: 'right', width: 90 });

    // Payment Status Stamp
    doc
      .fillColor('#10b981')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('PAID', 60, calcTop + 10, { align: 'left' });

    doc
      .fillColor('#64748b')
      .fontSize(8)
      .font('Helvetica')
      .text('Thank you for subscribing to BillScan Pro! Dynamic extraction features have been unlocked.', 60, calcTop + 30, { width: 250 });

    // Footer note
    doc
      .fillColor('#94a3b8')
      .fontSize(8)
      .font('Helvetica')
      .text('If you have any questions about this invoice, contact support@billscanpro.com', 50, doc.page.height - 70, { align: 'center', width: 500 });

    doc.end();
  });
};

module.exports = {
  generateInvoicePDF,
  extractTextFromPDF,
};
