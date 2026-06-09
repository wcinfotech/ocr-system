/**
 * ============================================
 * OCR & Barcode Service (v4) - Tesseract.js + Sharp + ZXing
 * ============================================
 * Preprocessing: auto-rotate, grayscale, scale/DPI, contrast, sharpen
 * Barcodes: Code128, EAN, UPC, QR, PDF417, DataMatrix
 */

// Global polyfill for browser-dependent libraries
if (typeof window === 'undefined') {
  // removed
}

const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { MultiFormatReader, RGBLuminanceSource, BinaryBitmap, HybridBinarizer } = require('@zxing/library');

/**
 * Preprocess image for maximum OCR accuracy
 * @param {string|Buffer} imageInput - Path to the image file or Buffer
 * @param {string} [outPath] - Path to save preprocessed image if input is a path
 * @returns {Promise<string|Buffer>} - Preprocessed image path or buffer
 */
const preprocessImage = async (imageInput, outPath = null) => {
  try {
    let image = sharp(imageInput);
    const metadata = await image.metadata();

    // Auto rotate based on EXIF orientation
    image = image.rotate();

    // Grayscale optimization
    image = image.grayscale();

    // DPI / Resolution Enhancement: Upscale if width is low
    const targetWidth = 2000;
    if (metadata.width && metadata.width < targetWidth) {
      image = image.resize({
        width: targetWidth,
        fit: 'inside',
        kernel: 'lanczos3',
      });
    }

    // Contrast Enhancement (normalize) + Edge sharpening
    image = image.normalize().sharpen({ sigma: 1.2 });

    if (outPath) {
      await image.png({ quality: 100 }).toFile(outPath);
      return outPath;
    } else {
      return await image.png().toBuffer();
    }
  } catch (error) {
    console.warn(`⚠️ Preprocessing failed, using original: ${error.message}`);
    return imageInput;
  }
};

/**
 * Scan an image file or buffer for barcodes and QR codes
 * @param {string|Buffer} imageInput - Path to file or Image Buffer
 * @returns {Promise<{text: string, format: string}|null>}
 */
const scanBarcode = async (imageInput) => {
  try {
    let image = sharp(imageInput);
    
    // We get raw pixel values with alpha channel
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const len = info.width * info.height;
    const rgbArray = new Uint8ClampedArray(len * 3);
    for (let i = 0; i < len; i++) {
      rgbArray[i * 3] = data[i * 4];         // R
      rgbArray[i * 3 + 1] = data[i * 4 + 1]; // G
      rgbArray[i * 3 + 2] = data[i * 4 + 2]; // B
    }

    const luminanceSource = new RGBLuminanceSource(rgbArray, info.width, info.height);
    const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
    const reader = new MultiFormatReader();
    
    const decodeResult = reader.decode(binaryBitmap);
    if (decodeResult) {
      return {
        text: decodeResult.getText(),
        format: decodeResult.getBarcodeFormat().toString(),
      };
    }
    return null;
  } catch (err) {
    // ZXing throws if no barcode is found; return null quietly
    return null;
  }
};

/**
 * Extract text from image using Tesseract OCR (with pre-processing and barcode fallback)
 * @param {string} filePath - Path to image file
 * @param {boolean} preprocess - Whether to preprocess image first
 * @returns {Promise<{text: string, confidence: number, ocrUsed: boolean, barcode: {text: string, format: string}|null}>}
 */
const extractTextFromImage = async (filePath, preprocess = true) => {
  let processedPath = filePath;
  let barcode = null;

  try {
    // 1. Try reading barcodes/QR codes first
    try {
      barcode = await scanBarcode(filePath);
      if (barcode) {
        console.log(`🎯 Barcode scanned successfully: [${barcode.format}] ${barcode.text}`);
      }
    } catch (bcErr) {
      /* ignore barcode fail */
    }

    // 2. Preprocess image
    if (preprocess) {
      const ext = path.extname(filePath).toLowerCase();
      const dir = path.dirname(filePath);
      const base = path.basename(filePath, ext);
      const tempOut = path.join(dir, `${base}_preprocessed.png`);
      processedPath = await preprocessImage(filePath, tempOut);
    }

    console.log(`🔍 Starting OCR for: ${path.basename(filePath)}`);
    const result = await Tesseract.recognize(processedPath, 'eng', {
      langPath: path.join(__dirname, '../../'),
      gzip: false,
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

    return { text, confidence, ocrUsed: true, barcode };
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
 * Convert a PDF page image buffer to text via OCR and Barcode scan
 * Used for scanned PDF fallback
 * @param {Buffer} imageBuffer - Image buffer from PDF rendering
 * @returns {Promise<{text: string, confidence: number, barcode: object|null}>}
 */
const ocrFromBuffer = async (imageBuffer) => {
  try {
    // 1. Scan barcode
    const barcode = await scanBarcode(imageBuffer);

    // 2. Preprocess buffer
    const processed = await preprocessImage(imageBuffer);

    const result = await Tesseract.recognize(processed, 'eng', {
      langPath: path.join(__dirname, '../../'),
      gzip: false,
    });
    return {
      text: result.data.text || '',
      confidence: result.data.confidence || 0,
      barcode,
    };
  } catch (error) {
    console.error(`❌ Buffer OCR Error: ${error.message}`);
    return { text: '', confidence: 0, barcode: null };
  }
};

module.exports = {
  extractTextFromImage,
  preprocessImage,
  ocrFromBuffer,
  scanBarcode,
};
