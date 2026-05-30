/**
 * ============================================
 * PDF Text Extraction Service (v3)
 * ============================================
 * Uses pdf-parse with OCR fallback for scanned PDFs
 * Supports large PDFs with page-level processing
 */

const pdfParse = require('pdf-parse');
const fs = require('fs');
const { extractTextFromImage } = require('./ocrService');
const path = require('path');

// Custom page render — appends form-feed for page boundaries
const renderPageWithFormFeed = (pageData) => {
  let render_options = {
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

    let extractedText = data.text || '';
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
        // Continue with whatever text we extracted
      }
    }

    return {
      text: extractedText,
      pages: data.numpages,
      info: data.info || {},
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

module.exports = { extractTextFromPDF };
