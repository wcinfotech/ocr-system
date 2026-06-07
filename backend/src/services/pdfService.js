/**
 * ============================================
 * PDF Text & Barcode Extraction Service (v4)
 * ============================================
 * Uses pdf-parse with page-level operator extraction
 * Scans page image streams for barcodes (Code128, QR, etc.)
 * Falls back to high-resolution OCR for scanned PDF pages
 */

// ============================================
// PDF.js DOM & Image Shims for Node.js
// Fixes "Image is not defined", "document is not defined", etc.
// ============================================
if (typeof global.navigator === 'undefined') {
  global.navigator = { userAgent: 'node' };
}
if (typeof global.Image === 'undefined') {
  global.Image = class {
    constructor() {
      this.onload = null;
      this.onerror = null;
      this.src = '';
    }
    set src(val) {
      this._src = val;
      setTimeout(() => {
        if (this.onload) this.onload();
      }, 1);
    }
    get src() {
      return this._src;
    }
  };
}

if (typeof global.document === 'undefined') {
  const mockElement = {
    sheet: {
      cssRules: [],
      insertRule: () => {}
    },
    appendChild: () => {},
    removeChild: () => {},
    remove: () => {},
    setAttribute: () => {},
    style: {},
    getElementsByTagName: () => [mockElement],
    getContext: () => {
      return {
        fillText: () => {},
        measureText: () => ({ width: 10 }),
        getImageData: () => ({ data: [0, 0, 0, 0] })
      };
    }
  };

  global.document = {
    documentElement: mockElement,
    body: mockElement,
    createElement: () => mockElement,
    getElementsByTagName: () => [mockElement]
  };
}

const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');

/**
 * Render a specific PDF page to an image using pdfjs-dist and OCR it.
 * This bypasses pdf-parse's broken internal image extraction on Node.
 */
const ocrPdfPageWithPdfJs = async (filePath, pageNumber) => {
  try {
    const { createCanvas, Image } = require('@napi-rs/canvas');
    if (!global.window || !global.window.document) {
      global.window = global;
      global.Image = Image;
      global.HTMLElement = class {};
      global.history = {};
      global.location = { href: 'http://localhost' };
      global.navigator = { userAgent: 'node' };
      global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
      global.document = {
        createElement: (tag) => {
          if (tag === 'style') return { sheet: { insertRule: () => {} } };
          if (tag === 'canvas') return createCanvas(1, 1);
          return { getContext: () => null };
        },
        getElementsByTagName: () => [{ appendChild: () => {} }],
        documentElement: { style: {} }
      };
    }
    const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
    
    const data = new Uint8Array(fs.readFileSync(filePath));
    const doc = await pdfjs.getDocument({
      data, 
      standardFontDataUrl: path.join(__dirname, '../../../node_modules/pdfjs-dist/standard_fonts/')
    }).promise;
    
    if (pageNumber > doc.numPages) return '';
    
    const page = await doc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext('2d');
    
    await page.render({ canvasContext: ctx, viewport }).promise;
    const pngBuffer = canvas.toBuffer('image/png');
    
    const ocrResult = await Tesseract.recognize(pngBuffer, 'eng', {
      langPath: path.join(__dirname, '../../'),
    });
    
    let text = ocrResult.data.text || '';
    
    // Try barcode scanning as well
    try {
      const { scanBarcode } = require('./ocrService');
      const barcodeResult = await scanBarcode(pngBuffer);
      if (barcodeResult && barcodeResult.text) {
        text = `AWB_BARCODE: ${barcodeResult.text}\nBARCODE_FORMAT: ${barcodeResult.format}\n\n` + text;
      }
    } catch (bcErr) {
      console.warn(`Barcode scan failed on page ${pageNumber}: ${bcErr.message}`);
    }
    
    return text;
  } catch (err) {
    console.error(`⚠️ OCR rendering failed for page ${pageNumber}: ${err.message}`);
    return '';
  }
};

// Custom page render — appends form-feed for page boundaries
const renderPageWithFormFeed = (pageData) => {
  const render_options = {
    normalizeWhitespace: false,
    disableCombineTextItems: false
  };

  return pageData.getTextContent(render_options)
    .then(function (textContent) {
      let lastY, text = '';
      for (let item of textContent.items) {
        if (lastY === item.transform[5] || !lastY) {
          text += item.str;
        } else {
          text += '\n' + item.str;
        }
        lastY = item.transform[5];
      }
      return text + '\n\f\n';
    });
};

/**
 * Extract text from a PDF file with OCR fallback
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {Promise<{text: string, pages: number, info: object, isTextPDF: boolean, ocrUsed: boolean}>}
 */
const extractTextFromPDF = async (filePath) => {
  let ocrUsed = false;

  try {
    const dataBuffer = fs.readFileSync(filePath);

    // Parse PDF with text extraction
    const data = await pdfParse(dataBuffer, {
      max: 200,  // Support up to 200 pages
      pagerender: renderPageWithFormFeed
    });

    let extractedText = '';
    const rawPages = data.text.split('\f');
    let pagesProcessed = 0;

    for (let i = 0; i < rawPages.length; i++) {
      let pageText = rawPages[i].trim();
      pagesProcessed++;

      // If page is mostly empty, it's likely an image (like an Amazon label)
      if (pageText.replace(/\s+/g, '').length < 30) {
        console.log(`📸 Page ${i + 1} appears image-based. Rendering & OCRing via pdfjs-dist...`);
        const ocrText = await ocrPdfPageWithPdfJs(filePath, i + 1);
        if (ocrText && ocrText.trim().length > 0) {
          pageText = ocrText;
          ocrUsed = true;
          console.log(`✅ Page ${i + 1} OCR Succeeded: ${ocrText.length} chars`);
        }
      }
      
      extractedText += pageText + '\n\f\n';
    }

    const meaningfulText = extractedText.replace(/\s+/g, ' ').trim();
    const isTextPDF = meaningfulText.length > 50;

    // Global OCR Fallback: If EVERYTHING was still poor
    if (!isTextPDF || meaningfulText.length < 100) {
      console.log('📸 Entire PDF appears scanned/image-based. Attempting global OCR fallback...');
      try {
        const { extractTextFromImage } = require('./ocrService');
        const ocrResult = await extractTextFromImage(filePath, true);
        if (ocrResult.text && ocrResult.text.trim().length > extractedText.trim().length) {
          extractedText = ocrResult.text;
          ocrUsed = true;
          if (ocrResult.barcode) {
            extractedText = `AWB_BARCODE: ${ocrResult.barcode.text}\nBARCODE_FORMAT: ${ocrResult.barcode.format}\n\n` + extractedText;
          }
        }
      } catch (ocrErr) {
        console.warn(`⚠️ Global OCR fallback failed: ${ocrErr.message}`);
      }
    }

    return {
      text: extractedText,
      pages: pagesProcessed || data.numpages,
      info: data.info || {},
      isTextPDF,
      ocrUsed,
    };
  } catch (error) {
    console.error(`PDF parsing error: ${error.message}`);
    console.log('📸 Attempting direct OCR on PDF...');
    try {
      const { extractTextFromImage } = require('./ocrService');
      const ocrResult = await extractTextFromImage(filePath, true);
      let textVal = ocrResult.text || '';
      if (ocrResult.barcode) {
        textVal = `AWB_BARCODE: ${ocrResult.barcode.text}\nBARCODE_FORMAT: ${ocrResult.barcode.format}\n\n` + textVal;
      }
      return {
        text: textVal,
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

module.exports = { extractTextFromPDF };
