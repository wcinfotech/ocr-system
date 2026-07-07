/**
 * ============================================
 * OCR & Barcode Service (v6) - Tesseract.js + Sharp + ZXing
 * ============================================
 * Preprocessing: auto-rotate, grayscale, scale/DPI, contrast, sharpen
 * Barcodes: Code128, EAN, UPC, QR, PDF417, DataMatrix
 * Multi-pass OCR: Original, Enhanced, Threshold, Upscaled, HighContrast with auto-selection
 * v6: Added Pass 5 (High Contrast Invoice Mode), multi-attempt barcode, debug logs
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

    // Advanced Image Preprocessing for Photo/Receipt OCR:
    // 1. Normalize global contrast
    image = image.normalize();
    
    // 2. Local contrast enhancement (CLAHE) - Essential for removing shadows and uneven lighting in pictures
    try {
      image = image.clahe({ width: 200, height: 200, maxSlope: 3 });
    } catch (e) {
      console.warn('⚠️ CLAHE not supported/failed in standard preprocess, skipping');
    }
    
    // 3. Soft binarization via linear stretch (preserves anti-aliased edges for Tesseract LSTM)
    image = image.linear(1.5, -0.2);
    
    // 4. Edge sharpening to crisp up the text
    image = image.sharpen({ sigma: 1.5 });

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
  // Helper to decode barcode from a sharp pipeline
  const decodeFromBuffer = async (buf) => {
    const { data, info } = await sharp(buf)
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
    return decodeResult ? { text: decodeResult.getText(), format: decodeResult.getBarcodeFormat().toString() } : null;
  };

  try {
    // Attempt 1: Original image
    const result = await decodeFromBuffer(imageInput);
    if (result) return result;
  } catch (err) { /* no barcode on original */ }

  try {
    // Attempt 2: Threshold + high contrast version (for low-quality prints)
    const enhanced = await sharp(imageInput)
      .grayscale()
      .normalize()
      .threshold(140)
      .png()
      .toBuffer();
    const result = await decodeFromBuffer(enhanced);
    if (result) return result;
  } catch (err) { /* no barcode on enhanced */ }

  try {
    // Attempt 3: Upscaled version (for small barcodes on labels)
    const upscaled = await sharp(imageInput)
      .resize({ width: 2500, fit: 'inside', withoutEnlargement: false, kernel: 'lanczos3' })
      .grayscale()
      .normalize()
      .sharpen({ sigma: 2.0 })
      .png()
      .toBuffer();
    const result = await decodeFromBuffer(upscaled);
    if (result) return result;
  } catch (err) { /* no barcode on upscaled */ }

  return null;
};

/**
 * Helper to score OCR output text based on Tesseract confidence and presence of key document fields
 */
const scoreOcrResult = (text, confidence) => {
  if (!text || text.trim().length < 10) return 0;
  let score = confidence;
  const lower = text.toLowerCase();

  // Boost score if key billing terms are present (indicates successful invoice structure parsing)
  if (/\b(?:invoice|bill|receipt|tax invoice|retail invoice)\b/.test(lower)) score += 15;
  if (/\b(?:order number|order id|order#|ordid)\b/.test(lower)) score += 15;
  if (/\b(?:awb|tracking|waybill|consignment|courier|delivery)\b/.test(lower)) score += 15;
  if (/\b(?:gst|gstin|taxable|cgst|sgst|igst|hsn|sac)\b/.test(lower)) score += 15;
  if (/\b(?:total|amount|payable|subtotal|grand total|rs\.?|inr|₹)\b/.test(lower)) score += 15;
  if (/\b(?:qty|quantity|pcs|pieces)\b/.test(lower)) score += 10;
  if (/\b(?:seller|vendor|supplier|sold by|customer|ship to|bill to)\b/.test(lower)) score += 10;

  // Tiny length boost to prefer more complete text over fragmented output
  score += Math.min(10, text.length / 200);

  return score;
};

/**
 * Extract text from image using Tesseract OCR (with multi-pass preprocessing and barcode fallback)
 * @param {string} filePath - Path to image file
 * @param {boolean} preprocess - Whether to preprocess image first
 * @returns {Promise<{text: string, confidence: number, ocrUsed: boolean, barcode: {text: string, format: string}|null, passUsed: string}>}
 */
const extractTextFromImage = async (filePath, preprocess = true) => {
  let barcode = null;

  try {
    const fileBuffer = fs.readFileSync(filePath);

    // 1. Try reading barcodes/QR codes first
    try {
      barcode = await scanBarcode(fileBuffer);
      if (barcode) {
        console.log(`🎯 Barcode scanned successfully: [${barcode.format}] ${barcode.text}`);
      }
    } catch (bcErr) {
      /* ignore barcode fail */
    }

    if (!preprocess) {
      // Direct, single pass without extra preprocessing (backward compatible / fast path)
      console.log(`🔍 Starting Single-Pass OCR for: ${path.basename(filePath)}`);
      const result = await Tesseract.recognize(fileBuffer, 'eng', {
        langPath: path.join(__dirname, '../../'),
        gzip: false,
      });
      return {
        text: result.data.text || '',
        confidence: result.data.confidence || 0,
        ocrUsed: true,
        barcode,
        passUsed: 'Original-Direct'
      };
    }

    // 2. Multi-Pass OCR Engine
    console.log(`🔍 Starting Multi-Pass OCR for: ${path.basename(filePath)}`);
    const ocrPasses = [];

    // Pass 1: Original image (auto-rotated only)
    try {
      const p1Buffer = await sharp(fileBuffer).rotate().png().toBuffer();
      ocrPasses.push({ name: 'Original', buffer: p1Buffer });
    } catch (e) {
      ocrPasses.push({ name: 'Original', buffer: fileBuffer });
    }

    // Pass 2: Enhanced Contrast & Grayscale (CLAHE + Sharpen)
    try {
      let p2 = sharp(fileBuffer).rotate().grayscale().normalize();
      try {
        p2 = p2.clahe({ width: 200, height: 200, maxSlope: 3 });
      } catch (e) {}
      const p2Buffer = await p2.sharpen({ sigma: 1.5 }).png().toBuffer();
      ocrPasses.push({ name: 'Enhanced', buffer: p2Buffer });
    } catch (e) {
      console.warn(`⚠️ Pass 'Enhanced' failed to prepare: ${e.message}`);
    }

    // Pass 3: Adaptive Thresholding Binarization (Sleek document scan representation)
    try {
      const p3Buffer = await sharp(fileBuffer)
        .rotate()
        .grayscale()
        .normalize()
        .threshold(128)
        .png()
        .toBuffer();
      ocrPasses.push({ name: 'Threshold', buffer: p3Buffer });
    } catch (e) {
      console.warn(`⚠️ Pass 'Threshold' failed to prepare: ${e.message}`);
    }

    // Pass 4: Upscaled + Denoise (For compressed/low-res images e.g. WhatsApp, screenshots)
    try {
      let p4 = sharp(fileBuffer).rotate().grayscale();
      p4 = p4.resize({ width: 3000, fit: 'inside', withoutEnlargement: false, kernel: 'lanczos3' });
      p4 = p4.median(3).normalize();
      try {
        p4 = p4.clahe({ width: 150, height: 150, maxSlope: 4 });
      } catch (e) {}
      const p4Buffer = await p4.sharpen({ sigma: 2.0 }).png().toBuffer();
      ocrPasses.push({ name: 'Upscaled', buffer: p4Buffer });
    } catch (e) {
      console.warn(`⚠️ Pass 'Upscaled' failed to prepare: ${e.message}`);
    }

    // Pass 5: High Contrast Invoice Mode (Aggressive binarization + edge enhancement)
    // Best for camera-captured bills, WhatsApp compressed images, and scanned receipts
    try {
      let p5 = sharp(fileBuffer).rotate().grayscale();
      // Aggressive upscale for small/compressed images
      const meta = await sharp(fileBuffer).metadata();
      const targetW = Math.max(2500, (meta.width || 1000) * 2);
      p5 = p5.resize({ width: Math.min(targetW, 4000), fit: 'inside', withoutEnlargement: false, kernel: 'lanczos3' });
      // Heavy contrast normalization
      p5 = p5.normalize();
      try {
        p5 = p5.clahe({ width: 100, height: 100, maxSlope: 5 });
      } catch (e) {}
      // Aggressive linear contrast stretch (push text to pure black, background to white)
      p5 = p5.linear(2.2, -0.5);
      // Strong sharpening to crisp up edges
      p5 = p5.sharpen({ sigma: 2.5 });
      // Final adaptive threshold for clean binary output
      p5 = p5.threshold(110);
      const p5Buffer = await p5.png().toBuffer();
      ocrPasses.push({ name: 'HighContrast', buffer: p5Buffer });
    } catch (e) {
      console.warn(`⚠️ Pass 'HighContrast' failed to prepare: ${e.message}`);
    }

    // Execute OCR passes
    let bestResult = null;
    let bestScore = -1;
    const passResults = []; // Collect all pass results for debug logging

    for (const pass of ocrPasses) {
      try {
        console.log(`   Running Pass: ${pass.name}...`);
        const result = await Tesseract.recognize(pass.buffer, 'eng', {
          langPath: path.join(__dirname, '../../'),
          gzip: false,
        });

        const text = result.data.text || '';
        const confidence = result.data.confidence || 0;
        const score = scoreOcrResult(text, confidence);

        passResults.push({ name: pass.name, confidence, score: score.toFixed(1), chars: text.length });
        console.log(`   Pass ${pass.name} completed. Confidence: ${confidence}%, Score: ${score.toFixed(1)}, Chars: ${text.length}`);

        if (score > bestScore) {
          bestScore = score;
          bestResult = {
            text,
            confidence,
            ocrUsed: true,
            barcode,
            passUsed: pass.name,
            allPassResults: passResults,
          };
        }

        // Optimization: Early exit if we get a highly confident read with all key markers
        if (confidence >= 85 && score >= 140) {
          console.log(`   ⚡ Early exit triggered on Pass: ${pass.name} (Confidence: ${confidence}%)`);
          bestResult.allPassResults = passResults;
          return bestResult;
        }
      } catch (passErr) {
        passResults.push({ name: pass.name, confidence: 0, score: '0', chars: 0, error: passErr.message });
        console.error(`   ❌ Pass ${pass.name} failed: ${passErr.message}`);
      }
    }

    if (bestResult) {
      bestResult.allPassResults = passResults;
      console.log(`✅ Multi-Pass OCR completed. Best Pass: ${bestResult.passUsed} (Confidence: ${bestResult.confidence}%)`);
      console.log(`   All pass results: ${JSON.stringify(passResults)}`);
      return bestResult;
    }

    throw new Error('All OCR passes failed to produce text.');
  } catch (error) {
    console.error(`❌ OCR Error: ${error.message}`);
    throw new Error(`OCR failed: ${error.message}`);
  }
};

/**
 * Convert a PDF page image buffer to text via OCR and Barcode scan
 * Used for scanned PDF fallback
 * @param {Buffer} imageBuffer - Image buffer from PDF rendering
 * @returns {Promise<{text: string, confidence: number, barcode: object|null, passUsed: string}>}
 */
const ocrFromBuffer = async (imageBuffer) => {
  try {
    // For buffers (often high quality extracted from PDF), run the Enhanced processor as the default
    const barcode = await scanBarcode(imageBuffer);
    const processed = await preprocessImage(imageBuffer);

    const result = await Tesseract.recognize(processed, 'eng', {
      langPath: path.join(__dirname, '../../'),
      gzip: false,
    });
    return {
      text: result.data.text || '',
      confidence: result.data.confidence || 0,
      barcode,
      passUsed: 'Enhanced-Buffer'
    };
  } catch (error) {
    console.error(`❌ Buffer OCR Error: ${error.message}`);
    return { text: '', confidence: 0, barcode: null, passUsed: 'Failed' };
  }
};

module.exports = {
  extractTextFromImage,
  preprocessImage,
  ocrFromBuffer,
  scanBarcode,
};
