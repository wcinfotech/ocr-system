/**
 * ============================================
 * OCR Service (v3) - Tesseract.js + Sharp
 * ============================================
 * Enhanced with image preprocessing pipeline:
 * grayscale → threshold → sharpen → denoise
 */

const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Preprocess image for better OCR accuracy
 * @param {string} filePath - Path to the image file
 * @returns {Promise<string>} - Path to preprocessed image
 */
const preprocessImage = async (filePath) => {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const dir = path.dirname(filePath);
    const base = path.basename(filePath, ext);
    const outPath = path.join(dir, `${base}_preprocessed.png`);

    await sharp(filePath)
      .grayscale()                    // Convert to grayscale
      .normalize()                    // Auto-level contrast
      .sharpen({ sigma: 1.5 })       // Sharpen text edges
      .threshold(140)                 // Binarize for clean text
      .median(3)                      // Denoise
      .png({ quality: 100 })
      .toFile(outPath);

    console.log(`🖼️  Image preprocessed: ${outPath}`);
    return outPath;
  } catch (error) {
    console.warn(`⚠️  Preprocessing failed, using original: ${error.message}`);
    return filePath;
  }
};

/**
 * Extract text from image using Tesseract OCR
 * @param {string} filePath - Path to image file
 * @param {boolean} preprocess - Whether to preprocess image first
 * @returns {Promise<{text: string, confidence: number, ocrUsed: boolean}>}
 */
const extractTextFromImage = async (filePath, preprocess = true) => {
  let processedPath = filePath;

  try {
    // Preprocess if enabled
    if (preprocess) {
      processedPath = await preprocessImage(filePath);
    }

    console.log(`🔍 Starting OCR for: ${path.basename(filePath)}`);
    const result = await Tesseract.recognize(processedPath, 'eng', {
      logger: (info) => {
        if (info.status === 'recognizing text') {
          const progress = Math.round(info.progress * 100);
          if (progress % 25 === 0) console.log(`   OCR: ${progress}%`);
        }
      },
    });

    const text = result.data.text || '';
    const confidence = result.data.confidence || 0;
    console.log(`✅ OCR done. Confidence: ${confidence}%, Chars: ${text.length}`);

    // Cleanup preprocessed file
    if (processedPath !== filePath && fs.existsSync(processedPath)) {
      try { fs.unlinkSync(processedPath); } catch { /* ignore */ }
    }

    return { text, confidence, ocrUsed: true };
  } catch (error) {
    // Cleanup on error
    if (processedPath !== filePath && fs.existsSync(processedPath)) {
      try { fs.unlinkSync(processedPath); } catch { /* ignore */ }
    }
    console.error(`❌ OCR Error: ${error.message}`);
    throw new Error(`OCR failed: ${error.message}`);
  }
};

/**
 * Convert a PDF page image buffer to text via OCR
 * Used for scanned PDF fallback
 * @param {Buffer} imageBuffer - Image buffer from PDF rendering
 * @returns {Promise<{text: string, confidence: number}>}
 */
const ocrFromBuffer = async (imageBuffer) => {
  try {
    // Preprocess buffer
    const processed = await sharp(imageBuffer)
      .grayscale()
      .normalize()
      .sharpen({ sigma: 1.5 })
      .threshold(140)
      .median(3)
      .png()
      .toBuffer();

    const result = await Tesseract.recognize(processed, 'eng');
    return {
      text: result.data.text || '',
      confidence: result.data.confidence || 0,
    };
  } catch (error) {
    console.error(`❌ Buffer OCR Error: ${error.message}`);
    return { text: '', confidence: 0 };
  }
};

module.exports = { extractTextFromImage, preprocessImage, ocrFromBuffer };
