/**
 * ============================================
 * OCR Service - Tesseract.js
 * ============================================
 */

const Tesseract = require('tesseract.js');

const extractTextFromImage = async (filePath) => {
  try {
    console.log(`🔍 Starting OCR for: ${filePath}`);
    const result = await Tesseract.recognize(filePath, 'eng', {
      logger: (info) => {
        if (info.status === 'recognizing text') {
          const progress = Math.round(info.progress * 100);
          if (progress % 25 === 0) console.log(`   OCR: ${progress}%`);
        }
      },
    });
    const text = result.data.text || '';
    const confidence = result.data.confidence || 0;
    console.log(`✅ OCR done. Confidence: ${confidence}%`);
    return { text, confidence };
  } catch (error) {
    console.error(`❌ OCR Error: ${error.message}`);
    throw new Error(`OCR failed: ${error.message}`);
  }
};

module.exports = { extractTextFromImage };
