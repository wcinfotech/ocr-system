/**
 * ============================================
 * PDF Text Extraction Service
 * ============================================
 * Uses pdf-parse to extract text from text-based PDFs
 */

const pdfParse = require('pdf-parse');
const fs = require('fs');

// Custom page render function to append a form feed (\f) at the end of each page.
// This allows us to reliably detect page boundaries when splitting multi-bill PDFs.
const renderPageWithFormFeed = (pageData) => {
  let render_options = {
    normalizeWhitespace: false,
    disableCombineTextItems: false
  };

  return pageData.getTextContent(render_options)
    .then(function(textContent) {
      let lastY, text = '';
      for (let item of textContent.items) {
        if (lastY === item.transform[5] || !lastY){
          text += item.str;
        } else {
          text += '\n' + item.str;
        }
        lastY = item.transform[5];
      }
      // Append form feed as a clear page separator
      return text + '\n\f\n';
    });
};

/**
 * Extract text from a PDF file
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {Promise<{text: string, pages: number, info: object}>}
 */
const extractTextFromPDF = async (filePath) => {
  try {
    // Read the PDF file as buffer
    const dataBuffer = fs.readFileSync(filePath);

    // Parse PDF with custom page renderer
    const data = await pdfParse(dataBuffer, {
      max: 20,
      pagerender: renderPageWithFormFeed
    });

    const extractedText = data.text || '';

    // Check if meaningful text was extracted
    // If very little text, the PDF might be scanned/image-based
    const meaningfulText = extractedText.replace(/\s+/g, ' ').trim();
    const isTextPDF = meaningfulText.length > 50;

    return {
      text: extractedText,
      pages: data.numpages,
      info: data.info || {},
      isTextPDF,
    };
  } catch (error) {
    console.error(`PDF parsing error: ${error.message}`);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};

module.exports = { extractTextFromPDF };
